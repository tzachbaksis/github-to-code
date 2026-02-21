const NULL_BYTE_RE = /\0/;
const CONTROL_CHAR_RE = /[\x01-\x1f\x7f]/;

export function sanitizePath(basePath: string, relativePath: string): string {
  if (NULL_BYTE_RE.test(relativePath) || NULL_BYTE_RE.test(basePath)) {
    throw new Error("Path contains null bytes");
  }

  if (CONTROL_CHAR_RE.test(relativePath)) {
    throw new Error("Path contains control characters");
  }

  // Normalize separators
  const normalizedRelative = relativePath.replace(/\\/g, "/");
  const normalizedBase = basePath.replace(/\\/g, "/").replace(/\/+$/, "");

  // Check for directory traversal
  const parts = normalizedRelative.split("/");
  for (const part of parts) {
    if (part === "..") {
      throw new Error("Path contains directory traversal (..)");
    }
  }

  const result = `${normalizedBase}/${normalizedRelative}`;

  // Verify the resolved path still starts with the base
  if (!result.startsWith(normalizedBase + "/")) {
    throw new Error("Resolved path escapes base directory");
  }

  return result;
}
