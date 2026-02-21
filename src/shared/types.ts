export type IDEKey = "vscode" | "goland";

export interface IDEConfig {
  key: IDEKey;
  label: string;
  icon: string;
  generateURL: (absPath: string, line?: number) => string;
}

export interface RepoMapping {
  /** "org/repo" or "org/*" */
  pattern: string;
  localPath: string;
}

export interface ExtensionSettings {
  mappings: RepoMapping[];
  ide: IDEKey;
  showOnFileHeaders: boolean;
  showOnLineNumbers: boolean;
}

export interface GitHubFileContext {
  org: string;
  repo: string;
  filePath: string;
  lineNumber?: number;
}
