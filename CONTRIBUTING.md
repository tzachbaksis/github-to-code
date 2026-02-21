# Contributing to GitHub to Code

Thanks for your interest in contributing!

## Prerequisites

- Node.js 20 or later
- npm 9+

## Setup

```bash
git clone https://github.com/tzachbaksis/github-to-code.git
cd github-to-code
npm install
```

## Development

```bash
npm run build    # Full production build (typecheck + Vite)
npm test         # Run unit tests
npm run dev      # Build in watch mode
```

### Loading the extension locally

1. Run `npm run build`
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/` folder

## Pull requests

1. Fork the repo and create a feature branch from `main`
2. Make your changes
3. Ensure `npm run build` and `npm test` both pass
4. Open a PR against `main`

CI will automatically run typecheck, build, and tests on your PR.
