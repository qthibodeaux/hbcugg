import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { POSTER_W, P_BG, P_SEAM, P_PANEL, BRAND } from "./scoutPresentation";
import { PTeamBar, PStrip, PSide, PUnitRows, PLeaders } from "./ScoutPosterSections";
import { longDate } from "../../../../utils/gamePreview";
import { PBox, PKick } from "./ScoutPrimitives";

export const GamePreviewScoutPoster = ({ m, innerRef }) => {
  const max = Math.max(...[...m.away.leaders, ...m.home.leaders].slice(0).map((p) => p.production), 1);
  return (
    <Box ref={innerRef} w={`${POSTER_W}px`} bg={P_BG} color="white" p="14px">
      <Flex direction="column" gap="1px" bg={P_SEAM} border={`1px solid ${P_SEAM}`} borderRadius="12px" overflow="hidden">
        <Grid templateColumns="1fr 56px 1fr" gap="1px" bg={P_SEAM}>
          <PTeamBar sd={m.away} />
          <Flex align="center" justify="center" bg={P_PANEL}><Text fontSize="20px" fontWeight="900" color="rgba(255,255,255,0.5)">@</Text></Flex>
          <PTeamBar sd={m.home} right />
        </Grid>
        <Flex align="center" bg={P_PANEL} h="34px">
          <Flex align="center" h="full" px="14px" bg={BRAND}><Text fontSize="15px" fontWeight="900" fontStyle="italic" textTransform="uppercase">{m.week_label}</Text></Flex>
          <Text px="14px" fontSize="14px" fontWeight="800" textTransform="uppercase">{longDate(m.date)}</Text>
          <Text px="14px" fontSize="14px" fontWeight="800" color="rgba(255,255,255,0.75)" borderLeft="1px solid rgba(255,255,255,0.12)">{m.kickoff_label ?? "Kickoff TBA"}</Text>
          <Text px="14px" fontSize="14px" fontWeight="800" color="rgba(255,255,255,0.75)" borderLeft="1px solid rgba(255,255,255,0.12)" flex={1}>{m.venue}</Text>
          <Text px="14px" fontSize="16px" fontWeight="900" fontStyle="italic" letterSpacing="-0.02em">HBCU <Text as="span" color={BRAND}>GRIDIRON GLORY</Text></Text>
        </Flex>
        <Grid templateColumns="1fr 1fr" gap="1px" bg={P_SEAM}>
          <PStrip sd={m.away} />
          <PStrip sd={m.home} />
        </Grid>
        <Grid templateColumns="minmax(0,0.78fr) minmax(0,1.22fr) minmax(0,0.78fr)" gap="1px" bg={P_SEAM} alignItems="stretch">
          <PSide sd={m.away} total={m.ranked_teams} />
          <PBox title="Unit matchups" right={<PKick size={10} color="rgba(255,255,255,0.75)">Through week {m.through_week}</PKick>}>
            <Flex direction="column" gap="10px">
              <PUnitRows offId={m.away.team_id} defId={m.home.team_id} rows={m.units.away_offense} total={m.ranked_teams} />
              <Box h="1px" bg="rgba(255,255,255,0.1)" />
              <PUnitRows offId={m.home.team_id} defId={m.away.team_id} rows={m.units.home_offense} total={m.ranked_teams} />
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
