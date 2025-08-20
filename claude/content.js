// Content script for drawing functionality
class DrawingTool {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.isEnabled = false;
        this.currentTool = 'pen';
        this.currentColor = '#ff0000';
        this.currentSize = 5;
        this.currentOpacity = 1;
        this.startX = 0;
        this.startY = 0;
        this.history = [];
        this.historyIndex = -1;
        this.tempCanvas = null;
        this.tempCtx = null;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
    }
    
    createCanvas() {
        // Main drawing canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'drawingCanvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '999999';
        this.canvas.style.display = 'none';
        
        // Temporary canvas for shape preview
        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.id = 'tempDrawingCanvas';
        this.tempCanvas.style.position = 'fixed';
        this.tempCanvas.style.top = '0';
        this.tempCanvas.style.left = '0';
        this.tempCanvas.style.width = '100vw';
        this.tempCanvas.style.height = '100vh';
        this.tempCanvas.style.pointerEvents = 'none';
        this.tempCanvas.style.zIndex = '1000000';
        this.tempCanvas.style.display = 'none';
        
        document.body.appendChild(this.canvas);
        document.body.appendChild(this.tempCanvas);
        
        this.resizeCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.tempCtx = this.tempCanvas.getContext('2d');
        
        // Save initial state
        this.saveState();
    }
    
    resizeCanvas() {
        const rect = document.documentElement.getBoundingClientRect();
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.tempCanvas.width = window.innerWidth;
        this.tempCanvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.addEventListener('mousedown', (e) => this.startDrawing(e));
        document.addEventListener('mousemove', (e) => this.draw(e));
        document.addEventListener('mouseup', (e) => this.stopDrawing(e));
        document.addEventListener('click', (e) => this.handleClick(e));
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message);
        });
    }
    
    handleMessage(message) {
        switch (message.action) {
            case 'enable':
                this.enable();
                this.setTool(message.tool);
                this.setColor(message.color);
                this.setSize(message.size);
                this.setOpacity(message.opacity);
                break;
            case 'disable':
                this.disable();
                break;
            case 'setTool':
                this.setTool(message.tool);
                break;
            case 'setColor':
                this.setColor(message.color);
                break;
            case 'setSize':
                this.setSize(message.size);
                break;
            case 'setOpacity':
                this.setOpacity(message.opacity);
                break;
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
            case 'clear':
                this.clear();
                break;
        }
    }
    
    enable() {
        this.isEnabled = true;
        this.canvas.style.display = 'block';
        this.tempCanvas.style.display = 'block';
        this.canvas.style.pointerEvents = 'auto';
        this.tempCanvas.style.pointerEvents = 'auto';
        document.body.style.cursor = this.getCursor();
    }
    
    disable() {
        this.isEnabled = false;
        this.canvas.style.display = 'none';
        this.tempCanvas.style.display = 'none';
        this.canvas.style.pointerEvents = 'none';
        this.tempCanvas.style.pointerEvents = 'none';
        document.body.style.cursor = 'auto';
    }
    
    getCursor() {
        switch (this.currentTool) {
            case 'pen':
            case 'highlighter':
                return 'crosshair';
            case 'eraser':
                return 'grab';
            case 'rectangle':
            case 'circle':
            case 'arrow':
                return 'crosshair';
            default:
                return 'crosshair';
        }
    }
    
    setTool(tool) {
        this.currentTool = tool;
        if (this.isEnabled) {
            document.body.style.cursor = this.getCursor();
        }
    }
    
    setColor(color) {
        this.currentColor = color;
    }
    
    setSize(size) {
        this.currentSize = size;
    }
    
    setOpacity(opacity) {
        this.currentOpacity = opacity;
    }
    
    startDrawing(e) {
        if (!this.isEnabled) return;
        
        e.preventDefault();
        this.isDrawing = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        if (this.currentTool === 'pen' || this.currentTool === 'highlighter' || this.currentTool === 'eraser') {
            this.setupDrawingStyle();
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        }
    }
    
    draw(e) {
        if (!this.isEnabled || !this.isDrawing) return;
        
        e.preventDefault();
        const currentX = e.clientX;
        const currentY = e.clientY;
        
        if (this.currentTool === 'pen' || this.currentTool === 'highlighter') {
            this.ctx.lineTo(currentX, currentY);
            this.ctx.stroke();
        } else if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.beginPath();
            this.ctx.arc(currentX, currentY, this.currentSize, 0, 2 * Math.PI);
            this.ctx.fill();
        } else if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'arrow') {
            // Clear temp canvas and draw preview
            this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
            this.drawShape(this.tempCtx, this.startX, this.startY, currentX, currentY);
        }
    }
    
    stopDrawing(e) {
        if (!this.isEnabled || !this.isDrawing) return;
        
        this.isDrawing = false;
        
        if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'arrow') {
            // Draw final shape on main canvas
            const currentX = e.clientX;
            const currentY = e.clientY;
            this.drawShape(this.ctx, this.startX, this.startY, currentX, currentY);
            this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        }
        
        this.ctx.globalCompositeOperation = 'source-over';
        this.saveState();
    }
    
    drawShape(ctx, startX, startY, endX, endY) {
        ctx.save();
        this.setupDrawingStyle(ctx);
        
        switch (this.currentTool) {
            case 'rectangle':
                const width = endX - startX;
                const height = endY - startY;
                ctx.strokeRect(startX, startY, width, height);
                break;
                
            case 'circle':
                const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                ctx.stroke();
                break;
                
            case 'arrow':
                this.drawArrow(ctx, startX, startY, endX, endY);
                break;
        }
        
        ctx.restore();
    }
    
    drawArrow(ctx, fromX, fromY, toX, toY) {
        const headLength = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }
    
    setupDrawingStyle(ctx = this.ctx) {
        ctx.strokeStyle = this.hexToRgba(this.currentColor, this.currentOpacity);
        ctx.lineWidth = this.currentSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (this.currentTool === 'highlighter') {
            ctx.globalCompositeOperation = 'multiply';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    handleClick(e) {
        if (!this.isEnabled || this.currentTool !== 'eraser') return;
        
        e.preventDefault();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(e.clientX, e.clientY, this.currentSize, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
        this.saveState();
    }
    
    saveState() {
        this.historyIndex++;
        if (this.historyIndex < this.history.length) {
            this.history.length = this.historyIndex;
        }
        this.history.push(this.canvas.toDataURL());
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
        }
    }
    
    restoreState(dataUrl) {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        this.saveState();
    }
}

// Initialize the drawing tool when the content script loads
const drawingTool = new DrawingTool();