import { describe, it, expect } from "vitest";
import { parseGitHubURL, parseOrgRepo } from "../src/shared/url-parser";

describe("parseGitHubURL", () => {
  it("parses a blob URL without line number", () => {
    const result = parseGitHubURL(
      "https://github.com/facebook/react/blob/main/src/index.ts",
    );
    expect(result).toEqual({
      org: "facebook",
      repo: "react",
      filePath: "src/index.ts",
      lineNumber: undefined,
    });
  });

  it("parses a blob URL with a line number", () => {
    const result = parseGitHubURL(
      "https://github.com/facebook/react/blob/main/src/index.ts#L42",
    );
    expect(result).toEqual({
      org: "facebook",
      repo: "react",
      filePath: "src/index.ts",
      lineNumber: 42,
    });
  });

  it("parses a blob URL with a line range (uses start line)", () => {
    const result = parseGitHubURL(
      "https://github.com/facebook/react/blob/main/src/index.ts#L10-L20",
    );
    expect(result).toEqual({
      org: "facebook",
      repo: "react",
      filePath: "src/index.ts",
      lineNumber: 10,
    });
  });

  it("parses a blame URL", () => {
    const result = parseGitHubURL(
      "https://github.com/vercel/next.js/blame/canary/package.json",
    );
    expect(result).toEqual({
      org: "vercel",
      repo: "next.js",
      filePath: "package.json",
      lineNumber: undefined,
    });
  });

  it("parses deeply nested file paths", () => {
    const result = parseGitHubURL(
      "https://github.com/org/repo/blob/main/src/a/b/c/d/file.tsx",
    );
    expect(result).toEqual({
      org: "org",
      repo: "repo",
      filePath: "src/a/b/c/d/file.tsx",
      lineNumber: undefined,
    });
  });

  it("handles file paths with special characters", () => {
    const result = parseGitHubURL(
      "https://github.com/org/repo/blob/main/src/my-file_v2.test.ts",
    );
    expect(result).toEqual({
      org: "org",
      repo: "repo",
      filePath: "src/my-file_v2.test.ts",
      lineNumber: undefined,
    });
  });

  it("returns null for non-matching URLs", () => {
    expect(parseGitHubURL("https://github.com/facebook/react")).toBeNull();
    expect(parseGitHubURL("https://github.com/facebook/react/pulls")).toBeNull();
    expect(parseGitHubURL("https://example.com/blob/main/file.ts")).toBeNull();
  });

  it("strips query parameters from file path", () => {
    const result = parseGitHubURL(
      "https://github.com/org/repo/blob/main/src/file.ts?plain=1#L5",
    );
    expect(result).toEqual({
      org: "org",
      repo: "repo",
      filePath: "src/file.ts",
      lineNumber: 5,
    });
  });
});

describe("parseOrgRepo", () => {
  it("extracts org and repo from a GitHub URL", () => {
    expect(
      parseOrgRepo("https://github.com/facebook/react/pull/123/files"),
    ).toEqual({ org: "facebook", repo: "react" });
  });

  it("extracts org and repo from a simple repo URL", () => {
    expect(parseOrgRepo("https://github.com/vercel/next.js")).toEqual({
      org: "vercel",
      repo: "next.js",
    });
  });

  it("returns null for non-GitHub URLs", () => {
    expect(parseOrgRepo("https://example.com/foo/bar")).toBeNull();
  });

  it("returns null for GitHub homepage", () => {
    expect(parseOrgRepo("https://github.com/")).toBeNull();
  });
});
