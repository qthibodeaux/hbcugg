import { useState, useMemo } from "react";
import { GAME_CENTER_DEFAULT_SEASON } from "../../components/molecules/game/SeasonSelector";
import { ALL_TEAM_IDS, ROSTER_HUB_SEASONS } from "../../utils/rosterHubConfig";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useRosterHub, useAllPlayersByYear } from "../../hooks/useSWACData";
import teamsData from "../../data/teams.json";
import { Flex, Spinner, Box } from "@chakra-ui/react";
import { LeagueModeContent } from "../../components/organisms/rosterHub/LeagueRosterView";
import { DivisionsModeContent } from "../../components/organisms/rosterHub/DivisionRosterView";
import { BannerRostersHub } from "../../components/molecules/banners/RostersHubBanner";
import { KpiControlPanel, TeamSelectorSlot } from "../../components/organisms/rosterHub/RosterHubControls";
import { TeamAnalyticsPanel, TeamModeContent } from "../../components/organisms/rosterHub/TeamRosterView";
import PageShell from "../../components/layouts/PageShell";

// ─── Main Page ────────────────────────────────────────────────────────────────
// mode + selectedId used to live inside a separate RosterComparisonComponent
// wrapper, entirely within PageShell's `listContent` area. That's what put
// the switcher and the team-strip+cards visually out of step with the KPI
// grid above them — listContent shares the same outer margins as the Slot
// grid, but not the same rhythm. Both moved up here so the switcher and the
// team panel can be real PageShell.Slot siblings of the KPI card instead.

const RostersPage = ({ defaultMode = "team" }) => {
  // Opens on the current season (2026 ships roster_hub_2026 + player_seasons_2026).
  const [season, setSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const [pendingSeason, setPendingSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const [mode, setMode] = useState(defaultMode);
  const [selectedId, setSelectedId] = useState(
    () => ALL_TEAM_IDS[Math.floor(Math.random() * ALL_TEAM_IDS.length)],
  );
  const { isMobile } = useLayoutDensity();

  const { hub, allLeague, teams: teamsMap, isLoading: hubLoading } = useRosterHub(season);
  // Individual player-season records for the exact selected season, so the Physical range chart
  // follows the season selector with everything else.
  const { players } = useAllPlayersByYear(season, { exactSeason: true });

  const programCount = useMemo(() => Object.keys(teamsMap ?? {}).length, [teamsMap]);
  const rosterYear = hub?.year ?? season;

  const kpis = allLeague
    ? [
        {
          label: "Total Players",
          value: (allLeague.composition?.total_players ?? 0).toLocaleString(),
          sub: `${programCount || 18} Programs · ${rosterYear}`,
          accent: "white",
        },
        {
          label: "Portal Rate",
          value: `${(allLeague.transfers?.transfer_rate ?? 0).toFixed(0)}%`,
          sub: `${allLeague.transfers?.transfer_count ?? 0} transfers`,
          accent: "#3182ce",
        },
        {
          label: "In-State Talent",
          value: `${(allLeague.geographic?.in_state_pct ?? 0).toFixed(0)}%`,
          sub: "recruited locally",
          accent: "#2c7a7b",
        },
        {
          label: "Avg Recruit Dist",
          value: `${allLeague.geographic?.avg_recruiting_distance_miles ?? 0}mi`,
          sub: "from hometown",
          accent: "#d69e2e",
        },
      ]
    : Array(4).fill(null);

  const mod = teamsMap?.[selectedId] ?? null;
  const teamEntry = selectedId
    ? teamsData.teams.find((t) => t.exportId.replace(/25$/, "") === selectedId)
    : null;

  const listContent =
    mode === "team" ? null : hubLoading ? (
      <Flex justify="center" py={20}>
        <Spinner color="brand.500" size="xl" thickness="4px" />
      </Flex>
    ) : mode === "league" && allLeague ? (
      <LeagueModeContent all={allLeague} />
    ) : mode === "divisions" ? (
      <DivisionsModeContent teamsMap={teamsMap} />
    ) : null;

  // Mobile — banner is the only thing that's had a real mobile pass so far.
  // Everything below it is the same desktop cards/grids stacked full-width
  // and unstyled for now (KpiControlPanel's 4-col stat grid, the 6-col
  // TeamAnalyticsPanel grid) — flagging that clearly since those grids will
  // read cramped at phone width until they get their own mobile treatment.
  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        <BannerRostersHub
          season={season}
          pendingSeason={pendingSeason}
          setPendingSeason={setPendingSeason}
          onApplySeason={(year) => setSeason(year ?? pendingSeason)}
          seasons={ROSTER_HUB_SEASONS}
        />
        <Box h="14rem">
          <KpiControlPanel kpis={kpis} isLoading={hubLoading} mode={mode} setMode={setMode} isMobile />
        </Box>

        {/* Logo grid at its own height — six square cells a row, flush under the
            KPI panel and straight into the team panel. */}
        {mode === "team" && <TeamSelectorSlot selectedId={selectedId} onChange={setSelectedId} />}

        {mode === "team" && teamEntry && (
          <TeamAnalyticsPanel mod={mod} teamEntry={teamEntry} teamsMap={teamsMap} players={players} />
        )}
        {mode !== "team" && (
          <Box px="0.75rem" pt="0.75rem" pb="0.75rem">
            {listContent}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <PageShell listContent={listContent}>

      {/* Row 1: Banner */}
      <PageShell.Slot cols={4}>
        <BannerRostersHub
          season={season}
          pendingSeason={pendingSeason}
          setPendingSeason={setPendingSeason}
          onApplySeason={(year) => setSeason(year ?? pendingSeason)}
          seasons={ROSTER_HUB_SEASONS}
        />
      </PageShell.Slot>

      {/* Row 2: KPI stats + mode switcher, one panel */}
      <PageShell.Slot cols={4}>
        <KpiControlPanel kpis={kpis} isLoading={hubLoading} mode={mode} setMode={setMode} />
      </PageShell.Slot>

      {/* Row 3+: team picker + team-branded analytics panel — real Slot
          siblings now, not listContent, so they line up with everything
          above them. Only shown in "By Team" mode. */}
      {mode === "team" && (
        <>
          <PageShell.Slot cols={4}>
            <TeamModeContent selectedId={selectedId} setSelectedId={setSelectedId} />
          </PageShell.Slot>
          {teamEntry && (
            <PageShell.Slot cols={4} rows={5}>
              <TeamAnalyticsPanel mod={mod} teamEntry={teamEntry} teamsMap={teamsMap} players={players} />
            </PageShell.Slot>
          )}
        </>
      )}

    </PageShell>
  );
};

export default RostersPage;
