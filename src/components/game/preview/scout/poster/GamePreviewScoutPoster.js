import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { POSTER_W, P_BG, P_SEAM, P_PANEL, BRAND } from "../scoutPresentation";
import { PBanner, PStrip, PBox, PKick } from "./PosterHeader";
import { PSide, PUnitRows, PLeaders } from "./PosterUnits";

// Full-size scout poster composition, preserving the accepted source model and layout.

export const GamePreviewScoutPoster = ({ m, innerRef }) => {
  const max = Math.max(...[...m.away.leaders, ...m.home.leaders].slice(0).map((p) => p.production), 1);
  return (
    <Box ref={innerRef} w={`${POSTER_W}px`} bg={P_BG} color="var(--gg-ink)" p="14px">
      <Flex direction="column" gap="1px" bg={P_SEAM} border={`1px solid ${P_SEAM}`} borderRadius="12px" overflow="hidden">
        <PBanner m={m} />
        <Flex align="center" justify="flex-end" bg={P_PANEL} h="28px">
          <Text px="14px" fontSize="14px" fontWeight="900" fontStyle="italic" letterSpacing="-0.02em">HBCU <Text as="span" color={BRAND}>GRIDIRON GLORY</Text></Text>
        </Flex>
        <Grid templateColumns="1fr 1fr" gap="1px" bg={P_SEAM}>
          <PStrip sd={m.away} />
          <PStrip sd={m.home} />
        </Grid>
        <Grid templateColumns="minmax(0,0.78fr) minmax(0,1.22fr) minmax(0,0.78fr)" gap="1px" bg={P_SEAM} alignItems="stretch">
          <PSide sd={m.away} total={m.ranked_teams} />
          <PBox title="Unit matchups" right={<PKick size={10} color="rgba(var(--gg-fg), 0.75)">Through week {m.through_week}</PKick>}>
            <Flex direction="column" gap="10px">
              <PUnitRows awayId={m.away.team_id} offId={m.away.team_id} defId={m.home.team_id} rows={m.units.away_offense} total={m.ranked_teams} />
              <Box h="1px" bg="rgba(var(--gg-fg), 0.1)" />
              <PUnitRows awayId={m.away.team_id} offId={m.home.team_id} defId={m.away.team_id} rows={m.units.home_offense} total={m.ranked_teams} />
            </Flex>
          </PBox>
          <PSide sd={m.home} total={m.ranked_teams} />
        </Grid>
        <Grid templateColumns="1fr 1fr" gap="1px" bg={P_SEAM}>
          <PLeaders sd={m.away} max={max} />
          <PLeaders sd={m.home} max={max} />
        </Grid>
      </Flex>
    </Box>
  );
};
