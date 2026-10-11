import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Poster, PosterTitle, PosterBanner, PosterSection, CARD_BG, HAIRLINE } from "./PosterChrome";
import { buildHeader, buildOffenseRows, teamAccent, teamLogo, teamShort } from "./exportData";
import { barPct, barRange, barSegment } from "../../../utils/statBars";

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE 1 — OFFENSIVE BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════
// Fourteen rows, away on the left, home on the right, the league average under
// the label. Each side gets a bar: the team that came out ahead on the row in its
// own color, the other side washed out. Bars run 0 (or the negative team's value)
// to the league max, with a zero mark and a league-average tick — utils/statBars,
// the same scale as the game page.

const StatRow = ({ row, awayId, homeId }) => {
  const range = barRange(row.away, row.home, row.league, row.fallbackMax);
  const avgPct = row.league?.avg == null ? null : barPct(row.league.avg, range);
  const tie = row.away == null || row.home == null || row.away === row.home;
  const awayWins = !tie && (row.lowerIsBetter ? row.away < row.home : row.away > row.home);
  const homeWins = !tie && !awayWins;

  const Side = ({ value, sub, isHome, wins }) => {
    const accent = teamAccent(isHome ? homeId : awayId);
    const seg = barSegment(value, range);
    const at = (pct) => (isHome ? { left: `${pct}%` } : { right: `${pct}%` });
    return (
      <Flex align="center" gap="14px" direction={isHome ? "row" : "row-reverse"} minW={0}>
        <Box textAlign={isHome ? "left" : "right"} minW="82px">
          <Text fontSize="26px" fontWeight="950" fontFamily="mono" lineHeight={1} color={wins ? "white" : "rgba(255,255,255,0.55)"}>
            {row.fmt(value)}
          </Text>
          {sub && <Text fontSize="10px" fontWeight="800" color="rgba(255,255,255,0.35)" mt="2px">{sub}</Text>}
        </Box>
        <Box flex="1" h="14px" bg="rgba(255,255,255,0.05)" borderRadius="3px" position="relative" overflow="hidden">
          <Box
            position="absolute" top={0} bottom={0}
            {...at(seg.from)}
            w={`${seg.width}%`}
            bg={value != null && value < 0 ? "rgba(239,68,68,0.85)" : wins ? accent : "rgba(255,255,255,0.22)"}
            borderRadius="3px"
          />
          {seg.zero != null && (
            <Box position="absolute" top="-3px" bottom="-3px" w="2px" bg="rgba(255,255,255,0.35)" {...at(seg.zero)} />
          )}
          {avgPct != null && (
            <Box position="absolute" top={0} bottom={0} w="2px" bg="rgba(255,255,255,0.75)" {...(isHome ? { left: `${avgPct}%` } : { right: `${avgPct}%` })} />
          )}
        </Box>
      </Flex>
    );
  };

  return (
    <Grid templateColumns="minmax(0, 1fr) 210px minmax(0, 1fr)" columnGap="20px" alignItems="center" py="9px" borderBottom="1px solid" borderColor="rgba(255,255,255,0.05)">
      <Side value={row.away} sub={row.awaySub} isHome={false} wins={awayWins} />
      <Box textAlign="center">
        <Text fontSize="15px" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.1}>
          {row.label}
        </Text>
        <Text fontSize="11px" fontWeight="800" color="rgba(255,255,255,0.38)" mt="3px" letterSpacing="0.04em">
          {row.league ? `Lg Avg ${row.fmt(row.league.avg)}` : "Lg Avg —"}
        </Text>
      </Box>
      <Side value={row.home} sub={row.homeSub} isHome wins={homeWins} />
    </Grid>
  );
};

export const OffensePoster = ({ game, leagueAvg, innerRef }) => {
  const header = buildHeader(game);
  const rows = buildOffenseRows(game, leagueAvg);
  const accent = teamAccent(header.winnerId ?? header.homeId);

  return (
    <Poster innerRef={innerRef}>
      <PosterTitle kicker={[header.weekLabel, "Offensive Breakdown"].filter(Boolean).join(" · ")} title={`${teamShort(header.awayId)} vs ${teamShort(header.homeId)}`} accent={accent} />
      <PosterBanner header={header} />

      <Box bg={CARD_BG} borderRadius="16px" border="1px solid" borderColor={HAIRLINE} px="24px" py="16px">
        <PosterSection
          title="Overall Offense"
          accent={accent}
          mb="4px"
          right={
            <Flex gap="18px">
              {[header.awayId, header.homeId].map((id) => (
                <Flex key={id} align="center" gap="6px">
                  <Image src={teamLogo(id)} alt="" w="18px" h="18px" objectFit="contain" />
                  <Text fontSize="12px" fontWeight="900" letterSpacing="0.12em" color="rgba(255,255,255,0.6)">{teamShort(id)}</Text>
                </Flex>
              ))}
            </Flex>
          }
        >
          {rows.map((row) => (
            <StatRow key={row.key} row={row} awayId={header.awayId} homeId={header.homeId} />
          ))}
        </PosterSection>
      </Box>

    </Poster>
  );
};
