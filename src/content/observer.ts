export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function observeDOM(callback: () => void, debounceMs = 150): () => void {
  const debouncedCallback = debounce(callback, debounceMs);

  const observer = new MutationObserver(() => {
    debouncedCallback();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  const turboHandler = () => callback();
  const popstateHandler = () => callback();

  document.addEventListener("turbo:load", turboHandler);
  window.addEventListener("popstate", popstateHandler);

  return () => {
    observer.disconnect();
    document.removeEventListener("turbo:load", turboHandler);
    window.removeEventListener("popstate", popstateHandler);
  };
}
