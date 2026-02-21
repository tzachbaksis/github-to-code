import type { ExtensionSettings, RepoMapping } from "./types";
import { DEFAULT_SETTINGS } from "./constants";
import { validateSettings } from "./validation";

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return validateSettings(result as Record<string, unknown>);
}

export async function saveSettings(
  partial: Partial<ExtensionSettings>,
): Promise<void> {
  await chrome.storage.sync.set(partial);
}

export function findMapping(
  mappings: RepoMapping[],
  org: string,
  repo: string,
): RepoMapping | undefined {
  // Exact match first
  const exact = mappings.find(
    (m) => m.pattern.toLowerCase() === `${org}/${repo}`.toLowerCase(),
  );
  if (exact) return exact;

  // Wildcard fallback: org/*
  const wildcard = mappings.find(
    (m) => m.pattern.toLowerCase() === `${org}/*`.toLowerCase(),
  );
  return wildcard;
}
