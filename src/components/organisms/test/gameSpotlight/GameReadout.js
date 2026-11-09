import { Flex, Text, Box } from "@chakra-ui/react";
import { BADGE_CONFIG, buildStatFields, SECONDARY_STAT_LABELS, TICK_FADE, abbreviateOpponent } from "./spotlightPresentation";

// Game spotlight readout, existing primary/secondary stat rows and badge presentation.

const StatRow = ({ fields, primary, secondary }) => (
  <Flex gap="2px" bg="whiteAlpha.100" borderRadius="sm" overflow="hidden">
    {fields.map((field) => (
      <Flex key={field.label} direction="column" align="center" flex="1" bg={`${primary}14`} py="0.28rem">
        <Text fontSize="clamp(1rem, 2.3vw, 1.5rem)" fontWeight="950" color={secondary} lineHeight={1}>
          {field.value}
        </Text>
        <Text fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.06em" mt="1px">
          {field.label}
        </Text>
      </Flex>
    ))}
  </Flex>
);

export const GameReadout = ({ game, visible, primary, secondary }) => {
  const badge = game?.tier ? BADGE_CONFIG[game.tier] : null;
  const Icon = badge?.icon;
  const isWin = String(game?.result ?? "").startsWith("W");
  const resultColor = isWin ? "#68D391" : "#F56565";
  const [resultLetter = "—", score = ""] = String(game?.result ?? "").split(" ");
  // Real games carry stat_line[] ([{label,value}], position-agnostic) —
  // use it directly rather than buildStatFields, which only knows the
  // defensive keys the original mock data happened to use.
  const statFields = game.statFields ?? buildStatFields(game.stats);
  const primaryStatFields = statFields.filter((f) => !SECONDARY_STAT_LABELS.has(f.label));
  const secondaryStatFields = statFields.filter((f) => SECONDARY_STAT_LABELS.has(f.label));

  return (
    <Flex
      direction="column"
      h="full"
      p="clamp(0.6rem, 1vw, 0.9rem)"
      justify="flex-start"
      position="relative"
      overflow="hidden"
      bg={`linear-gradient(165deg, ${primary}1A 0%, transparent 60%)`}
    >
      <Flex align="center" gap="0.35rem" mb="0.5rem">
        <Box w="3px" h="12px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.62rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Game Spotlight
        </Text>
      </Flex>

      <Box style={{ opacity: visible ? 1 : 0, transition: `opacity ${TICK_FADE}ms ease` }}>
        {badge && (
          <Flex align="center" gap="0.3rem" w="fit-content" px="0.5rem" py="0.2rem" borderRadius="sm" bg={`${badge.color}22`} border={`1px solid ${badge.color}44`} mb="0.45rem">
            <Icon size={13} color={badge.color} />
            <Text fontSize="0.56rem" fontWeight="900" color={badge.color} textTransform="uppercase" letterSpacing="0.08em">
              {badge.label}
            </Text>
          </Flex>
        )}

        <Text fontSize="clamp(1.1rem, 1.9vw, 1.5rem)" fontWeight="950" textTransform="uppercase" lineHeight={1.15}>
          <Box as="span" color="white">{game.week} </Box>
          <Box as="span" color={secondary}>{abbreviateOpponent(game.vs)}</Box>
        </Text>

        <Flex align="center" gap="0.45rem" mt="0.4rem">
          <Flex align="center" justify="center" w="1.5rem" h="1.5rem" borderRadius="sm" bg={`${resultColor}26`} border={`1px solid ${resultColor}`} flexShrink={0}>
            <Text fontSize="0.7rem" fontWeight="950" color={resultColor}>{resultLetter}</Text>
          </Flex>
          <Text fontSize="0.85rem" fontWeight="900" color="white">{score}</Text>
        </Flex>

        {/* Labeled stat grid — real fields, not a flat string. Secondary
            production (rushing, receiving, returns) gets its own row
            instead of crowding into the primary line. */}
        {/* Trimmed from a 1.3-1.9rem value / 0.4rem padding: the stat row
            was eating enough height that Top Play below it was cut off. */}
        <Flex direction="column" gap="2px" mt="0.5rem">
          <StatRow fields={primaryStatFields} primary={primary} secondary={secondary} />
          {secondaryStatFields.length > 0 && (
            <StatRow fields={secondaryStatFields} primary={primary} secondary={secondary} />
          )}
        </Flex>

        {game.note && (
          <Text fontSize="0.56rem" color={primary} fontWeight="800" mt="0.35rem" textTransform="uppercase" letterSpacing="0.04em">
            {game.note}
          </Text>
        )}

        {game.highlightPlay && (
          <Box mt="0.4rem" pt="0.35rem" borderTop={`1px solid ${primary}33`}>
            <Flex align="center" gap="0.4rem" mb="0.25rem">
              <Text fontSize="0.62rem" color={primary} fontWeight="900" textTransform="uppercase" letterSpacing="0.06em">
                Top Play
              </Text>
              <Text fontSize="0.62rem" fontWeight="900" color={game.highlightPlay.epa < 0 ? "#68D391" : "#F56565"}>
                {game.highlightPlay.epa > 0 ? "+" : ""}
                {game.highlightPlay.epa.toFixed(1)} EPA
              </Text>
            </Flex>
            <Text fontSize="0.78rem" color="white" fontWeight="700" lineHeight={1.3}>
              {game.highlightPlay.description}
            </Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
};
