import { Ball } from './ball';
import { MouseSource } from './mouseSource';
import { MovementSink } from './movementSink';

export class Main {
  private balls: Set<Ball> = new Set<Ball>();
  private movers: MouseSource[] = [];
  private playerBalls: Ball[] = [];
  private canvas: HTMLCanvasElement;


  constructor() {
    const body = document.getElementsByTagName("body")[0];
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1024;
    this.canvas.height = 1024;

    for (let i = 0; i < 1000; ++i) {
      const b = new Ball(Math.random() * 1024, Math.random() * 1024, 2);
      this.balls.add(b);
    }

    const b = new Ball(Math.random() * 1024, Math.random() * 1024, 2);
    b.c = 'pink';
    const sink = new MovementSink(b);
    const mouseSource = new MouseSource(this.canvas, sink);
    this.movers.push(mouseSource);
    this.playerBalls.push(b);

    body.appendChild(this.canvas);
    this.renderLoop();
  }

  renderLoop() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const b of this.balls) {
      b.render(ctx);
    }
    for (const m of this.movers) {
      m.update();
    }
    const ballsToRemove: Ball[] = [];
    for (let b of this.playerBalls) {
      b.render(ctx);
      for (let o of this.balls) {
        if (o.touching(b)) {
          b.r = Math.sqrt(o.r * o.r + b.r * b.r);
          ballsToRemove.push(o);
        }
      }
    }
    for (const b of ballsToRemove) {
      this.balls.delete(b);
    }

    requestAnimationFrame(() => { this.renderLoop(); });
  }


}