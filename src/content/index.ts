import { getSettings } from "../shared/storage";
import { parseOrgRepo } from "../shared/url-parser";
import { GHC_BUTTON_CLASS } from "../shared/constants";
import { detectPageType } from "./dom-utils";
import { initFilesChanged } from "./files-changed";
import { initBlob } from "./blob";
import { installClickDelegation } from "./icon-injector";
import { observeDOM } from "./observer";
import "./index.css";

let cleanupObserver: (() => void) | null = null;

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
          .querySelectorAll(`.${GHC_BUTTON_CLASS}`)
          .forEach((el) => el.remove());
        processPage();
      });
    }
  });
}

run();
