import { ImmutableBall } from "./immutableBall";

export class Ball implements ImmutableBall {
  public static minRadius: number = 4;
  public static defatulColor: string = 'lightgrey';

  x: number;
  y: number;
  r: number;
  c: string;
  private rot: number = Math.random();
  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = Ball.defatulColor;
  }

  touching(other: Ball) {
    const twor2 = other.r * other.r + this.r * this.r;
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    return (dx2 + dy2) <= twor2;
  }

  render(ctx: CanvasRenderingContext2D, frameNumber: number) {
    if (this.r < 6 && ctx.fillStyle !== this.c) {
      ctx.fillStyle = this.c;
    } else {
      const gradient = ctx.createRadialGradient(
        this.x + this.r * 0.2,  // x1
        this.y - this.r * 0.1,   // y1
        this.r * 0.5,   // r1 
        this.x,  // x2
        this.y,  // y2
        this.r * 1.2);  // r2
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(.2, this.c);
      gradient.addColorStop(.9, this.c);
      gradient.addColorStop(1, '#333');
      ctx.fillStyle = gradient;
    }
    ctx.beginPath();
    const bulge = Math.sin(frameNumber / 20) * 0.1 + 1.0;
    this.rot += 0.3 * Math.random() - 0.1;
    ctx.ellipse(this.x, this.y,
      this.r * bulge, this.r / bulge,
      this.rot, -Math.PI, Math.PI);
    ctx.fill();
  }

  renderPlayer(ctx: CanvasRenderingContext2D, frameNumber: number) {
    ctx.lineWidth = 1;
    //  ^-(o.O)-^
    ctx.strokeStyle =
      ['green', 'yellow', 'white', 'blue', 'turquoise']
      [Math.trunc(Math.random() * 5)];

    ctx.beginPath();
    ctx.moveTo(this.x + this.r * (Math.random() + 1), this.y);
    for (let t = -Math.PI; t < Math.PI; t += 0.1) {
      const rr = this.r * (Math.random() + 1);
      ctx.lineTo(this.x + Math.cos(t) * rr, this.y + Math.sin(t) * rr);
    }
    ctx.stroke();

    this.render(ctx, frameNumber);
  }
}