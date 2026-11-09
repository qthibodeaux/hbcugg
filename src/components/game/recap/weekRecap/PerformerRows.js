import { brandOf } from "../../preview/GamePreviewScout";
import { statsFor, componentsOf, metaOf, rowStats, scoreOf } from "./recapModel";
import { Box, Image, Grid, Text, Flex } from "@chakra-ui/react";
import { PANEL, INK, GOLD, LINE, DIM } from "./recapPresentation";
import { teamLogo } from "../../export/exportData";
import { Kick, CompBar } from "./RecapPrimitives";

export const Performer = ({ p, games, max, nameW, scoreW }) => {
  const color = brandOf(p.team_id);
  const stats = statsFor(p, games);
  const withComps = { ...p, components: p.components ?? componentsOf(games, p.team_id, p.person_id) };
  return (
    <Box flex="1" display="flex" flexDirection="column" justifyContent="center" position="relative" overflow="hidden" bg={PANEL} borderLeft={`5px solid ${color}`} px="16px" py="7px" minW={0}>
      <Image src={teamLogo(p.team_id)} alt="" position="absolute" right="90px" top="-20px" w="130px" h="130px" objectFit="contain" opacity={0.1} />
      <Grid position="relative" templateColumns={`40px ${nameW}px minmax(0,1fr) ${scoreW}px`} columnGap="18px" alignItems="center">
        <Image src={teamLogo(p.team_id)} alt="" w="40px" h="40px" objectFit="contain" />
        <Box minW={0}>
          <Text fontSize="30px" fontWeight="950" fontStyle="italic" color={INK} textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.02em" lineClamp={1}>{p.last_name}</Text>
          <Kick size={11} mt="4px">{metaOf(p)}</Kick>
        </Box>
        <CompBar p={withComps} max={max} h="20px" />
        <Text fontSize="38px" fontWeight="950" color={GOLD} lineHeight={1} fontVariantNumeric="tabular-nums" textAlign="right">{scoreOf(p).toFixed(1)}</Text>
      </Grid>
      <Flex position="relative" gap="14px" mt="6px" pl="54px" wrap="nowrap" overflow="hidden">
        {stats.slice(0, 8).map((st) => (
          <Flex key={st.label} align="baseline" gap="5px">
            <Text fontSize="19px" fontWeight="900" color={INK} lineHeight={1} fontVariantNumeric="tabular-nums">{st.value}</Text>
            <Kick size={9}>{st.label}</Kick>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

export const NextRow = ({ p, rank, first, max, games }) => (
  <Grid templateColumns="24px 26px minmax(0,0.9fr) minmax(0,1.3fr) 150px" columnGap="12px" alignItems="center" minH="44px" py="6px" px="14px" borderTop={first ? "none" : "1px solid"} borderColor={LINE}>
    <Text fontSize="15px" fontWeight="900" color={DIM} fontVariantNumeric="tabular-nums">{rank}</Text>
    <Image src={teamLogo(p.team_id)} alt="" w="24px" h="24px" objectFit="contain" />
    <Flex direction="column" gap="2px" minW={0}>
      <Text fontSize="18px" fontWeight="900" color={INK} textTransform="uppercase" lineClamp={1}>{p.last_name}</Text>
      <Kick size={10} flexShrink={0}>{metaOf(p)}</Kick>
    </Flex>
    <Flex gap="8px" rowGap="4px" minW={0} wrap="wrap">
      {rowStats(p, games).map((st) => (
        <Flex key={st.label} align="baseline" gap="4px" flexShrink={0}>
          <Text fontSize="17px" fontWeight="900" color={INK} fontVariantNumeric="tabular-nums">{st.value}</Text>
          <Kick size={9}>{st.label}</Kick>
        </Flex>
      ))}
    </Flex>
    <Grid templateColumns="minmax(0,1fr) max-content" alignItems="center" gap={2} minW={0}>
      <CompBar p={{ ...p, components: p.components ?? componentsOf(games, p.team_id, p.person_id) }} max={max} h="8px" />
      <Text whiteSpace="nowrap" fontSize="19px" fontWeight="950" color={INK} fontVariantNumeric="tabular-nums" textAlign="right">{scoreOf(p).toFixed(1)}</Text>
    </Grid>
  </Grid>
);
