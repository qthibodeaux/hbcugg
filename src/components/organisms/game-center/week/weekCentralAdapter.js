import { GAME_CENTER_SEASONS } from "../../../molecules/game/SeasonSelector";
import { buildGameModel } from "./weekGameModel";

// Single shared launch.0 year scope — see GAME_CENTER_SEASONS.
export const WEEK_CENTRAL_SEASONS = GAME_CENTER_SEASONS;

// Week labels come from the payload (`weeks[].label` / `compact_label`).
export const getCompactWeekLabel = (weekEntry) =>
  weekEntry?.compact_label ?? (weekEntry?.week != null ? `W${weekEntry.week}` : "");

const EMPTY_MODEL = {
  weeks: [],
  weekEntries: [],
  selectedWeek: null,
  weekLabel: "",
  dateRange: null,
  isCurrentWeek: false,
  slate: [],
  totals: { all: 0, visible: 0, hbcu: 0, outside: 0 },
};

// `data` is one week-central payload. The slate filter (§4): the toggle off
// keeps only `is_covered_matchup: true`; on shows everything. Order is the
// backend's — `games[]` arrives pre-sorted, `sort_order` is the tiebreak.
export const buildWeekCentralModel = ({ data, includeNonConference }) => {
  if (!data) return EMPTY_MODEL;

  const weekEntries = Array.isArray(data.weeks) ? data.weeks : [];
  const games = Array.isArray(data.games) ? data.games : [];
  const visibleGames = includeNonConference ? games : games.filter((game) => game.is_covered_matchup === true);
  const slate = visibleGames
    .map(buildGameModel)
    .sort((a, b) => (a.rawGame.sort_order ?? 0) - (b.rawGame.sort_order ?? 0));

  return {
    weeks: weekEntries.map((entry) => Number(entry.week)),
    weekEntries,
    selectedWeek: Number(data.week),
    weekLabel: data.week_label ?? data.label ?? `Week ${data.week}`,
    dateRange: data.date_range ?? null,
    isCurrentWeek: data.is_current_week === true,
    slate,
    totals: {
      all: data.summary?.total_games ?? games.length,
      visible: slate.length,
      hbcu: data.summary?.hbcu_matchups ?? slate.filter((game) => game.bothHBCU).length,
      outside: data.summary?.outside_games ?? slate.filter((game) => game.isOutsideOpponent).length,
    },
  };
};

export { BRAND_PREVIEW_COLOR, normalizeTeamKey, isHBCUTeam, getSide, getGameWinner, toGradientRow, getSelectedGameTheme } from "./weekGameModel";
