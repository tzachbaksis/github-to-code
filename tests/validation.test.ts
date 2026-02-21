import { describe, it, expect } from "vitest";
import {
  isAllowedURL,
  validateSettings,
  validateMappingPattern,
  validateLocalPath,
} from "../src/shared/validation";

describe("isAllowedURL", () => {
  it("accepts vscode protocol", () => {
    expect(isAllowedURL("vscode://file/path/to/file.ts")).toBe(true);
  });

  it("accepts goland protocol", () => {
    expect(isAllowedURL("goland://open?file=/path")).toBe(true);
  });

  it("rejects http/https protocols", () => {
    expect(isAllowedURL("https://evil.com")).toBe(false);
    expect(isAllowedURL("http://evil.com")).toBe(false);
  });

  it("rejects javascript protocol", () => {
    expect(isAllowedURL("javascript:alert(1)")).toBe(false);
  });

  it("rejects data protocol", () => {
    expect(isAllowedURL("data:text/html,<h1>hi</h1>")).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(isAllowedURL("not a url")).toBe(false);
    expect(isAllowedURL("")).toBe(false);
  });

  it("rejects protocols not in the allowed list", () => {
    expect(isAllowedURL("idea://open?file=/path")).toBe(false);
    expect(isAllowedURL("cursor://file/path")).toBe(false);
  });
});

describe("validateSettings", () => {
  it("returns valid settings as-is", () => {
    const input = {
      ide: "goland",
      showOnFileHeaders: false,
      showOnLineNumbers: true,
      mappings: [{ pattern: "org/repo", localPath: "/path" }],
    };
    const result = validateSettings(input);
    expect(result.ide).toBe("goland");
    expect(result.showOnFileHeaders).toBe(false);
    expect(result.mappings).toHaveLength(1);
  });

  it("falls back to defaults for unknown IDE", () => {
    const result = validateSettings({ ide: "notepad" });
    expect(result.ide).toBe("vscode");
  });

  it("falls back to defaults for removed IDE keys", () => {
    const result = validateSettings({ ide: "custom" });
    expect(result.ide).toBe("vscode");
  });

  it("falls back to defaults for non-string IDE", () => {
    const result = validateSettings({ ide: 42 });
    expect(result.ide).toBe("vscode");
  });

  it("falls back to defaults for non-boolean showOnFileHeaders", () => {
    const result = validateSettings({ showOnFileHeaders: "yes" });
    expect(result.showOnFileHeaders).toBe(true);
  });

  it("falls back to defaults for non-array mappings", () => {
    const result = validateSettings({ mappings: "not an array" });
    expect(result.mappings).toEqual([]);
  });

  it("filters out invalid mappings", () => {
    const result = validateSettings({
      mappings: [
        { pattern: "org/repo", localPath: "/path" },
        { pattern: 123, localPath: "/path" },
        "not a mapping",
        null,
      ],
    });
    expect(result.mappings).toHaveLength(1);
    expect(result.mappings[0].pattern).toBe("org/repo");
  });

  it("handles completely empty input", () => {
    const result = validateSettings({});
    expect(result.ide).toBe("vscode");
    expect(result.showOnFileHeaders).toBe(true);
    expect(result.showOnLineNumbers).toBe(true);
    expect(result.mappings).toEqual([]);
  });
});

describe("validateMappingPattern", () => {
  it("accepts org/repo", () => {
    expect(validateMappingPattern("my-org/my-repo")).toBeNull();
  });

  it("accepts org/*", () => {
    expect(validateMappingPattern("my-org/*")).toBeNull();
  });

  it("accepts dots and underscores", () => {
    expect(validateMappingPattern("my.org/my_repo")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(validateMappingPattern("")).not.toBeNull();
  });

  it("rejects pattern without slash", () => {
    expect(validateMappingPattern("justrepo")).not.toBeNull();
  });

  it("rejects path traversal in pattern", () => {
    expect(validateMappingPattern("../evil/repo")).not.toBeNull();
  });

  it("rejects spaces in pattern", () => {
    expect(validateMappingPattern("my org/repo")).not.toBeNull();
  });
});

describe("validateLocalPath", () => {
  it("accepts absolute Unix path", () => {
    expect(validateLocalPath("/Users/me/code/repo")).toBeNull();
  });

  it("accepts absolute Windows path", () => {
    expect(validateLocalPath("C:\\Users\\me\\code")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(validateLocalPath("")).not.toBeNull();
  });

  it("rejects relative path", () => {
    expect(validateLocalPath("relative/path")).not.toBeNull();
  });

  it("rejects null bytes", () => {
    expect(validateLocalPath("/path/\0evil")).not.toBeNull();
  });

  it("rejects control characters", () => {
    expect(validateLocalPath("/path/\x07evil")).not.toBeNull();
  });
});
