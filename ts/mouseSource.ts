import { FutureMove } from "./futureMove";
import { MovementSink } from "./movementSink";
import { MovementSource } from "./movementSource";
import { PeerGroup } from "./peerGroup";

export class MouseSource implements MovementSource {
  private x: number = 0;
  private y: number = 0;
  private split: boolean = false;
  private changed: boolean = true;
  private peerGroup: PeerGroup;
  private sink: MovementSink;
  constructor(canvas: HTMLCanvasElement, peerGroup: PeerGroup,
    sink: MovementSink) {
    this.peerGroup = peerGroup;
    this.sink = sink;
    canvas.addEventListener('mousemove', (ev: MouseEvent) => {
      this.x = ev.clientX - canvas.offsetLeft;
      this.y = ev.clientY - canvas.offsetTop;
      this.changed = true;
    });
    canvas.addEventListener('click', (ev: MouseEvent) => {
      this.split = true;
    });
  }

  update(frameNumber: number) {
    if (this.changed) {
      this.changed = false;
      const m = new FutureMove(frameNumber, 'move');
      m.x = this.x;
      m.y = this.y;
      this.sink.moveTo(this.x, this.y, frameNumber);
      this.peerGroup.broadcast(
        `from_${this.peerGroup.getId()}`, JSON.stringify(m));
    }
    if (this.split) {
      const m = new FutureMove(frameNumber, 'split');
      this.sink.split(frameNumber);
      this.split = false;
      this.peerGroup.broadcast(
        `from_${this.peerGroup.getId()}`, JSON.stringify(m));
    }
  }

  getSink(): MovementSink {
    return this.sink;
  }
}