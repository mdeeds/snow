import { S_IFLNK } from "constants";
import { Ball } from "./ball";
import { MovementSink } from "./movementSink";

export class MouseSource {
  private x: number = 0;
  private y: number = 0;
  private sink: MovementSink;
  constructor(canvas: HTMLCanvasElement, sink: MovementSink) {
    this.sink = sink;
    canvas.addEventListener('mousemove', (ev: MouseEvent) => {
      this.x = ev.clientX;
      this.y = ev.clientY;
    })
  }

  update() {
    this.sink.moveTo(this.x, this.y);
  }
}