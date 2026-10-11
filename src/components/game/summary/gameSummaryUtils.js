/**
 * Shared utilities for game summary components.
 */

import teamsData from "../../../data/teams.json";

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

export const getTeam = (id) => TEAM_META[id] ?? null;
export const getTeamLabel = (id) =>
  getTeam(id)?.shortName ?? String(id ?? "TEAM").toUpperCase();
export const getTeamName = (id) => getTeam(id)?.name ?? getTeamLabel(id);
export const getTeamLogo = (id) =>
  getTeam(id)?.logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;
export const getTeamColor = (id, fallback = "#E53E3E") =>
  getTeam(id)?.colors?.primary ?? fallback;

export const fmt = (value, digits = 1) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
};

export const pct = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Math.round(Number(value) * 100)}%`;
};

export const signed = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  const next = Number(value);
  return `${next > 0 ? "+" : ""}${next.toFixed(digits)}`;
};

export const cleanName = (name) => {
  if (!name) return "Unknown";
  const parts = String(name).split(",").map((part) => part.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : String(name);
};

export const readableResult = (result) =>
  String(result ?? "Drive").replace(/([a-z])([A-Z])/g, "$1 $2");

export const yardsPerPlay = (box) => {
  const plays = Number(box?.plays_offense) || 0;
  return plays ? Number(box.total_yards ?? 0) / plays : null;
};

export const grade = (value, bands, higherIsBetter = true) => {
  if (value == null || Number.isNaN(Number(value)))
    return { label: "N/A", color: "#A1A1AA", note: "missing" };
  const v = Number(value);
  const ordered = higherIsBetter ? bands : [...bands].reverse();
  const hit = ordered.find((band) =>
    higherIsBetter ? v >= band.min : v <= band.max
  );
  return hit ?? { label: "C", color: "#A1A1AA", note: "average" };
};

export const rateGrade = (value) =>
  grade(value, [
    { min: 0.55, label: "A", color: "#48BB78", note: "elite" },
    { min: 0.45, label: "B", color: "#68D391", note: "strong" },
    { min: 0.35, label: "C", color: "#ECC94B", note: "solid" },
    { min: 0.25, label: "D", color: "#F6AD55", note: "thin" },
  ]);

export const epaGrade = (value) =>
  grade(value, [
    { min: 0.18, label: "A", color: "#48BB78", note: "elite" },
    { min: 0.08, label: "B", color: "#68D391", note: "strong" },
    { min: 0, label: "C", color: "#ECC94B", note: "neutral" },
    { min: -0.12, label: "D", color: "#F6AD55", note: "drag" },
  ]);
