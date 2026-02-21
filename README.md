# GitHub to Code - TypeScript Chrome Extension

A Chrome extension built with TypeScript that demonstrates modern extension development practices.

## Features

- 🎯 TypeScript for type-safe development
- 📦 Webpack for bundling
- 🎨 Modern UI with popup interface
- 🔧 Background service worker
- 📄 Content script injection
- 💾 Chrome storage API integration

## Project Structure

```
github-to-code/
├── src/
│   ├── background.ts    # Background service worker
│   ├── content.ts       # Content script
│   └── popup.ts         # Popup UI logic
├── public/
│   ├── manifest.json    # Extension manifest
│   ├── popup.html       # Popup UI
│   └── icons/           # Extension icons
├── dist/                # Built extension (generated)
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

## Development

To watch for changes and rebuild automatically:
```bash
npm run watch
```

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `dist` folder from this project

## Usage

1. Click the extension icon in your Chrome toolbar
2. The popup will show the extension status
3. Click "Perform Action" to interact with the current page
4. The extension will show a temporary indicator on GitHub pages

## Extension Components

### Background Service Worker
- Handles extension lifecycle events
- Listens for messages from content scripts and popup
- Manages extension state

### Content Script
- Runs on web pages
- Can interact with page DOM
- Communicates with background script and popup
- Shows an indicator on GitHub pages

### Popup
- Provides user interface for the extension
- Displays extension status
- Allows users to trigger actions
- Communicates with both content scripts and background script

## Technologies Used

- TypeScript
- Chrome Extension Manifest V3
- Webpack
- Chrome APIs (storage, tabs, runtime)

## License

MIT