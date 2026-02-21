import type { ExtensionSettings, IDEKey, RepoMapping } from "../shared/types";
import { IDE_CONFIGS } from "../shared/ide-protocols";
import { getSettings, saveSettings } from "../shared/storage";
import {
  validateMappingPattern,
  validateLocalPath,
} from "../shared/validation";

const ideSelect = document.getElementById("ide-select") as HTMLSelectElement;
const mappingsList = document.getElementById("mappings-list") as HTMLElement;
const addMappingBtn = document.getElementById("add-mapping") as HTMLButtonElement;
const showHeadersCheck = document.getElementById(
  "show-headers",
) as HTMLInputElement;
const showLinesCheck = document.getElementById(
  "show-lines",
) as HTMLInputElement;

let currentSettings: ExtensionSettings;

// Populate IDE dropdown
for (const config of Object.values(IDE_CONFIGS)) {
  const opt = document.createElement("option");
  opt.value = config.key;
  opt.textContent = config.label;
  ideSelect.appendChild(opt);
}

function createErrorEl(message: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "field-error";
  el.textContent = message;
  return el;
}

function clearError(container: HTMLElement, input: HTMLInputElement): void {
  input.classList.remove("input-error");
  const existing = container.querySelector(".field-error");
  if (existing) existing.remove();
}

function showError(
  container: HTMLElement,
  input: HTMLInputElement,
  message: string,
): void {
  input.classList.add("input-error");
  const existing = container.querySelector(".field-error");
  if (existing) existing.remove();
  container.appendChild(createErrorEl(message));
}

function renderMappings(mappings: RepoMapping[]): void {
  while (mappingsList.firstChild) {
    mappingsList.removeChild(mappingsList.firstChild);
  }

  for (let i = 0; i < mappings.length; i++) {
    const mapping = mappings[i];
    const row = document.createElement("div");
    row.className = "mapping-row";

    const fieldsCol = document.createElement("div");
    fieldsCol.className = "mapping-fields";

    const patternInput = document.createElement("input");
    patternInput.type = "text";
    patternInput.className = "input input-sm";
    patternInput.placeholder = "org/repo or org/*";
    patternInput.value = mapping.pattern;
    patternInput.addEventListener("change", () => {
      const error = validateMappingPattern(patternInput.value);
      if (error) {
        showError(fieldsCol, patternInput, error);
        return;
      }
      clearError(fieldsCol, patternInput);
      currentSettings.mappings[i].pattern = patternInput.value;
      saveSettings({ mappings: currentSettings.mappings });
    });

    const pathInput = document.createElement("input");
    pathInput.type = "text";
    pathInput.className = "input input-sm";
    pathInput.placeholder = "/Users/you/code/repo";
    pathInput.value = mapping.localPath;
    pathInput.addEventListener("change", () => {
      const error = validateLocalPath(pathInput.value);
      if (error) {
        showError(fieldsCol, pathInput, error);
        return;
      }
      clearError(fieldsCol, pathInput);
      currentSettings.mappings[i].localPath = pathInput.value;
      saveSettings({ mappings: currentSettings.mappings });
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-danger btn-sm";
    removeBtn.textContent = "x";
    removeBtn.addEventListener("click", () => {
      currentSettings.mappings.splice(i, 1);
      saveSettings({ mappings: currentSettings.mappings });
      renderMappings(currentSettings.mappings);
    });

    fieldsCol.appendChild(patternInput);
    fieldsCol.appendChild(pathInput);

    row.appendChild(fieldsCol);
    row.appendChild(removeBtn);
    mappingsList.appendChild(row);
  }
}

async function init(): Promise<void> {
  currentSettings = await getSettings();

  ideSelect.value = currentSettings.ide;
  showHeadersCheck.checked = currentSettings.showOnFileHeaders;
  showLinesCheck.checked = currentSettings.showOnLineNumbers;

  renderMappings(currentSettings.mappings);
}

ideSelect.addEventListener("change", () => {
  const ide = ideSelect.value as IDEKey;
  currentSettings.ide = ide;
  saveSettings({ ide });
});

showHeadersCheck.addEventListener("change", () => {
  currentSettings.showOnFileHeaders = showHeadersCheck.checked;
  saveSettings({ showOnFileHeaders: showHeadersCheck.checked });
});

showLinesCheck.addEventListener("change", () => {
  currentSettings.showOnLineNumbers = showLinesCheck.checked;
  saveSettings({ showOnLineNumbers: showLinesCheck.checked });
});

addMappingBtn.addEventListener("click", () => {
  currentSettings.mappings.push({ pattern: "", localPath: "" });
  saveSettings({ mappings: currentSettings.mappings });
  renderMappings(currentSettings.mappings);
});

init();
