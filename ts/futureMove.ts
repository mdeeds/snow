
type MoveType = 'move' | 'split';

export class FutureMove {
  public readonly frameNumber: number;
  public readonly type: MoveType;
  public x: number;
  public y: number;

  constructor(frameNumber: number, type: MoveType) {
    this.frameNumber = frameNumber;
    this.type = type;
  }
}