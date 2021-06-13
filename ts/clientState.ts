import { ImmutableBall } from "./immutableBall";
import { State } from "./state";

export class ClientState implements State {

  private constructor() {

  }

  static async fetch(hostId: string): Promise<ClientState> {
    throw new Error("Not implemented");
  }

  split(playerId: string, lastAngle: number): void {
    throw new Error("Not implemented");
  }
  setLocation(playerId: string, x: number, y: number): void {
    throw new Error("Not implemented");
  }
  getNonPlayerBalls(): IterableIterator<ImmutableBall> {
    throw new Error("Not implemented");
  }
  getPlayerBalls(): IterableIterator<ImmutableBall> {
    throw new Error("Not implemented");
  }
  getBall(playerId: string): ImmutableBall {
    throw new Error("Not implemented");
  }
  renderBalls(ctx: CanvasRenderingContext2D): void {
    throw new Error("Not implemented");
  }
}