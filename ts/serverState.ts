import { Ball } from "./ball";
import { FutureMove } from "./futureMove";
import { ImmutableBall } from "./immutableBall";
import { Log } from "./log";
import { State } from "./state";

const playerColors = ['blue', 'green', 'purple', 'red', 'orange', 'yellow'];
const frameLatency = 10;  // Latency measured in frames

export class ServerState implements State {
  private nonPlayerBalls: Set<Ball> = new Set<Ball>();
  private playerBalls: Map<string, Ball> = new Map<string, Ball>();
  private frameNumber: number = 0;
  private moveBuffer: FutureMove[] = [];

  public populate(numBalls: number, width: number, height: number) {
    for (let i = 0; i < numBalls; ++i) {
      const b = new Ball(Math.random() * width, Math.random() * height,
        Ball.minRadius);
      this.nonPlayerBalls.add(b);
    }
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

  private splitInternal(playerId: string, lastAngle: number) {
    const ball = this.playerBalls.get(playerId);

    const oldRadius = ball.r * Math.sqrt(0.45);
    const newRadius = ball.r * Math.sqrt(0.55);
    if (newRadius < Ball.minRadius) {
      return;
    }

    const dx = ball.r * Math.cos(lastAngle);
    const dy = ball.r * Math.sin(lastAngle);

    const b = new Ball(ball.x - dx, ball.y - dy, oldRadius);
    b.c = ball.c;
    this.nonPlayerBalls.add(b);

    ball.x += dx;
    ball.y += dy;
    ball.r = newRadius;
  }

  public split(playerId: string, lastAngle: number) {
    const m = new FutureMove(
      playerId, this.frameNumber + frameLatency, 'split');
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
    const m = new FutureMove(playerId, this.frameNumber + frameLatency, 'move');
    m.x = x;
    m.y = y;
    this.moveBuffer.push(m);
  }

  private setLocationInternal(playerId: string, x: number, y: number) {
    const b = this.playerBalls.get(playerId);
    b.x = x;
    b.y = y;

    const ballsToRemove: Ball[] = [];
    for (const o of this.nonPlayerBalls.values()) {
      if (o.touching(b)) {
        // You can always eat balls of your own color.
        // You can also eat balls that are no bigger than you.
        if (o.c === b.c || o.r <= b.r) {
          b.r = Math.sqrt(o.r * o.r + b.r * b.r);
          ballsToRemove.push(o);
        } else {
          this.bounce(b, o);
        }
      }
    }
    for (const b of ballsToRemove) {
      this.nonPlayerBalls.delete(b);
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
      b.render(ctx, this.frameNumber);
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
  }
}