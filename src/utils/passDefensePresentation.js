import { contrastRatio, relativeLuminance } from "./teamColor";

// Display bounds only. No rates, ranks, averages or statistical benchmarks.
export const passDefenseAxis = (values, { unit = "pct", zero = false } = {}) => {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return { domain: [0, 1], ticks: [0, 0.25, 0.5, 0.75, 1] };
  let lo = Math.min(...finite), hi = Math.max(...finite);
  const pad = (hi - lo) * 0.08 || Math.max(Math.abs(hi) * 0.08, unit === "pct" ? 0.01 : 0.1);
  lo = zero ? Math.min(0, lo) : lo - pad;
  hi += pad;
  const raw = Math.max(hi - lo, 1e-9) / 6;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 1.25, 1.5, 2, 2.5, 5, 10].map((n) => n * mag).find((n) => n >= raw) ?? mag * 10;
  lo = Math.floor(lo / step) * step;
  hi = Math.ceil(hi / step) * step;
  if (unit === "pct") { lo = Math.max(0, lo); hi = Math.min(1, hi); }
  if (hi === lo) hi = lo + step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 100; v += step) ticks.push(Number(v.toFixed(10)));
  return { domain: [lo, hi], ticks };
};

// Preserve the primary hue. A black-primary team uses its secondary on a dark
// ground; maroon/navy remain maroon/navy, with only a visibility adjustment.
export const passDefenseChartColor = (colors, background) => {
  let color = colors?.primary ?? "#8A5CC2";
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  if (relativeLuminance(color) == null) return "#8A5CC2";
  const channels = rgb(color);
  if (contrastRatio(color, background) < 3 && Math.max(...channels) < 45 && Math.max(...channels) - Math.min(...channels) < 20) color = colors?.secondary ?? color;
  if (relativeLuminance(color) == null) return "#8A5CC2";
  const target = relativeLuminance(background) > 0.5 ? 0 : 255;
  const original = rgb(color);
  for (let i = 0; i <= 20; i += 1) {
    const candidate = "#" + original.map((v) => Math.round(v + (target - v) * i / 20).toString(16).padStart(2, "0")).join("");
    if (contrastRatio(candidate, background) >= 3) return candidate;
  }
  return color;
};
