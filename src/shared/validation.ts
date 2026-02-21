import type { ExtensionSettings, IDEKey, RepoMapping } from "./types";
import { DEFAULT_SETTINGS } from "./constants";

const ALLOWED_PROTOCOLS = ["vscode:", "goland:"];

const VALID_IDE_KEYS: ReadonlySet<string> = new Set<string>([
  "vscode",
  "goland",
]);

/** Pattern: org/repo or org/* — alphanumeric, hyphens, dots, underscores */
const MAPPING_PATTERN_RE = /^[\w.\-]+\/(?:[\w.\-]+|\*)$/;

export function isAllowedURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function validateSettings(
  raw: Record<string, unknown>,
): ExtensionSettings {
  const ide =
    typeof raw.ide === "string" && VALID_IDE_KEYS.has(raw.ide)
      ? (raw.ide as IDEKey)
      : DEFAULT_SETTINGS.ide;

  const showOnFileHeaders =
    typeof raw.showOnFileHeaders === "boolean"
      ? raw.showOnFileHeaders
      : DEFAULT_SETTINGS.showOnFileHeaders;

  const showOnLineNumbers =
    typeof raw.showOnLineNumbers === "boolean"
      ? raw.showOnLineNumbers
      : DEFAULT_SETTINGS.showOnLineNumbers;

  const mappings = Array.isArray(raw.mappings)
    ? raw.mappings.filter(isValidMapping)
    : DEFAULT_SETTINGS.mappings;

  return { ide, showOnFileHeaders, showOnLineNumbers, mappings };
}

function isValidMapping(m: unknown): m is RepoMapping {
  if (typeof m !== "object" || m === null) return false;
  const obj = m as Record<string, unknown>;
  return typeof obj.pattern === "string" && typeof obj.localPath === "string";
}

export function validateMappingPattern(pattern: string): string | null {
  if (!pattern.trim()) return "Pattern is required";
  if (!MAPPING_PATTERN_RE.test(pattern)) {
    return "Pattern must be org/repo or org/*";
  }
  return null;
}

export function validateLocalPath(path: string): string | null {
  if (!path.trim()) return "Local path is required";
  if (!/^\/|^[A-Z]:\\/i.test(path)) return "Path must be absolute";
  if (/\0/.test(path)) return "Path contains invalid characters";
  if (/[\x01-\x1f\x7f]/.test(path)) return "Path contains control characters";
  return null;
}
