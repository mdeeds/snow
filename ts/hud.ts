export class Hud {
  private canvas: HTMLCanvasElement;
  private timerEndTime = null;
  private colorScores: Map<string, number> = new Map<string, number>();
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 600;
    this.canvas.height = 100;
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(this.canvas);
  }

  public setColorScore(color: string, score: number) {
    this.colorScores.set(color, score);
    this.render();
  }

  public setTimerEndTime(endTimeMs: number) {
    this.timerEndTime = endTimeMs;
  }

  private lastRender = 0;
  private render() {
    const nowTime = window.performance.now();
    if (nowTime - this.lastRender < 100) {
      return;
    }
    this.lastRender = nowTime;
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.timerEndTime) {
      ctx.fillStyle = 'green';
      const remainingMs = Math.max(0, this.timerEndTime - nowTime);
      const totalSecondsRemaining = Math.ceil(remainingMs / 1000);
      const remainingS = totalSecondsRemaining % 60;
      const remainingM = Math.floor(totalSecondsRemaining / 60);
      const timerMessage = remainingM.toFixed(0).padStart(2, '0') + ':' +
        remainingS.toFixed(0).padStart(2, '0');
      ctx.fillText(timerMessage, this.canvas.width - 100, 20);
    }
    ctx.font = '20px monospace'
    let y = 20;
    let x = 5;
    for (const [color, score] of this.colorScores.entries()) {
      ctx.fillStyle = color;
      ctx.fillText(`${color}: ${score.toFixed(0)}`, x, y);
      y += 25;
      if (y >= this.canvas.height) {
        y = 20;
        x += 200;
      }
    }
  }
}