import type { ExtensionSettings, GitHubFileContext } from "../shared/types";
import { IDE_CONFIGS } from "../shared/ide-protocols";
import { findMapping } from "../shared/storage";
import { GHC_BUTTON_CLASS } from "../shared/constants";
import { getDiffFiles, getLineNumberElements } from "./dom-utils";
import { createIDEButton, injectFileHeaderIcon, injectLineIcon } from "./icon-injector";

export function initFilesChanged(
  settings: ExtensionSettings,
  org: string,
  repo: string,
): void {
  const mapping = findMapping(settings.mappings, org, repo);
  if (!mapping) return;
  if (!mapping.localPath) return;

  const ideConfig = IDE_CONFIGS[settings.ide];
  const diffFiles = getDiffFiles();

  for (const { anchor, filePath, container } of diffFiles) {
    const context: GitHubFileContext = { org, repo, filePath };

    // Inject file header icon — only if not already present next to this anchor
    if (settings.showOnFileHeaders) {
      const existingHeaderBtn = anchor.parentElement?.querySelector(
        `.${GHC_BUTTON_CLASS}.ghc-ide-btn--header`,
      );
      if (!existingHeaderBtn) {
        const headerBtn = createIDEButton(
          context,
          ideConfig,
          mapping,
        );
        if (headerBtn) {
          injectFileHeaderIcon(anchor, headerBtn);
        }
      }
    }

    // Inject line number icons — check each td individually,
    // since GitHub virtualizes these cells (destroys/recreates on scroll)
    if (settings.showOnLineNumbers) {
      const lines = getLineNumberElements(container);
      for (const { el, line } of lines) {
        if (el.querySelector(`.${GHC_BUTTON_CLASS}`)) continue;

        const lineContext: GitHubFileContext = {
          ...context,
          lineNumber: line,
        };
        const lineBtn = createIDEButton(
          lineContext,
          ideConfig,
          mapping,
        );
        if (lineBtn) {
          injectLineIcon(el, lineBtn);
        }
      }
    }
  }
}
