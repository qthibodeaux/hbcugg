import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Poster, PosterTitle, PosterBanner, PosterSection, CARD_BG, HAIRLINE, Head } from "./PosterChrome";
import { buildHeader, buildEpaBreakdown, buildBiggestPlays, teamAccent, teamLogo, teamShort, teamName, signed1, signed2, DASH } from "./exportData";
import { ChainsMovedCard, SeriesResultsCard } from "../page/summary/SeriesCards";

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE 2 — DRIVES & SITUATIONS
// ═══════════════════════════════════════════════════════════════════════════════
// Offense EPA breakdown, the two series bars (`series_summary`) and the biggest
// plays (`game_export.biggest_plays`, regulation + overtime folded to a top 3).

const Card = ({ children, ...props }) => (
  <Box bg={CARD_BG} borderRadius="16px" border="1px solid" borderColor={HAIRLINE} px="24px" py="16px" {...props}>
    {children}
  </Box>
);

const EpaBreakdown = ({ rows, accent }) => (
  <Card>
    <PosterSection title="Offense EPA Breakdown" accent={accent} mb="0">
      <Grid templateColumns="minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))" columnGap="16px" pb="6px">
        <Box />
        <Head align="center">Dropback EPA</Head>
        <Head align="center">Run EPA</Head>
        <Head align="center">Offense EPA</Head>
      </Grid>
      {rows.map((r) => {
        const color = teamAccent(r.id);
        return (
          <Grid key={r.id} templateColumns="minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))" columnGap="16px" alignItems="center" py="12px" borderTop="1px solid" borderColor="rgba(255,255,255,0.06)" borderLeft="4px solid" style={{ borderLeftColor: color }} pl="14px">
            <Flex align="center" gap="10px" minW={0}>
              <Image src={teamLogo(r.id)} alt="" w="26px" h="26px" objectFit="contain" />
              <Text fontSize="20px" fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" lineClamp={1}>{teamName(r.id)}</Text>
            </Flex>
            {[r.dropback, r.run].map((v, i) => (
              <Text key={i} textAlign="center" fontSize="22px" fontWeight="900" fontFamily="mono">{signed1(v)}</Text>
            ))}
            <Text textAlign="center" fontSize="24px" fontWeight="950" fontFamily="mono" color={r.offense == null ? "white" : r.offense >= 0 ? "#22c55e" : "#ef4444"}>{signed1(r.offense)}</Text>
          </Grid>
        );
      })}
    </PosterSection>
  </Card>
);

const PlayList = ({ title, plays, positive, awayId, homeId }) => (
  <Box>
    <Grid templateColumns="28px 150px 90px minmax(0, 1fr) 110px 70px" columnGap="12px" alignItems="end" pb="6px" borderBottom="1px solid" borderColor="rgba(255,255,255,0.08)">
      <Text fontSize="12px" fontWeight="950" color={positive ? "#22c55e" : "#ef4444"} textTransform="uppercase" letterSpacing="0.14em" gridColumn="span 4">{title}</Text>
      <Head align="center">Score</Head>
      <Head>EPA</Head>
    </Grid>
    {plays.length === 0 && (
      <Text py="14px" fontSize="12px" fontWeight="800" color="rgba(255,255,255,0.3)" textTransform="uppercase" letterSpacing="0.14em">
        No biggest-plays data on file
      </Text>
    )}
    {plays.map((p, i) => {
      const color = teamAccent(p.team_id);
      return (
        <Grid key={p.play_id ?? i} templateColumns="28px 150px 90px minmax(0, 1fr) 110px 70px" columnGap="12px" alignItems="center" py="9px" borderBottom="1px solid" borderColor="rgba(255,255,255,0.05)" borderLeft="3px solid" style={{ borderLeftColor: color }} pl="10px">
          <Text fontSize="20px" fontWeight="950" fontStyle="italic" color="rgba(255,255,255,0.6)">{i + 1}</Text>
          <Text fontSize="12px" fontWeight="900" color="rgba(255,255,255,0.6)" letterSpacing="0.06em" whiteSpace="nowrap">
            {teamShort(p.team_id)} · {p.period === "OT" ? "OT" : `Q${p.quarter} ${p.clock}`}
          </Text>
          <Text fontSize="12px" fontWeight="800" color="rgba(255,255,255,0.45)" whiteSpace="nowrap">
            {p.down != null ? `${p.down}${["st", "nd", "rd", "th"][Math.min(p.down, 4) - 1]} & ${p.distance ?? DASH}` : DASH}
          </Text>
          <Text fontSize="14px" fontWeight="700" lineClamp={1}>{p.description ?? DASH}</Text>
          <Text fontSize="12px" fontWeight="900" color="rgba(255,255,255,0.6)" textAlign="center" whiteSpace="nowrap">
            {p.score_after ? `${teamShort(awayId)} ${p.score_after.away} - ${teamShort(homeId)} ${p.score_after.home}` : DASH}
          </Text>
          <Flex justify="flex-end">
            <Box px="10px" py="2px" borderRadius="4px" bg={positive ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}>
              <Text fontSize="15px" fontWeight="950" fontFamily="mono">{signed2(p.epa)}</Text>
            </Box>
          </Flex>
        </Grid>
      );
    })}
  </Box>
);

export const DrivesPoster = ({ game, innerRef }) => {
  const header = buildHeader(game);
  const accent = teamAccent(header.winnerId ?? header.homeId);
  const epa = buildEpaBreakdown(game);
  const biggest = buildBiggestPlays(game);

  return (
    <Poster innerRef={innerRef}>
      <PosterTitle kicker={[header.weekLabel, "Drives & Situations"].filter(Boolean).join(" · ")} title={`${teamShort(header.awayId)} vs ${teamShort(header.homeId)}`} accent={accent} />
      <PosterBanner header={header} />

      <Flex direction="column" gap="14px">
        <EpaBreakdown rows={epa} accent={accent} />

        {/* The two series cards, as the Summary tab draws them — sized for the poster. */}
        <Box h="250px">
          <ChainsMovedCard seriesSummary={game?.series_summary} awayId={header.awayId} homeId={header.homeId} accent={accent} />
        </Box>
        <Box h="250px">
          <SeriesResultsCard seriesSummary={game?.series_summary} awayId={header.awayId} homeId={header.homeId} accent={accent} />
        </Box>

        <Card>
          <PosterSection title="Biggest Plays by EPA" accent={accent} mb="0">
            <Flex direction="column" gap="16px">
              <PlayList title="Top 3 positive" plays={biggest.positive} positive awayId={header.awayId} homeId={header.homeId} />
              <PlayList title="Top 3 negative" plays={biggest.negative} positive={false} awayId={header.awayId} homeId={header.homeId} />
            </Flex>
          </PosterSection>
        </Card>
      </Flex>

    </Poster>
  );
};
