import { describe, it, expect } from "vitest";
import { IDE_CONFIGS } from "../src/shared/ide-protocols";

describe("IDE_CONFIGS", () => {
  it("vscode generates correct URL with line", () => {
    const url = IDE_CONFIGS.vscode.generateURL("/home/user/project/file.ts", 42);
    expect(url).toBe(`vscode://file/${encodeURIComponent("/home/user/project/file.ts")}:42`);
  });

  it("vscode generates correct URL without line", () => {
    const url = IDE_CONFIGS.vscode.generateURL("/home/user/project/file.ts");
    expect(url).toBe(`vscode://file/${encodeURIComponent("/home/user/project/file.ts")}`);
  });

  it("vscode encodes paths with spaces", () => {
    const url = IDE_CONFIGS.vscode.generateURL("/home/user/my project/file.ts", 1);
    expect(url).toBe(`vscode://file/${encodeURIComponent("/home/user/my project/file.ts")}:1`);
  });

  it("goland generates correct URL with line", () => {
    const url = IDE_CONFIGS.goland.generateURL("/home/user/project/main.go", 5);
    expect(url).toBe(
      `goland://open?file=${encodeURIComponent("/home/user/project/main.go")}&line=5`,
    );
  });

  it("goland generates correct URL without line", () => {
    const url = IDE_CONFIGS.goland.generateURL("/home/user/project/main.go");
    expect(url).toBe(
      `goland://open?file=${encodeURIComponent("/home/user/project/main.go")}`,
    );
  });

  it("handles paths with spaces (goland)", () => {
    const url = IDE_CONFIGS.goland.generateURL(
      "/home/user/my project/file.go",
      1,
    );
    expect(url).toBe(
      `goland://open?file=${encodeURIComponent("/home/user/my project/file.go")}&line=1`,
    );
  });
});
