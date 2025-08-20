// Popup script for the drawing extension
let isDrawingEnabled = false;
let currentTool = 'pen';
let currentColor = '#ff0000';
let currentSize = 5;
let currentOpacity = 100;

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
    updateUI();
});

function setupEventListeners() {
    // Toggle drawing mode
    document.getElementById('toggleDrawing').addEventListener('click', toggleDrawingMode);
    
    // Tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectTool(this.dataset.tool);
        });
    });
    
    // Color picker
    document.getElementById('colorPicker').addEventListener('change', function() {
        currentColor = this.value;
        sendMessageToContent({action: 'setColor', color: currentColor});
        saveSettings();
    });
    
    // Size picker
    document.getElementById('sizePicker').addEventListener('input', function() {
        currentSize = parseInt(this.value);
        document.getElementById('sizeValue').textContent = currentSize;
        sendMessageToContent({action: 'setSize', size: currentSize});
        saveSettings();
    });
    
    // Opacity picker
    document.getElementById('opacityPicker').addEventListener('input', function() {
        currentOpacity = parseInt(this.value);
        document.getElementById('opacityValue').textContent = currentOpacity;
        sendMessageToContent({action: 'setOpacity', opacity: currentOpacity / 100});
        saveSettings();
    });
    
    // Action buttons
    document.getElementById('undoBtn').addEventListener('click', () => {
        sendMessageToContent({action: 'undo'});
    });
    
    document.getElementById('redoBtn').addEventListener('click', () => {
        sendMessageToContent({action: 'redo'});
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (confirm('Clear all drawings?')) {
            sendMessageToContent({action: 'clear'});
        }
    });
}

function toggleDrawingMode() {
    isDrawingEnabled = !isDrawingEnabled;
    const toggleBtn = document.getElementById('toggleDrawing');
    
    if (isDrawingEnabled) {
        toggleBtn.textContent = 'Disable Drawing';
        toggleBtn.classList.add('active');
        sendMessageToContent({action: 'enable', tool: currentTool, color: currentColor, size: currentSize, opacity: currentOpacity / 100});
    } else {
        toggleBtn.textContent = 'Enable Drawing';
        toggleBtn.classList.remove('active');
        sendMessageToContent({action: 'disable'});
    }
    
    saveSettings();
}

function selectTool(tool) {
    currentTool = tool;
    
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    
    if (isDrawingEnabled) {
        sendMessageToContent({action: 'setTool', tool: currentTool});
    }
    
    saveSettings();
}

function sendMessageToContent(message) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

function saveSettings() {
    const settings = {
        isDrawingEnabled,
        currentTool,
        currentColor,
        currentSize,
        currentOpacity
    };
    chrome.storage.local.set({drawingSettings: settings});
}

function loadSettings() {
    chrome.storage.local.get('drawingSettings', function(result) {
        if (result.drawingSettings) {
            const settings = result.drawingSettings;
            isDrawingEnabled = settings.isDrawingEnabled || false;
            currentTool = settings.currentTool || 'pen';
            currentColor = settings.currentColor || '#ff0000';
            currentSize = settings.currentSize || 5;
            currentOpacity = settings.currentOpacity || 100;
            
            updateUI();
        }
    });
}

function updateUI() {
    // Update toggle button
    const toggleBtn = document.getElementById('toggleDrawing');
    if (isDrawingEnabled) {
        toggleBtn.textContent = 'Disable Drawing';
        toggleBtn.classList.add('active');
    } else {
        toggleBtn.textContent = 'Enable Drawing';
        toggleBtn.classList.remove('active');
    }
    
    // Update tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${currentTool}"]`).classList.add('active');
    
    // Update controls
    document.getElementById('colorPicker').value = currentColor;
    document.getElementById('sizePicker').value = currentSize;
    document.getElementById('sizeValue').textContent = currentSize;
    document.getElementById('opacityPicker').value = currentOpacity;
    document.getElementById('opacityValue').textContent = currentOpacity;
}