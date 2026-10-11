import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { teamAccent, teamLogo, teamMascot, teamName, withAlpha } from "../export/exportData";
import { longDate } from "../../../utils/gamePreview";
import PreviewCountdown from "./PreviewCountdown";

/**
 * GamePreviewBanner
 *
 * PHILOSOPHY:
 *   Purpose: The played-game banner's look (team-color gradient, watermark
 *   logos, name / mascot / record stacks) for a game that has not happened.
 *   The score column becomes a countdown; the center carries the date, venue
 *   and event instead of FINAL and the margin.
 *
 * CONTENT TIERS:
 *   Essential: both teams, records entering the game, PREVIEW pill, date.
 *   Nice-to-have: countdown, venue, event / classic name.
 *   Fluff: watermark logos, the export link.
 *
 * SIZING:
 *   clamp() and fr tracks only.
 */

const TeamSide = ({ team, align }) => {
  const right = align === "right";
  const rec = team.confRecord ? `${team.confRecord}${team.conference ? ` ${String(team.conference).toUpperCase()}` : ""}` : null;
  return (
    <Flex align="center" gap="clamp(0.75rem, 2vw, 2rem)" direction={right ? "row-reverse" : "row"} minW={0} px={{ base: 2, lg: 6 }} py={2}>
      <Image src={teamLogo(team.id)} alt="" h="clamp(56px, 9vw, 112px)" objectFit="contain" flexShrink={0} />
      <Box minW={0} textAlign={right ? "right" : "left"}>
        <Text fontSize="clamp(1.1rem, 2.2vw, 2rem)" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.05} lineClamp={1}>
          {teamName(team.id)}
        </Text>
        <Text fontSize="clamp(0.9rem, 1.7vw, 1.5rem)" fontWeight="900" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.06em" lineHeight={1.15} mt="3px" lineClamp={1}>
          {teamMascot(team.id)}
        </Text>
        <Flex align="baseline" gap={1.5} mt="4px" justify={right ? "flex-end" : "flex-start"}>
          {rec ? <Text fontSize="clamp(0.8rem, 1.3vw, 1rem)" fontWeight="950" color="white">{rec}</Text> : null}
          <Text fontSize="clamp(0.8rem, 1.3vw, 1rem)" fontWeight="500" color="whiteAlpha.600">({team.record ?? "—"})</Text>
        </Flex>
      </Box>
    </Flex>
  );
};

const GamePreviewBanner = ({ model }) => {
  const { away, home, venue, event } = model;
  const awayColor = teamAccent(away.id);
  const homeColor = teamAccent(home.id);

  const venueRows = [
    { key: "stadium", text: venue?.stadium_name ?? venue?.venue_label ?? null },
    { key: "city", text: venue?.stadium_name ? venue?.city ?? null : null },
    {
      key: "event",
      text: model.eventName ?? event?.name
        ? [model.eventName ?? event?.name, model.neutralSite ? "Neutral site" : null].filter(Boolean).join(" · ")
        : model.neutralSite ? "Neutral site" : null,
    },
  ].filter((r) => r.text);

  return (
    <Box position="relative" overflow="hidden" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100" w="full" h="100%" bg="#08080A">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${withAlpha(awayColor, 0.27)} 0%, #08080A 34%, #08080A 66%, ${withAlpha(homeColor, 0.27)} 100%)`} />
      <Image src={teamLogo(away.id)} alt="" position="absolute" left="-5%" top="50%" transform="translateY(-50%)" h="clamp(200px, 24vw, 300px)" opacity={0.16} pointerEvents="none" objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      <Image src={teamLogo(home.id)} alt="" position="absolute" right="-5%" top="50%" transform="translateY(-50%)" h="clamp(200px, 24vw, 300px)" opacity={0.16} pointerEvents="none" objectFit="contain" filter="grayscale(1) brightness(1.8)" />

      <Box
        as={Link}
        to={`/game/preview/${encodeURIComponent(model.gameId)}/export`}
        position="absolute" top="0.75rem" right="0.75rem" zIndex={5}
        px={3} py={1.5} borderRadius="md"
        bg="whiteAlpha.200" _hover={{ bg: "whiteAlpha.300", textDecoration: "none" }}
        fontSize="10px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.16em"
      >
        Export preview
      </Box>

      <Grid position="relative" zIndex={1} h="100%" templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="stretch">
        <TeamSide team={away} align="left" />

        <Flex direction="column" align="center" justify="center" px={{ base: 2, lg: 6 }} gap={2} position="relative">
          <Box position="absolute" left={0} h="40%" w="1px" bg="whiteAlpha.100" />
          <Box position="absolute" right={0} h="40%" w="1px" bg="whiteAlpha.100" />
          <Box px={4} py={1} bg="brand.500" transform="skewX(-10deg)">
            <Text textStyle="pill" color="white" fontSize="10px" transform="skewX(10deg)" letterSpacing="0.04em">PREVIEW</Text>
          </Box>
          <PreviewCountdown kickoffAt={model.kickoffAt} date={model.date} />
          <Text textStyle="cardTitle" color="white" fontSize="sm" whiteSpace="nowrap" textTransform="uppercase">
            {longDate(model.date)}
          </Text>
          <Text textStyle="editorial" color="whiteAlpha.600" fontSize="10px" fontWeight="700" textAlign="center">
            {[model.weekLabel, model.kickoffLabel ? (model.kickoffAt ? model.kickoffLabel : `Kickoff ${model.kickoffLabel}`) : null].filter(Boolean).join(" · ")}
          </Text>
          {venueRows.length > 0 ? (
            <Flex direction="column" align="center" gap={0} maxW="clamp(10rem, 16vw, 14rem)">
              {venueRows.map((row) => (
                <Text
                  key={row.key}
                  textStyle="editorial"
                  color={row.key === "event" ? "brand.400" : "whiteAlpha.500"}
                  textAlign="center"
                  fontSize="9px"
                  fontWeight={row.key === "event" || row.key === "stadium" ? "900" : "700"}
                  textTransform={row.key === "event" ? "uppercase" : "none"}
                  letterSpacing={row.key === "event" ? "0.08em" : "normal"}
                  lineHeight={1.3}
                  lineClamp={row.key === "event" ? 2 : 2}
                >
                  {row.text}
                </Text>
              ))}
            </Flex>
          ) : null}
        </Flex>

        <TeamSide team={home} align="right" />
      </Grid>
    </Box>
  );
};

export default GamePreviewBanner;
