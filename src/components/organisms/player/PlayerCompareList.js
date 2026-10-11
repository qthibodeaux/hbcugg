import { Box, Flex, Image, Text } from "@chakra-ui/react";

// Real PAR-based ranking against the same position peers used elsewhere in
// this tab — no mock here. Shows a window of players around this one (like
// the StatCards Compare reference) rather than the full position group, with
// this player's own row pinned/highlighted and deltas measured against them,
// not an abstract average.
const initials = (name) =>
  String(name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const CompareRow = ({ p, isPlayer, delta, primary }) => (
  <Flex
    align="center"
    gap={3}
    p={isPlayer ? 4 : 3}
    bg={isPlayer ? "whiteAlpha.100" : "whiteAlpha.50"}
    border="1px solid"
    borderColor={isPlayer ? primary : "whiteAlpha.100"}
    borderRadius="md"
  >
    <Flex
      w={isPlayer ? "44px" : "36px"}
      h={isPlayer ? "44px" : "36px"}
      borderRadius="full"
      overflow="hidden"
      bg="whiteAlpha.200"
      align="center"
      justify="center"
      flexShrink={0}
    >
      {p.image_url ? (
        <Image src={p.image_url} w="full" h="full" objectFit="cover" />
      ) : (
        <Text fontSize="xs" fontWeight="black" color="white">{initials(p.name_display ?? p.full_name)}</Text>
      )}
    </Flex>
    <Box flex={1} minW={0}>
      <Text fontSize={isPlayer ? "md" : "sm"} fontWeight="black" color="white" lineClamp={1}>
        {p.name_display ?? p.full_name}
      </Text>
      <Text fontSize="10px" color="text.muted" textTransform="uppercase">
        {p.team} · {p.position_group}
      </Text>
    </Box>
    <Box textAlign="right" flexShrink={0}>
      <Text fontSize={isPlayer ? "lg" : "md"} fontWeight="black" fontFamily="mono" color="white">
        PAR {Number(p.par ?? 0).toFixed(2)}
      </Text>
      <Text fontSize="xs" fontWeight="800" fontFamily="mono" color={delta === 0 ? "text.muted" : delta > 0 ? "green.300" : "red.300"}>
        {delta === 0 ? "0.00" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}`}
      </Text>
    </Box>
  </Flex>
);

const PlayerCompareList = ({ player, positionPeers = [], primary, limit = 7 }) => {
  const sorted = [...positionPeers].sort((a, b) => (b.par ?? 0) - (a.par ?? 0));
  const idx = sorted.findIndex(
    (p) =>
      (p.person_id && player.person_id && p.person_id === player.person_id) ||
      ((p.name_display ?? p.full_name) === (player.name_display ?? player.full_name) && p.team === player.team),
  );
  const safeIdx = idx === -1 ? 0 : idx;
  const half = Math.floor(limit / 2);
  const start = Math.max(0, safeIdx - half);
  const windowed = sorted.slice(start, start + limit);
  const playerPar = Number(player.par ?? 0);

  if (!windowed.length) {
    return (
      <Text fontSize="sm" color="text.muted" textAlign="center" py={8}>
        No position peers on file to compare against.
      </Text>
    );
  }

  return (
    <Flex direction="column" gap={2}>
      {windowed.map((p, i) => (
        <CompareRow
          key={p.person_id ?? `${p.name_display ?? p.full_name}-${i}`}
          p={p}
          isPlayer={start + i === safeIdx}
          delta={Number(p.par ?? 0) - playerPar}
          primary={primary}
        />
      ))}
      <Text fontSize="10px" color="text.muted" textAlign="center" mt={1}>
        Same position group · Current season
      </Text>
    </Flex>
  );
};

export default PlayerCompareList;
