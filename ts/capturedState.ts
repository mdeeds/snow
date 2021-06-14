import { Ball } from "./ball";

export class CapturedState {
  public nonPlayerBalls: Set<Ball> = new Set<Ball>();
  public playerBalls: Map<string, Ball> = new Map<string, Ball>();
  public frameNumber: number;
  private constructor() { }

  static serialize(nonPlayerBalls: Set<Ball>,
    playerBalls: Map<string, Ball>,
    frameNumber: number) {
    const npb: Ball[] = [];
    for (const b of nonPlayerBalls) {
      npb.push(b);
    }
    const pb: object[] = [];
    for (const [k, v] of playerBalls) {
      pb.push([k, v]);
    }
    const dict: object = {};
    dict['nonPlayerBalls'] = npb;
    dict['playerBalls'] = pb;
    dict['frameNumber'] = frameNumber;
    return JSON.stringify(dict);
  }

  static deserialize(serialized: string): CapturedState {
    const result = new CapturedState();
    this.merge(serialized, result);
    return result;
  }

  static merge(serialized: string, target: CapturedState) {
    const dict = JSON.parse(serialized);
    target.nonPlayerBalls.clear();
    for (const b of dict['nonPlayerBalls']) {
      const ball: Ball = new Ball(b.x, b.y, b.r);
      Object.assign(ball, b);
      target.nonPlayerBalls.add(ball);
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
  }
}