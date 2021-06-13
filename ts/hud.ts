export class Hud {
  private canvas: HTMLCanvasElement;
  private numberOfPlayers: number = 0;
  private knownColors: string[] = [];
  private colorScores: Map<string, number> = new Map<string, number>();
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1024;
    this.canvas.height = 100;
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(this.canvas);
  }

  public setNumberOfPlayers(n: number) {
    this.numberOfPlayers = n;
    this.render();
  }

  public setKnownColors(colors: string[]) {
    this.knownColors = colors;
    this.render();
  }

  public setColorScore(color: string, score: number) {
    this.colorScores.set(color, score);
    this.render();
  }

  private lastRender = 0;
  private render() {
    if (window.performance.now() - this.lastRender < 10) {
      return;
    }
    this.lastRender = window.performance.now();
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.font = '30px monospace'
    ctx.fillStyle = 'orange';
    ctx.fillText(this.numberOfPlayers.toFixed(0), 5, 20);
    ctx.fillText(this.knownColors.join(' '), 5, 60);

    ctx.font = '20px monospace'
    let y = 20;
    for (const [color, score] of this.colorScores.entries()) {
      ctx.fillStyle = color;
      ctx.fillText(`${color}: ${score.toFixed(0)}`, 500, y);
      y += 25;
    }
  }
}