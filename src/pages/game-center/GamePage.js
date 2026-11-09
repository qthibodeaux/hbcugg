import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { gameCenterPaths } from "../../utils/gameCenterPayloads";
import { useAllPlayersByYear, useLeagueAverages } from "../../hooks/useSWACData";
import { GamePageShell, getTeamLabel, normalizeDrives } from "../../components/game/page";
import { withParAsProduction } from "../../utils/parProduction";

// ─── Data fetchers ────────────────────────────────────────────────────────────

export const fetchGame = async (gameId) => {
  const indexRes = await fetch(gameCenterPaths.gamesIndex());
  if (!indexRes.ok) throw new Error("Failed to load game index");
  const gameIndex = await indexRes.json();
  const requested = String(gameId ?? "").trim();
  const requestedUpper = requested.toUpperCase();

  let match = gameIndex.find(
    (e) =>
      String(e.game_stem).toLowerCase() === requested.toLowerCase() ||
      String(e.game_id).toUpperCase() === requestedUpper,
  );

  if (!match && requested.toLowerCase() === "pvamutsu") {
    match =
      gameIndex.find((e) => e.game_stem === "W1pvamutsu") ??
      [...gameIndex]
        .filter((e) => String(e.game_stem).toLowerCase().includes("pvamutsu"))
        .sort((a, b) => Number(b.season) - Number(a.season))[0];
  }

  // A game file can land before the weekly index rebuild. A stem ends in the
  // season's two digits (famuasu26 → 2026), so the file can still be found.
  if (!match) {
    const yy = requested.match(/^[a-z]+(\d{2})$/i)?.[1];
    if (yy) match = { season: 2000 + Number(yy), game_stem: requested.toLowerCase() };
  }

  if (!match) throw new Error("Game data not found");
  const res = await fetch(gameCenterPaths.gameFile(match.season, match.game_stem));
  if (!res.ok) throw new Error("Failed to load game payload");
  return withParAsProduction(await res.json());
};

// ─── GamePage ─────────────────────────────────────────────────────────────────

const GamePage = () => {
  const { gameId = "pvamutsu" } = useParams();
  const [activeSection, setActiveSection] = useState("summary");

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => fetchGame(gameId),
  });

  const meta = game?.metadata ?? {};
  const season = Number(meta.season) || Number(game?.season) || 2025;
  const { players: playerSeasons = [] } = useAllPlayersByYear(season);
  // Season before, for headshots: the 2026 roster's image URLs are placeholders.
  const { players: priorPlayerSeasons = [] } = useAllPlayersByYear(Number(season) - 1);
  const { data: leagueAvg } = useLeagueAverages(season);

  const awayId =
    game?.away_team?.team_id ??
    game?.away_team?.id ??
    meta.away_team?.team_id ??
    meta.away_team?.id ??
    meta.away_team ??
    "";
  const homeId =
    game?.home_team?.team_id ??
    game?.home_team?.id ??
    meta.home_team?.team_id ??
    meta.home_team?.id ??
    meta.home_team ??
    "";
  const awayShort = getTeamLabel(awayId);
  const homeShort = getTeamLabel(homeId);

  // Map the selected section to the desktop and mobile banner tab labels.
  const activeTab = useMemo(() => {
    switch (activeSection) {
      case "boxscore": return "Player Stats";
      case "teamstats": return "Team Stats";
      case "drives": return "Drives";
      case "pbp": return "Play By Play";
      default: return "Summary";
    }
  }, [activeSection]);

  const handleTabChange = (tabName) => {
    switch (tabName) {
      case "Player Stats": setActiveSection("boxscore"); break;
      case "Team Stats": setActiveSection("teamstats"); break;
      case "Drives": setActiveSection("drives"); break;
      case "Play By Play": setActiveSection("pbp"); break;
      default: setActiveSection("summary"); break;
    }
  };

  return (
    <GamePageShell
      game={game}
      isLoading={isLoading}
      isError={isError}
      activeSection={activeSection}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      awayId={awayId}
      homeId={homeId}
      awayShort={awayShort}
      homeShort={homeShort}
      meta={meta}
      teamBox={game?.team_box ?? {}}
      teamStats={game?.team_stats}
      advancedTeam={game?.advanced_team ?? {}}
      teamEntries={Object.entries(game?.individual_stats ?? {})}
      productionScores={game?.production_scores ?? {}}
      drives={normalizeDrives(game?.drive_summary)}
      driveSummary={game?.drive_summary ?? []}
      plays={game?.play_by_play ?? []}
      playerSeasons={playerSeasons}
      priorPlayerSeasons={priorPlayerSeasons}
      leagueAvg={leagueAvg}
    />
  );
};

export default GamePage;
