import { Ball } from "./ball";

export class CapturedState {
  public static frameLatency = 10;  // Latency measured in frames

  public nonPlayerBalls: Map<number, Ball> = new Map<number, Ball>();
  public playerBalls: Map<string, Ball> = new Map<string, Ball>();
  public frameNumber: number;
  public deletedBalls: number[] = [];
  private constructor() { }

  static serialize(nonPlayerBalls: Map<number, Ball>,
    playerBalls: Map<string, Ball>,
    frameNumber: number,
    deletedBalls: number[], addedBalls: number[]) {
    const npb: object[] = [];
    for (const ballId of addedBalls) {
      npb.push([ballId, nonPlayerBalls.get(ballId)]);
    }
    const pb: object[] = [];
    for (const [k, v] of playerBalls) {
      pb.push([k, v]);
    }
    const dict: object = {};
    dict['nonPlayerBalls'] = npb;
    dict['playerBalls'] = pb;
    dict['frameNumber'] = frameNumber;
    dict['deletedBalls'] = deletedBalls;
    return JSON.stringify(dict);
  }

  static deserialize(serialized: string): CapturedState {
    const result = new CapturedState();
    this.merge(serialized, result);
    return result;
  }

  static merge(serialized: string, target: CapturedState) {
    const dict = JSON.parse(serialized);
    for (const [k, v] of dict['nonPlayerBalls']) {
      let ball: Ball;
      if (target.nonPlayerBalls.has(k)) {
        ball = target.nonPlayerBalls.get(k);
      } else {
        ball = new Ball(v.x, v.y, v.r);
        target.nonPlayerBalls.set(k, ball);
      }
      Object.assign(ball, v);
    }
    for (const [k, v] of dict['playerBalls']) {
      if (target.playerBalls.has(k)) {
        Object.assign(target.playerBalls.get(k), v);
      } else {
        const ball: Ball = new Ball(v['x'], v['y'], v['r']);
        Object.assign(ball, v);
        target.playerBalls.set(k, ball);
      }
    }
    target.frameNumber = dict['frameNumber'];
    for (const i of dict['deletedBalls']) {
      target.nonPlayerBalls.delete(i);
    }
  }
}