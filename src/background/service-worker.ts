import { DEFAULT_SETTINGS } from "../shared/constants";

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(null);
  if (!existing.ide) {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
  }
});
