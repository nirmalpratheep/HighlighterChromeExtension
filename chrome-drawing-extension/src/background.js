// Background script for the Drawing and Highlighting Extension
chrome.runtime.onInstalled.addListener(() => {
    console.log("Drawing and Highlighting Extension installed successfully.");
});

// Handle extension icon click to toggle drawing mode
chrome.action.onClicked.addListener((tab) => {
    // Only work if we're on a valid page
    if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        console.log('Extension icon clicked, toggling drawing mode...');
        
        // First try to send a message to see if content script is already there
        chrome.tabs.sendMessage(tab.id, { action: 'ping' }, function (response) {
            if (chrome.runtime.lastError) {
                // Content script not there, inject it first
                console.log('Content script not found, injecting...');
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['src/content.js']
                }).then(() => {
                    console.log('Content script injected, now toggling...');
                    // Wait a moment then toggle
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
                    }, 100);
                }).catch((err) => {
                    console.error('Failed to inject content script:', err);
                });
            } else {
                // Content script already there, just toggle
                console.log('Content script found, toggling...');
                chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
            }
        });
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'ping':
            sendResponse({ success: true, message: 'Background script responding' });
            break;
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
});