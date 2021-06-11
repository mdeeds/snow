import { MovementSink } from "./movementSink";

export interface MovementSource {

  // When requested, sends update for frame `frameNumber` to sink.
  update(frameNumber: number, sink: MovementSink): void;
}