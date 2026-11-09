// Existing team-profile cell formatting, percentile fill and headline-stat selection.

const GOOD = "#22C55E";

const BAD = "#A855F7";

const NEUTRAL_CELL = "rgba(255,255,255,0.05)";

const cellFill = (pct) => {
  if (!Number.isFinite(pct)) return NEUTRAL_CELL;
  const strength = Math.min(1, Math.abs(pct - 50) / 50);
  const alpha = (0.18 + 0.5 * strength).toFixed(2);
  const hex = pct >= 50 ? GOOD : BAD;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const fmt = (value, unit) =>
  !Number.isFinite(value) ? "—" : unit === "pct" ? `${(value * 100).toFixed(1)}%` : value.toFixed(2);

const ordinal = (n) => {
  if (!Number.isFinite(n)) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

export const headlineStats = (hub, row, season) => {
  if (!row) return [];
  const levers = [...(hub.levers ?? [])].sort((a, b) => b.abs - a.abs).slice(0, 3);
  const teamCount = Object.keys(hub.teams ?? {}).length;
  // Rank 1 of 18 reads as the 100th percentile so the rating cell colours on
  // the same scale as the lever cells.
  const ratingPct = Number.isFinite(row.rating_rank) && teamCount > 1 ? Math.round((1 - (row.rating_rank - 1) / (teamCount - 1)) * 100) : null;
  return [
    { label: `${season} Record`, value: row.record?.record ?? "—", sub: row.record?.conference_record ? `Conf: ${row.record.conference_record}` : null, fill: NEUTRAL_CELL },
    {
      label: "Rating",
      value: `${row.rating > 0 ? "+" : ""}${row.rating ?? "—"}`,
      sub: Number.isFinite(row.rating_rank) ? `#${row.rating_rank}` : null,
      fill: cellFill(ratingPct),
    },
    { label: "Streak", value: row.record?.streak ?? "—", sub: row.record?.last5 ? `Last 5: ${row.record.last5}` : null, fill: NEUTRAL_CELL },
    ...levers.map((l) => {
      const pct = row.percentiles?.[l.field];
      return {
        label: l.short,
        value: fmt(row.metrics?.[l.field], l.unit),
        sub: Number.isFinite(pct) ? `${ordinal(pct)} %ile` : null,
        fill: cellFill(pct),
      };
    }),
  ];
};
