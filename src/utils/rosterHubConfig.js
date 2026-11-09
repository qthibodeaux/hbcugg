import { GAME_CENTER_SEASONS } from "../components/molecules/game/SeasonSelector";
import teamsData from "../data/teams.json";

// Extracted from the live roster hub. Existing calculations and layouts preserved.

export const ROW_H = "clamp(160px, 20vw, 260px)";

export const TALL_ROW_H = `calc(${ROW_H} * 1.6)`;

export const GRID_GAP = "10px";

export const ROSTER_HUB_SEASONS = GAME_CENTER_SEASONS;

export const CLASS_COLORS = {
  "Fr.": "#c53030",
  "So.": "#dd6b20",
  "Jr.": "#d69e2e",
  "Sr.": "#2c7a7b",
  "Gr.": "#276749",
};

export const TRANSFER_COLORS = {
  P4: "#3182ce",
  G5: "#2c7a7b",
  FCS: "#dd6b20",
  D2: "#d69e2e",
  JUCO: "#c53030",
  HS: "#718096",
  Unknown: "#52525B", // a transfer whose previous school isn't named
};

export const CARD_ACCENTS = {
  composition: "#F56565",
  experience: "#38A169",
  physical: "#F56565",
  geographic: "#D69E2E",
  transfers: "#3182CE",
  players: "#FFFFFF",
  portal: "#3182CE",
  local: "#2C7A7B",
  distance: "#D69E2E",
};

export const DIVISION_MAP = {
  "SWAC East": [
    "swacaamu",
    "swacasu",
    "swacbcu",
    "swacfamu",
    "swacjsu",
    "swacmvsu",
  ],
  "SWAC West": ["swacpvamu", "swacsu", "swactsu", "swacuapb", "swacgsu", "swacalc"],
  MEAC: ["meacdsu", "meachu", "meacmsu", "meacnccu", "meacnsu", "meacscsu"],
};

export const DIVISION_ACCENT = {
  "SWAC East": "#E53E3E",
  "SWAC West": "#ECC94B",
  MEAC: "#4299E1",
};

export const SWAC_TEAM_IDS = [...DIVISION_MAP["SWAC East"], ...DIVISION_MAP["SWAC West"]];

export const MEAC_TEAM_IDS = DIVISION_MAP.MEAC;

export const ALL_TEAM_IDS = teamsData.teams.map((t) => t.exportId.replace(/25$/, ""));

export const POS_ORDER = {
  QB: 0,
  RB: 1,
  WR: 2,
  TE: 3,
  OL: 4,
  DL: 5,
  LB: 6,
  DB: 7,
  ST: 8,
};

export const PHYSICAL_POSITION_LIST = Object.keys(POS_ORDER).slice(0, 8);

export const TEAM_LIST = teamsData.teams
  .map((t) => ({
    id: t.exportId.replace(/25$/, ""),
    label: t.name,
    short: t.shortName,
    primary: t.colors.primary,
    secondary: t.colors.secondary,
    conference: t.conference,
    division: t.division,
    logo: t.logo,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
