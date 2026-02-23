# Privacy Policy – GitHub to Code

**Last updated:** February 23, 2026

## Overview

GitHub to Code is a Chrome extension that adds "Open in IDE" buttons to GitHub pages. It is designed with privacy in mind and does **not** collect, transmit, or share any user data.

## Data Collection

This extension does **not** collect any personal or sensitive user data.

## Data Storage

The extension stores the following settings **locally** on your device using the Chrome Storage API (`chrome.storage.local`):

- Your selected IDE (e.g., VS Code, GoLand)
- Repository-to-local-path mappings (e.g., `myorg/myrepo` → `/Users/me/code/myrepo`)
- Display preferences (show on file headers, show on line numbers)

This data never leaves your browser and is not transmitted to any server.

## Data Sharing

No data is shared with third parties. The extension does not use analytics, tracking, or any external services.

## Permissions

- **storage** – Used to save your IDE preference, repo mappings, and display settings locally.
- **Host permission (github.com)** – Used to inject "Open in IDE" buttons into GitHub pages. The extension reads page content only to identify file paths and line numbers.

## Contact

If you have questions about this privacy policy, please open an issue at:
https://github.com/tzachbaksis/github-to-code/issues
