// Pure helpers for the game preview page (an upcoming game with no game file).
//
// A preview has no game_path_id — the only stable identity is the schedule's
// game_id, "YYYY-MM-DD_<away>_at_<home>" with v5 team ids. Everything the page
// shows is read off the two teams' schedule rows for that game.

export const previewPath = (gameId) => `/game/preview/${encodeURIComponent(gameId)}`;

export const parsePreviewId = (gameId) => {
  const m = /^(\d{4}-\d{2}-\d{2})_(.+?)_at_(.+)$/.exec(String(gameId ?? ""));
  if (!m) return null;
  return { date: m[1], awayId: m[2], homeId: m[3], season: Number(m[1].slice(0, 4)) };
};

/**
 * Kickoff as a Date, or null when the schedule has no time yet ("TBA").
 * The schedule gives a local clock string ("13:00" or "06:05 PM") with no time
 * zone, so the instant is read in the viewer's zone — a backend ask is an ISO
 * kickoff with an offset.
 */
export const kickoffDate = (isoDate, label) => {
  const text = String(label ?? "").trim();
  let m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(text);
  let hour;
  let minute;
  if (m) {
    hour = Number(m[1]) % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0);
    minute = Number(m[2]);
  } else {
    m = /^(\d{1,2}):(\d{2})$/.exec(text);
    if (!m) return null;
    hour = Number(m[1]);
    minute = Number(m[2]);
  }
  const d = new Date(`${isoDate}T00:00:00`);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Sat, Nov 28, 2026" */
export const longDate = (isoDate) => {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate ?? "";
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const shortDate = (isoDate) => {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate ?? "";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export { rankTone, buildMatchupSheet } from "./gamePreview/matchupSheet";
