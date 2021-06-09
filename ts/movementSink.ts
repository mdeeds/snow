import { Ball } from "./ball";

export class MovementSink {
  private ball: Ball;
  private nonPlayerBalls: Set<Ball>;
  private lastAngle: number = 0;
  constructor(ball: Ball, nonPlayerBalls: Set<Ball>) {
    this.ball = ball;
    this.nonPlayerBalls = nonPlayerBalls;
  }

  private distance(dx: number, dy: number) {
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    return Math.sqrt(dx2 + dy2);
  }

  moveTo(x: number, y: number) {
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

  split() {
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
}