import { describe, it, expect } from "vitest";
import { sanitizePath } from "../src/shared/path-sanitizer";

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

  it("rejects control characters", () => {
    expect(() => sanitizePath("/project", "file\x01.ts")).toThrow(
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
});
