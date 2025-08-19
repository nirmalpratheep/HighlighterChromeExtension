document.addEventListener('DOMContentLoaded', function () {
    const colorPicker = document.getElementById('colorPicker');
    const shapeSelector = document.getElementById('shapeSelector');
    const fillCheckbox = document.getElementById('fillCheckbox');
    const eraserButton = document.getElementById('eraserButton');
    const drawButton = document.getElementById('drawButton');

    drawButton.addEventListener('click', function () {
        const selectedColor = colorPicker.value;
        const selectedShape = shapeSelector.value;
        const fillShape = fillCheckbox.checked;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'draw',
                color: selectedColor,
                shape: selectedShape,
                fill: fillShape
            });
        });
    });

    eraserButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'erase' });
        });
    });
});