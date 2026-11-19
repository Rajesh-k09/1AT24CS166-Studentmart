// In development with Vite proxy, use relative /api to avoid CORS and port collisions.
// If outside Vite proxy, fallback to the direct backend port 5001.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "/api"
    : "http://127.0.0.1:5001/api");
