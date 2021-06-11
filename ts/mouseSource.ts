import { S_IFLNK } from "constants";
import { Ball } from "./ball";
import { MovementSink } from "./movementSink";
import { MovementSource } from "./movementSource";

export class MouseSource implements MovementSource {
  private x: number = 0;
  private y: number = 0;
  private split: boolean = false;
  private changed: boolean = true;
  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousemove', (ev: MouseEvent) => {
      this.x = ev.clientX - canvas.offsetLeft;
      this.y = ev.clientY - canvas.offsetTop;
      this.changed = true;
    });
    canvas.addEventListener('click', (ev: MouseEvent) => {
      this.split = true;
    });
  }

  update(frameNumber: number, sink: MovementSink) {
    if (this.changed) {
      this.changed = false;
      sink.moveTo(this.x, this.y, frameNumber);
    }
    if (this.split) {
      sink.split(frameNumber);
      this.split = false;
    }
  }
}