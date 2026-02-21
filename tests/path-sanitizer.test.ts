import { describe, it, expect } from "vitest";
import { sanitizePath, isValidFilePath } from "../src/shared/path-sanitizer";

describe("sanitizePath", () => {
  it("joins base and relative path correctly", () => {
    expect(sanitizePath("/home/user/project", "src/index.ts")).toBe(
      "/home/user/project/src/index.ts",
    );
  });

  it("handles nested relative paths", () => {
    expect(sanitizePath("/project", "a/b/c/file.ts")).toBe(
      "/project/a/b/c/file.ts",
    );
  });

  it("normalizes backslashes to forward slashes", () => {
    expect(sanitizePath("/project", "src\\utils\\helper.ts")).toBe(
      "/project/src/utils/helper.ts",
    );
  });

  it("strips trailing slashes from base path", () => {
    expect(sanitizePath("/project/", "file.ts")).toBe("/project/file.ts");
  });

  it("rejects directory traversal with ..", () => {
    expect(() => sanitizePath("/project", "../etc/passwd")).toThrow(
      "directory traversal",
    );
  });

  it("rejects .. in the middle of the path", () => {
    expect(() => sanitizePath("/project", "src/../../../etc/passwd")).toThrow(
      "directory traversal",
    );
  });

  it("rejects null bytes in relative path", () => {
    expect(() => sanitizePath("/project", "file\0.ts")).toThrow("null bytes");
  });

  it("rejects null bytes in base path", () => {
    expect(() => sanitizePath("/pro\0ject", "file.ts")).toThrow("null bytes");
  });

  it("rejects control characters in relative path", () => {
    expect(() => sanitizePath("/project", "file\x01.ts")).toThrow(
      "control characters",
    );
  });

  it("rejects control characters in base path", () => {
    expect(() => sanitizePath("/proj\x07ect", "file.ts")).toThrow(
      "control characters",
    );
  });

  it("allows dots in file names (not traversal)", () => {
    expect(sanitizePath("/project", ".eslintrc.json")).toBe(
      "/project/.eslintrc.json",
    );
  });

  it("allows single dot directory names", () => {
    expect(sanitizePath("/project", "./src/file.ts")).toBe(
      "/project/./src/file.ts",
    );
  });

  it("rejects percent-encoded traversal (%2e%2e)", () => {
    expect(() => sanitizePath("/project", "%2e%2e/etc/passwd")).toThrow(
      "directory traversal",
    );
  });

  it("rejects percent-encoded null bytes (%00)", () => {
    expect(() => sanitizePath("/project", "file%00.ts")).toThrow("null bytes");
  });

  it("rejects percent-encoded traversal in base path", () => {
    expect(() => sanitizePath("/project/%2e%2e", "file.ts")).toThrow(
      "directory traversal",
    );
  });
});

describe("isValidFilePath", () => {
  it("accepts normal relative paths", () => {
    expect(isValidFilePath("src/index.ts")).toBe(true);
    expect(isValidFilePath("a/b/c/file.go")).toBe(true);
    expect(isValidFilePath(".eslintrc.json")).toBe(true);
  });

  it("rejects empty paths", () => {
    expect(isValidFilePath("")).toBe(false);
  });

  it("rejects paths with ..", () => {
    expect(isValidFilePath("../etc/passwd")).toBe(false);
    expect(isValidFilePath("src/../../etc/passwd")).toBe(false);
  });

  it("rejects paths with null bytes", () => {
    expect(isValidFilePath("file\0.ts")).toBe(false);
  });

  it("rejects paths with control characters", () => {
    expect(isValidFilePath("file\x01.ts")).toBe(false);
  });

  it("rejects paths with percent-encoded sequences", () => {
    expect(isValidFilePath("src/%2e%2e/etc/passwd")).toBe(false);
    expect(isValidFilePath("file%00.ts")).toBe(false);
  });

  it("rejects paths exceeding 1024 characters", () => {
    expect(isValidFilePath("a/".repeat(513))).toBe(false);
  });
});
