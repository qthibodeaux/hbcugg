

// Team Spotlight story-kind layout/tone configuration and ghost-number presentation.

export const LAYOUT = {
  turnaround: { cols: 2, tone: "primary" },
  historic: { cols: 1, tone: "white" },
  historic_team: { cols: 1, tone: "black" },
  formula: { cols: 2, tone: "dark" },
  turning_point: { cols: 2, tone: "dark" },
  halftime: { cols: 1, tone: "primary" },
  stakes: { cols: 1, tone: "white" },
  floor: { cols: 2, tone: "white" },
  expectation: { cols: 2, tone: "dark" },
  roster: { cols: 2, tone: "black" },
  coach: { cols: 2, tone: "dark" },
  fix: { cols: 2, tone: "black" },
};

export const ghostOf = (card) => {
  const n = card.numbers?.[0];
  if (card.kind === "halftime") return String(card.headline).match(/\d+-\d+/)?.[0] ?? "";
  if (card.kind === "stakes") return String(card.headline).match(/\d+%/)?.[0] ?? "";
  if (card.kind === "turnaround") return String(card.headline).match(/\d+-\d+$/)?.[0] ?? "";
  if (n?.value != null && typeof n.value === "number") return String(Math.round(n.value));
  return "";
};
