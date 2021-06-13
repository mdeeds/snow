import { ImmutableBall } from "./immutableBall";

export interface State {
  split(playerId: string, lastAngle: number): void;
  setLocation(playerId: string, x: number, y: number): void;
  getNonPlayerBalls(): IterableIterator<ImmutableBall>;
  getPlayerBalls(): IterableIterator<ImmutableBall>;
  getBall(playerId: string): ImmutableBall;
  renderBalls(ctx: CanvasRenderingContext2D): void;
}