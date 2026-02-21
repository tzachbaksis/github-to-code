import { SELECTORS } from "../shared/constants";

/**
 * Max depth when walking up the DOM to find a diff section ancestor.
 * GitHub's diff DOM nests line-number cells ~10-15 levels deep; 20 gives
 * comfortable headroom without risking an expensive full-document walk.
 */
const MAX_ANCESTOR_DEPTH = 20;

/**
 * Max depth for the fallback ancestor search (querySelector-based).
 * Slightly lower than MAX_ANCESTOR_DEPTH because each iteration runs
 * multiple querySelectorAll calls, so we keep it tighter for performance.
 */
const MAX_FALLBACK_DEPTH = 15;

export type PageType = "files-changed" | "blob" | "blame" | "tree" | "unknown";

export function detectPageType(): PageType {
  const path = window.location.pathname;

  if (/\/pull\/\d+\/(files|changes)/.test(path)) return "files-changed";
  if (/\/blob\//.test(path)) return "blob";
  if (/\/blame\//.test(path)) return "blame";
  if (/\/tree\//.test(path)) return "tree";

  return "unknown";
}

export interface DiffFile {
  /** The element we anchor our header button next to */
  anchor: HTMLElement;
  /** Extracted file path */
  filePath: string;
  /** The diff section container (for finding line numbers) */
  container: HTMLElement;
}

/**
 * Extract the diff hash from a data-grid-cell-id attribute value.
 * Format: "diff-{hash}-{line}-{line}-{col}"
 */
function extractDiffHash(cellId: string): string | null {
  const match = cellId.match(/^diff-([a-f0-9]+)-/);
  return match ? match[1] : null;
}

/**
 * Find diff files using multiple strategies.
 */
export function getDiffFiles(): DiffFile[] {
  const results: DiffFile[] = [];
  const seenPaths = new Set<string>();

  // Strategy 1: [data-file-path] elements
  const filePathEls = document.querySelectorAll<HTMLElement>(
    SELECTORS.filesChanged.filePathAttr,
  );
  for (const anchor of filePathEls) {
    const filePath = anchor.getAttribute("data-file-path");
    if (!filePath || seenPaths.has(filePath)) continue;
    seenPaths.add(filePath);

    const container = findDiffContainer(anchor);
    results.push({ anchor, filePath, container });
  }

  // Early exit: if Strategy 1 found files and covers all visible diff sections, skip remaining strategies
  const expectedDiffs = document.querySelectorAll("div[id^='diff-']").length;
  if (results.length > 0 && results.length >= expectedDiffs) {
    return results;
  }

  // Strategy 2: Find all diff sections by scanning td cells for unique diff hashes,
  // then resolve file paths from the enclosing section.
  const allCells = document.querySelectorAll<HTMLElement>(
    "td.new-diff-line-number[data-grid-cell-id]",
  );
  const hashToCell = new Map<string, HTMLElement>();
  for (const cell of allCells) {
    const cellId = cell.getAttribute("data-grid-cell-id") || "";
    const hash = extractDiffHash(cellId);
    if (hash && !hashToCell.has(hash)) {
      hashToCell.set(hash, cell);
    }
  }

  // For each unique diff hash, check if we already have that file.
  // If not, try to find its file path from the DOM.
  for (const [hash, cell] of hashToCell) {
    // Walk up from the cell to find a diff section container
    const section = findDiffSectionByHash(cell, hash);
    if (!section) continue;

    const filePath = extractFilePathFromSection(section);
    if (!filePath || seenPaths.has(filePath)) continue;
    seenPaths.add(filePath);

    // Find a suitable anchor element for the header button
    const anchor = findFileNameElement(section) || section;
    results.push({ anchor, filePath, container: section });
  }

  // Strategy 3: Scan ALL div[id^="diff-"] containers directly.
  // This catches files with "Load Diff" (no td cells yet) and any other
  // files missed by previous strategies.
  const diffSections =
    document.querySelectorAll<HTMLElement>("div[id^='diff-']");
  for (const section of diffSections) {
    const filePath = extractFilePathFromSection(section);
    if (!filePath || seenPaths.has(filePath)) continue;
    seenPaths.add(filePath);

    const anchor = findFileNameElement(section) || section;
    results.push({ anchor, filePath, container: section });
  }

  // Strategy 4: [data-tagsearch-path] containers
  const tagsearchEls = document.querySelectorAll<HTMLElement>(
    "[data-tagsearch-path]",
  );
  for (const el of tagsearchEls) {
    const filePath = el.getAttribute("data-tagsearch-path");
    if (!filePath || seenPaths.has(filePath)) continue;
    seenPaths.add(filePath);

    const anchor = findFileNameElement(el) || el;
    const container = findDiffContainer(anchor) || el;
    results.push({ anchor, filePath, container });
  }

  return results;
}

/**
 * Walk up from a td cell to find the enclosing diff section.
 * Looks for elements with id matching the diff hash.
 */
function findDiffSectionByHash(
  cell: HTMLElement,
  hash: string,
): HTMLElement | null {
  let el: HTMLElement | null = cell;
  for (let i = 0; i < MAX_ANCESTOR_DEPTH && el; i++) {
    // Check if this element's id contains the hash
    if (el.id && el.id.includes(hash)) {
      return el;
    }
    // Check for common diff section markers
    if (
      el.getAttribute("data-tagsearch-path") ||
      el.getAttribute("data-file-path") ||
      el.id?.startsWith("diff-")
    ) {
      return el;
    }
    el = el.parentElement;
  }

  // Fallback: walk up to find any ancestor that contains both
  // the file header area and the diff table
  el = cell;
  for (let i = 0; i < MAX_FALLBACK_DEPTH && el; i++) {
    if (
      el.querySelector(SELECTORS.filesChanged.lineNumberCell) &&
      (el.querySelector("[data-file-path]") ||
        el.querySelector("a[title]") ||
        el.querySelector("button[aria-label]") ||
        el.querySelector("copilot-diff-entry"))
    ) {
      return el;
    }
    el = el.parentElement;
  }

  return null;
}

/**
 * Extract a file path from a diff section container.
 */
function extractFilePathFromSection(section: HTMLElement): string | null {
  // Try data attributes first
  const dataFilePath = section.querySelector<HTMLElement>("[data-file-path]");
  if (dataFilePath) {
    return dataFilePath.getAttribute("data-file-path");
  }

  const tagsearchPath = section.getAttribute("data-tagsearch-path");
  if (tagsearchPath) return tagsearchPath;

  // Try to find a link whose href contains /blob/ or /tree/
  const blobLink = section.querySelector<HTMLAnchorElement>(
    "a[href*='/blob/'], a[href*='/tree/']",
  );
  if (blobLink) {
    const href = blobLink.getAttribute("href") || "";
    // Extract path after /blob/{ref}/ or /tree/{ref}/
    const match = href.match(/\/(?:blob|tree)\/[^/]+\/(.+)/);
    if (match) return match[1];
  }

  // Try title attributes on links
  const titleLink = section.querySelector<HTMLElement>("a[title]");
  if (titleLink) {
    const title = titleLink.getAttribute("title");
    if (title && title.includes("/")) return title;
  }

  // Try copilot-diff-entry
  const copilot = section.querySelector<HTMLElement>("copilot-diff-entry");
  if (copilot) {
    return (
      copilot.getAttribute("data-file-path") ||
      copilot.getAttribute("data-path") ||
      copilot.getAttribute("path")
    );
  }

  // Fallback: extract file path from header text content.
  // GitHub 2026 embeds the file name between U+200E (LTR mark) characters:
  //   "Collapse file‎path/to/file‎Copy file name..."
  const headerEl = section.querySelector<HTMLElement>(
    "[class*='Header'], [class*='header']",
  );
  if (headerEl) {
    const text = headerEl.textContent || "";
    // Try extracting between LTR marks (U+200E)
    const ltrMatch = text.match(/\u200E([^\u200E]+)\u200E/);
    if (ltrMatch && ltrMatch[1].includes("/")) {
      return ltrMatch[1];
    }
    // Fallback: extract between "Collapse file" and "Copy file name"
    const textMatch = text.match(/Collapse file\s*(.+?)\s*Copy file name/);
    if (textMatch && textMatch[1].includes("/")) {
      return textMatch[1].trim();
    }
  }

  return null;
}

/**
 * Walk up from an anchor element to find the diff section container.
 */
function findDiffContainer(anchor: HTMLElement): HTMLElement {
  let container = anchor.parentElement;
  for (let i = 0; i < 10 && container; i++) {
    if (container.querySelector(SELECTORS.filesChanged.lineNumberCell)) {
      return container;
    }
    container = container.parentElement;
  }
  return anchor.parentElement || anchor;
}

/**
 * Within a diff section, find an element to anchor our header button next to.
 * We look for the file name element or the clipboard copy button.
 */
function findFileNameElement(container: HTMLElement): HTMLElement | null {
  // Direct file-path attribute (works for some files)
  const filePath = container.querySelector<HTMLElement>("[data-file-path]");
  if (filePath) return filePath;

  // Links to blob/tree views
  const blobLink =
    container.querySelector<HTMLElement>("a[title][href*='/blob/']") ||
    container.querySelector<HTMLElement>("a[title][href*='/tree/']") ||
    container.querySelector<HTMLElement>("a.Link--primary[title]");
  if (blobLink) return blobLink;

  // Clipboard copy button — always present next to the file name in 2026 GitHub.
  // Insert our button after it.
  const copyBtn = container.querySelector<HTMLElement>(
    "button[aria-label*='Copy'], clipboard-copy, [data-action*='clipboard']",
  );
  if (copyBtn) return copyBtn;

  // Any button in the diff header area (e.g., the collapse button)
  const diffHeader = container.querySelector<HTMLElement>(
    "[class*='diffHeader'], [class*='DiffFileHeader']",
  );
  if (diffHeader) {
    // Find the last button-like element in the header's first row
    const btns = diffHeader.querySelectorAll<HTMLElement>("button");
    if (btns.length > 1) {
      // Return the second button (first is collapse, second is near the file name)
      return btns[1];
    }
    return diffHeader;
  }

  return (
    container.querySelector<HTMLElement>(".Truncate a") ||
    container.querySelector<HTMLElement>("copilot-diff-entry")
  );
}

export interface LineInfo {
  el: HTMLElement;
  line: number;
  side: "left" | "right";
}

export function getLineNumberElements(container: HTMLElement): LineInfo[] {
  const results: LineInfo[] = [];
  const cells = container.querySelectorAll<HTMLElement>(
    SELECTORS.filesChanged.lineNumberCell,
  );

  for (const cell of cells) {
    if (!cell.classList.contains("new-diff-line-number")) continue;

    const lineStr = cell.getAttribute("data-line-number");
    if (!lineStr) continue;

    const line = parseInt(lineStr, 10);
    if (isNaN(line)) continue;

    const diffSide = cell.getAttribute("data-diff-side");
    const side: "left" | "right" = diffSide === "right" ? "right" : "left";

    results.push({ el: cell, line, side });
  }

  return results;
}
