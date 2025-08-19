// This file contains the content script that interacts with the web pages. 
// It handles user interactions and drawing functionalities on the page.

let isDrawing = false;
let startX, startY;
let canvas, ctx;

function createCanvas() {
  canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '10000';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
}

function startDrawing(event) {
  isDrawing = true;
  startX = event.clientX;
  startY = event.clientY;
}

function draw(event) {
  if (!isDrawing) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.rect(startX, startY, event.clientX - startX, event.clientY - startY);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

if (!canvas) {
  createCanvas();
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
}