import { ImmutableBall } from "./immutableBall";
import { State } from "./state";

export class MouseSource {
  private x: number = 0;
  private y: number = 0;
  private split: boolean = false;
  private changed: boolean = true;
  private state: State;
  private playerId: string;
  private ball: ImmutableBall;
  private lastAngle: number = 0;

  constructor(canvas: HTMLCanvasElement, playerId: string,
    state: State, ball: ImmutableBall) {
    this.playerId = playerId;
    this.state = state;
    this.ball = ball;
    canvas.addEventListener('mousemove', (ev: MouseEvent) => {
      this.x = ev.clientX - canvas.offsetLeft;
      this.y = ev.clientY - canvas.offsetTop;
      this.changed = true;
    });
    canvas.addEventListener('click', (ev: MouseEvent) => {
      this.split = true;
    });
  }
  private distance(dx: number, dy: number) {
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    return Math.sqrt(dx2 + dy2);
  }

  private internalMoveTo() {
    const maxSpeed = 60 / Math.pow(this.ball.r, 1.2);
    const dx = this.x - this.ball.x;
    const dy = this.y - this.ball.y;
    const d = this.distance(dx, dy);
    if (d <= maxSpeed) {
      this.state.setLocation(this.playerId, this.x, this.y);
    } else {
      const p = maxSpeed / d;
      this.state.setLocation(this.playerId, p * dx, p * dy);
    }
    this.lastAngle = Math.atan2(dy, dx);
  }

  update() {
    this.internalMoveTo();
    this.state.setLocation(this.playerId, this.x, this.y);
    if (this.split) {
      this.state.split(this.playerId, this.lastAngle);
      this.split = false;
    }
  }
}