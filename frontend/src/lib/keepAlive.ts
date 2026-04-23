/**
 * keepAlive.ts
 *
 * Sends a lightweight GET /health ping to the Render backend every 14 minutes
 * to prevent it from sleeping (Render free tier sleeps after 15 min inactivity).
 *
 * Logic:
 *  - Tracks the timestamp of the last real API request in localStorage.
 *  - If more than 14.5 minutes have passed with no real request, pings /health.
 *  - This means: active users never see extra pings (real traffic keeps it warm).
 *    Only idle-but-open tabs send pings.
 */

const BACKEND_URL = import.meta.env.VITE_RENDER_BACKEND_URL as string | undefined;

// Key used to store the last real-request timestamp in localStorage
const LAST_REQUEST_KEY = 'meowfolio_last_api_request';

// 14.5 minutes in milliseconds — just under Render's 15-min sleep threshold
const IDLE_THRESHOLD_MS = 14.5 * 60 * 1000;

// How often we check whether a ping is needed (every 1 minute)
const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Call this whenever a real API request is made (parse-resume, parse-jd, extract-text).
 * This resets the idle clock so we don't send unnecessary pings.
 */
export function recordApiRequest() {
  try {
    localStorage.setItem(LAST_REQUEST_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable (private browsing, etc.) — safe to ignore
  }
}

function getLastRequestTime(): number {
  try {
    const stored = localStorage.getItem(LAST_REQUEST_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

async function ping() {
  if (!BACKEND_URL) return;
  try {
    await fetch(`${BACKEND_URL}/health`, { method: 'GET', cache: 'no-store' });
    console.debug('[keepAlive] Pinged Render backend to prevent sleep.');
  } catch {
    // Silently ignore — the ping is best-effort, not critical
  }
}

/**
 * Start the keep-alive scheduler. Call once on app boot.
 * Returns a cleanup function to stop the interval (useful for tests).
 */
export function startKeepAlive(): () => void {
  if (!BACKEND_URL) {
    // No Render URL configured — nothing to keep alive
    return () => undefined;
  }

  const intervalId = setInterval(() => {
    const lastRequest = getLastRequestTime();
    const idleMs = Date.now() - lastRequest;

    if (idleMs >= IDLE_THRESHOLD_MS) {
      void ping();
    }
  }, CHECK_INTERVAL_MS);

  return () => clearInterval(intervalId);
}
