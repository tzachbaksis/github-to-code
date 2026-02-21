import type { GitHubFileContext } from "./types";

const FILE_PATH_RE =
  /github\.com\/([^/]+)\/([^/]+)\/(?:blob|blame|tree)\/[^/]+\/(.+)/;

const LINE_RE = /#L(\d+)(?:-L(\d+))?/;

const ORG_REPO_RE = /github\.com\/([^/]+)\/([^/?#]+)/;

export function parseGitHubURL(url: string): GitHubFileContext | null {
  const fileMatch = url.match(FILE_PATH_RE);
  if (!fileMatch) return null;

  const [, org, repo, filePath] = fileMatch;

  // Strip hash/query from file path
  const cleanPath = filePath.split("#")[0].split("?")[0];

  let lineNumber: number | undefined;
  const lineMatch = url.match(LINE_RE);
  if (lineMatch) {
    lineNumber = parseInt(lineMatch[1], 10);
  }

  return { org, repo, filePath: cleanPath, lineNumber };
}

export function parseOrgRepo(
  url: string,
): { org: string; repo: string } | null {
  const match = url.match(ORG_REPO_RE);
  if (!match) return null;
  return { org: match[1], repo: match[2] };
}
