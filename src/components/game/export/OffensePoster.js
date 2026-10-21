import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Poster, PosterTitle, PosterBanner, PosterSection, CARD_BG, HAIRLINE } from "./PosterChrome";
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

const StatRow = ({ row, awayId, homeId, first }) => {
  const range = barRange(row.away, row.home, row.league, row.fallbackMax);
  const avgPct = row.league?.avg == null ? null : barPct(row.league.avg, range);
  const tie = row.away == null || row.home == null || row.away === row.home;
  const awayWins = !tie && (row.lowerIsBetter ? row.away < row.home : row.away > row.home);
  const homeWins = !tie && !awayWins;
  const inks = matchupInks(awayId, homeId);

  const Value = ({ value, sub, isHome, wins }) => (
    <Box textAlign={isHome ? "left" : "right"} minW={0}>
      <Text fontSize="22px" fontWeight="950" fontFamily="mono" lineHeight={1} whiteSpace="nowrap" color={wins ? "white" : "rgba(255,255,255,0.55)"}>
        {row.fmt(value)}
      </Text>
      {/* The sub line is always there (blank when a row has none) so every row is the same height. */}
      <Text fontSize="10px" fontWeight="800" color="rgba(255,255,255,0.35)" mt="2px" lineHeight="12px" h="12px" whiteSpace="nowrap">{sub ?? ""}</Text>
    </Box>
  );

  const Bar = ({ value, isHome, wins }) => {
    const seg = barSegment(value, range);
    const at = (pct) => (isHome ? { left: `${pct}%` } : { right: `${pct}%` });
    return (
      <Box h="12px" bg="rgba(255,255,255,0.05)" borderRadius="3px" position="relative" overflow="hidden">
        <Box
          position="absolute" top={0} bottom={0}
          {...at(seg.from)}
          w={`${seg.width}%`}
          bg={value != null && value < 0 ? "rgba(239,68,68,0.85)" : wins ? (isHome ? inks.home : inks.away) : "rgba(255,255,255,0.22)"}
          borderRadius="3px"
        />
        {seg.zero != null && <Box position="absolute" top="-3px" bottom="-3px" w="2px" bg="rgba(255,255,255,0.35)" {...at(seg.zero)} />}
        {avgPct != null && <Box position="absolute" top={0} bottom={0} w="2px" bg="rgba(255,255,255,0.75)" {...at(avgPct)} />}
      </Box>
    );
  };

  return (
    <Box py="8px" borderTop={first ? "none" : "1px solid"} borderColor="rgba(255,255,255,0.05)">
      <Flex justify="center" align="baseline" gap="8px" mb="6px">
        <Text fontSize="13px" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.1}>{row.label}</Text>
        <Text fontSize="10px" fontWeight="800" color="rgba(255,255,255,0.38)" letterSpacing="0.04em">
          {row.league ? `Lg Avg ${row.fmt === num ? rate1(row.league.avg) : row.fmt(row.league.avg)}` : "Lg Avg —"}
        </Text>
      </Flex>
      <Grid templateColumns="78px minmax(0,1fr) minmax(0,1fr) 78px" columnGap="10px" alignItems="center">
        <Value value={row.away} sub={row.awaySub} isHome={false} wins={awayWins} />
        <Bar value={row.away} isHome={false} wins={awayWins} />
        <Bar value={row.home} isHome wins={homeWins} />
        <Value value={row.home} sub={row.homeSub} isHome wins={homeWins} />
      </Grid>
    </Box>
  );
};

const TeamKey = ({ awayId, homeId }) => (
  <Flex gap="14px">
    {[awayId, homeId].map((id) => (
      <Flex key={id} align="center" gap="6px">
        <Image src={teamLogo(id)} alt="" w="16px" h="16px" objectFit="contain" />
        <Text fontSize="11px" fontWeight="900" letterSpacing="0.12em" color="rgba(255,255,255,0.6)">{teamShort(id)}</Text>
      </Flex>
    ))}
  </Flex>
);

const Board = ({ title, rows, accent, awayId, homeId }) => (
  <Box bg={CARD_BG} borderRadius="16px" border="1px solid" borderColor={HAIRLINE} px="18px" py="14px" minW={0}>
    <PosterSection title={title} accent={accent} mb="0" right={<TeamKey awayId={awayId} homeId={homeId} />}>
      {rows.map((row, i) => (
        <StatRow key={row.key} row={row} awayId={awayId} homeId={homeId} first={i === 0} />
      ))}
    </PosterSection>
  </Box>
);

export const OffensePoster = ({ game, leagueAvg, innerRef }) => {
  const header = buildHeader(game);
  const counting = buildCountingRows(game, leagueAvg);
  const advanced = buildAdvancedRows(game, leagueAvg);
  const accent = teamAccent(header.winnerId ?? header.homeId);

  return (
    <Poster innerRef={innerRef}>
      <PosterTitle kicker={[header.weekLabel, "Offensive Breakdown"].filter(Boolean).join(" · ")} title={`${teamShort(header.awayId)} vs ${teamShort(header.homeId)}`} accent={accent} />
      <PosterBanner header={header} />
      <GameFlowStrip game={game} awayId={header.awayId} homeId={header.homeId} />

      <Grid templateColumns="repeat(2, minmax(0,1fr))" gap="12px" alignItems="stretch">
        <Board title="Counting Stats" rows={counting} accent={accent} awayId={header.awayId} homeId={header.homeId} />
        <Board title="Advanced Stats" rows={advanced} accent={accent} awayId={header.awayId} homeId={header.homeId} />
      </Grid>
    </Poster>
  );
};
