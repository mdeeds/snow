const { deflateRaw } = require("zlib");


function draw(canvas) {
  const ctx = canvas.getContext("2d");
  // Create a radial gradient
  // The inner circle is at x=110, y=90, with radius=30
  // The outer circle is at x=100, y=100, with radius=70
  var gradient = ctx.createRadialGradient(
    110,  // x1
    90,   // y1
    30,   // r1 
    100,  // x2
    100,  // y2
    70);  // r2

  // Add three color stops
  gradient.addColorStop(0, 'white');
  gradient.addColorStop(.9, 'lightgrey');
  gradient.addColorStop(1, 'lightblue');

  // Set the fill style and draw a rectangle
  ctx.fillStyle = gradient;
  ctx.fillRect(20, 20, 160, 160);

}



function main() {
  const body = document.getElementsByTagName("body")[0];
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 800;

  body.appendChild(canvas);
  draw(canvas);
}