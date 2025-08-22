// Content script for the Drawing and Highlighting Extension
console.log('Drawing extension content script starting...');

// Check if already initialized
if (window.drawingExtension) {
    console.log('Drawing extension already exists, skipping initialization');
} else {
    // Mark as initialized
    window.drawingExtension = true;
    
    let canvas, ctx;
    let isDrawing = false;
    let isErasing = false;
    let isHighlighting = false;
    let isTextMode = false;
    let currentTool = 'draw';
    let currentColor = '#ff0000';
    let currentSize = 3;
    let isFilled = false;
    let startX, startY;
    let drawings = [];
    let highlights = [];
    let texts = [];
    let shapes = [];
    let toolbar;
    let isToolbarVisible = false;

    // Initialize the extension
    function initExtension() {
        try {
            console.log('Initializing drawing extension...');
            createCanvas();
            createToolbar();
            setupEventListeners();
            console.log('Drawing extension initialized successfully');
        } catch (error) {
            console.error('Failed to initialize drawing extension:', error);
        }
    }

    // Create the drawing canvas overlay
    function createCanvas() {
        console.log('Creating canvas...');
        
        // Remove existing canvas if any
        const existingCanvas = document.getElementById('drawing-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        canvas = document.createElement('canvas');
        canvas.id = 'drawing-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2147483647;
        `;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        
        // Set initial styles
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        ctx.lineWidth = currentSize;
        
        console.log('Canvas created successfully', canvas.width, canvas.height);
    }

    // Create floating toolbar
    function createToolbar() {
        console.log('Creating toolbar...');
        
        toolbar = document.createElement('div');
        toolbar.id = 'drawing-toolbar';
        toolbar.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 2147483648; /* ensure toolbar is above the canvas */
            display: none;
            flex-direction: column;
            gap: 4px;
        `;

        // Tool buttons
        const tools = [
            { id: 'draw', icon: '✏️', tooltip: 'Draw' },
            { id: 'highlight', icon: '🖍️', tooltip: 'Highlight' },
            { id: 'text', icon: '📝', tooltip: 'Text' },
            { id: 'eraser', icon: '🧽', tooltip: 'Eraser' },
            { id: 'rectangle', icon: '⬜', tooltip: 'Rectangle' },
            { id: 'circle', icon: '⭕', tooltip: 'Circle' },
            { id: 'triangle', icon: '🔺', tooltip: 'Triangle' },
            { id: 'line', icon: '➖', tooltip: 'Line' }
        ];

        tools.forEach(tool => {
            const btn = document.createElement('button');
            btn.innerHTML = tool.icon;
            btn.title = tool.tooltip;
            btn.dataset.tool = tool.id;
            btn.style.cssText = `
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 6px;
                background: ${tool.id === 'draw' ? '#667eea' : 'white'};
                color: ${tool.id === 'draw' ? 'white' : '#333'};
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            `;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('=== BUTTON CLICK EVENT ===');
                console.log('Button clicked:', tool.id);
                console.log('Event target:', e.target);
                console.log('Button element:', btn);
                console.log('Button dataset:', btn.dataset);
                console.log('Button styles:', {
                    background: btn.style.background,
                    color: btn.style.color,
                    display: btn.style.display
                });
                console.log('========================');
                selectTool(tool.id);
            });
            toolbar.appendChild(btn);
        });

        // Separator
        const separator = document.createElement('div');
        separator.style.cssText = `
            height: 1px;
            background: #e0e0e0;
            margin: 4px 0;
        `;
        toolbar.appendChild(separator);

        // Color picker
        const colorBtn = document.createElement('button');
        colorBtn.innerHTML = '🎨';
        colorBtn.title = 'Color';
        colorBtn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: white;
            color: #333;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        colorBtn.addEventListener('click', showColorPicker);
        toolbar.appendChild(colorBtn);

        // Size control
        const sizeBtn = document.createElement('button');
        sizeBtn.innerHTML = '📏';
        sizeBtn.title = `Size: ${currentSize}`;
        sizeBtn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: white;
            color: #333;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        sizeBtn.addEventListener('click', showSizeControl);
        toolbar.appendChild(sizeBtn);

        // Fill toggle
        const fillBtn = document.createElement('button');
        fillBtn.innerHTML = isFilled ? '🔲' : '⬜';
        fillBtn.title = `Fill: ${isFilled ? 'On' : 'Off'}`;
        fillBtn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: ${isFilled ? '#667eea' : 'white'};
            color: ${isFilled ? 'white' : '#333'};
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        fillBtn.addEventListener('click', toggleFill);
        toolbar.appendChild(fillBtn);

        // Separator
        const separator2 = document.createElement('div');
        separator2.style.cssText = `
            height: 1px;
            background: #e0e0e0;
            margin: 4px 0;
        `;
        toolbar.appendChild(separator2);

        // Action buttons
        const undoBtn = document.createElement('button');
        undoBtn.innerHTML = '↶';
        undoBtn.title = 'Undo';
        undoBtn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: white;
            color: #333;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        undoBtn.addEventListener('click', undo);
        toolbar.appendChild(undoBtn);

        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = '🗑️';
        clearBtn.title = 'Clear All';
        clearBtn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: white;
            color: #333;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        clearBtn.addEventListener('click', clearAll);
        toolbar.appendChild(clearBtn);

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.title = 'Close';
        closeBtn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: #ff6b6b;
            color: white;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.addEventListener('click', hideToolbar);
        toolbar.appendChild(closeBtn);
    // (Removed debug/test buttons to avoid stray UI artifacts)

        document.body.appendChild(toolbar);
        console.log('Toolbar created successfully');
    }

    // Show color picker
    function showColorPicker() {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = currentColor;
        input.style.cssText = `
            position: fixed;
            top: -100px;
            left: -100px;
            opacity: 0;
        `;
        
        input.addEventListener('change', (e) => {
            changeColor(e.target.value);
            document.body.removeChild(input);
        });
        
        document.body.appendChild(input);
        input.click();
    }

    // Show size control
    function showSizeControl() {
        const sizeControl = document.createElement('div');
        sizeControl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 2147483648;
            text-align: center;
        `;
        
        sizeControl.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #333;">Select Size</h3>
            <input type="range" min="1" max="20" value="${currentSize}" style="width: 200px; margin: 10px 0;">
            <div style="font-size: 18px; color: #667eea; font-weight: bold;">${currentSize}</div>
            <button id="size-ok" style="margin-top: 15px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">OK</button>
        `;
        
        const slider = sizeControl.querySelector('input[type="range"]');
        const sizeDisplay = sizeControl.querySelector('div');
        const okBtn = sizeControl.querySelector('#size-ok');
        
        slider.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            sizeDisplay.textContent = size;
            changeSize(size);
        });
        
        okBtn.addEventListener('click', () => {
            document.body.removeChild(sizeControl);
        });
        
        document.body.appendChild(sizeControl);
    }

    // Toggle fill
    function toggleFill() {
        isFilled = !isFilled;
        const fillBtn = toolbar.querySelector('button[title*="Fill"]');
        fillBtn.innerHTML = isFilled ? '🔲' : '⬜';
        fillBtn.title = `Fill: ${isFilled ? 'On' : 'Off'}`;
        fillBtn.style.background = isFilled ? '#667eea' : 'white';
        fillBtn.style.color = isFilled ? 'white' : '#333';
    }

    // Undo last action
    function undo() {
        if (shapes.length > 0) {
            shapes.pop();
        } else if (texts.length > 0) {
            texts.pop();
        } else if (highlights.length > 0) {
            highlights.pop();
        } else if (drawings.length > 0) {
            drawings.pop();
        }
        redrawAll();
    }

    // Show toolbar
    function showToolbar() {
        if (!isToolbarVisible) {
            toolbar.style.display = 'flex';
            isToolbarVisible = true;
            
            // Ensure canvas is visible but keep pointer events off so toolbar stays clickable
            canvas.style.display = 'block';
            canvas.style.pointerEvents = 'none';
            canvas.style.visibility = 'visible';
            
            // Clear any existing content and redraw
            redrawAll();
            
            console.log('Toolbar and canvas shown');
            console.log('Canvas display:', canvas.style.display);
            console.log('Canvas pointerEvents:', canvas.style.pointerEvents);
            console.log('Canvas visibility:', canvas.style.visibility);
        }
    }

    // Hide toolbar
    function hideToolbar() {
        toolbar.style.display = 'none';
        isToolbarVisible = false;
        canvas.style.display = 'none';
        canvas.style.pointerEvents = 'none';
        console.log('Toolbar and canvas hidden');
    }

    // Setup event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Canvas event listeners
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('click', handleClick);
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
        
        console.log('Event listeners set up successfully');
    }

    // Handle mouse down events
    function handleMouseDown(e) {
        console.log('Mouse down:', currentTool, e.clientX, e.clientY);
        
        if (currentTool === 'draw' || currentTool === 'highlight') {
            isDrawing = true;
            startX = e.clientX;
            startY = e.clientY;

            // Configure context for drawing or highlighting
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            if (currentTool === 'highlight') {
                ctx.globalAlpha = 0.25; // semi-transparent
                ctx.lineWidth = Math.max(12, currentSize * 4);
            } else {
                ctx.globalAlpha = 1.0;
                ctx.lineWidth = currentSize;
            }
            ctx.strokeStyle = currentColor;
            ctx.fillStyle = currentColor;
            console.log('Started drawing at:', startX, startY, 'tool:', currentTool);
        } else if (currentTool === 'eraser') {
            isErasing = true;
            eraseAt(e.clientX, e.clientY);
        } else if (['rectangle', 'circle', 'triangle', 'line'].includes(currentTool)) {
            // Start shape drawing only on mousedown
            isDrawing = true;
            startX = e.clientX;
            startY = e.clientY;
            console.log('Started shape at:', startX, startY);
        }
    }

    // Handle mouse move events
    function handleMouseMove(e) {
        if (isDrawing && (currentTool === 'draw' || currentTool === 'highlight')) {
            ctx.lineTo(e.clientX, e.clientY);
            ctx.stroke();
        } else if (isErasing) {
            eraseAt(e.clientX, e.clientY);
        } else if (isDrawing && ['rectangle', 'circle', 'triangle', 'line'].includes(currentTool)) {
            // Preview shape while dragging (only when mouse is pressed)
            redrawAll();
            drawShapePreview(startX, startY, e.clientX, e.clientY);
        }
    }

    // Handle mouse up events
    function handleMouseUp(e) {
        console.log('Mouse up:', currentTool);
        
        if (isDrawing) {
            // Finalize drawing or shape
            if (currentTool === 'highlight') {
                saveHighlight();
            } else if (currentTool === 'draw') {
                saveDrawing();
            } else if (['rectangle', 'circle', 'triangle', 'line'].includes(currentTool)) {
                drawFinalShape(startX, startY, e.clientX, e.clientY);
                // Reset start coordinates to avoid accidental extra shapes
                startX = undefined;
                startY = undefined;
            }
            isDrawing = false;
            console.log('Finished drawing/shape');
        } else if (isErasing) {
            isErasing = false;
        }
    }

    // Draw shape preview
    function drawShapePreview(startX, startY, endX, endY) {
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        ctx.lineWidth = currentSize;
        
        switch (currentTool) {
            case 'rectangle':
                if (isFilled) {
                    ctx.fillRect(startX, startY, endX - startX, endY - startY);
                } else {
                    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                }
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                if (isFilled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.lineTo(startX - (endX - startX), endY);
                ctx.closePath();
                if (isFilled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
                break;
            case 'line':
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                break;
        }
    }

    // Draw final shape and save it
    function drawFinalShape(startX, startY, endX, endY) {
        const shapeData = {
            type: currentTool,
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            color: currentColor,
            size: currentSize,
            filled: isFilled
        };
        
        shapes.push(shapeData);
        
        // Redraw everything to include the new shape
        redrawAll();
    }

    // Save highlight with semi-transparent effect
    function saveHighlight() {
        // Save current canvas snapshot for highlight (treat like a drawing)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        highlights.push({
            type: 'highlight',
            path: imageData,
            color: currentColor,
            size: currentSize
        });
    // Reset alpha so subsequent operations are not semi-transparent
    ctx.globalAlpha = 1.0;
    }

    // Save drawing
    function saveDrawing() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        drawings.push({
            type: 'drawing',
            path: imageData,
            color: currentColor,
            size: currentSize
        });
    // Reset alpha to default
    ctx.globalAlpha = 1.0;
    }

    // Note: highlight uses semi-transparent strokes during drawing; no global fill function required.

    // Handle click events (for text mode)
    function handleClick(e) {
        if (currentTool === 'text') {
            addText(e.clientX, e.clientY);
        }
    }

    // Add text to the canvas
    function addText(x, y) {
        const text = prompt('Enter text:');
        if (text) {
            ctx.font = `${currentSize * 4}px Arial`;
            ctx.fillStyle = currentColor;
            ctx.fillText(text, x, y);
            
            texts.push({
                type: 'text',
                text: text,
                x: x,
                y: y,
                color: currentColor,
                size: currentSize
            });
        }
    }

    // Erase at specific coordinates
    function eraseAt(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, currentSize * 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }

    // Handle window resize
    function handleResize() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            redrawAll();
        }
    }

    // Redraw all elements
    function redrawAll() {
        // Clear the entire canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Only redraw if there are elements to draw
        if (highlights.length > 0 || drawings.length > 0 || shapes.length > 0 || texts.length > 0) {
            console.log('Redrawing elements:', {
                highlights: highlights.length,
                drawings: drawings.length,
                shapes: shapes.length,
                texts: texts.length
            });
            
            // Redraw highlights
            highlights.forEach(highlight => {
                ctx.putImageData(highlight.path, 0, 0);
            });
            
            // Redraw drawings
            drawings.forEach(drawing => {
                ctx.putImageData(drawing.path, 0, 0);
            });
            
            // Redraw shapes
            shapes.forEach(shape => {
                ctx.strokeStyle = shape.color;
                ctx.fillStyle = shape.color;
                ctx.lineWidth = shape.size;
                
                switch (shape.type) {
                    case 'rectangle':
                        if (shape.filled) {
                            ctx.fillRect(shape.startX, shape.startY, shape.endX - shape.startX, shape.endY - shape.startY);
                        } else {
                            ctx.strokeRect(shape.startX, shape.startY, shape.endX - shape.startX, shape.endY - shape.startY);
                        }
                        break;
                    case 'circle':
                        const radius = Math.sqrt(Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2));
                        ctx.beginPath();
                        ctx.arc(shape.startX, shape.startY, radius, 0, 2 * Math.PI);
                        if (shape.filled) {
                            ctx.fill();
                        } else {
                            ctx.stroke();
                        }
                        break;
                    case 'triangle':
                        ctx.beginPath();
                        ctx.moveTo(shape.startX, shape.startY);
                        ctx.lineTo(shape.endX, shape.endY);
                        ctx.lineTo(shape.startX - (shape.endX - shape.startX), shape.endY);
                        ctx.closePath();
                        if (shape.filled) {
                            ctx.fill();
                        } else {
                            ctx.stroke();
                        }
                        break;
                    case 'line':
                        ctx.beginPath();
                        ctx.moveTo(shape.startX, shape.startY);
                        ctx.lineTo(shape.endX, shape.endY);
                        ctx.stroke();
                        break;
                }
            });
            
            // Redraw texts
            texts.forEach(text => {
                ctx.font = `${text.size * 4}px Arial`;
                ctx.fillStyle = text.color;
                ctx.fillText(text.text, text.x, text.y);
            });
        } else {
            console.log('No elements to redraw, canvas is clean');
        }
    }

    // Clear all drawings
    function clearAll() {
        console.log('Clearing all drawings...');
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Reset all arrays
        drawings = [];
        highlights = [];
        texts = [];
        shapes = [];
        
        console.log('All drawings cleared');
    }

    // Select tool
    function selectTool(tool) {
        console.log('Selecting tool:', tool);
        
        // Update current tool
        currentTool = tool;
        
        // Get all tool buttons
        const toolButtons = toolbar.querySelectorAll('button[data-tool]');
        console.log('Found tool buttons:', toolButtons.length);
        
        // Reset all tool buttons to default state
        toolButtons.forEach(btn => {
            btn.style.background = 'white';
            btn.style.color = '#333';
            console.log('Reset button:', btn.dataset.tool);
        });
        
        // Find and activate the selected button
        const selectedButton = toolbar.querySelector(`button[data-tool="${tool}"]`);
        if (selectedButton) {
            selectedButton.style.background = '#667eea';
            selectedButton.style.color = 'white';
            console.log('Button activated:', tool);
        } else {
            console.error('Button not found for tool:', tool);
        }
        
        // Update canvas cursor based on tool
        let cursor = 'default';
        switch (tool) {
            case 'draw':
                cursor = 'crosshair';
                break;
            case 'highlight':
                cursor = 'crosshair';
                break;
            case 'text':
                cursor = 'text';
                break;
            case 'eraser':
                cursor = 'crosshair';
                break;
            case 'rectangle':
                cursor = 'crosshair';
                break;
            case 'circle':
                cursor = 'crosshair';
                break;
            case 'triangle':
                cursor = 'crosshair';
                break;
            case 'line':
                cursor = 'crosshair';
                break;
            default:
                cursor = 'default';
        }
        
        canvas.style.cursor = cursor;
        console.log('Tool set to:', tool, 'Cursor:', cursor);
        
        // Enable canvas pointer events for drawing/erasing tools so the canvas receives input.
        // The toolbar has a higher z-index so it will remain clickable.
        const drawingTools = ['draw', 'highlight', 'eraser', 'rectangle', 'circle', 'triangle', 'line', 'text'];
        if (drawingTools.includes(tool)) {
            canvas.style.pointerEvents = 'auto';
        } else {
            canvas.style.pointerEvents = 'none';
        }
        
        // Log current state
        console.log('Current tool state:', {
            tool: currentTool,
            cursor: canvas.style.cursor,
            activeButton: selectedButton ? selectedButton.dataset.tool : 'none'
        });
    }

    // Change color
    function changeColor(color) {
        currentColor = color;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        // Update toolbar color button appearance if present
        try {
            const colorBtn = toolbar && toolbar.querySelector('button[title="Color"]');
            if (colorBtn) {
                colorBtn.style.background = color;
                // adjust text color for contrast
                colorBtn.style.color = '#fff';
            }
        } catch (e) {
            // ignore
        }
        console.log('Color changed to:', color);
    }

    // Change size
    function changeSize(size) {
        currentSize = parseInt(size);
        ctx.lineWidth = currentSize;
        const sizeBtn = toolbar.querySelector('button[title*="Size"]');
        if (sizeBtn) {
            sizeBtn.title = `Size: ${size}`;
        }
        console.log('Size changed to:', size);
    }

    // Debug function to check button states
    function debugButtons() {
        console.log('=== DEBUGGING BUTTONS ===');
        const toolButtons = toolbar.querySelectorAll('button[data-tool]');
        console.log('Total tool buttons found:', toolButtons.length);
        
        toolButtons.forEach((btn, index) => {
            console.log(`Button ${index}:`, {
                tool: btn.dataset.tool,
                title: btn.title,
                background: btn.style.background,
                color: btn.style.color,
                display: btn.style.display,
                visible: btn.offsetParent !== null
            });
        });
        
        console.log('Current tool:', currentTool);
        console.log('Canvas cursor:', canvas.style.cursor);
        console.log('========================');
    }

    // Test drawing function
    function testDrawing() {
        console.log('Testing drawing functionality...');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw a test pattern
        ctx.strokeStyle = '#ff0000';
        ctx.fillStyle = '#00ff00';
        ctx.lineWidth = 5;
        
        // Draw a red line
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(200, 200);
        ctx.stroke();
        
        // Draw a green circle
        ctx.beginPath();
        ctx.arc(300, 300, 50, 0, 2 * Math.PI);
        ctx.fill();
        
        console.log('Test drawing completed - you should see a red line and green circle');
    }

    // Message listener for communication with popup/background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            console.log('Received message:', request.action, request);
            switch (request.action) {
                case 'ping':
                    sendResponse({ success: true, message: 'Content script is running' });
                    break;
                case 'toggle':
                    if (isToolbarVisible) {
                        hideToolbar();
                    } else {
                        showToolbar();
                    }
                    sendResponse({ success: true });
                    break;
                case 'test':
                    testDrawing();
                    sendResponse({ success: true });
                    break;
                case 'setTool':
                    if (request.tool) {
                        // Ensure toolbar is visible when changing tool from popup
                        if (!isToolbarVisible) showToolbar();
                        selectTool(request.tool);
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ success: false, error: 'Missing tool' });
                    }
                    break;
                case 'setColor':
                    if (request.color) {
                        changeColor(request.color);
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ success: false, error: 'Missing color' });
                    }
                    break;
                case 'setSize':
                    if (typeof request.size !== 'undefined') {
                        changeSize(request.size);
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ success: false, error: 'Missing size' });
                    }
                    break;
                case 'setFill':
                    if (typeof request.fill !== 'undefined') {
                        isFilled = !!request.fill;
                        // Update fill button appearance if toolbar exists
                        const fillBtn = toolbar && toolbar.querySelector('button[title*="Fill"]');
                        if (fillBtn) {
                            fillBtn.innerHTML = isFilled ? '\ud83d\udd32' : '\u2b1c';
                            fillBtn.title = `Fill: ${isFilled ? 'On' : 'Off'}`;
                            fillBtn.style.background = isFilled ? '#667eea' : 'white';
                            fillBtn.style.color = isFilled ? 'white' : '#333';
                        }
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ success: false, error: 'Missing fill value' });
                    }
                    break;
                case 'clear':
                    clearAll();
                    sendResponse({ success: true });
                    break;
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }

        // Return true to indicate we'll respond synchronously (keeps behavior stable)
        return true;
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExtension);
    } else {
        initExtension();
    }
}