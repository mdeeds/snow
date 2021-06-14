import { State } from "./state";

export class MouseSource {
  private x: number = 0;
  private y: number = 0;
  private split: boolean = false;
  private state: State;
  private playerId: string;
  private lastAngle: number = 0;

  constructor(canvas: HTMLCanvasElement, playerId: string,
    state: State) {
    this.playerId = playerId;
    this.state = state;
    canvas.addEventListener('mousemove', (ev: MouseEvent) => {
      this.x = ev.clientX - canvas.offsetLeft;
      this.y = ev.clientY - canvas.offsetTop;
    });
    canvas.addEventListener('click', (ev: MouseEvent) => {
      this.split = true;
    });
  }

  update() {
    this.state.setLocation(this.playerId, this.x, this.y);
    if (this.split) {
      const ball = this.state.getBall(this.playerId);
      const dx = this.x - ball.x;
      const dy = this.y - ball.y;
      this.lastAngle = Math.atan2(dy, dx);
      this.state.split(this.playerId, this.lastAngle);
      this.split = false;
    }
  }
}