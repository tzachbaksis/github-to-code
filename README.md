# github-to-code

A Chrome extension that adds "Open in IDE" buttons to GitHub, letting you jump straight from a file or line on GitHub into your local editor.

## Supported pages

- **PR "Files changed"** — buttons on file headers and line numbers in diffs
- **Blob (single file view)** — button next to the file name and on each line number

> **Note:** This extension is built for GitHub's **new UI experience**. It may not work correctly on the older/classic GitHub UI.

## Supported IDEs

- VS Code
- GoLand

## Development

```bash
npm install
npm run build
npm test
```

Load the `dist/` folder as an unpacked extension in Chrome.