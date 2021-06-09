export class Ball {
  x: number;
  y: number;
  r: number;
  c: string;
  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = 'lightgrey';
  }

  touching(other: Ball) {
    const twor2 = other.r * other.r + this.r * this.r;
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    return (dx2 + dy2 <= twor2);
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.r < 6) {
      ctx.fillStyle = this.c;
    } else {
      const gradient = ctx.createRadialGradient(
        this.x + this.r * 0.2,  // x1
        this.y - this.r * 0.1,   // y1
        this.r * 0.5,   // r1 
        this.x,  // x2
        this.y,  // y2
        this.r);  // r2
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(.9, this.c);
      gradient.addColorStop(1, 'lightblue');
      ctx.fillStyle = gradient;
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, -Math.PI, Math.PI);
    ctx.fill();
  }
}