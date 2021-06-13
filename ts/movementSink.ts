import { Ball } from "./ball";
import { FutureMove } from "./futureMove";
import { Log } from "./log";
import { PeerGroup } from "./peerGroup";

export class MovementSink {
  // Latency from command to action measured in frames.
  private static latency: number = 10;

  private ball: Ball;
  private nonPlayerBalls: Set<Ball>;
  private lastAngle: number = 0;
  private futureMoves: FutureMove[] = [];
  private lastFrameProcessed: number = 0;
  private lastPoint: FutureMove = null;
  constructor(ball: Ball, nonPlayerBalls: Set<Ball>) {
    this.ball = ball;
    this.nonPlayerBalls = nonPlayerBalls;
  }

  private distance(dx: number, dy: number) {
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    return Math.sqrt(dx2 + dy2);
  }

  moveTo(x: number, y: number, frameNumber: number) {
    const m = new FutureMove(frameNumber + MovementSink.latency, 'move');
    m.x = x;
    m.y = y;
    this.futureMoves.push(m);
  }

  private internalMoveTo(x: number, y: number) {
    const maxSpeed = 60 / Math.pow(this.ball.r, 1.2);
    const dx = x - this.ball.x;
    const dy = y - this.ball.y;
    const d = this.distance(dx, dy);
    if (d <= maxSpeed) {
      this.ball.x = x;
      this.ball.y = y;
    } else {
      const p = maxSpeed / d;
      this.ball.x += p * dx;
      this.ball.y += p * dy;
    }
    this.lastAngle = Math.atan2(dy, dx);
  }

  split(frameNumber: number) {
    const m = new FutureMove(frameNumber + MovementSink.latency, 'split');
    this.futureMoves.push(m);
  }

  private internalSplit() {
    const oldRadius = this.ball.r * Math.sqrt(0.45);
    const newRadius = this.ball.r * Math.sqrt(0.55);
    if (newRadius < Ball.minRadius) {
      return;
    }

    const dx = this.ball.r * Math.cos(this.lastAngle);
    const dy = this.ball.r * Math.sin(this.lastAngle);

    const b = new Ball(this.ball.x - dx, this.ball.y - dy, oldRadius);
    b.c = this.ball.c;
    this.nonPlayerBalls.add(b);

    this.ball.x += dx;
    this.ball.y += dy;
    this.ball.r = newRadius;
  }

  public update(frameNumber: number) {
    let moved = false;
    while (this.futureMoves.length > 0 &&
      this.futureMoves[0].frameNumber <= frameNumber) {
      if (this.futureMoves[0].frameNumber < frameNumber) {
        // Move arrived too late - ignore it.
        this.futureMoves.splice(0, 1);
        continue;
      }
      const d = this.futureMoves[0];
      switch (d.type) {
        case 'move':
          this.lastPoint = d;
          this.internalMoveTo(d.x, d.y);
          break;
        case 'split':
          this.internalSplit();
          break;
      }
      this.futureMoves.splice(0, 1);
      moved = true;
    }
    if (!moved && this.lastPoint) {
      this.internalMoveTo(this.lastPoint.x, this.lastPoint.y);
    }
  }
}