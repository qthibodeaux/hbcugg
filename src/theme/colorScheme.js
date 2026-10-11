import { useSyncExternalStore } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Light / Night mode — which palette is on. The palette itself is CSS variables
// (src/theme/palette.css); this only sets `data-theme` on <html> and remembers
// the viewer's pick. A tiny external store, read with useSyncExternalStore — no
// context, no effect. `applyStoredScheme()` runs once in src/index.js before the
// first render so a light-mode viewer never sees a night flash.
// ─────────────────────────────────────────────────────────────────────────────

export const SCHEMES = ["night", "light"];
const STORAGE_KEY = "hbcugg-color-scheme";

// Groundwork only: most of the site is still hard-coded night, so the switch
// shows in development and stays hidden in production until the conversion
// lands (THEME_LIGHT_NIGHT.md).
export const THEME_SWITCH_ENABLED = process.env.NODE_ENV === "development";

const readStored = () => {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return SCHEMES.includes(v) ? v : "night";
  } catch {
    return "night";
  }
};

let current = "night";
const listeners = new Set();

const apply = (scheme) => {
  current = scheme;
  document.documentElement.dataset.theme = scheme;
};

export const applyStoredScheme = () => apply(THEME_SWITCH_ENABLED ? readStored() : "night");

export const setColorScheme = (scheme) => {
  if (!SCHEMES.includes(scheme) || scheme === current) return;
  apply(scheme);
  try {
    window.localStorage.setItem(STORAGE_KEY, scheme);
  } catch {
    // Private window / blocked storage — the pick lasts for this visit only.
  }
  listeners.forEach((fn) => fn());
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** [scheme, setScheme] — "night" | "light". */
export const useColorScheme = () => [useSyncExternalStore(subscribe, () => current, () => "night"), setColorScheme];
