import { Flex, Image, Box, Text, Grid } from "@chakra-ui/react";
import { teamLogo, teamName, teamMascot, teamAccent, withAlpha } from "../../../game/export/exportData";
import { Kicker, RankChip } from "./ScoutPrimitives";
import { ExportScout } from "./ExportScout";
import PreviewCountdown from "../../../game/preview/PreviewCountdown";
import { longDate } from "../../../../utils/gamePreview";
import { brandOf, PANEL, STRIP } from "./scoutPresentation";

const TeamSide = ({ side, align }) => {
  const right = align === "right";
  const coaches = [["Head coach", side.coaches.head_coach], ["Off. coord.", side.coaches.offensive_coordinator], ["Def. coord.", side.coaches.defensive_coordinator]];
  return (
    <Flex direction="column" justify="center" gap={3} minW={0} px={{ base: 2, lg: 6 }} py={4}>
      <Flex align="center" gap="clamp(0.75rem, 2vw, 1.5rem)" direction={right ? "row-reverse" : "row"} minW={0}>
        <Image src={teamLogo(side.team_id)} alt="" h="clamp(56px, 8vw, 100px)" objectFit="contain" flexShrink={0} />
        <Box minW={0} textAlign={right ? "right" : "left"}>
          <Text fontSize="clamp(1.05rem, 2vw, 1.8rem)" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.03em" lineHeight={1} lineClamp={2} overflowWrap="anywhere">
            {teamName(side.team_id)}
          </Text>
          <Text fontSize="clamp(0.85rem, 1.5vw, 1.3rem)" fontWeight="900" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.05em" lineHeight={1.05} mt="4px" lineClamp={2}>
            {teamMascot(side.team_id)}
          </Text>
          <Flex align="baseline" gap={1.5} mt="6px" justify={right ? "flex-end" : "flex-start"} wrap="wrap">
            <Text fontSize="clamp(0.8rem, 1.2vw, 0.95rem)" fontWeight="950" color="white">{side.conference_record} {String(side.conference ?? "").toUpperCase()}</Text>
            <Text fontSize="clamp(0.8rem, 1.2vw, 0.95rem)" fontWeight="500" color="whiteAlpha.600">({side.record ?? "—"})</Text>
          </Flex>
        </Box>
      </Flex>
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={3} pt={2.5} borderTop="1px solid" borderColor="whiteAlpha.200" textAlign={right ? "right" : "left"}>
        {(right ? [...coaches].reverse() : coaches).map(([role, name]) => (
          <Box key={role} minW={0}>
            <Kicker color="whiteAlpha.500" fontSize="0.52rem">{role}</Kicker>
            <Text fontSize="0.78rem" fontWeight="800" color="white" lineHeight={1.15} lineClamp={2}>{name ?? "—"}</Text>
          </Box>
        ))}
      </Grid>
    </Flex>
  );
};

export const Banner = ({ m }) => {
  const awayColor = teamAccent(m.away.team_id);
  const homeColor = teamAccent(m.home.team_id);
  return (
    <Box position="relative" overflow="hidden" bg="#08080A">
      <ExportScout m={m} />
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${withAlpha(awayColor, 0.27)} 0%, #08080A 34%, #08080A 66%, ${withAlpha(homeColor, 0.27)} 100%)`} />
      <Image src={teamLogo(m.away.team_id)} alt="" position="absolute" left="-5%" top="50%" transform="translateY(-50%)" h="clamp(200px, 24vw, 300px)" opacity={0.16} pointerEvents="none" objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      <Image src={teamLogo(m.home.team_id)} alt="" position="absolute" right="-5%" top="50%" transform="translateY(-50%)" h="clamp(200px, 24vw, 300px)" opacity={0.16} pointerEvents="none" objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      <Grid position="relative" zIndex={1} templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="stretch">
        <TeamSide side={m.away} align="left" />
        <Flex direction="column" align="center" justify="center" px={{ base: 2, lg: 6 }} gap={2} position="relative">
          <Box position="absolute" left={0} h="40%" w="1px" bg="whiteAlpha.100" />
          <Box position="absolute" right={0} h="40%" w="1px" bg="whiteAlpha.100" />
          <Box px={4} py={1} bg="brand.500" transform="skewX(-10deg)">
            <Text textStyle="pill" color="white" fontSize="10px" transform="skewX(10deg)" letterSpacing="0.04em">PREVIEW</Text>
          </Box>
          <PreviewCountdown kickoffAt={m.kickoff_at ?? null} date={m.date} />
          <Text textStyle="cardTitle" color="white" fontSize="sm" whiteSpace="nowrap" textTransform="uppercase">{longDate(m.date)}</Text>
          <Text textStyle="editorial" color="whiteAlpha.600" fontSize="10px" fontWeight="700" textAlign="center">
            {[m.week_label, m.kickoff_label ?? "Kickoff TBA"].filter(Boolean).join(" · ")}
          </Text>
          <Text textStyle="editorial" color="whiteAlpha.500" fontSize="9px" fontWeight="900" textAlign="center" maxW="clamp(10rem, 16vw, 14rem)" lineHeight={1.3} lineClamp={2}>
            {m.venue}
          </Text>
        </Flex>
        <TeamSide side={m.home} align="right" />
      </Grid>
    </Box>
  );
};

export const Strip = ({ side }) => {
  const color = brandOf(side.team_id);
  return (
    <Grid templateColumns="repeat(5, minmax(0,1fr))" bg={PANEL} borderTop="3px solid" borderTopColor={color} overflow="hidden">
      {STRIP.map(([k, label], i) => {
        const s = side.strip[k];
        return (
          <Flex key={k} direction="column" justify="space-between" gap={2} px={3} py={3} borderLeft={i ? "1px solid" : "none"} borderColor={withAlpha(color, 0.35)} minW={0}>
            <Text fontSize="0.6rem" fontWeight="900" color="rgba(255,255,255,0.65)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.2} lineClamp={2}>{label}</Text>
            <Text fontSize="clamp(1.15rem, 1.9vw, 1.5rem)" fontWeight="900" color="white" fontFamily="mono" lineHeight={1} whiteSpace="nowrap">{s.display}</Text>
            <RankChip rank={s.rank} color={color} />
          </Flex>
        );
      })}
    </Grid>
  );
};
