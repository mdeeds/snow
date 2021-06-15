import { Ball } from "./ball";
import { CapturedState } from "./capturedState";
import { FutureMove } from "./futureMove";
import { ImmutableBall } from "./immutableBall";
import { Log } from "./log";
import { PeerGroup } from "./peerGroup";
import { Sfx } from "./sfx";
import { State } from "./state";

const playerColors = [
  'Chartreuse',
  'Fuchsia',
  'Gold',
  'Crimson',
  'Yellow',
  'DeepPink',
  'Aqua'];

export class ServerState implements State {
  private nonPlayerBalls: Map<number, Ball> = new Map<number, Ball>();
  private playerBalls: Map<string, Ball> = new Map<string, Ball>();
  private frameNumber: number = 0;
  private ballsToDelete: number[] = [];
  private changedBalls: number[] = [];
  private sfx: string[] = [];

  private moveBuffer: FutureMove[] = [];
  private peerGroup: PeerGroup;
  private nextBall: number = 0;
  private isStopped: boolean = false;

  public constructor(peerGroup: PeerGroup) {
    this.peerGroup = peerGroup;
    peerGroup.addAnswer('state', (fromId: string, message: string) => {
      return this.serialize();
    });
    peerGroup.addCallback('move', (fromId: string, data: string) => {
      this.moveBuffer.push(JSON.parse(data));
    });
  }

  private serialize(): string {
    return CapturedState.serialize(
      this.nonPlayerBalls, this.playerBalls, this.frameNumber,
      this.ballsToDelete, this.changedBalls, this.sfx);
  }

  public populate(numBalls: number, width: number, height: number) {
    for (let i of this.nonPlayerBalls.keys()) {
      this.ballsToDelete.push(i);
    }
    for (let i of this.ballsToDelete) {
      this.nonPlayerBalls.delete(i);
    }
    for (let b of this.playerBalls.values()) {
      b.r = Ball.minRadius;
    }

    for (let i = 0; i < numBalls; ++i) {
      const b = new Ball(Math.random() * (width - 10) + 5,
        Math.random() * (height - 10) + 5,
        Ball.minRadius);
      const ballId = this.nextBall++;
      this.nonPlayerBalls.set(ballId, b);
      this.changedBalls.push(ballId);
    }
    this.isStopped = false;
  }

  public stop() {
    const ballsToRemove: number[] = [];
    for (const [i, o] of this.nonPlayerBalls.entries()) {
      if (o.c === Ball.defatulColor) {
        ballsToRemove.push(i);
      }
    }
    for (const i of ballsToRemove) {
      this.nonPlayerBalls.delete(i);
      this.ballsToDelete.push(i);
    }
    this.isStopped = true;
  }

  public addPlayer(playerId: string, playerNumber: number) {
    if (this.playerBalls.has(playerId)) {
      return;
    }
    const b = new Ball(512, 512, Ball.minRadius);
    b.c = playerColors[playerNumber];
    this.playerBalls.set(playerId, b);
    Log.info(`New player: ${playerId}`);
  }

  // Doesn't work.  Might work if we project onto the line between the 
  // two balls.
  private splitCalc(x0: number, r0: number, r1: number, r2: number): number[] {
    const x1 = (x0 * r0 * r0 - (r1 * r2 * r2 + r2 * r2 * r2)) /
      (r1 * r1 + r2 * r2);
    const x2 = x1 + r1 + r2;
    return [x1, x2];
  }

  private splitInternal(playerId: string, lastAngle: number) {
    const ball = this.playerBalls.get(playerId);

    // const newRadius = Ball.minRadius;
    // const oldRadius = Math.sqrt(ball.r * ball.r - newRadius * newRadius);
    // if (oldRadius < Ball.minRadius) {
    //   return;
    // }
    const newRadius = ball.r * Math.sqrt(0.2);
    const oldRadius = ball.r * Math.sqrt(0.8);
    if (newRadius < Ball.minRadius) {
      return;
    }

    const dx = ball.r * Math.cos(lastAngle);
    const dy = ball.r * Math.sin(lastAngle);

    const b = new Ball(ball.x - dx, ball.y - dy, oldRadius);
    b.c = ball.c;
    const ballId = this.nextBall++;
    this.nonPlayerBalls.set(ballId, b);
    this.changedBalls.push(ballId);

    ball.x += dx;
    ball.y += dy;
    ball.r = newRadius;
    this.sfx.push('split');
  }

  public split(playerId: string, lastAngle: number) {
    const m = new FutureMove(
      playerId, this.frameNumber + CapturedState.frameLatency, 'split');
    m.lastAngle = lastAngle;
    this.moveBuffer.push(m);
  }

  private bounce(a: Ball, b: Ball) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    const d = Math.sqrt(dx2 + dy2);
    const minD = a.r + b.r * 1.05;
    const p = (d - minD) / d;
    a.x += p * dx;
    a.y += p * dy;
    b.x -= p * dx;
    b.y -= p * dy;
  }

  public setLocation(playerId: string, x: number, y: number) {
    const m = new FutureMove(playerId,
      this.frameNumber + CapturedState.frameLatency, 'move');
    m.x = x;
    m.y = y;
    this.moveBuffer.push(m);
  }

  private distance(dx: number, dy: number) {
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    return Math.sqrt(dx2 + dy2);
  }

  private setLocationInternal(playerId: string, x: number, y: number) {
    const b = this.playerBalls.get(playerId);
    const maxSpeed = 60 / Math.pow(b.r, 1.2);
    const dx = x - b.x;
    const dy = y - b.y;
    const d = this.distance(dx, dy);
    if (d <= maxSpeed) {
      b.x = x;
      b.y = y;
    } else {
      const p = maxSpeed / d;
      b.x = p * dx + b.x;
      b.y = p * dy + b.y;
    }
    if (this.isStopped) {
      return;
    }

    const ballsToRemove: number[] = [];
    for (const [i, o] of this.nonPlayerBalls.entries()) {
      if (o.touching(b)) {
        // You can always eat balls of your own color.
        // You can also eat balls that are no bigger than you.
        if (o.c === b.c || o.r <= b.r) {
          b.r = Math.sqrt(o.r * o.r + b.r * b.r);
          ballsToRemove.push(i);
          this.sfx.push('pickup');
        } else {
          this.sfx.push('bounce');
          this.bounce(b, o);
          this.changedBalls.push(i);
        }
      }
    }
    for (const i of ballsToRemove) {
      this.nonPlayerBalls.delete(i);
      this.ballsToDelete.push(i);
    }

    // Leech
    for (const [otherId, o] of this.playerBalls.entries()) {
      if (o.r > b.r || otherId === playerId) {
        continue;
      }
      const dx = o.x - b.x;
      const dy = o.y - b.y;
      if (this.distance(dx, dy) < o.r + b.r) {
        o.r = Math.sqrt(o.r * o.r + 1);
        b.r = Math.sqrt(b.r * b.r - 1);
        this.sfx.push('leech');
        this.bounce(b, o);
      }
    }
  };

  public getNonPlayerBalls(): IterableIterator<ImmutableBall> {
    return this.nonPlayerBalls.values();
  }

  public getPlayerBalls(): IterableIterator<ImmutableBall> {
    return this.playerBalls.values();
  }

  public getBall(playerId: string): ImmutableBall {
    if (!this.playerBalls.has(playerId)) {
      throw new Error(`No ball for ${playerId}`);
    }
    return this.playerBalls.get(playerId);
  }

  public renderBalls(ctx: CanvasRenderingContext2D) {
    for (const b of this.nonPlayerBalls.values()) {
      b.render(ctx, this.frameNumber);
    }
    for (const b of this.playerBalls.values()) {
      b.renderPlayer(ctx, this.frameNumber);
    }
  }

  public update() {
    this.frameNumber++;
    this.moveBuffer.sort((a, b) => a.frameNumber - b.frameNumber);
    while (this.moveBuffer.length > 0 &&
      this.moveBuffer[0].frameNumber < this.frameNumber) {
      const move = this.moveBuffer.splice(0, 1)[0];
      switch (move.type) {
        case 'move':
          this.setLocationInternal(move.playerId, move.x, move.y);
          break;
        case 'split':
          this.splitInternal(move.playerId, move.lastAngle);
      }
    }
    for (const s of this.sfx) {
      Sfx.play(s);
    }

    const serializedState = CapturedState.serialize(this.nonPlayerBalls,
      this.playerBalls, this.frameNumber, this.ballsToDelete,
      this.changedBalls, this.sfx);
    this.peerGroup.broadcast('updateState', serializedState);
    this.ballsToDelete.splice(0);
    this.changedBalls.splice(0);
    this.sfx.splice(0);
  }
}