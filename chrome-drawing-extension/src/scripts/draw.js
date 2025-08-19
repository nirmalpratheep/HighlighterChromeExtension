const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let shape = 'rectangle';
let color = 'black';
let startX, startY;

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShape(e.offsetX, e.offsetY);
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
});

function drawShape(x, y) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    switch (shape) {
        case 'rectangle':
            ctx.fillRect(startX, startY, x - startX, y - startY);
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(startX, startY, Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2)), 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'square':
            const size = Math.min(x - startX, y - startY);
            ctx.fillRect(startX, startY, size, size);
            break;
    }
}

function setColor(newColor) {
    color = newColor;
}

function setShape(newShape) {
    shape = newShape;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        clearCanvas();
    }
});