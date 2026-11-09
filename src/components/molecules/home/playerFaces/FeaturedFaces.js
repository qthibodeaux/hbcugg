import { useTileVariant, Mark, lastName, Headline, BigNumber, Micro } from "../LiveTile";
import { Box, Flex, Text } from "@chakra-ui/react";
import { PT_CSS, Photo, Title, GOLD, Who, INK, Line, DIM, GOOD, Svg } from "./FacePrimitives";
import { withAlpha, teamMeta, teamLogo, teamShort } from "../../../game/export/exportData";
import { vivid } from "../StatsTileFaces";

// Home Players tile collage, player-of-week and breakout faces.

export const Collage = ({ item }) => {
  const mobile = useTileVariant() === "mobile";
  const players = item.data.players.slice(0, 16);
  const n = players.length;
  return (
    <Box h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" display="grid" gridTemplateColumns="repeat(4, minmax(0, 1fr))" gridTemplateRows="repeat(4, minmax(0, 1fr))" gap="0.5cqmin" style={{ perspective: "120cqmin" }}>
      <style>{PT_CSS}</style>
      {players.map((p, i) => {
        // Spread the flips so neighbours never turn together.
        const order = (i * 7) % n;
        return (
          <Box key={p.player_id ?? i} minW={0} minH={0}>
            <Box className="pt-card" style={{ "--pt-cycle": `${n * 1.9}s`, "--pt-delay": `${order * 1.9 - n * 1.9}s` }}>
              <Box className="pt-side" overflow="hidden" bg="#1A1A1D">
                <Photo player={p} fade={false} w="100%" h="100%" style={{ filter: `brightness(${1 - (p.rank - 1) * 0.025})` }} />
              </Box>
              <Flex className="pt-side pt-back" direction="column" align="center" justify="center" gap="1cqmin" bg={withAlpha(teamMeta(p.team_id)?.colors?.primary ?? "#27272A", 0.9)} px="1cqmin">
                <Mark logo={teamLogo(p.team_id)} label={teamShort(p.team_id)} size={7} />
                <Text fontSize="4.4cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1}>{p.production_display}</Text>
                <Text fontSize="2cqmin" fontWeight="black" color="white" textTransform="uppercase" textAlign="center" lineClamp={1}>{mobile ? lastName(p.name) : p.name}</Text>
              </Flex>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export const PlayerOfWeek = ({ item }) => {
  const { player, line } = item.data;
  const accent = vivid(player.team_id);
  return (
    <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" overflow="hidden">
      <Box position="absolute" inset={0} bg={`radial-gradient(circle at 75% 30%, ${withAlpha(accent, 0.35)} 0%, transparent 60%)`} />
      <Photo player={player} position="absolute" right={0} top={0} h="100%" w="58%" />
      <Flex position="relative" direction="column" h="100%" justify="space-between">
        <Box p="var(--hl-pad, 5cqmin)" pb={0}>
          <Title color={GOLD}>{item.title}</Title>
        </Box>
        <Box px="var(--hl-pad, 5cqmin)" maxW="70%">
          <Who player={player} size={9} />
          <Headline size={4.2} lines={2} mt="2cqmin" color={INK}>{item.headline}</Headline>
        </Box>
        <Line cells={line} accent={accent} />
      </Flex>
    </Box>
  );
};

export const Breakout = ({ item }) => {
  const { player, weeks, this_season: now, prior_season: before } = item.data;
  const accent = vivid(player.team_id);
  const W = 400;
  const H = 180;
  const max = Math.max(...weeks.map((w) => w.production), 1);
  const pts = weeks.map((w, i) => [10 + (i / Math.max(1, weeks.length - 1)) * (W - 60), H - 10 - (w.production / max) * (H - 30)]);
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <Flex direction="column" h="100%" gap="2cqmin">
      <Flex justify="space-between" align="flex-start">
        <Box minW={0}>
          <Title color={accent}>{item.title}</Title>
          <Box mt="2cqmin"><Who player={player} size={6.5} /></Box>
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <Flex align="baseline" gap="2cqmin" justify="flex-end">
            <Text fontSize="5cqmin" fontWeight="black" color={DIM} textDecoration="line-through">{before}</Text>
            <BigNumber size={11} color={GOOD}>{now}</BigNumber>
          </Flex>
          <Micro size={2.1}>Production</Micro>
        </Box>
      </Flex>
      <Box flex={1} minH={0} position="relative">
        <Svg w={W} h={H}>
          <defs>
            <linearGradient id="pt-bo" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={accent} stopOpacity="0.45" />
              <stop offset="1" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L ${last[0]} ${H} L ${pts[0][0]} ${H} Z`} fill="url(#pt-bo)" />
          <path d={path} fill="none" stroke={accent} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="#fff" />)}
          <foreignObject x={last[0] - 6} y={Math.max(0, last[1] - 50)} width={56} height={56}>
            <Box w="100%" h="100%" borderRadius="full" overflow="hidden" border={`3px solid ${accent}`} bg="#1A1A1D">
              <Photo player={player} fade={false} w="100%" h="100%" />
            </Box>
          </foreignObject>
        </Svg>
      </Box>
      <Headline size={4.4} lines={2}>{item.headline}</Headline>
    </Flex>
  );
};
