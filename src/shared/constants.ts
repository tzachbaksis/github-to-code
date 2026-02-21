import type { ExtensionSettings } from "./types";

export const SELECTORS = {
  filesChanged: {
    /** Buttons/elements carrying the file path in the diff header */
    filePathAttr: "[data-file-path]",
    /** Line number cells in the diff table */
    lineNumberCell: "td[data-line-number]",
  },
  blob: {
    /** Line number elements — try modern selectors first, then legacy */
    lineNumber: [
      "td[data-line-number]",
      "div[data-line-number]",
      ".js-line-number",
    ],
    /** Selectors to find the file name element in the blob header for button injection */
    headerAnchors: [
      "#file-name-id-wide",
      "#file-name-id",
      "[data-testid='breadcrumbs-filename']",
      ".react-blob-header-edit-and-raw-actions",
      "nav[aria-label='File path'] li:last-child",
      ".final-path",
      ".breadcrumb .final-path",
    ],
  },
  blame: {
    lineNumber: ".js-line-number",
    filePath: "#raw-url",
  },
} as const;

export const GHC_BUTTON_CLASS = "ghc-ide-btn";

export const DEFAULT_SETTINGS: ExtensionSettings = {
  mappings: [],
  ide: "vscode",
  showOnFileHeaders: true,
  showOnLineNumbers: true,
};
