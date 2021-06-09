import { Ball } from './ball';
import { MouseSource } from './mouseSource';
import { MovementSink } from './movementSink';

export class Main {
  private balls: Set<Ball> = new Set<Ball>();
  private movers: MouseSource[] = [];
  private sink: MovementSink;
  private playerBalls: Ball[] = [];
  private canvas: HTMLCanvasElement;
  private frameNumber: number = 0;

  constructor() {
    const body = document.getElementsByTagName("body")[0];
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1024;
    this.canvas.height = 1024;

    for (let i = 0; i < 1000; ++i) {
      const b = new Ball(Math.random() * 1024, Math.random() * 1024,
        Ball.minRadius);
      this.balls.add(b);
    }

    const b = new Ball(Math.random() * 1024, Math.random() * 1024,
      Ball.minRadius);
    b.c = 'orange';
    this.sink = new MovementSink(b, this.balls);
    const mouseSource = new MouseSource(this.canvas, this.sink);
    this.movers.push(mouseSource);
    this.playerBalls.push(b);

    body.appendChild(this.canvas);
    this.renderLoop();
  }

  private bounce(a: Ball, b: Ball) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    const d = Math.sqrt(dx2 + dy2);
    const minD = a.r + b.r * 1.05;
    const p = (d - minD) / d;
    a.x += p * dx;
    a.y += p * dy;
    b.x -= p * dx;
    b.y -= p * dy;
  }

  renderLoop() {
    ++this.frameNumber;
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const b of this.balls) {
      b.x += Math.random() - 0.5;
      b.y += Math.random() - 0.5;
      b.render(ctx);
    }
    for (const m of this.movers) {
      m.update(this.frameNumber);
    }
    this.sink.update(this.frameNumber);

    const ballsToRemove: Ball[] = [];
    for (let b of this.playerBalls) {
      b.render(ctx);
      for (let o of this.balls) {
        if (o.touching(b)) {
          if (o.r <= b.r) {
            b.r = Math.sqrt(o.r * o.r + b.r * b.r);
            ballsToRemove.push(o);
          } else {
            this.bounce(b, o);
          }
        }
      }
    }
    for (const b of ballsToRemove) {
      this.balls.delete(b);
    }

    requestAnimationFrame(() => { this.renderLoop(); });
  }


}