# GitHub to Code

[![CI](https://github.com/tzachbaksis/github-to-code/actions/workflows/ci.yml/badge.svg)](https://github.com/tzachbaksis/github-to-code/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A Chrome extension that adds **"Open in IDE"** buttons to GitHub, letting you jump straight from a file or line on GitHub into your local editor.

## Features

- **PR "Files changed"** — buttons on file headers and line numbers in diffs
- **Blob (single file view)** — button next to the file name and on each line number
- Click a file header button to open the file in your IDE
- Click a line number button to open the file at that exact line

> **Note:** This extension is built for GitHub's **new UI experience**. It may not work correctly on the older/classic GitHub UI.

## Supported IDEs

- VS Code
- GoLand

## Installation

### From source

1. Clone the repo and build:

   ```bash
   git clone https://github.com/tzachbaksis/github-to-code.git
   cd github-to-code
   npm install
   npm run build
   ```

2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/` folder

### Configuration

1. Click the extension icon in the Chrome toolbar
2. Add a repo mapping (e.g. `myorg/myrepo` → `/Users/me/code/myrepo`)
3. Select your IDE

## Development

```bash
npm install
npm run build    # Typecheck + production build
npm test         # Run unit tests
npm run dev      # Build in watch mode
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

[MIT](LICENSE)