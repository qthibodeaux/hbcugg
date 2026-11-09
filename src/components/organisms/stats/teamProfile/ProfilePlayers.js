import { Flex, Box, Image, Text } from "@chakra-ui/react";
import { Kicker } from "../analyticsTabs/AnalyticsPrimitives";
import { BRAND } from "./profilePresentation";

export const LeaderCard = ({ slot, player, photo, primary, secondary, square = false }) => (
  <Flex direction="column" align="center" textAlign="center" flex="1" minW={0}>
    <Kicker color={secondary ?? BRAND}>{slot}</Kicker>
    <Box mt={2} w="clamp(3.4rem, 7vw, 5rem)" h="clamp(3.4rem, 7vw, 5rem)" borderRadius={square ? "0.6rem" : "full"} overflow="hidden" border="2px solid" borderColor={primary} bg="rgba(255,255,255,0.05)" position="relative">
      {photo ? (
        <Image src={photo} alt="" w="100%" h="100%" objectFit="cover" objectPosition="top center" />
      ) : (
        <Flex align="center" justify="center" h="100%">
          <Text fontSize="1.1rem" fontWeight="900" color="whiteAlpha.500">{(player?.name_display ?? "?").slice(0, 1)}</Text>
        </Flex>
      )}
    </Box>
    <Text fontSize="12px" fontWeight="900" color="white" mt={2} lineClamp={2}>{player?.name_display ?? "—"}</Text>
    <Kicker color="whiteAlpha.400" mt={1}>{player?.position ?? ""}</Kicker>
    <Text fontSize="clamp(0.95rem, 1.8vw, 1.3rem)" fontWeight="900" fontStyle="italic" color="white" mt={1.5} lineHeight={0.9} fontVariantNumeric="tabular-nums">
      {Number.isFinite(player?.par) ? player.par.toFixed(1) : "—"}
    </Text>
    <Kicker color="whiteAlpha.400" mt={1}>PAR · {player?.games_played ?? "—"} games</Kicker>
  </Flex>
);

export const ImpactRow = ({ player, open, onToggle, primary, maxPar }) => {
  const games = player.games ?? [];
  const maxGame = Math.max(1, ...games.map((g) => Math.abs(g.total ?? 0)));
  return (
    <Box borderBottom="1px solid" borderColor="whiteAlpha.50">
      <Flex as="button" onClick={onToggle} w="100%" align="center" gap={3} py={2} textAlign="left" _hover={{ bg: "whiteAlpha.50" }}>
        <Text w="14px" flexShrink={0} fontSize="10px" fontWeight="900" color="whiteAlpha.400">{open ? "−" : "+"}</Text>
        <Text flex="1" minW={0} fontSize="11px" fontWeight="900" color="white" lineClamp={1}>{player.name_display}</Text>
        <Kicker w="2.6rem" flexShrink={0} color="whiteAlpha.500">{player.position ?? player.position_group}</Kicker>
        <Box w="22%" minW="3rem" flexShrink={0}>
          <Box h="6px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
            <Box h="100%" borderRadius="full" bg={primary} style={{ width: `${Math.max(2, (player.par / maxPar) * 100)}%` }} />
          </Box>
        </Box>
        <Text w="3rem" flexShrink={0} textAlign="right" fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
          {Number.isFinite(player.par) ? player.par.toFixed(1) : "—"}
        </Text>
        <Text w="2.2rem" flexShrink={0} textAlign="right" fontSize="10px" fontWeight="800" color="whiteAlpha.600" fontVariantNumeric="tabular-nums">
          {player.games_played ?? "—"}
        </Text>
      </Flex>
      {open && (
        <Box pb={3} pl={7} pr={2}>
          <Kicker color="whiteAlpha.400" mb={2}>Production by game</Kicker>
          <Flex align="flex-end" gap={1.5} h="52px">
            {games.map((g) => (
              <Flex key={g.game_id} direction="column" justify="flex-end" flex="1" minW={0} h="100%" title={`${g.game_id} · ${(g.total ?? 0).toFixed(2)}`}>
                <Box borderRadius="sm" bg={primary} opacity={0.85} style={{ height: `${Math.max(3, (Math.abs(g.total ?? 0) / maxGame) * 100)}%` }} />
              </Flex>
            ))}
          </Flex>
          <Flex gap={4} mt={2} wrap="wrap">
            {Object.entries(player.season_components ?? {}).map(([k, v]) => (
              <Flex key={k} align="baseline" gap={1.5}>
                <Kicker color="whiteAlpha.400">{k.replace("_production", "")}</Kicker>
                <Text fontSize="11px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{Number(v).toFixed(1)}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
};
