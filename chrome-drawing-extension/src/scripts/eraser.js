// This file contains the logic for the eraser functionality, allowing users to remove drawn shapes from the web page.

let isErasing = false;

function toggleEraser() {
    isErasing = !isErasing;
    if (isErasing) {
        document.body.style.cursor = 'crosshair';
    } else {
        document.body.style.cursor = 'default';
    }
}

function eraseShape(event) {
    if (!isErasing) return;

    const x = event.clientX;
    const y = event.clientY;

    const shapes = document.querySelectorAll('.drawn-shape');
    shapes.forEach(shape => {
        const rect = shape.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            shape.remove();
        }
    });
}

document.addEventListener('mousedown', (event) => {
    if (isErasing) {
        eraseShape(event);
    }
});

document.addEventListener('mousemove', (event) => {
    if (isErasing) {
        eraseShape(event);
    }
});

document.addEventListener('mouseup', () => {
    if (isErasing) {
        isErasing = false;
        document.body.style.cursor = 'default';
    }
});