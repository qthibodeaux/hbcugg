export const fin = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

const cell = (value, rank, fmt) => ({ value: fin(value), rank: rank ?? null, display: fin(value) == null ? "—" : fmt(value) });

export const fmt = {
  s2: (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}`,
  s3: (v) => `${v > 0 ? "+" : ""}${v.toFixed(3)}`,
  f2: (v) => v.toFixed(2),
  f1: (v) => v.toFixed(1),
  int: (v) => `${v > 0 ? "+" : ""}${Math.round(v)}`,
  n: (v) => String(Math.round(v)),
  p1: (v) => `${(v * 100).toFixed(1)}%`,
  fp: (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}`,
  // A difference of two 0-1 rates, in percentage points ("+7.4").
  pp: (v) => `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}`,
};

export const pick = (fields, key, fallback, format, fallbackRank = null) => {
  const f = fields?.[key];
  if (f && f.value != null) return cell(f.value, f.rank, format);
  return cell(fallback, fallbackRank, format);
};

export const keyStats = (c, pos) => {
  if (!c) return [];
  const P = c.passing, R = c.rushing, C = c.receiving, D = c.defense;
  const out =
    pos === "QB" && P ? [["C/A", `${P.cmp}/${P.att}`], ["Yds", P.yds], ["TD", P.td], ["INT", P.int]]
    : ["RB", "FB"].includes(pos) && R ? [["Car", R.att], ["Yds", R.yds], ["TD", R.td], ...(C ? [["Rec", C.rec]] : [])]
    : ["WR", "TE"].includes(pos) && C ? [["Rec", C.rec], ["Yds", C.yds], ["TD", C.td], ["Long", C.long ?? "—"]]
    : D ? [["Tkl", D.tot], ["TFL", D.tfl], ["Sacks", D.sacks], [D.int ? "INT" : "PBU", D.int || D.brup]]
    : R ? [["Car", R.att], ["Yds", R.yds], ["TD", R.td]]
    : [];
  return out.map(([label, value]) => ({ label, value: String(value ?? "—") }));
};

const extentOf = (values, own, highBest) => {
  const seen = [own, ...values].map(fin).filter((v) => v != null);
  if (seen.length < 2) return null;
  return { min: Math.min(...seen), max: Math.max(...seen), highBest };
};

export const unitRows = (offF, defF, offAdv, defAdv, league = []) => {
  const ranked = league.filter((t) => t.games >= 3);
  // `offHighBest`: a high number is good for the offense, so a low one is good for the defense.
  const row = (label, previewKey, advKey, format, offHighBest = true) => {
    const o = offF?.[`o_${previewKey}`], d = defF?.[`d_${previewKey}`];
    const off = o?.value != null ? cell(o.value, o.rank, format) : cell(offAdv?.offense?.[advKey], offAdv?.ranks?.offense?.[advKey], format);
    const def = d?.value != null ? cell(d.value, d.rank, format) : cell(defAdv?.defense?.[advKey], defAdv?.ranks?.defense?.[advKey], format);
    return {
      label, off, def,
      offExtent: extentOf(ranked.map((t) => t.offense?.[advKey]), off.value, offHighBest),
      defExtent: extentOf(ranked.map((t) => t.defense?.[advKey]), def.value, !offHighBest),
    };
  };
  return [
    row("EPA / play", "epa", "epa_per_play", fmt.s2),
    row("Success rate", "success", "success_rate", fmt.p1),
    // Offense: havoc it allowed (lower is better). Defense: havoc it created.
    row("Havoc rate", "havoc_rate", "havoc_rate", fmt.p1, false),
    row("Explosive play %", "expl_rate", "explosive_rate", fmt.p1),
    row("Red-zone TD %", "rz_td", "red_zone_td_rate", fmt.p1),
  ];
};
