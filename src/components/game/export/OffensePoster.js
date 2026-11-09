import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Poster, PosterTitle, PosterBanner, PosterSection, FitBody, CARD_BG, HAIRLINE, WIDE_W, WIDE_H } from "./PosterChrome";
import { buildAdvancedRows, buildCountingRows, buildHeader, matchupInks, num, rate1, teamAccent, teamLogo, teamShort } from "./exportData";
import { barPct, barRange, barSegment } from "../../../utils/statBars";
import { GameFlowStrip } from "./GameFlowStrip";

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE 1 — OFFENSIVE BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════
// The banner, the game-flow strip, then the board in two equal columns:
// Counting Stats (box-score totals) on the left, Advanced Stats (EPA, success
// rate and the rest of our reads) on the right. Each row: the label and the
// league average on top, then away value · bar | bar · home value. The team
// that came out ahead on the row gets its colour, the other side washes out.
// Bars run 0 (or the negative team's value) to the league max, with a zero
// mark and a league-average tick — utils/statBars, the same scale as the
// game page.

// Export-only ink tuning for matchups where we want the bars to read like the
// Grambling/Texas Southern palette reference (gold + maroon).
const EXPORT_BAR_COLOR_OVERRIDES = {
  "alabama-state": "#FDB913",
  swacasu: "#FDB913",
  "alabama-am": "#6F2633",
  swacaamu: "#6F2633",
};
const normalizedTeamId = (id) => String(id ?? "").toLowerCase().replace(/25$/, "");
const posterInk = (teamId, fallback) => EXPORT_BAR_COLOR_OVERRIDES[normalizedTeamId(teamId)] ?? fallback;

// Type sizes: the vertical poster, and the 16:9 slide (bigger, read on a TV).
const ROW = {
  tall: { value: "1.375rem", sub: "0.625rem", subH: "0.75rem", label: "0.8125rem", avg: "0.625rem", bar: "0.75rem", valueCol: "4.875rem", py: "0.5rem" },
  wide: { value: "1.75rem", sub: "0.75rem", subH: "0.875rem", label: "1rem", avg: "0.75rem", bar: "0.875rem", valueCol: "6rem", py: "0.25rem" },
};

const StatRow = ({ row, awayId, homeId, first, size = ROW.tall }) => {
  const range = barRange(row.away, row.home, row.league, row.fallbackMax);
  const avgPct = row.league?.avg == null ? null : barPct(row.league.avg, range);
  const tie = row.away == null || row.home == null || row.away === row.home;
  const tieUsesTeamColors = tie && row.key === "passSr" && row.away != null && row.home != null;
  const awayWins = !tie && (row.lowerIsBetter ? row.away < row.home : row.away > row.home);
  const homeWins = !tie && !awayWins;
  const inks = matchupInks(awayId, homeId);
  const awayInk = posterInk(awayId, inks.away);
  const homeInk = posterInk(homeId, inks.home);

  const Value = ({ value, sub, isHome, wins }) => (
    <Box textAlign={isHome ? "left" : "right"} minW={0}>
      <Text fontSize={size.value} fontWeight="950" fontFamily="mono" lineHeight={1} whiteSpace="nowrap" color={wins ? "var(--gg-ink)" : "rgba(var(--gg-fg), calc(0.55 + var(--gg-faint-boost, 0)))"}>
        {row.fmt(value)}
      </Text>
      {/* The sub line is always there (blank when a row has none) so every row is the same height. */}
      <Text fontSize={size.sub} fontWeight="800" color="rgba(var(--gg-fg), calc(0.35 + var(--gg-faint-boost, 0)))" mt="0.125rem" lineHeight={size.subH} h={size.subH} whiteSpace="nowrap">{sub ?? ""}</Text>
    </Box>
  );

  const Bar = ({ value, isHome, wins }) => {
    const seg = barSegment(value, range);
    const at = (pct) => (isHome ? { left: `${pct}%` } : { right: `${pct}%` });
    return (
      <Box h={size.bar} bg="rgba(var(--gg-fg), calc(0.05 + var(--gg-line-boost, 0)))" borderRadius="0.1875rem" position="relative" overflow="hidden">
        <Box
          position="absolute" top={0} bottom={0}
          {...at(seg.from)}
          w={`${seg.width}%`}
          bg={
            value != null && value < 0
              ? "rgba(239,68,68,0.85)"
              : (wins || tieUsesTeamColors)
                ? (isHome ? homeInk : awayInk)
                : "rgba(var(--gg-fg), calc(0.22 + var(--gg-faint-boost, 0)))"
          }
          borderRadius="0.1875rem"
        />
        {seg.zero != null && <Box position="absolute" top="-0.1875rem" bottom="-0.1875rem" w="0.125rem" bg="rgba(var(--gg-fg), calc(0.35 + var(--gg-faint-boost, 0)))" {...at(seg.zero)} />}
        {avgPct != null && <Box position="absolute" top={0} bottom={0} w="0.125rem" bg="rgba(var(--gg-fg), calc(0.75 + var(--gg-faint-boost, 0)))" {...at(avgPct)} />}
      </Box>
    );
  };

  return (
    <Flex direction="column" justify="center" flex={size === ROW.wide ? "1" : undefined} py={size.py} borderTop={first ? "none" : "0.0625rem solid"} borderColor="rgba(var(--gg-fg), calc(0.05 + var(--gg-line-boost, 0)))">
      <Flex justify="center" align="baseline" gap="0.5rem" mb="0.375rem">
        <Text fontSize={size.label} fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.1}>{row.label}</Text>
        <Text fontSize={size.avg} fontWeight="800" color="rgba(var(--gg-fg), calc(0.38 + var(--gg-faint-boost, 0)))" letterSpacing="0.04em">
          {row.league ? `Lg Avg ${row.fmt === num ? rate1(row.league.avg) : row.fmt(row.league.avg)}` : "Lg Avg —"}
        </Text>
      </Flex>
      <Grid templateColumns={`${size.valueCol} minmax(0,1fr) minmax(0,1fr) ${size.valueCol}`} columnGap="0.625rem" alignItems="center">
        <Value value={row.away} sub={row.awaySub} isHome={false} wins={awayWins} />
        <Bar value={row.away} isHome={false} wins={awayWins} />
        <Bar value={row.home} isHome wins={homeWins} />
        <Value value={row.home} sub={row.homeSub} isHome wins={homeWins} />
      </Grid>
    </Flex>
  );
};

const TeamKey = ({ awayId, homeId }) => (
  <Flex gap="0.875rem">
    {[awayId, homeId].map((id) => (
      <Flex key={id} align="center" gap="0.375rem">
        <Image src={teamLogo(id)} alt="" w="1rem" h="1rem" objectFit="contain" />
        <Text fontSize="0.6875rem" fontWeight="900" letterSpacing="0.12em" color="rgba(var(--gg-fg), calc(0.6 + var(--gg-faint-boost, 0)))">{teamShort(id)}</Text>
      </Flex>
    ))}
  </Flex>
);

// On 16:9 (`wide`) the board fills its column's height and the rows share it evenly.
const Board = ({ title, rows, accent, awayId, homeId, wide = false }) => (
  <Box bg={CARD_BG} boxShadow="var(--gg-poster-shadow)" borderRadius="1rem" border="0.0625rem solid" borderColor={HAIRLINE} px="1.125rem" py="0.875rem" minW={0}
    display={wide ? "flex" : undefined} flexDirection="column">
    <PosterSection title={title} accent={accent} mb="0" right={<TeamKey awayId={awayId} homeId={homeId} />}>
      {null}
    </PosterSection>
    <Flex direction="column" flex={wide ? "1" : undefined}>
      {rows.map((row, i) => (
        <StatRow key={row.key} row={row} awayId={awayId} homeId={homeId} first={i === 0} size={wide ? ROW.wide : ROW.tall} />
      ))}
    </Flex>
  </Box>
);

// `wide`: the 16:9 slide. The game flow cards stack in a left column; the two boards sit side by
// side to their right.
export const OffensePoster = ({ game, leagueAvg, innerRef, wide = false }) => {
  const header = buildHeader(game);
  const counting = buildCountingRows(game, leagueAvg);
  const advanced = buildAdvancedRows(game, leagueAvg);
  const accent = teamAccent(header.winnerId ?? header.homeId);

  const title = <PosterTitle kicker={[header.weekLabel, "Offensive Breakdown"].filter(Boolean).join(" · ")} title={`${teamShort(header.awayId)} vs ${teamShort(header.homeId)}`} accent={accent} />;

  if (wide) {
    return (
      <Poster innerRef={innerRef} w={WIDE_W} h={WIDE_H} display="flex" flexDirection="column">
        <PosterBanner header={header} label="Offensive Breakdown" />
        <FitBody>
          <Grid templateColumns="35rem minmax(0,1fr) minmax(0,1fr)" gap="0.75rem" alignItems="stretch">
            <GameFlowStrip game={game} awayId={header.awayId} homeId={header.homeId} stacked />
            <Board title="Counting Stats" rows={counting} accent={accent} awayId={header.awayId} homeId={header.homeId} wide />
            <Board title="Advanced Stats" rows={advanced} accent={accent} awayId={header.awayId} homeId={header.homeId} wide />
          </Grid>
        </FitBody>
      </Poster>
    );
  }

  return (
    <Poster innerRef={innerRef}>
      {title}
      <PosterBanner header={header} />
      <GameFlowStrip game={game} awayId={header.awayId} homeId={header.homeId} />

      <Grid templateColumns="repeat(2, minmax(0,1fr))" gap="0.75rem" alignItems="stretch">
        <Board title="Counting Stats" rows={counting} accent={accent} awayId={header.awayId} homeId={header.homeId} />
        <Board title="Advanced Stats" rows={advanced} accent={accent} awayId={header.awayId} homeId={header.homeId} />
      </Grid>
    </Poster>
  );
};
