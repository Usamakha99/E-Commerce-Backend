/**
 * Backend origin for axios baseURL and upload image URLs.
 * - Use VITE_API_URL when set (full URL, optional trailing slash stripped).
 * - In the browser, default to same hostname as the page and port VITE_API_PORT or 5000
 *   so opening the app at http://SERVER_IP:5001 hits http://SERVER_IP:5000, not localhost.
 * - Fallback for non-browser (tests): http://localhost:5000
 */
export function getBackendBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.hostname) {
    const port = import.meta.env.VITE_API_PORT ?? "5000";
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }
  return "http://localhost:5000";
}
