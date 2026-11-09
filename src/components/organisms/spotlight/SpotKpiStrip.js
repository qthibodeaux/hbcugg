import { Box, Flex, Grid } from "@chakra-ui/react";
import { KpiCell, TickerSegment, readableTextColor } from "../../molecules/schools/TeamKPIStrip";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { fixNames, ordinal, pct0, shortOf, signed1 } from "./spotlightModel";

// The spotlight's second 4x1 — the team page's KPI strip (TeamKPIStrip's own
// cells and ticker): a ticker in the team's secondary colour over four cells
// in primary / white / white / black. Record, team rating, title odds, and the
// scoring margin against SWAC/MEAC opponents.

export const SpotKpiStrip = ({ spotlight, palette }) => {
  const { isMobile } = useLayoutDensity();
  const f = spotlight?.facts ?? {};
  const totw = f.team_of_the_week ?? {};
  const glory = totw.team?.glory ?? {};
  const st = f.standing ?? {};
  const race = f.race ?? {};
  const game = totw.game ?? {};
  const path = f.rating_path ?? [];
  const turn = (spotlight?.editorial ?? []).find((c) => c.kind === "turnaround");
  const margin = turn?.numbers?.find((n) => /margin/i.test(n.label));
  const [w, l] = String(f.record ?? "").split("-").map(Number);
  const primary = palette.primary;
  const secondary = palette.secondary;
  const tickerInk = readableTextColor(secondary);
  const firstRank = Array.isArray(path) && path.length ? path[0]?.rank : null;

  const ticker = [
    ["Team of the Week", totw.week_label ?? `Week ${spotlight?.through_week ?? ""}`],
    game.team_score != null ? ["Last game", `${game.team_score > game.opponent_score ? "W" : "L"} ${game.team_score}-${game.opponent_score} ${game.home_away === "away" ? "at" : "vs"} ${shortOf(game.opponent_team_id)}`] : null,
    firstRank && glory.rank ? ["Team rating", `${ordinal(firstRank)} → ${ordinal(glory.rank)}`] : null,
    st.group ? ["Standing", `${ordinal(st.rank)} in the ${st.group}`] : null,
    st.streak ? ["Streak", st.streak] : null,
    ["Season", spotlight?.season],
  ].filter(Boolean);
  const loop = [...ticker, ...ticker];

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius={isMobile ? 0 : "lg"} overflow="hidden" position="relative">
      <style>{`@keyframes spotKpiTicker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      <Flex position="relative" h="full" direction="column" minH={0}>
        <Box h="clamp(1.75rem, 18%, 2.25rem)" bg={secondary} overflow="hidden" borderBottom="1px solid" borderColor="blackAlpha.200" flexShrink={0}>
          <Flex h="full" align="center" gap={{ base: 4, lg: 7 }} px={4} w="max-content" style={{ animation: "spotKpiTicker 34s linear infinite" }}>
            {loop.map(([label, value], i) => (
              <TickerSegment key={`${label}-${i}`} label={label} value={fixNames(value)} dividerColor={tickerInk} textColor={tickerInk} />
            ))}
          </Flex>
        </Box>
        <Grid flex={1} minH={0} templateColumns="repeat(4, minmax(0, 1fr))">
          <KpiCell label="Record" value={f.record ?? "—"} sub={`${st.conference_record ?? "—"} conference`}
            bg={primary} textColor={readableTextColor(primary)} ringColor={readableTextColor(primary)}
            ringTrack={readableTextColor(primary) === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"} ringInner={primary}
            contextPct={w + l ? (w / (w + l)) * 100 : 0} />
          <KpiCell label="Team Rating" compactLabel="Rating" value={glory.rank ? ordinal(glory.rank) : "—"} sub={`of ${glory.ranked_teams ?? 18} · ${glory.display ?? ""} adj. EPA/play`}
            bg="#FFFFFF" textColor="#0B0B0D" ringColor={primary} ringTrack="rgba(11,11,13,0.12)" ringInner="#FFFFFF"
            contextPct={glory.rank ? ((glory.ranked_teams ?? 18) - glory.rank + 1) / (glory.ranked_teams ?? 18) * 100 : 0} />
          <KpiCell label="Title Odds" compactLabel="Odds" value={pct0(race.title_odds_pct)} sub={`to win the ${race.group ?? "division"}`}
            bg="#FFFFFF" textColor="#0B0B0D" ringColor={primary} ringTrack="rgba(11,11,13,0.12)" ringInner="#FFFFFF"
            contextPct={race.title_odds_pct ?? 0} />
          <KpiCell label="Margin / Game" compactLabel="Margin" value={margin ? signed1(margin.now) : "—"} sub={margin ? `${signed1(margin.then)} at this point last year` : "vs SWAC/MEAC"}
            bg="bg.secondary" textColor="#FFFFFF" ringColor={palette.ink} ringTrack="rgba(255,255,255,0.12)" ringInner="#141416"
            contextPct={margin ? Math.min(100, Math.max(0, 50 + margin.now * 2)) : 0} />
        </Grid>
      </Flex>
    </Box>
  );
};
