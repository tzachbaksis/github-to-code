import type { ExtensionSettings } from "../shared/types";
import { getSettings, findMapping, saveSettings } from "../shared/storage";
import { parseOrgRepo } from "../shared/url-parser";
import { GHC_BUTTON_CLASS, GHC_ADD_MAPPING_CLASS, SELECTORS } from "../shared/constants";
import { detectPageType } from "./dom-utils";
import { initFilesChanged } from "./files-changed";
import { initBlob } from "./blob";
import { installClickDelegation } from "./icon-injector";
import { observeDOM } from "./observer";
import "./index.css";

let cleanupObserver: (() => void) | null = null;

function findRepoNameElement(org: string, repo: string): HTMLElement | null {
  const href = `/${org}/${repo}`;

  // Try scoped search in known header containers first
  for (const container of SELECTORS.repoHeader.containers) {
    const scope = document.querySelector(container);
    if (!scope) continue;

    const link = scope.querySelector<HTMLElement>(`a[href="${href}"]`);
    if (link) return link;
  }

  // Fallback: find the repo link anywhere outside main content
  const allLinks = document.querySelectorAll<HTMLAnchorElement>(
    `a[href="${href}"]`,
  );
  for (const link of allLinks) {
    const inContent =
      link.closest("main") || link.closest("#readme") || link.closest("article");
    if (!inContent) return link;
  }

  return null;
}

function injectAddMappingButton(
  settings: ExtensionSettings,
  org: string,
  repo: string,
): void {
  // Don't inject if a mapping already exists
  const mapping = findMapping(settings.mappings, org, repo);
  if (mapping) return;

  // Don't inject if button already exists
  if (document.querySelector(`.${GHC_ADD_MAPPING_CLASS}`)) return;

  const repoNameEl = findRepoNameElement(org, repo);
  if (!repoNameEl) return;

  const btn = document.createElement("button");
  btn.className = GHC_ADD_MAPPING_CLASS;
  btn.title = "Add repo mapping for GitHub to Code";

  // Icon SVG (same as extension icon)
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("fill", "currentColor");
  const path = document.createElementNS(ns, "path");
  path.setAttribute(
    "d",
    "M2 1h8l4 4v10H2V1zm8 1v3h3L10 2zM4 8h8v1H4V8zm0 2h8v1H4v-1zm0 2h5v1H4v-1z",
  );
  svg.appendChild(path);
  btn.appendChild(svg);

  const label = document.createElement("span");
  label.textContent = "Add mapping";
  btn.appendChild(label);

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const freshSettings = await getSettings();
    // Re-check in case mapping was added between render and click
    if (findMapping(freshSettings.mappings, org, repo)) {
      btn.remove();
      return;
    }

    freshSettings.mappings.push({
      pattern: `${org}/${repo}`,
      localPath: "",
    });
    await saveSettings({ mappings: freshSettings.mappings });

    // Open the extension popup so the user can fill in the local path
    chrome.runtime.sendMessage({ type: "openPopup" });
  });

  repoNameEl.parentElement?.insertBefore(btn, repoNameEl.nextSibling);
}

async function run(): Promise<void> {
  const settings = await getSettings();

  const orgRepo = parseOrgRepo(window.location.href);
  if (!orgRepo) return;

  const { org, repo } = orgRepo;

  installClickDelegation();

  function processPage(): void {
    const pageType = detectPageType();

    switch (pageType) {
      case "files-changed":
        initFilesChanged(settings, org, repo);
        break;
      case "blob":
        initBlob(settings, org, repo);
        break;
    }

    injectAddMappingButton(settings, org, repo);
  }

  processPage();

  // Clean up previous observer before creating a new one
  if (cleanupObserver) {
    cleanupObserver();
  }
  cleanupObserver = observeDOM(processPage);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync") {
      getSettings().then((newSettings) => {
        Object.assign(settings, newSettings);
        document
          .querySelectorAll(`.${GHC_BUTTON_CLASS}, .${GHC_ADD_MAPPING_CLASS}`)
          .forEach((el) => el.remove());
        processPage();
      });
    }
  });
}

run();
