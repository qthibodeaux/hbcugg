import { Flex, Box, Text, Image } from "@chakra-ui/react";
import { nameSize, SIZE } from "./gloryContent";
import { withAlpha } from "../../../game/export/exportData";
import { Link } from "react-router-dom";

// Published Glory Team identity, rating, highlight and linked game reveal.

const TeamNumbers = ({ data, big }) => {
  const glory = data.team?.glory;
  return (
    <Flex gap={big ? "3cqw" : 6} wrap="wrap" align="flex-end">
      {glory ? (
        <Box>
          {/* No team Glory rating exists yet — the backend ranks on its team rating
              and names it in metric_label; print that, never "Glory rating". */}
          <Text textStyle="statLabel" color="text.muted">{glory.metric_label ?? "Team rating"}</Text>
          <Flex align="baseline" gap={2}>
            <Text fontSize={big ? "4cqw" : "2.4rem"} fontWeight="900" fontStyle="italic" lineHeight={1} color="white" fontVariantNumeric="tabular-nums">{glory.display ?? glory.rating}</Text>
            {glory.delta != null ? (
              <Text fontSize={big ? "1.3cqw" : "1rem"} fontWeight="900" color={glory.delta >= 0 ? "#68D391" : "#FC8181"}>{glory.delta_display ?? `${glory.delta > 0 ? "+" : ""}${glory.delta}`}</Text>
            ) : null}
            <Text textStyle="statLabel" color="text.secondary">#{glory.rank} of {glory.ranked_teams}</Text>
          </Flex>
        </Box>
      ) : null}
      {data.highlight ? (
        <Box>
          <Text textStyle="statLabel" color="text.muted">{data.highlight.label}</Text>
          <Text fontSize={big ? "4cqw" : "2.4rem"} fontWeight="900" fontStyle="italic" lineHeight={1} color="brand.300" fontVariantNumeric="tabular-nums">{data.highlight.display}</Text>
          {data.highlight.context ? <Text textStyle="statLabel" color="text.secondary" mt={1}>{data.highlight.context}</Text> : null}
        </Box>
      ) : null}
    </Flex>
  );
};

export const TeamReveal = ({ data, team, big }) => {
  const game = data.game;
  const identity = (
    <Flex align="center" gap={big ? "2cqw" : 4} minW={0}>
      {team.logo ? <Image src={team.logo} alt="" h={big ? "9cqw" : "4.5rem"} w={big ? "9cqw" : "4.5rem"} objectFit="contain" flexShrink={0} /> : null}
      <Box minW={0}>
        <Flex align="center" gap={2} mb={2} wrap="wrap">
          <Box bg="brand.500" px={3} py={1}><Text textStyle="pill" color="white">Glory Team of the Week</Text></Box>
          <Text textStyle="kicker" color="text.secondary" fontSize="11px">
            {data.week_label}{data.source === "prior_season_fallback" ? ` · ${data.season - 1} season` : ""}
          </Text>
        </Flex>
        <Text fontSize={big ? nameSize(team.name) : "2rem"} fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.03em" lineHeight={0.95} color="white" lineClamp={3}>
          {team.name}
        </Text>
        {data.copy?.headline ? <Text textStyle="editorial" color="text.secondary" fontSize="11px" mt={1.5}>{data.copy.headline}</Text> : null}
      </Box>
    </Flex>
  );
  const summary = (
    <Box minW={0}>
      {data.copy?.summary ? <Text fontSize={big ? "1.15cqw" : "1rem"} color="text.secondary" lineHeight={1.45}>{data.copy.summary}</Text> : null}
      {game ? (
        <Text textStyle="statLabel" color="text.muted" mt={2}>
          {game.event_name ? `${game.event_name} · ` : ""}{team.shortName} {game.team_score}, {game.opponent_name} {game.opponent_score}
        </Text>
      ) : null}
    </Box>
  );
  const body = big ? (
    <Box h="100%" p={SIZE.row.pad} display="grid" gridTemplateColumns="minmax(0, 1.25fr) minmax(0, 0.9fr) minmax(0, 1fr)" columnGap="3cqw" alignItems="center">
      {identity}
      <TeamNumbers data={data} big />
      {summary}
    </Box>
  ) : (
    <Flex direction="column" gap={4} p={SIZE.stack.pad}>
      {identity}
      <TeamNumbers data={data} />
      {summary}
    </Flex>
  );
  return (
    <Box position={big ? "absolute" : "relative"} inset={big ? 0 : undefined} bg={`linear-gradient(115deg, ${withAlpha(team.primary, 0.38)} 0%, rgba(11,11,13,0.96) 62%)`}>
      {big && team.logo ? <Image src={team.logo} alt="" position="absolute" right="-2%" top="50%" transform="translateY(-50%)" h="150%" opacity={0.07} objectFit="contain" pointerEvents="none" filter="grayscale(1) brightness(1.8)" /> : null}
      {game?.game_path_id ? <Box as={Link} to={`/game/${game.game_path_id}`} display="block" h={big ? "100%" : undefined} position="relative" _hover={{ textDecoration: "none" }}>{body}</Box> : body}
    </Box>
  );
};
