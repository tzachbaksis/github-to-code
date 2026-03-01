import type { ExtensionSettings, GitHubFileContext } from "../shared/types";
import { IDE_CONFIGS } from "../shared/ide-protocols";
import { findMapping } from "../shared/storage";
import { GHC_BUTTON_CLASS, SELECTORS } from "../shared/constants";
import { parseGitHubURL } from "../shared/url-parser";
import { createIDEButton, injectLineIcon } from "./icon-injector";

/**
 * Find the blob file header element to anchor our button next to.
 * Tries multiple selectors to handle different GitHub DOM layouts.
 */
function findBlobHeaderAnchor(): HTMLElement | null {
  // Try breadcrumb-based file name selectors
  for (const selector of SELECTORS.blob.headerAnchors) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) return el;
  }

  return null;
}

/**
 * Get line number elements from a blob page.
 * GitHub blob pages use <td> or <div> elements with data-line-number attributes.
 */
function getBlobLineElements(): { el: HTMLElement; line: number }[] {
  const results: { el: HTMLElement; line: number }[] = [];

  for (const selector of SELECTORS.blob.lineNumber) {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    for (const el of elements) {
      const lineStr = el.getAttribute("data-line-number");
      if (!lineStr) continue;

      const line = parseInt(lineStr, 10);
      if (isNaN(line)) continue;

      results.push({ el, line });
    }

    // If we found results with this selector, no need to try others
    if (results.length > 0) break;
  }

  return results;
}

export function initBlob(
  settings: ExtensionSettings,
  org: string,
  repo: string,
): void {
  const parsed = parseGitHubURL(window.location.href);
  if (!parsed) return;

  const { filePath } = parsed;
  const mapping = findMapping(settings.mappings, org, repo);
  if (!mapping) return;
  if (!mapping.localPath) return;

  const ideConfig = IDE_CONFIGS[settings.ide];
  const context: GitHubFileContext = { org, repo, filePath };

  // Inject header button next to the file name breadcrumb
  if (settings.showOnFileHeaders) {
    const anchor = findBlobHeaderAnchor();
    if (anchor) {
      const existingBtn = anchor.parentElement?.querySelector(
        `.${GHC_BUTTON_CLASS}.ghc-ide-btn--blob-header`,
      );
      if (!existingBtn) {
        const headerBtn = createIDEButton(context, ideConfig, mapping);
        if (headerBtn) {
          headerBtn.classList.add("ghc-ide-btn--blob-header");
          anchor.parentElement?.insertBefore(headerBtn, anchor.nextSibling);
        }
      }
    }
  }

  // Inject line number buttons
  if (settings.showOnLineNumbers) {
    const lines = getBlobLineElements();
    for (const { el, line } of lines) {
      if (el.querySelector(`.${GHC_BUTTON_CLASS}`)) continue;

      const lineContext: GitHubFileContext = { ...context, lineNumber: line };
      const lineBtn = createIDEButton(lineContext, ideConfig, mapping);
      if (lineBtn) {
        injectLineIcon(el, lineBtn);
      }
    }
  }
}
