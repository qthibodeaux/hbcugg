import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Trophy, Flame, TrendingUp } from "lucide-react";
import useMountEffect from "../../../hooks/useMountEffect";

const TICK_HOLD = 6000;
const TICK_FADE = 500;

const useGameCarousel = (games) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useMountEffect(() => {
    if (!games.length) return undefined;
    let current = 0;
    let fadeTimer;
    let holdTimer;

    const cycle = () => {
      setVisible(true);
      holdTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          current = (current + 1) % games.length;
          setIndex(current);
          cycle();
        }, TICK_FADE);
      }, TICK_HOLD);
    };

    cycle();
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  });

  return { game: games[index] ?? null, visible, index, total: games.length };
};

const BADGE_CONFIG = {
  career: { icon: Trophy, label: "CAREER BEST", color: "#F6AD55" },
  season: { icon: Flame, label: "SEASON BEST", color: "#E53E3E" },
  recent: { icon: TrendingUp, label: "RECENT", color: "#68D391" },
};

const GameCard = ({ game, visible, primary }) => {
  const badge = BADGE_CONFIG[game.tier] ?? BADGE_CONFIG.recent;
  const Icon = badge.icon;

  return (
    <Box
      h="full"
      w="full"
      position="relative"
      overflow="hidden"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${TICK_FADE}ms ease`,
      }}
    >
      {/* Subtle team color glow at top */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        bg={primary}
      />

      <Flex
        direction="column"
        justify="space-evenly"
        h="full"
        p="clamp(0.7rem, 1.1vw, 1rem)"
        position="relative"
        zIndex={1}
      >
        {/* Top: Badge + opponent */}
        <Flex align="center" gap="0.4rem">
          <Flex
            align="center"
            gap="0.25rem"
            px="0.45rem"
            py="0.2rem"
            borderRadius="sm"
            bg={`${badge.color}22`}
            border={`1px solid ${badge.color}44`}
          >
            <Icon size={12} color={badge.color} />
            <Text
              fontSize="0.5rem"
              fontWeight="900"
              color={badge.color}
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              {badge.label}
            </Text>
          </Flex>
        </Flex>

        {/* Middle: Game context */}
        <Box>
          <Text
            fontSize="clamp(0.95rem, 1.5vw, 1.3rem)"
            fontWeight="950"
            color="white"
            lineHeight={1.1}
            textTransform="uppercase"
            letterSpacing="0.02em"
          >
            {game.year} · {game.week} · {game.vs}
          </Text>
          <Text
            fontSize="0.58rem"
            color="rgba(255,255,255,0.5)"
            fontWeight="700"
            mt="0.2rem"
            textTransform="uppercase"
            letterSpacing="0.06em"
          >
            {game.result}
          </Text>
        </Box>

        {/* Bottom: Stat line */}
        <Box>
          <Text
            fontSize="clamp(1.1rem, 1.9vw, 1.7rem)"
            fontWeight="950"
            color="white"
            lineHeight={1}
          >
            {game.statLine}
          </Text>
          {game.note && (
            <Text
              fontSize="0.52rem"
              color="rgba(255,255,255,0.45)"
              fontWeight="700"
              mt="0.25rem"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {game.note}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export const PlayerBestGamesCarousel = ({ games, primary = "#E53E3E" }) => {
  const { game, visible, index, total } = useGameCarousel(games);

  if (!games.length) {
    return (
      <Flex
        h="full"
        w="full"
        align="center"
        justify="center"
        bg="rgba(255,255,255,0.03)"
        border="1px solid rgba(255,255,255,0.08)"
      >
        <Text fontSize="0.55rem" color="text.muted" fontWeight="700" textTransform="uppercase">
          No game data
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      h="full"
      w="full"
      bg="rgba(255,255,255,0.03)"
      border="1px solid rgba(255,255,255,0.08)"
      position="relative"
      overflow="hidden"
    >
      <Box flex={1} minH={0}>
        <GameCard game={game} visible={visible} primary={primary} />
      </Box>

      {/* Dot indicators */}
      <Flex
        justify="center"
        gap="0.3rem"
        pb="0.4rem"
        pt="0.2rem"
      >
        {Array.from({ length: total }).map((_, i) => (
          <Box
            key={i}
            w="0.28rem"
            h="0.28rem"
            borderRadius="full"
            bg={i === index ? primary : "rgba(255,255,255,0.2)"}
            transition="background 0.3s ease"
          />
        ))}
      </Flex>
    </Flex>
  );
};
