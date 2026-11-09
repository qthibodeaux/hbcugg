import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { readableTextColor, toV5TeamId, asNumber, asPct } from "./teamKpi/kpiPresentation";
import { useRosterHub, usePlayerAnalytics } from "../../../hooks/useSWACData";
import { Box, Flex, Grid } from "@chakra-ui/react";
import { TickerSegment, KpiCell } from "./teamKpi/KpiCells";

/**
 * TeamKPIStrip
 *
 * PHILOSOPHY:
 *   Purpose: Second team-page 4x1 banner with a moving sports ticker above four KPIs.
 *   Grid slot: 4x1 PageShell slot.
 *
 * CONTENT TIERS:
 *   Essential: ticker, Avg PAR, roster size, transfer rate, veteran percentage.
 *   Compact: ticker remains; KPI labels shorten; subtitles reduce before values wrap.
 *
 * SIZING:
 *   Root uses h="full" w="full". No fixed root height. Rows use clamp/flex.
 */

export const TeamKPIStrip = ({ team, season = 2025, stats }) => {
  const { isMobile } = useLayoutDensity();
  const primary = team?.colors?.primary || "#E53E3E";
  const secondary = team?.colors?.secondary || "#FDB913";
  const tickerText = readableTextColor(secondary);
  const v5TeamId = toV5TeamId(team);

  const { teams: rosterTeams } = useRosterHub(season);
  const { teamAnalytics } = usePlayerAnalytics();

  const rosterModule = rosterTeams?.[v5TeamId] ?? {};
  // player_analytics_2025.json is not year-parameterized — it is the 2025
  // season only. Only use it as a fallback when the strip is actually
  // showing 2025; for any other season, an empty roster_hub export (e.g.
  // no roster_hub_2026.json yet) should render honestly as "-", not
  // silently borrow 2025's numbers under a different season's label.
  const teamStats = Number(season) === 2025 ? (teamAnalytics?.[v5TeamId] ?? {}) : {};

  const data = {
    par: asNumber(stats?.par ?? teamStats.avg_par ?? null, "—"),
    parChange: stats?.parChange ?? "team average",
    rosterSize: stats?.rosterSize ?? rosterModule.composition?.total_players ?? teamStats.roster_size ?? "-",
    transferRate: stats?.transfers ?? asPct(rosterModule.transfers?.transfer_rate ?? teamStats.transfer_rate ?? 0),
    transferCount: rosterModule.transfers?.transfer_count ?? teamStats.transfer_count ?? "-",
    veterans: stats?.veterans ?? asPct(rosterModule.experience?.veteran_pct ?? 0),
  };

  const tickerItems = [
    ["Team", `${team?.shortName || "Team"} - ${team?.mascot || "Football"}`],
    ["Avg PAR", data.par],
    ["Roster", `${data.rosterSize} active`],
    ["Transfers", `${data.transferRate} / ${data.transferCount} players`],
    ["Veterans", `${data.veterans} upperclass`],
    ["Conference", `${team?.conference || "HBCU"}${team?.division ? ` ${team.division}` : ""}`],
    ["Season", season],
  ];
  const tickerLoop = [...tickerItems, ...tickerItems];

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius={isMobile ? 0 : "lg"}
      overflow="hidden"
      position="relative"
    >
      <style>{`
        @keyframes teamKpiTickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <Box
        position="absolute"
        inset={0}
        bg="bg.secondary"
      />

      <Flex position="relative" h="full" direction="column" minH={0}>
        <Box
          h="clamp(1.75rem, 18%, 2.25rem)"
          bg={secondary}
          overflow="hidden"
          borderBottom="1px solid"
          borderColor="blackAlpha.200"
          flexShrink={0}
        >
          <Flex
            h="full"
            align="center"
            gap={{ base: 4, lg: 7 }}
            px={4}
            w="max-content"
            style={{ animation: "teamKpiTickerScroll 34s linear infinite" }}
          >
            {tickerLoop.map(([label, value], index) => (
              <TickerSegment
                key={`${label}-${index}`}
                label={label}
                value={value}
                dividerColor={tickerText}
                textColor={tickerText}
              />
            ))}
          </Flex>
        </Box>

        <Grid flex={1} minH={0} templateColumns="repeat(4, minmax(0, 1fr))" bg="rgba(0,0,0,0.2)">
          <KpiCell 
            label="Avg PAR" 
            compactLabel="PAR" 
            value={data.par} 
            sub={data.parChange} 
            bg={primary} 
            textColor={readableTextColor(primary)}
            ringColor={readableTextColor(primary)}
            ringTrack={readableTextColor(primary) === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"}
            ringInner={primary}
            contextPct={(parseFloat(data.par) || 0) / 20 * 100}
          />
          <KpiCell 
            label="Roster" 
            value={data.rosterSize} 
            sub="active players" 
            bg={secondary}
            textColor={readableTextColor(secondary)}
            ringColor={readableTextColor(secondary)}
            ringTrack={readableTextColor(secondary) === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"}
            ringInner={secondary}
            contextPct={(parseInt(data.rosterSize) || 0) / 120 * 100}
          />
          <KpiCell 
            label="Transfer Rate" 
            compactLabel="Transfers" 
            value={data.transferRate} 
            sub="newcomers active" 
            bg="#FFFFFF"
            textColor="#0B0B0D"
            ringColor={primary}
            ringTrack="rgba(11,11,13,0.12)"
            ringInner="#FFFFFF"
            contextPct={parseFloat(data.transferRate) || 0}
          />
          <KpiCell 
            label="Veterans" 
            value={data.veterans} 
            sub="Jr / Sr / Grad" 
            bg="bg.secondary"
            textColor="#FFFFFF"
            ringColor={primary}
            ringTrack="rgba(255,255,255,0.12)"
            ringInner="#141416"
            contextPct={parseFloat(data.veterans) || 0}
          />
        </Grid>
      </Flex>
    </Box>
  );
};

export { readableTextColor } from "./teamKpi/kpiPresentation";

export { KpiCell, TickerSegment } from "./teamKpi/KpiCells";
