import { MovementSink } from "./movementSink";

export interface MovementSource {
  // When requested, sends update for frame `frameNumber` to its sink.
  update(frameNumber: number): void;
}