import { PeerConnectOption } from "peerjs";
import { CapturedState } from "./capturedState";
import { FutureMove } from "./futureMove";
import { ImmutableBall } from "./immutableBall";
import { PeerGroup } from "./peerGroup";
import { State } from "./state";

export class ClientState implements State {
  private peerGroup: PeerGroup;
  private hostId: string;
  private capturedState: CapturedState;
  private constructor(peerGroup: PeerGroup, hostId: string) {
    this.peerGroup = peerGroup;
    this.hostId = hostId;

    this.peerGroup.addCallback('updateState',
      (fromId: string, data: string) => {
        CapturedState.merge(data, this.capturedState);
      });
  }

  static async fetchState(peerGroup: PeerGroup, hostId: string):
    Promise<ClientState> {
    const self = new ClientState(peerGroup, hostId);
    const serialized = await peerGroup.ask(hostId, 'state:please');
    self.capturedState = CapturedState.deserialize(serialized);
    return new Promise((resolve, reject) => { resolve(self); });
  }

  split(playerId: string, lastAngle: number): void {
    const move = new FutureMove(
      playerId, this.capturedState.frameNumber, 'split');
    move.lastAngle = lastAngle;
    this.peerGroup.send(this.hostId, `update:${JSON.stringify(move)}`);
  }
  setLocation(playerId: string, x: number, y: number): void {
    const move = new FutureMove(
      playerId, this.capturedState.frameNumber, 'move');
    move.x = x;
    move.y = y;
    this.peerGroup.send(this.hostId, `update:${JSON.stringify(move)}`);
  }
  getNonPlayerBalls(): IterableIterator<ImmutableBall> {
    return this.capturedState.nonPlayerBalls.values();
  }
  getPlayerBalls(): IterableIterator<ImmutableBall> {
    return this.capturedState.playerBalls.values();
  }
  getBall(playerId: string): ImmutableBall {
    if (!this.capturedState.playerBalls.has(this.peerGroup.getId())) {
      throw new Error("Ball not found");
    }
    return this.capturedState.playerBalls.get(this.peerGroup.getId());
  }
  renderBalls(ctx: CanvasRenderingContext2D): void {
    for (const b of this.capturedState.nonPlayerBalls.values()) {
      b.render(ctx, this.capturedState.frameNumber);
    }
    for (const b of this.capturedState.playerBalls.values()) {
      b.render(ctx, this.capturedState.frameNumber);
    }
  }
}