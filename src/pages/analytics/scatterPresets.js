import { SCATTER_AXES, teamAxes } from "./scatter/baseAxes";
import { advAxis, readAdv } from "./scatter/advancedAxes";
import { presetFor, SCATTER_PRESETS } from "./scatter/presetRegistry";

export const fmtAxis = (v, unit) => {
  if (!Number.isFinite(v)) return "—";
  if (unit === "pct") return `${(v * 100).toFixed(1)}%`;
  if (unit === "pts") return `${v > 0 ? "+" : ""}${(v * 100).toFixed(0)}`;
  if (unit === "num1") return v.toFixed(1);
  if (unit === "int") return Math.round(v).toString();
  return v.toFixed(2);
};

/** An axis key is either a team chart axis (advanced block) or one of the hub's win levers. */
export const axisFor = (key, levers = []) => {
  if (SCATTER_AXES[key]) return SCATTER_AXES[key];
  if (String(key).startsWith("adv:")) return advAxis(key) ?? { key, label: key, unit: "num" };
  const l = levers.find((x) => x.field === key);
  return l ? { key, label: l.label, unit: l.unit ?? "num", low: !l.good, r: l.r } : { key, label: key, unit: "num" };
};

/**
 * Every team plotted on two axes, whichever kind each axis is.
 * Returns { points, avgX, avgY, x, y } — x / y are the resolved axis objects.
 */
export const scatterSeries = (hub, season, xKey, yKey, presetId = null) => {
  const levers = hub?.levers ?? [];
  const x = axisFor(xKey, levers);
  const y = axisFor(yKey, levers);
  const read = (axis, row, adv) => (axis.adv ? readAdv(row, axis.adv) : axis.team ? adv[axis.key] : row?.metrics?.[axis.key]);

  const points = Object.values(hub?.teams ?? {})
    .map((t) => ({ t, row: t.seasons?.[season], adv: teamAxes(t.seasons?.[season]) }))
    .filter((p) => p.row)
    .map(({ t, row, adv }) => ({
      id: t.identity.id,
      short: t.identity.short,
      name: t.identity.name,
      logo: t.identity.logo,
      color: t.identity.primary,
      record: row.record?.record,
      x: read(x, row, adv),
      y: read(y, row, adv),
    }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

  const lg = hub?.league?.[season]?.metrics ?? {};
  const mean = (vals) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : NaN);
  const median = (vals) => {
    if (!vals.length) return NaN;
    const v = [...vals].sort((a, b) => a - b);
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  };
  const preset = presetFor(xKey, yKey, presetId);
  const center = preset?.center === "median" ? median : mean;
  return {
    points,
    x,
    y,
    // Team axes average the plotted teams; lever axes use the hub's league mean.
    avgX: x.team ? center(points.map((p) => p.x)) : lg[x.key],
    avgY: y.team ? center(points.map((p) => p.y)) : lg[y.key],
    centerLabel: preset?.center === "median" ? "median" : "league average",
    preset,
    mock: false,
  };
};

/** Presets with at least three teams to plot this season — the rest wait for their data. */
export const availablePresets = (hub, season) =>
  SCATTER_PRESETS.filter((p) => scatterSeries(hub, season, p.x, p.y, p.id).points.length >= 3);

export { teamAxes, SCATTER_AXES } from "./scatter/baseAxes";

export { ADV_AXIS_GROUPS } from "./scatter/advancedAxes";

export { SCATTER_SECTIONS, SCATTER_PRESETS, presetFor } from "./scatter/presetRegistry";
