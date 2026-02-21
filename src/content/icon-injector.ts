import type { GitHubFileContext, IDEConfig, RepoMapping } from "../shared/types";
import { buildIDELink } from "../shared/ide-protocols";
import { GHC_BUTTON_CLASS } from "../shared/constants";
import { isAllowedURL } from "../shared/validation";

function createIconSVG(): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("fill", "currentColor");
  const path = document.createElementNS(ns, "path");
  path.setAttribute(
    "d",
    "M2 1h8l4 4v10H2V1zm8 1v3h3L10 2zM4 8h8v1H4V8zm0 2h8v1H4v-1zm0 2h5v1H4v-1z",
  );
  svg.appendChild(path);
  return svg;
}

let delegationInstalled = false;

/**
 * Install document-level event handlers:
 * 1. Capture-phase click handler to stop GitHub from intercepting our <a> clicks
 */
export function installClickDelegation(): void {
  if (delegationInstalled) return;
  delegationInstalled = true;

  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(`.${GHC_BUTTON_CLASS}`) as HTMLElement | null;

      if (btn) {
        // Stop GitHub from intercepting the <a> click (SPA routing)
        e.stopPropagation();
      }
    },
    true, // capture phase
  );

  // Block mousedown/pointerdown on our elements to prevent GitHub
  // from starting drag-select or line-selection interactions
  for (const eventName of ["mousedown", "pointerdown"] as const) {
    document.addEventListener(
      eventName,
      (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest(`.${GHC_BUTTON_CLASS}`);
        if (!btn) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
      },
      true,
    );
  }
}

/**
 * Creates an <a> element styled as a button that links to the IDE URL.
 * Uses a native <a href="protocol://..."> so clicking works WITHOUT any
 * JavaScript event handler — fully immune to DOM virtualization.
 */
export function createIDEButton(
  context: GitHubFileContext,
  ideConfig: IDEConfig,
  mapping: RepoMapping,
): HTMLAnchorElement | null {
  const url = buildIDELink(context, mapping, ideConfig);
  if (!isAllowedURL(url)) return null;

  const link = document.createElement("a");
  link.className = GHC_BUTTON_CLASS;
  link.title = `Open in ${ideConfig.label}`;
  link.href = url;
  link.appendChild(createIconSVG());
  link.setAttribute("data-ghc-path", context.filePath);
  link.setAttribute("data-ghc-url", url);
  if (context.lineNumber) {
    link.setAttribute("data-ghc-line", String(context.lineNumber));
  }

  link.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (isAllowedURL(url)) {
      window.location.href = url;
    }
  }, true);

  return link;
}

/**
 * Inject IDE button next to the [data-file-path] anchor element
 * in the diff file header.
 */
export function injectFileHeaderIcon(
  anchor: HTMLElement,
  button: HTMLElement,
): void {
  button.classList.add("ghc-ide-btn--header");
  anchor.parentElement?.insertBefore(button, anchor.nextSibling);
}

export function injectLineIcon(
  lineEl: HTMLElement,
  button: HTMLElement,
): void {
  button.classList.add("ghc-ide-btn--line");
  lineEl.style.position = "relative";
  lineEl.appendChild(button);
}
