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
  drawBall(ctx, 100, 100, 50);
}

function main() {
  const body = document.getElementsByTagName("body")[0];
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 800;

  body.appendChild(canvas);
  draw(canvas);
}