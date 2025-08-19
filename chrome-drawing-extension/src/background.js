// This file contains the background script for the Chrome extension. 
// It manages events and communicates between different parts of the extension.

chrome.runtime.onInstalled.addListener(() => {
    console.log("Drawing and Highlighting Extension installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getDrawingData") {
        // Logic to retrieve drawing data can be added here
        sendResponse({ data: "Drawing data" });
    }
    // Additional message handling can be added here
});