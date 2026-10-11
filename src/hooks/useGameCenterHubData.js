import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  gameCenterPaths,
  fetchJson,
  toFeaturedGameCard,
  toRailGameCard,
  toLocalTeam,
} from "../utils/gameCenterPayloads";
import { GAME_CENTER_DEFAULT_SEASON } from "../components/molecules/game/SeasonSelector";
import { useFootballCurrentContext } from "./useFootballCurrentContext";

const RAIL_GAME_COUNT = 5;

// Game Center Hub Design Doc §4 — the backend ranks and returns the five
// context cards in display order. The frontend renders exactly what arrives:
// no ranking, no filtering, no substitution when a slot is empty.
const CONTEXT_CARD_COUNT = 5;

const standingsRows = (group) =>
  (group?.rows ?? []).map((row) => {
    const team = toLocalTeam(row.team_id);
    const [cw = 0, cl = 0] = String(row.conference_record ?? "0-0").split("-").map(Number);
    return {
      ...row,
      id: row.team_id,
      teamId: row.team_id,
      team,
      shortName: team.shortName,
      confWins: cw,
      confLosses: cl,
      confRecord: row.conference_record,
    };
  });

// `defending_champion` and `conference_play_begins` are the no-leader state
// (every row `is_leader: false` before conference play starts). Both are on
// the backend ask list (LAUNCH_0_BACKEND_NOTES.md → Game Center Hub).
//
// TEMPORARY — 2026 season only, delete when the backend ships the fields.
// Champions and records are the backend's own numbers from this drop's
// context_cards (defending_champion:swacjsu / defending_champion:meacscsu);
// play-begins dates are the earliest `conference_scope: "conference"` row in
// team-schedules/2026 per group. The payload field wins whenever present.
const NO_LEADER_FALLBACK_2026 = {
  swac_east: {
    defending_champion: { team_id: "swacjsu", record: "7-1", season: 2025 },
    conference_play_begins: { date_label: "Sep 26", date: "2026-09-26" },
  },
  meac: {
    defending_champion: { team_id: "meacscsu", record: "5-0", season: 2025 },
    conference_play_begins: { date_label: "Oct 23", date: "2026-10-23" },
  },
};

const standingsGroup = (group, key, season) => {
  const fallback = Number(season) === 2026 ? NO_LEADER_FALLBACK_2026[key] : null;
  return {
    rows: standingsRows(group),
    metric: group?.metric ?? "conference",
    defendingChampion: group?.defending_champion ?? fallback?.defending_champion ?? null,
    conferencePlayBegins: group?.conference_play_begins ?? fallback?.conference_play_begins ?? null,
  };
};

// One shape per card_type, matching the §4 payload. `team` is joined locally
// from team_id per the contract — the backend's `team_short` is the fallback
// only when the id doesn't resolve.
const toContextCard = (card, index) => {
  const payload = card?.payload ?? {};
  const team = payload.team_id ? toLocalTeam(payload.team_id, payload.team_short) : null;
  const teamLabel = team?.shortName ?? payload.team_short ?? null;

  return {
    id: card?.card_id ?? `context-${index}`,
    type: card?.card_type ?? null,
    title: card?.title ?? payload.title ?? "",
    whyReasons: Array.isArray(card?.why_reasons) ? card.why_reasons : [],
    team,
    teamLabel,
    payload,
  };
};

export const useGameCenterHubData = () => {
  const { currentSeason, isLoading: isCurrentContextLoading } = useFootballCurrentContext();
  const [seasonOverride, setSeasonOverride] = useState(null);
  const season = seasonOverride ?? currentSeason ?? GAME_CENTER_DEFAULT_SEASON;

  const { data: seasonData, isLoading, isError } = useQuery({
    queryKey: ["game-center-hub", season],
    queryFn: () => fetchJson(gameCenterPaths.hub(season)),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const parsed = useMemo(() => {
    const empty = { featuredGames: [], scheduleRailCards: [], standings: null, contextCards: [], isEmpty: true };
    if (!seasonData) return { ...empty, isEmpty: false };

    const featuredRaw = seasonData.featured_games ?? [];
    const railRaw = seasonData.recent_results_rail ?? [];
    if (!featuredRaw.length && !railRaw.length) return empty;

    return {
      featuredGames: featuredRaw.slice(0, 4).map(toFeaturedGameCard),
      scheduleRailCards: railRaw.slice(0, RAIL_GAME_COUNT).map(toRailGameCard),
      standings: {
        swacWest: standingsGroup(seasonData.standings?.swac_west, "swac_west", seasonData.season),
        swacEast: standingsGroup(seasonData.standings?.swac_east, "swac_east", seasonData.season),
        meac: standingsGroup(seasonData.standings?.meac, "meac", seasonData.season),
      },
      contextCards: (seasonData.context_cards ?? []).slice(0, CONTEXT_CARD_COUNT).map(toContextCard),
      isEmpty: false,
    };
  }, [seasonData]);

  return {
    season,
    setSeason: setSeasonOverride,
    isLoading: isLoading || isCurrentContextLoading,
    isError,
    ...parsed,
  };
};
