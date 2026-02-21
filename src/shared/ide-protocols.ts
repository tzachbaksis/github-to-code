import type { IDEConfig, IDEKey, GitHubFileContext, RepoMapping } from "./types";
import { sanitizePath } from "./path-sanitizer";

export const IDE_CONFIGS: Record<IDEKey, IDEConfig> = {
  vscode: {
    key: "vscode",
    label: "VS Code",
    generateURL: (absPath, line) => {
      const encoded = encodeURIComponent(absPath);
      return line
        ? `vscode://file/${encoded}:${line}`
        : `vscode://file/${encoded}`;
    },
  },
  goland: {
    key: "goland",
    label: "GoLand",
    generateURL: (absPath, line) =>
      line
        ? `goland://open?file=${encodeURIComponent(absPath)}&line=${line}`
        : `goland://open?file=${encodeURIComponent(absPath)}`,
  },
};

export function buildIDELink(
  context: GitHubFileContext,
  mapping: RepoMapping,
  ideConfig: IDEConfig,
): string {
  const absPath = sanitizePath(mapping.localPath, context.filePath);
  const url = ideConfig.generateURL(absPath, context.lineNumber);

  // Guard against header injection / malformed URLs from crafted paths
  if (/[\r\n]/.test(url)) {
    throw new Error("Generated URL contains newline characters");
  }

  return url;
}
