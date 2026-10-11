import { Fragment } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { BarChart3, Trophy } from "lucide-react";
import PageShell from "../../layouts/PageShell";
import teamsData from "../../../data/teams.json";
import { GameProductionPassingFieldMapA } from "./GameProductionPassingFieldMapA";
import { GameProductionRushing } from "./GameProductionRushing";
import { GameProductionDefenseMasteryA } from "./GameProductionDefenseMasteryA";
import { GameProductionSpecialTeamsC } from "./GameProductionSpecialTeamsC";

/**
 * GameBoxScorePacketLab
 *
 * PHILOSOPHY:
 *   Purpose: Audition the Game Page Box Score tab as production cards plus traditional player stats.
 *   Grid slot: Full PageShell lab route.
 *
 * CONTENT TIERS:
 *   Essential: final score banner, active tab state, passing/rushing/defense/special-teams production cards.
 *   Nice-to-have: player stat tables for passing, rushing, receiving, defense, returns.
 *   Drop later at mobile: secondary metadata and lower-priority stat columns.
 *
 * COMPONENT SIZING:
 *   4x1 banner, then 4x2 production modules.
 *   Player tables live in PageShell listContent so they can scroll naturally.
 */

const TEAM_META = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const getTeam = (id) => TEAM_META[id] ?? {};
const getTeamLabel = (id) => getTeam(id).shortName ?? String(id ?? "TEAM").toUpperCase();
const getTeamName = (id) => getTeam(id).name ?? getTeamLabel(id);
const getTeamLogo = (id) => getTeam(id).logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;
const getTeamColor = (id, fallback = "#E53E3E") => getTeam(id).colors?.primary ?? fallback;

const cleanName = (name) => {
  if (!name) return "Unknown";
  const parts = String(name).split(",").map((part) => part.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : String(name);
};

const fmt = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
};

const pct = (made, attempts) => {
  const a = Number(attempts) || 0;
  if (!a) return "-";
  return `${Math.round((Number(made) / a) * 100)}%`;
};

const toRows = (obj) => Object.values(obj ?? {});

const BoxScoreBanner = ({ game }) => {
  const meta = game?.metadata ?? {};
  const awayId = meta.away_team;
  const homeId = meta.home_team;
  const awayScore = game?.final_score?.away ?? meta.final_score?.away ?? meta.away_points ?? 0;
  const homeScore = game?.final_score?.home ?? meta.final_score?.home ?? meta.home_points ?? 0;
  const winner = awayScore > homeScore ? awayId : homeId;
  const awayColor = getTeamColor(awayId, "#4B0082");
  const homeColor = getTeamColor(homeId, "#002147");

  return (
    <Box w="full" h="full" position="relative" overflow="hidden" bg="#08080A" border="1px solid" borderColor="whiteAlpha.100">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${awayColor}55 0%, #08080A 34%, #08080A 66%, ${homeColor}55 100%)`} />
      <Text position="absolute" left="50%" top="-7%" transform="translateX(-50%)" fontSize="clamp(4.5rem, 13vw, 11rem)" fontWeight="black" lineHeight={0.8} color="whiteAlpha.100" textTransform="uppercase" whiteSpace="nowrap">
        Final
      </Text>
      <Grid position="relative" zIndex={1} templateColumns={{ base: "1fr", lg: "minmax(0,1fr) 190px minmax(0,1fr)" }} alignItems="center" gap={6} px={{ base: 5, lg: 8 }} py={5}>
        <Flex align="center" gap={4} minW={0}>
          <Image src={getTeamLogo(awayId)} alt="" h="clamp(56px, 8vw, 104px)" objectFit="contain" />
          <Box minW={0}>
            <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Away</Text>
            <Text fontSize="clamp(1.8rem, 5vw, 4.2rem)" color="white" fontWeight="black" lineHeight={0.9} textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">{getTeamLabel(awayId)}</Text>
            <Text fontSize="xs" color="whiteAlpha.700" lineClamp={1}>{getTeamName(awayId)}</Text>
          </Box>
          <Text fontSize="clamp(3rem, 7vw, 6.2rem)" color="white" fontWeight="black" lineHeight={0.85} ml="auto">{awayScore}</Text>
        </Flex>

        <Flex direction="column" align="center" gap={3}>
          <Box px={3} py={1} bg="brand.500">
            <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">Final</Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black" textTransform="uppercase">{getTeamLabel(winner)} by {Math.abs(awayScore - homeScore)}</Text>
          <Text fontSize="10px" color="whiteAlpha.600" textAlign="center" lineClamp={2}>{meta.date} | {meta.site}</Text>
        </Flex>

        <Flex align="center" gap={4} direction="row-reverse" minW={0}>
          <Image src={getTeamLogo(homeId)} alt="" h="clamp(56px, 8vw, 104px)" objectFit="contain" />
          <Box minW={0} textAlign="right">
            <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Home</Text>
            <Text fontSize="clamp(1.8rem, 5vw, 4.2rem)" color="white" fontWeight="black" lineHeight={0.9} textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">{getTeamLabel(homeId)}</Text>
            <Text fontSize="xs" color="whiteAlpha.700" lineClamp={1}>{getTeamName(homeId)}</Text>
          </Box>
          <Text fontSize="clamp(3rem, 7vw, 6.2rem)" color="white" fontWeight="black" lineHeight={0.85} mr="auto">{homeScore}</Text>
        </Flex>
      </Grid>
      <Flex position="relative" zIndex={1} justify="space-between" align="center" gap={4} px={{ base: 5, lg: 8 }} pb={5} wrap="wrap">
        <Flex gap={2} wrap="wrap">
          {["Game Summary", "Box Score", "Play By Play", "Team Stats"].map((tab) => (
            <Box key={tab} px={3} py={2} border="1px solid" borderColor={tab === "Box Score" ? "brand.500" : "whiteAlpha.100"} bg={tab === "Box Score" ? "rgba(229,62,62,0.18)" : "whiteAlpha.50"}>
              <Text fontSize="10px" color={tab === "Box Score" ? "white" : "text.muted"} fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">{tab}</Text>
            </Box>
          ))}
        </Flex>
        <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.12em">
          Attendance {meta.attendance?.toLocaleString?.() ?? "-"} | Kick {meta.kickoff_time ?? "-"}
        </Text>
      </Flex>
    </Box>
  );
};

const SectionTitle = ({ children }) => (
  <Flex align="center" gap={2} mb={3}>
    <Trophy size={14} color="#E53E3E" />
    <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">{children}</Text>
  </Flex>
);

const TableBlock = ({ title, children }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p={4}>
    <SectionTitle>{title}</SectionTitle>
    {children}
  </Box>
);

const DataTable = ({ columns, rows }) => (
  <Box overflowX="auto">
    <Grid templateColumns={`minmax(180px, 1.4fr) repeat(${columns.length - 1}, minmax(70px, 0.55fr))`} gap={2} minW="720px" alignItems="center">
      {columns.map((column, index) => (
        <Text key={column.key} fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" textAlign={index === 0 ? "left" : "right"}>{column.label}</Text>
      ))}
      {rows.map((row) => (
        <Fragment key={row.player_id ?? row.name_raw}>
          {columns.map((column, index) => (
            <Text key={`${row.player_id ?? row.name_raw}-${column.key}`} fontSize="11px" color={index === 0 ? "white" : "text.secondary"} fontWeight={index === 0 ? "black" : "bold"} textAlign={index === 0 ? "left" : "right"} lineClamp={1}>
              {column.render ? column.render(row) : row[column.key] ?? "-"}
            </Text>
          ))}
        </Fragment>
      ))}
    </Grid>
  </Box>
);

const PlayerStatTables = ({ game }) => {
  const meta = game?.metadata ?? {};
  const teamIds = [meta.away_team, meta.home_team].filter(Boolean);
  const stats = game?.individual_stats ?? {};

  return (
    <Box bg="bg.primary" pb={10}>
      <Box maxW="1400px" mx="auto">
        <Flex align="center" gap={2} mb={4}>
          <BarChart3 size={16} color="#E53E3E" />
          <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase">Traditional Player Box</Text>
        </Flex>
        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
          {teamIds.map((teamId) => {
            const teamStats = stats[teamId] ?? {};
            return (
              <Box key={teamId}>
                <Flex align="center" gap={3} mb={3}>
                  <Box w="10px" h="10px" bg={getTeamColor(teamId)} />
                  <Text fontSize="lg" color="white" fontWeight="black">{getTeamName(teamId)}</Text>
                </Flex>
                <Flex direction="column" gap={4}>
                  <TableBlock title="Passing">
                    <DataTable
                      columns={[
                        { key: "name", label: "Player", render: (r) => cleanName(r.name_raw) },
                        { key: "completions", label: "C" },
                        { key: "attempts", label: "A" },
                        { key: "pct", label: "Pct", render: (r) => pct(r.completions, r.attempts) },
                        { key: "yards", label: "Yds" },
                        { key: "touchdowns", label: "TD" },
                        { key: "interceptions", label: "INT" },
                      ]}
                      rows={toRows(teamStats.passing).sort((a, b) => (b.yards ?? 0) - (a.yards ?? 0))}
                    />
                  </TableBlock>
                  <TableBlock title="Rushing">
                    <DataTable
                      columns={[
                        { key: "name", label: "Player", render: (r) => cleanName(r.name_raw) },
                        { key: "attempts", label: "Att" },
                        { key: "yards", label: "Yds" },
                        { key: "avg", label: "Avg", render: (r) => fmt((r.yards ?? 0) / Math.max(1, r.attempts ?? 0), 1) },
                        { key: "touchdowns", label: "TD" },
                        { key: "explosive_carries_10", label: "10+" },
                      ]}
                      rows={toRows(teamStats.rushing).sort((a, b) => (b.yards ?? 0) - (a.yards ?? 0))}
                    />
                  </TableBlock>
                  <TableBlock title="Receiving">
                    <DataTable
                      columns={[
                        { key: "name", label: "Player", render: (r) => cleanName(r.name_raw) },
                        { key: "targets", label: "Tgt" },
                        { key: "receptions", label: "Rec" },
                        { key: "yards", label: "Yds" },
                        { key: "avg", label: "Avg", render: (r) => fmt((r.yards ?? 0) / Math.max(1, r.receptions ?? 0), 1) },
                        { key: "touchdowns", label: "TD" },
                      ]}
                      rows={toRows(teamStats.receiving).sort((a, b) => (b.yards ?? 0) - (a.yards ?? 0))}
                    />
                  </TableBlock>
                  <TableBlock title="Defense">
                    <DataTable
                      columns={[
                        { key: "name", label: "Player", render: (r) => cleanName(r.name_raw) },
                        { key: "tackles", label: "Tkl" },
                        { key: "tfl", label: "TFL" },
                        { key: "sacks", label: "Sack" },
                        { key: "qb_hurries", label: "Hur" },
                        { key: "passes_defended", label: "PD" },
                        { key: "forced_fumbles", label: "FF" },
                      ]}
                      rows={toRows(teamStats.defense).sort((a, b) => (b.tackles ?? 0) - (a.tackles ?? 0)).slice(0, 12)}
                    />
                  </TableBlock>
                </Flex>
              </Box>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export const GameBoxScorePacketContent = ({ game }) => (
  <PageShell listContent={<PlayerStatTables game={game} />}>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionPassingFieldMapA />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionRushing />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionDefenseMasteryA />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionSpecialTeamsC />
    </PageShell.Slot>
  </PageShell>
);

export const GameBoxScorePacketLab = ({ game }) => (
  <PageShell listContent={<PlayerStatTables game={game} />}>
    <PageShell.Slot cols={4}>
      <BoxScoreBanner game={game} />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionPassingFieldMapA />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionRushing />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionDefenseMasteryA />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <GameProductionSpecialTeamsC />
    </PageShell.Slot>
  </PageShell>
);
