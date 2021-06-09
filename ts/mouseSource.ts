import { S_IFLNK } from "constants";
import { Ball } from "./ball";
import { MovementSink } from "./movementSink";

export class MouseSource {
  private x: number = 0;
  private y: number = 0;
  private sink: MovementSink;
  private split: boolean = false;
  constructor(canvas: HTMLCanvasElement, sink: MovementSink) {
    this.sink = sink;
    canvas.addEventListener('mousemove', (ev: MouseEvent) => {
      this.x = ev.clientX - canvas.offsetLeft;
      this.y = ev.clientY - canvas.offsetTop;
    });
    canvas.addEventListener('click', (ev: MouseEvent) => {
      this.split = true;
    });
  }

  update() {
    this.sink.moveTo(this.x, this.y);
    if (this.split) {
      this.sink.split();
      this.split = false;
    }
  }
}