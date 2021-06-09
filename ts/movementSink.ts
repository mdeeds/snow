import { Ball } from "./ball";

class FuturePoint {
  frame: number;
  x: number;
  y: number;
  constructor(frame: number, x: number, y: number) {
    this.frame = frame;
    this.x = x;
    this.y = y;
  }
}

export class MovementSink {
  // Latency from command to action measured in frames.
  private static latency: number = 10;

  private ball: Ball;
  private nonPlayerBalls: Set<Ball>;
  private lastAngle: number = 0;
  private futureDestinations: FuturePoint[] = [];
  private futureSplits: number[] = [];
  private lastFrameProcessed: number = 0;
  private lastPoint: FuturePoint = null;
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
    if (frameNumber >= this.lastFrameProcessed) {
      this.futureDestinations.push(
        new FuturePoint(frameNumber + MovementSink.latency, x, y));
    }
  }

  private internalMoveTo(x: number, y: number) {
    const maxSpeed = 30 / Math.pow(this.ball.r, 1.5);
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
    if (frameNumber >= this.lastFrameProcessed) {
      this.futureSplits.push(frameNumber);
    }
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
    while (this.futureDestinations.length > 0 &&
      this.futureDestinations[0].frame === frameNumber) {
      const d = this.futureDestinations[0];
      this.lastPoint = d;
      this.internalMoveTo(d.x, d.y);
      this.futureDestinations.splice(0, 1);
      moved = true;
    }
    if (!moved && this.lastPoint) {
      this.internalMoveTo(this.lastPoint.x, this.lastPoint.y);
    }

    if (this.futureSplits[0] === frameNumber) {
      this.internalSplit();
      while (this.futureSplits.length > 0 &&
        this.futureSplits[0] === frameNumber) {
        this.futureSplits.splice(0, 1);
      }
    }
  }
}