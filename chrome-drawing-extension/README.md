# Drawing and Highlighting Chrome Extension

A powerful Chrome extension that allows you to draw, highlight, add text, and erase on any webpage. Perfect for presenters, teachers, and anyone who needs to annotate web content quickly.

## Features

- **✏️ Drawing Tool**: Freehand drawing with customizable colors and sizes
- **🖍️ Highlighting Tool**: Highlight important content with semi-transparent colors
- **📝 Text Tool**: Add text annotations anywhere on the page
- **🧽 Eraser Tool**: Remove drawings and highlights
- **🎨 Color Picker**: Choose from millions of colors
- **📏 Size Control**: Adjust line thickness from 1-20 pixels
- **🗑️ Clear All**: Remove all annotations with one click
- **👁️ Toggle Canvas**: Show/hide the drawing overlay

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `chrome-drawing-extension` folder
5. The extension should now appear in your extensions list

### Method 2: Install from Chrome Web Store

*Coming soon...*

## Usage

### Getting Started

1. **Install the extension** using one of the methods above
2. **Navigate to any webpage** where you want to draw or highlight
3. **Click the extension icon** in your Chrome toolbar to open the popup
4. **Select a tool** from the available options:
   - **Draw**: Freehand drawing
   - **Highlight**: Semi-transparent highlighting
   - **Text**: Add text annotations
   - **Eraser**: Remove drawings

### Tool Controls

- **Color Picker**: Click the color swatch to choose any color
- **Size Slider**: Drag the slider to adjust line thickness (1-20px)
- **Clear All**: Remove all drawings and highlights
- **Toggle Canvas**: Show/hide the drawing overlay

### Drawing Tips

- **Drawing**: Click and drag to draw freehand
- **Highlighting**: Click and drag to create highlights
- **Text**: Click anywhere to add text (you'll be prompted to enter text)
- **Erasing**: Click and drag over areas you want to remove
- **Resize**: The canvas automatically adjusts to window size

## Technical Details

### Architecture

- **Background Script** (`background.js`): Manages extension lifecycle and content script injection
- **Content Script** (`content.js`): Creates the drawing canvas overlay and handles user interactions
- **Popup** (`popup.html/js/css`): User interface for tool selection and settings
- **Manifest** (`manifest.json`): Extension configuration and permissions

### Permissions

- `activeTab`: Access to the currently active tab
- `scripting`: Ability to inject content scripts
- `storage`: Save user preferences (future feature)
- `<all_urls>`: Work on any website

### Browser Compatibility

- Chrome 88+ (Manifest V3)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

## Troubleshooting

### Common Issues

1. **Extension not working**: Make sure you're on an HTTP/HTTPS page (not `chrome://` or `file://`)
2. **Canvas not appearing**: Try refreshing the page or clicking the extension icon again
3. **Drawing not working**: Check that the content script is injected (check browser console)
4. **Permission errors**: Ensure the extension has the necessary permissions

### Debug Mode

1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Look for messages from the extension
4. Check for any error messages

## Development

### Project Structure

```
chrome-drawing-extension/
├── manifest.json          # Extension configuration
├── src/
│   ├── background.js      # Background service worker
│   ├── content.js         # Content script for webpage overlay
│   └── popup/             # Extension popup interface
│       ├── popup.html     # Popup HTML structure
│       ├── popup.css      # Popup styling
│       └── popup.js       # Popup functionality
├── icons/                 # Extension icons
└── README.md             # This file
```

### Building and Testing

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test the changes on a webpage

### Future Enhancements

- Save/load drawing sessions
- Export drawings as images
- Undo/redo functionality
- Different brush styles
- Shape tools (rectangles, circles, arrows)
- Keyboard shortcuts
- Touch support for mobile devices

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Look for existing issues in the repository
3. Create a new issue with detailed information about your problem

---

**Happy Drawing! 🎨**