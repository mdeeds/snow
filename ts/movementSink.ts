import { Ball } from "./ball";

export class MovementSink {
  private ball: Ball;
  constructor(ball: Ball) {
    this.ball = ball;
  }

  private distance(dx: number, dy: number) {
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    return Math.sqrt(dx2 + dy2);
  }

  moveTo(x: number, y: number) {
    const maxSpeed = 30 / (this.ball.r * this.ball.r);
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
  }
}