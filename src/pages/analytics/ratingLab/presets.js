export const labLevers = (hub) => (hub?.levers ?? []).filter((l) => l.abs >= 0.25);

const seeded = (levers) =>
  levers.reduce((acc, l) => {
    acc[l.field] = Math.round(l.abs * 100);
    return acc;
  }, {});

const byRule = (levers, rule) =>
  levers.reduce((acc, l) => {
    acc[l.field] = rule(l);
    return acc;
  }, {});

const isOffense = (l) => l.field.startsWith("o_");

const isRush = (l) => l.field.includes("rushing.");

const isPass = (l) => l.field.includes("passing.");

const isDisruption = (l) => /pressureRate|tflRate|stuffRate|powerStopRate/.test(l.field);

export const LAB_PRESETS = [
  {
    id: "wins",
    label: "What actually wins",
    build: (levers) => seeded(levers),
  },
  {
    id: "ground",
    label: "Ground & pound",
    build: (levers) => byRule(levers, (l) => (isRush(l) ? (isOffense(l) ? 100 : 60) : 15)),
  },
  {
    id: "air",
    label: "Air raid",
    build: (levers) => byRule(levers, (l) => (isPass(l) ? (isOffense(l) ? 100 : 55) : 15)),
  },
  {
    id: "bend",
    label: "Bend don't break",
    build: (levers) => byRule(levers, (l) => (isOffense(l) ? 20 : isDisruption(l) ? 10 : 100)),
  },
  {
    id: "havoc",
    label: "Havoc",
    build: (levers) => byRule(levers, (l) => (isDisruption(l) ? 100 : 20)),
  },
  {
    id: "flat",
    label: "Flat",
    build: (levers) => byRule(levers, () => 50),
  },
];

export const presetWeights = (id, levers) => {
  const preset = LAB_PRESETS.find((p) => p.id === id) ?? LAB_PRESETS[0];
  return preset.build(levers);
};

export const presetFor = (weights, levers) =>
  LAB_PRESETS.find((p) => {
    const w = p.build(levers);
    return levers.every((l) => (weights[l.field] ?? 0) === w[l.field]);
  })?.id ?? null;

const clampW = (v) => Math.max(-100, Math.min(100, Math.round(Number(v) || 0)));

export const encodeModel = (levers, weights) => levers.map((l) => clampW(weights[l.field] ?? 0)).join(".");

export const decodeModel = (text, levers) => {
  if (!text) return null;
  const parts = String(text).split(".");
  if (parts.length !== levers.length) return null;
  const out = {};
  for (let i = 0; i < levers.length; i += 1) {
    const v = Number(parts[i]);
    if (!Number.isFinite(v)) return null;
    out[levers[i].field] = clampW(v);
  }
  return out;
};
