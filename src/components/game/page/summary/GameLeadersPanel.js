import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { cleanName } from "../../../../utils/gameHelpers";
import { getTeamLabel } from "../utils/teamHelpers";
import { SectionShell } from "../panels/SectionShell";

const PlayerAvatar = ({ playerKey, name, imageMap, size = "40px" }) => {
  const imgUrl = imageMap[playerKey];
  return (
    <Box w={size} h={size} borderRadius="lg" overflow="hidden" bg="whiteAlpha.100" flexShrink={0}>
      {imgUrl
        ? <Image src={imgUrl} w="full" h="full" objectFit="cover" />
        : <Flex w="full" h="full" align="center" justify="center">
            <Text fontSize="xs" fontWeight="black" color="text.muted">{name?.[0] ?? "?"}</Text>
          </Flex>
      }
    </Box>
  );
};

const LeaderMatchup = ({ category, away, home, imageMap }) => {
  const side = (player, isHome) => {
    if (!player) {
      return (
        <Flex flex={1} direction={isHome ? "row-reverse" : "row"} align="center" gap={2} minW={0}>
          <Box w="40px" h="40px" borderRadius="full" bg="whiteAlpha.50" flexShrink={0} />
          <Text fontSize="xs" color="text.muted">—</Text>
        </Flex>
      );
    }
    const initial = player.name?.split(" ")[0]?.[0] ?? "";
    return (
      <Flex flex={1} direction={isHome ? "row-reverse" : "row"} align="center" gap={2} minW={0}>
        <PlayerAvatar playerKey={player.playerKey} name={player.name} imageMap={imageMap} />
        <Box minW={0} textAlign={isHome ? "right" : "left"}>
          <Text fontSize="xl" fontWeight="black" color="brand.400" lineHeight={1}>
            {player.statValue}
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="text.primary" lineClamp={1}>
            {initial}. {player.name?.split(" ").slice(1).join(" ")}
            <Text as="span" fontSize="9px" color="text.muted" ml={1}>{player.position}</Text>
          </Text>
          <Text fontSize="9px" color="text.muted" lineClamp={1}>{player.statLine}</Text>
        </Box>
      </Flex>
    );
  };

  return (
    <Box py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="widest" textAlign="center" mb={2}>
        {category}
      </Text>
      <Flex align="center" gap={3}>
        {side(away, false)}
        <Box w="1px" h="40px" bg="whiteAlpha.100" flexShrink={0} />
        {side(home, true)}
      </Flex>
    </Box>
  );
};

export const GameLeadersPanel = ({ awayId, homeId, teamEntries, imageMap }) => {
  const byTeam = (tid, key) => {
    const entry = teamEntries.find(([id]) => id === tid);
    return entry?.[1]?.[key] ?? [];
  };

  const topOf = (arr, field) => [...arr].sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))[0];

  const awayPasser = topOf(byTeam(awayId, "passing"), "yards");
  const homePasser = topOf(byTeam(homeId, "passing"), "yards");

  const awayRusher = topOf(byTeam(awayId, "rushing"), "yards");
  const homeRusher = topOf(byTeam(homeId, "rushing"), "yards");

  const awayReceiver = topOf(byTeam(awayId, "receiving"), "yards");
  const homeReceiver = topOf(byTeam(homeId, "receiving"), "yards");

  const havocScore = (p) =>
    (p.tfl ?? 0) + (p.sacks ?? 0) + (p.passes_defended ?? 0) + (p.interceptions ?? 0) + (p.forced_fumbles ?? 0);
  const awayHavoc = [...byTeam(awayId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];
  const homeHavoc = [...byTeam(homeId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];

  const awayTackler = topOf(byTeam(awayId, "defense"), "tackles");
  const homeTackler = topOf(byTeam(homeId, "defense"), "tackles");

  const passerCard = (p) => p ? {
    playerKey: p.player_key, name: cleanName(p.name), position: p.position ?? "QB",
    statValue: `${p.yards ?? 0}`, statLine: `${p.completions ?? 0}/${p.attempts ?? 0}, ${p.touchdowns ?? 0} TD, ${p.interceptions ?? 0} INT`,
  } : null;

  const rusherCard = (p) => p ? {
    playerKey: p.player_key, name: cleanName(p.name), position: p.position ?? "RB",
    statValue: `${p.yards ?? 0}`, statLine: `${p.attempts ?? 0} car, ${p.touchdowns ?? 0} TD`,
  } : null;

  const receiverCard = (p) => p ? {
    playerKey: p.player_key, name: cleanName(p.name), position: p.position ?? "WR",
    statValue: `${p.yards ?? 0}`, statLine: `${p.receptions ?? 0} rec, ${p.touchdowns ?? 0} TD`,
  } : null;

  const havocCard = (p) => p ? {
    playerKey: p.player_key, name: cleanName(p.name), position: p.position ?? "DEF",
    statValue: `${havocScore(p)}`, statLine: `${p.tfl ?? 0} TFL, ${p.sacks ?? 0} SK, ${p.passes_defended ?? 0} PD`,
  } : null;

  const tacklerCard = (p) => p ? {
    playerKey: p.player_key, name: cleanName(p.name), position: p.position ?? "DEF",
    statValue: `${p.tackles ?? 0}`, statLine: `${p.solo_tackles ?? 0} solo, ${p.tfl ?? 0} TFL`,
  } : null;

  const matchups = [
    { category: "Passing Yards", away: passerCard(awayPasser), home: passerCard(homePasser) },
    { category: "Rushing Yards", away: rusherCard(awayRusher), home: rusherCard(homeRusher) },
    { category: "Receiving Yards", away: receiverCard(awayReceiver), home: receiverCard(homeReceiver) },
    { category: "Havoc Leader", away: havocCard(awayHavoc), home: havocCard(homeHavoc) },
    { category: "Tackles", away: tacklerCard(awayTackler), home: tacklerCard(homeTackler) },
  ];

  return (
    <SectionShell title="Game Leaders">
      <Grid templateColumns="1fr 1fr" gap={0} mb={1}>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary">{getTeamLabel(awayId)}</Text>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary" textAlign="right">{getTeamLabel(homeId)}</Text>
      </Grid>
      {matchups.map((m) => (
        <LeaderMatchup key={m.category} {...m} imageMap={imageMap} />
      ))}
    </SectionShell>
  );
};
