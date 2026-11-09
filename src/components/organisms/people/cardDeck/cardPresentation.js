import teamsData from "../../../../data/teams.json";
import { Flame, Shield, Zap, Sprout, ArrowLeftRight, MapPin, ClipboardList } from "lucide-react";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const HOLD_SECONDS = 7;

export const PANEL_BG = "bg.secondary";

export const PANEL_BORDER = "whiteAlpha.100";

export const teamOf = (id) => TEAM_BY_ID[id] ?? null;

export const accentOf = (id) => teamOf(id)?.colors?.primary ?? "#E53E3E";

export const markOf = (id) => {
  const s = teamOf(id)?.colors?.secondary;
  return s && s.toUpperCase() !== "#000000" ? s : "#FFFFFF";
};

export const ICONS = { flame: Flame, shield: Shield, zap: Zap, sprout: Sprout, arrows: ArrowLeftRight, pin: MapPin, clipboard: ClipboardList };
