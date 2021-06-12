import { FutureMove } from "./futureMove";
import { Log } from "./log";
import { MovementSink } from "./movementSink";
import { MovementSource } from "./movementSource";
import { PeerGroup } from "./peerGroup";

export class NetworkSource implements MovementSource {
  private futureMoves: FutureMove[] = [];
  private sink: MovementSink;

  constructor(sourceId: string, peerGroup: PeerGroup, sink: MovementSink) {
    this.sink = sink;
    peerGroup.addCallback(`from_${sourceId}`,
      (fromId: string, data: string) => {
        const m: FutureMove = JSON.parse(data);
        this.futureMoves.push(m);
        this.futureMoves.sort((a, b) => a.frameNumber - b.frameNumber)
      });
  }

  // When requested, sends update for frame `frameNumber` to sink.
  update(frameNumber: number): void {
    for (const f of this.futureMoves) {
      switch (f.type) {
        case 'move': this.sink.moveTo(f.x, f.y, f.frameNumber);
          break;
        case 'split': this.sink.split(f.frameNumber);
          break;
      }
    }
    this.futureMoves.splice(0);
    this.sink.update(frameNumber);
  }
}