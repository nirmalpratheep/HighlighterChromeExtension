// Popup script for the Drawing and Highlighting Extension
document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const toolButtons = document.querySelectorAll('.tool-btn');
    const shapeButtons = document.querySelectorAll('.shape-btn');
    const colorPicker = document.getElementById('colorPicker');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const fillCheckbox = document.getElementById('fillCheckbox');
    const clearBtn = document.getElementById('clearBtn');
    const toggleBtn = document.getElementById('toggleBtn');
    const statusText = document.getElementById('statusText');

    let currentTool = 'draw';
    let currentColor = '#ff0000';
    let currentSize = 3;
    let isFilled = false;

    // Initialize popup
    function initPopup() {
        // Set initial values
        colorPicker.value = currentColor;
        sizeSlider.value = currentSize;
        sizeValue.textContent = currentSize;
        fillCheckbox.checked = isFilled;
        
        // Update status
        updateStatus(`Current tool: ${currentTool}`);
        
        // Try to inject content script
        injectContentScript();
    }

    // Inject content script into active tab
    function injectContentScript() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0]) {
                // First try to send a message to see if content script is already there
                chrome.tabs.sendMessage(tabs[0].id, { action: 'ping' }, function (response) {
                    if (chrome.runtime.lastError) {
                        // Content script not there, inject it
                        console.log('Attempting to inject content script...');
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            files: ['src/content.js']
                        }).then(() => {
                            console.log('Content script injected successfully');
                            updateStatus('Extension ready!');
                            // Wait a moment then try to communicate
                            setTimeout(() => {
                                sendMessage('ping');
                            }, 100);
                        }).catch((err) => {
                            console.error('Failed to inject content script:', err);
                            updateStatus(`Injection failed: ${err.message}`);
                            
                            // Try alternative injection method
                            tryAlternativeInjection(tabs[0].id);
                        });
                    } else {
                        // Content script already there
                        console.log('Content script already present');
                        updateStatus('Extension ready!');
                    }
                });
            }
        });
    }

    // Try alternative injection method
    function tryAlternativeInjection(tabId) {
        console.log('Trying alternative injection method...');
        updateStatus('Trying alternative injection...');
        
        // Try injecting the script content directly
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: injectContentScriptDirectly
        }).then(() => {
            console.log('Alternative injection successful');
            updateStatus('Extension ready!');
        }).catch((err) => {
            console.error('Alternative injection also failed:', err);
            updateStatus('Extension failed to load. Please refresh the page and try again.');
        });
    }

    // Function to inject content script directly
    function injectContentScriptDirectly() {
        // This function will be injected into the page
        if (window.drawingExtension) {
            console.log('Drawing extension already exists');
            return;
        }

        // Create a script element and inject it
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('src/content.js');
        script.onload = function() {
            console.log('Content script loaded via script tag');
        };
        script.onerror = function() {
            console.error('Failed to load content script via script tag');
        };
        document.head.appendChild(script);
    }

    // Send message to content script
    function sendMessage(action, data = {}) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: action,
                    ...data
                }, function (response) {
                    if (chrome.runtime.lastError) {
                        console.error('Message error:', chrome.runtime.lastError);
                        updateStatus('Error: Could not communicate with page');
                        // Try to reinject content script
                        setTimeout(() => {
                            injectContentScript();
                        }, 1000);
                    } else if (response && response.success) {
                        console.log('Message sent successfully:', action);
                    }
                });
            }
        });
    }

    // Update status text
    function updateStatus(message) {
        statusText.textContent = message;
    }

    // Handle tool selection
    function selectTool(tool) {
        currentTool = tool;
        
        // Update active button states
        toolButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        shapeButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Find and activate the selected button
        const selectedButton = document.querySelector(`[data-tool="${tool}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // Send tool change to content script
        sendMessage('setTool', { tool: tool });
        
        // Update status
        updateStatus(`Tool selected: ${tool}`);
    }

    // Handle color change
    function changeColor(color) {
        currentColor = color;
        sendMessage('setColor', { color: color });
        updateStatus(`Color changed to: ${color}`);
    }

    // Handle size change
    function changeSize(size) {
        currentSize = parseInt(size);
        sizeValue.textContent = currentSize;
        sendMessage('setSize', { size: currentSize });
        updateStatus(`Size changed to: ${currentSize}`);
    }

    // Handle fill checkbox change
    function changeFill(filled) {
        isFilled = filled;
        sendMessage('setFill', { fill: filled });
        updateStatus(`Fill ${filled ? 'enabled' : 'disabled'}`);
    }

    // Event listeners for tool buttons
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tool = this.dataset.tool;
            selectTool(tool);
        });
    });

    // Event listeners for shape buttons
    shapeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tool = this.dataset.tool;
            selectTool(tool);
        });
    });

    // Event listener for color picker
    colorPicker.addEventListener('change', function() {
        changeColor(this.value);
    });

    // Event listener for size slider
    sizeSlider.addEventListener('input', function() {
        changeSize(this.value);
    });

    // Event listener for fill checkbox
    fillCheckbox.addEventListener('change', function() {
        changeFill(this.checked);
    });

    // Event listener for clear button
    clearBtn.addEventListener('click', function() {
        sendMessage('clear');
        updateStatus('Canvas cleared');
    });

    // Event listener for toggle button
    toggleBtn.addEventListener('click', function() {
        sendMessage('toggle');
        updateStatus('Canvas toggled');
    });

    // Initialize popup
    initPopup();
});