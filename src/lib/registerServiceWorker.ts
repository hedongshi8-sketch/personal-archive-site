export function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("sw.js", window.location.href)).catch(() => {
      // The site remains fully usable if offline caching is unavailable.
    });
  });
}
