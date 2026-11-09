import { fgOf, S, crewLabel, caps, tab, fix, pct, foulName } from "./penaltyPosterModel";
import { Card, Head, Tiles, Tile } from "./PenaltyPosterPrimitives";
import { Grid, Flex, Text, Box } from "@chakra-ui/react";

// Officiating crew comparisons and crew-specific callouts.

export const OfficialsMain = ({ pal }) => {
  const fg = fgOf(pal);
  const crews = [...S.officiating_crews.crews].sort((a, b) => b.flags_per_game - a.flags_per_game);
  const maxFlags = Math.max(...crews.map((c) => c.flags_per_game));
  const maxGap = Math.max(...crews.map((c) => Math.abs(c.home_team_flags - c.away_team_flags)));
  const cols = "260px 220px 260px 180px 180px";
  return (
    <Card pal={pal} kicker="Crew profile matrix">
      <Head
        pal={pal}
        cols={cols}
        gap="20px"
        align={["left", "left", "left", "left", "left"]}
        labels={["Crew", "Flags / game", "Home vs away gap", "Defense share", "Pre-snap share"]}
      />
      {crews.map((c) => {
        const gap = c.home_team_flags - c.away_team_flags;
        const gapW = maxGap > 0 ? (Math.abs(gap) / maxGap) * 50 : 0;
        return (
          <Grid key={c.crew_id} templateColumns={cols} columnGap="20px" alignItems="center" h="58px" borderBottom={`1px solid ${fg(0.06)}`}>
            <Flex align="center" gap="10px">
              <Text fontSize="18px" fontWeight="900" textTransform="uppercase">{crewLabel(c)}</Text>
              {c.games === 1 && (
                <Text fontSize="11px" px="6px" py="2px" borderRadius="sm" bg={fg(0.1)} color={fg(0.7)} {...caps}>
                  n=1
                </Text>
              )}
            </Flex>
            <Flex align="center" gap="10px">
              <Box h="20px" w={`${(c.flags_per_game / maxFlags) * 100}%`} bg={pal.brand} />
              <Text fontSize="20px" fontWeight="950" minW="48px" textAlign="right" {...tab}>{fix(c.flags_per_game)}</Text>
            </Flex>
            <Box position="relative" h="20px">
              <Box position="absolute" left="50%" top="-4px" bottom="-4px" w="2px" bg={fg(0.35)} />
              <Box
                position="absolute"
                top={0}
                bottom={0}
                bg={gap >= 0 ? pal.brand : pal.orange}
                left={gap >= 0 ? "50%" : `${50 - gapW}%`}
                w={`${Math.max(gapW, 0.8)}%`}
              />
              <Text position="absolute" right={0} top="-2px" fontSize="16px" fontWeight="900" {...tab}>
                {gap > 0 ? "+" : gap < 0 ? "−" : ""}{Math.abs(gap)}
              </Text>
            </Box>
            <Text fontSize="20px" fontWeight="900" {...tab}>{pct(c.defense_share)}</Text>
            <Text fontSize="20px" fontWeight="900" {...tab}>{pct(c.pre_snap_share)}</Text>
          </Grid>
        );
      })}
    </Card>
  );
};

export const OfficialsTiles = ({ pal }) => {
  const pinkard = S.officiating_crews.crews.find((c) => c.crew_id === "crew_01");
  const greenRates = S.officiating_crews.fouls_vs_swac_rate
    .filter((r) => r.crew_id === "crew_02")
    .sort((a, b) => b.ratio_to_swac - a.ratio_to_swac)
    .slice(0, 3);
  const minFlags = pinkard ? Math.min(...pinkard.flags_by_game) : null;
  const maxFlags = pinkard ? Math.max(...pinkard.flags_by_game) : null;
  return (
    <Tiles n={2}>
      <Tile
        pal={pal}
        value={minFlags == null || maxFlags == null ? "—" : `${minFlags}–${maxFlags}`}
        ink={pal.brand}
        title="Pinkard crew game spread"
        text="From 7 flags in one game to 31 in another."
      />
      <Tile
        pal={pal}
        value={greenRates[0] ? `${fix(greenRates[0].ratio_to_swac, 1)}×` : "—"}
        ink={pal.orange}
        title="Green crew foul profile"
        text={greenRates.map((r) => `${foulName(r.foul)} ${fix(r.ratio_to_swac, 1)}×`).join(" · ")}
      />
    </Tiles>
  );
};
