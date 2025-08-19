// This file contains the content script that interacts with the web pages. 
// It handles user interactions and drawing functionalities on the page.

let canvas, ctx;
let drawing = false;
let currentShape = 'rectangle';
let fillColor = 'rgba(255, 0, 0, 0.5)';
let strokeColor = 'black';
let shapes = [];

document.addEventListener('DOMContentLoaded', () => {
    createCanvas();
    setupEventListeners();
});

function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setupEventListeners() {
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousedown', startDrawing);
    document.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stopDrawing);
}

function startDrawing(e) {
    drawing = true;
    const shape = {
        type: currentShape,
        startX: e.clientX,
        startY: e.clientY,
        endX: e.clientX,
        endY: e.clientY,
        fillColor: fillColor,
        strokeColor: strokeColor
    };
    shapes.push(shape);
}

function draw(e) {
    if (!drawing) return;
    const shape = shapes[shapes.length - 1];
    shape.endX = e.clientX;
    shape.endY = e.clientY;
    render();
}

function stopDrawing() {
    drawing = false;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => {
        ctx.fillStyle = shape.fillColor;
        ctx.strokeStyle = shape.strokeColor;
        ctx.beginPath();
        switch (shape.type) {
            case 'rectangle':
                ctx.rect(shape.startX, shape.startY, shape.endX - shape.startX, shape.endY - shape.startY);
                ctx.fill();
                ctx.stroke();
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2));
                ctx.arc(shape.startX, shape.startY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
            // Add more shapes as needed
        }
    });
}

// Function to set the current shape
function setCurrentShape(shape) {
    currentShape = shape;
}

// Function to set the fill color
function setFillColor(color) {
    fillColor = color;
}

// Function to set the stroke color
function setStrokeColor(color) {
    strokeColor = color;
}

// Function to clear the canvas
function clearCanvas() {
    shapes = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Function to erase shapes
function erase() {
    // Implement eraser functionality
}