import { Text, Flex, Box, Image, Grid } from "@chakra-ui/react";
import { cleanName, getTeam, getTeamLabel, fmt } from "./magazineModel";
import { CardShell, SectionLabel } from "./MagazinePrimitives";

const PlayerFaceOffCard = ({ category, awayPlayer, homePlayer, awayColor, homeColor, imageMap }) => {
  const Side = ({ player, isHome }) => {
    if (!player) return <Text color="text.muted" fontSize="sm">—</Text>;
    const img = imageMap?.[player.playerKey];
    return (
      <Flex direction={isHome ? "row-reverse" : "row"} align="center" gap={3} flex={1}>
        <Box w="48px" h="48px" borderRadius="lg" overflow="hidden" bg="whiteAlpha.100" flexShrink={0} border="1px solid" borderColor="whiteAlpha.200">
          {img ? <Image src={img} w="full" h="full" objectFit="cover" /> : <Flex w="full" h="full" align="center" justify="center"><Text fontSize="lg" fontWeight="black" color="text.muted">{cleanName(player.name)?.[0]}</Text></Flex>}
        </Box>
        <Box textAlign={isHome ? "right" : "left"} minW={0}>
          <Text fontSize="xl" fontWeight="black" color={isHome ? homeColor : awayColor} lineHeight={1}>{player.statValue}</Text>
          <Text fontSize="xs" fontWeight="bold" color="text.primary" lineClamp={1}>{cleanName(player.name)}</Text>
          <Text fontSize="9px" color="text.muted">{player.statLine}</Text>
        </Box>
      </Flex>
    );
  };

  return (
    <Box p={4} bg="whiteAlpha.50" borderRadius="lg">
      <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center" mb={3}>{category}</Text>
      <Flex align="center" gap={4}>
        <Side player={awayPlayer} isHome={false} />
        <Box w="1px" h="40px" bg="whiteAlpha.100" />
        <Side player={homePlayer} isHome={true} />
      </Flex>
    </Box>
  );
};

export const PlayerDuels = ({ awayId, homeId, individualStats, imageMap }) => {
  const awayColor = getTeam(awayId)?.colors?.primary ?? "#E53E3E";
  const homeColor = getTeam(homeId)?.colors?.primary ?? "#E53E3E";

  const byTeam = (tid, key) => {
    const entry = Object.entries(individualStats ?? {}).find(([id]) => id === tid);
    return entry?.[1]?.[key] ?? [];
  };

  const topOf = (arr, field) => [...arr].sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))[0];

  const ap = topOf(byTeam(awayId, "passing"), "yards");
  const hp = topOf(byTeam(homeId, "passing"), "yards");
  const ar = topOf(byTeam(awayId, "rushing"), "yards");
  const hr = topOf(byTeam(homeId, "rushing"), "yards");
  const arec = topOf(byTeam(awayId, "receiving"), "yards");
  const hrec = topOf(byTeam(homeId, "receiving"), "yards");

  const havocScore = (p) => (p.tfl ?? 0) + (p.sacks ?? 0) + (p.passes_defended ?? 0) + (p.interceptions ?? 0) + (p.forced_fumbles ?? 0);
  const ah = [...byTeam(awayId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];
  const hh = [...byTeam(homeId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];

  const duels = [
    {
      category: "Passing Yards",
      away: ap ? { playerKey: ap.player_key, name: ap.name, statValue: `${ap.yards ?? 0}`, statLine: `${ap.completions ?? 0}/${ap.attempts ?? 0}, ${ap.touchdowns ?? 0} TD` } : null,
      home: hp ? { playerKey: hp.player_key, name: hp.name, statValue: `${hp.yards ?? 0}`, statLine: `${hp.completions ?? 0}/${hp.attempts ?? 0}, ${hp.touchdowns ?? 0} TD` } : null,
    },
    {
      category: "Rushing Yards",
      away: ar ? { playerKey: ar.player_key, name: ar.name, statValue: `${ar.yards ?? 0}`, statLine: `${ar.attempts ?? 0} car, ${ar.touchdowns ?? 0} TD` } : null,
      home: hr ? { playerKey: hr.player_key, name: hr.name, statValue: `${hr.yards ?? 0}`, statLine: `${hr.attempts ?? 0} car, ${hr.touchdowns ?? 0} TD` } : null,
    },
    {
      category: "Receiving Yards",
      away: arec ? { playerKey: arec.player_key, name: arec.name, statValue: `${arec.yards ?? 0}`, statLine: `${arec.receptions ?? 0} rec, ${arec.touchdowns ?? 0} TD` } : null,
      home: hrec ? { playerKey: hrec.player_key, name: hrec.name, statValue: `${hrec.yards ?? 0}`, statLine: `${hrec.receptions ?? 0} rec, ${hrec.touchdowns ?? 0} TD` } : null,
    },
    {
      category: "Havoc Leader",
      away: ah ? { playerKey: ah.player_key, name: ah.name, statValue: `${havocScore(ah)}`, statLine: `${ah.tfl ?? 0} TFL, ${ah.sacks ?? 0} SK` } : null,
      home: hh ? { playerKey: hh.player_key, name: hh.name, statValue: `${havocScore(hh)}`, statLine: `${hh.tfl ?? 0} TFL, ${hh.sacks ?? 0} SK` } : null,
    },
  ];

  return (
    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={3}>
      {duels.map((d) => (
        <PlayerFaceOffCard key={d.category} {...d} awayColor={awayColor} homeColor={homeColor} imageMap={imageMap} />
      ))}
    </Grid>
  );
};

export const GloryMVP = ({ awayId, homeId, productionScores, imageMap }) => {
  const allPlayers = [
    ...(productionScores[awayId] ?? []),
    ...(productionScores[homeId] ?? []),
  ].sort((a, b) => (b.production_total ?? 0) - (a.production_total ?? 0));

  const mvp = allPlayers[0];
  if (!mvp) return <Text color="text.muted">No production data.</Text>;

  const mvpTeamId = Object.entries(productionScores).find(([, players]) => players.some((p) => p.player_key === mvp.player_key))?.[0];
  const img = imageMap?.[mvp.player_key];
  const accent = getTeam(mvpTeamId)?.colors?.primary ?? "#E53E3E";

  return (
    <CardShell accent={accent}>
      <SectionLabel label="Glory MVP" color={accent} />
      <Flex align="center" gap={4} mt={2}>
        <Box w="64px" h="64px" borderRadius="lg" overflow="hidden" bg="whiteAlpha.100" flexShrink={0} border="1px solid" borderColor="whiteAlpha.200">
          {img ? <Image src={img} w="full" h="full" objectFit="cover" /> : <Flex w="full" h="full" align="center" justify="center"><Text fontSize="2xl" fontWeight="black" color="text.muted">{cleanName(mvp.name)?.[0]}</Text></Flex>}
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="black" color="text.primary">{cleanName(mvp.name)}</Text>
          <Text fontSize="xs" color="text.muted">{mvp.position} · {getTeamLabel(mvpTeamId)}</Text>
          <Text fontSize="3xl" fontWeight="black" color={accent} lineHeight={1}>{fmt(mvp.production_total, 1)}</Text>
          <Text fontSize="9px" color="text.muted" textTransform="uppercase">Production Score</Text>
        </Box>
      </Flex>
      {mvp.components && (
        <Grid templateColumns="1fr 1fr" gap={2} mt={3}>
          {Object.entries(mvp.components).map(([k, v]) => (
            <Box key={k} p={2} bg="whiteAlpha.50" borderRadius="md">
              <Text fontSize="9px" color="text.muted" textTransform="uppercase">{k.replace(/_/g, " ")}</Text>
              <Text fontSize="sm" fontWeight="black" color="text.primary">{fmt(v, 1)}</Text>
            </Box>
          ))}
        </Grid>
      )}
    </CardShell>
  );
};
