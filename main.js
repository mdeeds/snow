var penguin;
var balls = [];

function drawBall(ctx, x, y, r) {
  var gradient = ctx.createRadialGradient(
    x + r * 0.2,  // x1
    y - r * 0.1,   // y1
    r * 0.5,   // r1 
    x,  // x2
    y,  // y2
    r);  // r2
  gradient.addColorStop(0, 'white');
  gradient.addColorStop(.9, 'lightgrey');
  gradient.addColorStop(1, 'lightblue');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI, Math.PI);
  ctx.fill();
}

function draw(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall(ctx, penguin.x, penguin.y, penguin.r);
  for (let b of balls) {
    drawBall(ctx, b.x, b.y, b.r);
  }
  requestAnimationFrame((timeStep) => {
    penguin.update(timeStep);
    for (let b of balls) {
      b.update(timeStep);
    }
    draw(canvas);
  });
}

class Penguin {
  constructor() {
    this.x = 500;
    this.y = 600;
    this.dx = 0;
    this.dy = 0;
    this.r = 0;
    this.lastUpdate = 0;
    document.addEventListener("keydown", (ev) => {
      this.handleKeyDown(ev);
    });
    document.addEventListener("keyup", (ev) => {
      this.handleKeyDown(ev);
    });
  }

  handleKeyDown(ev) {
    if (ev.type == "keyup") {
      this.dx = 0;
      return;
    }
    switch (ev.code) {
      case "ArrowRight":
        this.dx = 10;
        break;
      case "ArrowLeft":
        this.dx = -10;
        break;
      case "Space":
        const ball = new Ball(this.x, this.y, this.r);
        balls.push(ball);
        this.r = 0;
        break;
    }
    console.log(ev.code);
  }

  update(timeStep) {
    if (!this.lastUpdate) {
      this.lastUpdate = timeStep;
      return;
    }
    let dt = timeStep / this.lastUpdate;
    this.lastUpdate = timeStep;
    this.x += dt * this.dx;
    this.dy += dt * this.dy;
    const dr = dt * Math.abs(this.dx * 0.01);
    this.r += dr;
    this.y -= 1 * dr;
  }

}

class Ball {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.dy = -10;
    this.dx = 0;
  }
  update(timeStep) {
    if (!this.lastUpdate) {
      this.lastUpdate = timeStep;
      return;
    }
    let dt = timeStep / this.lastUpdate;
    this.lastUpdate = timeStep;
    this.x += dt * this.dx;
    this.y += dt * this.dy;
    this.dy += 0.2 * dt;
  }
}

function main() {
  penguin = new Penguin();

  const body = document.getElementsByTagName("body")[0];
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 800;

  body.appendChild(canvas);
  draw(canvas);
}