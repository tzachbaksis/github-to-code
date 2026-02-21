const NULL_BYTE_RE = /\0/;
const CONTROL_CHAR_RE = /[\x01-\x1f\x7f]/;

/**
 * Decode any percent-encoded sequences so traversal payloads like
 * `%2e%2e` or `%2F` are caught by the checks below.
 */
function decodeIfEncoded(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // Malformed encoding — reject by returning as-is (will still be checked)
    return value;
  }
}

export function sanitizePath(basePath: string, relativePath: string): string {
  // Decode percent-encoding before any validation so encoded
  // traversal sequences (%2e%2e, %2f, %00) are caught.
  const decodedRelative = decodeIfEncoded(relativePath);
  const decodedBase = decodeIfEncoded(basePath);

  if (NULL_BYTE_RE.test(decodedRelative) || NULL_BYTE_RE.test(decodedBase)) {
    throw new Error("Path contains null bytes");
  }

  if (CONTROL_CHAR_RE.test(decodedRelative) || CONTROL_CHAR_RE.test(decodedBase)) {
    throw new Error("Path contains control characters");
  }

  // Normalize separators
  const normalizedRelative = decodedRelative.replace(/\\/g, "/");
  const normalizedBase = decodedBase.replace(/\\/g, "/").replace(/\/+$/, "");

  // Check for directory traversal in both paths
  for (const segment of [...normalizedBase.split("/"), ...normalizedRelative.split("/")]) {
    if (segment === "..") {
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

/**
 * Validates that a file path extracted from the DOM looks like a
 * legitimate relative file path (no traversal, no control chars,
 * no encoded sequences, only expected characters).
 */
export function isValidFilePath(path: string): boolean {
  if (!path || path.length > 1024) return false;
  if (NULL_BYTE_RE.test(path)) return false;
  if (CONTROL_CHAR_RE.test(path)) return false;

  // Reject percent-encoded sequences — paths from GitHub DOM should
  // already be decoded; encoded chars indicate tampering.
  if (/%[0-9a-fA-F]{2}/.test(path)) return false;

  const decoded = decodeIfEncoded(path);
  const parts = decoded.replace(/\\/g, "/").split("/");
  for (const part of parts) {
    if (part === "..") return false;
  }

  return true;
}
