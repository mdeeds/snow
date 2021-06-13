
type MoveType = 'move' | 'split';

export class FutureMove {
  public readonly playerId: string;
  public readonly frameNumber: number;
  public readonly type: MoveType;
  public x: number;
  public y: number;
  public lastAngle: number;

  constructor(playerId: string, frameNumber: number, type: MoveType) {
    this.playerId = playerId;
    this.frameNumber = frameNumber;
    this.type = type;
  }
}