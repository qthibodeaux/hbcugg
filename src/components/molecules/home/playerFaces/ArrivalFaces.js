import { vivid } from "../StatsTileFaces";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Photo, Title, FAINT, DIM, Who } from "./FacePrimitives";
import { Micro, Mark, BigNumber } from "../LiveTile";
import { teamLogo, teamShort } from "../../../game/export/exportData";

// Home Players tile transfer-impact and freshman faces.

export const TransferImpact = ({ item }) => {
  const { player, from_school: from, after } = item.data;
  const accent = vivid(player.team_id);
  return (
    <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" overflow="hidden">
      <Photo player={player} position="absolute" right={0} top={0} h="100%" w="50%" />
      <Flex position="relative" direction="column" h="100%" justify="space-between" p="var(--hl-pad, 5cqmin)">
        <Title color={accent}>{item.title}</Title>
        <Flex align="center" gap="3cqmin" maxW="62%">
          <Box px="2.5cqmin" py="2cqmin" border="0.4cqmin solid" borderColor={FAINT} borderRadius="md" bg="rgba(255,255,255,0.04)" minW={0}>
            <Text fontSize="4.4cqmin" fontWeight="black" color={DIM} textTransform="uppercase" lineHeight={1} lineClamp={2}>{from.name}</Text>
            {from.tier ? <Micro size={2} mt="1cqmin">{from.tier}</Micro> : null}
          </Box>
          <Text fontSize="8cqmin" fontWeight="black" color={accent} flexShrink={0}>→</Text>
          <Mark logo={teamLogo(player.team_id)} label={teamShort(player.team_id)} size={16} />
        </Flex>
        <Box maxW="58%">
          <Who player={player} size={7} />
          <Flex align="baseline" gap="2cqmin" mt="2cqmin">
            <BigNumber size={10} color={accent}>{after.display}</BigNumber>
            <Micro size={2.2}>{after.label}</Micro>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export const Freshman = ({ item }) => {
  const d = item.data;
  const accent = vivid(d.player.team_id);
  const max = Math.max(d.production, d.freshman_avg) * 1.05;
  return (
    <Box position="relative" h="100%" m="calc(-1 * var(--hl-pad, 5cqmin))" overflow="hidden">
      <Photo player={d.player} position="absolute" right={0} top={0} h="100%" w="50%" />
      <Flex position="relative" direction="column" h="100%" justify="space-between" p="var(--hl-pad, 5cqmin)" maxW="62%">
        <Flex align="center" gap="2cqmin">
          <Flex px="2cqmin" py="0.8cqmin" bg={accent} borderRadius="sm">
            <Text fontSize="3cqmin" fontWeight="black" color="#0B0B0D">FR</Text>
          </Flex>
          <Title color={accent}>{item.title}</Title>
        </Flex>
        <Who player={d.player} size={8} />
        <Box>
          {[
            { label: teamShort(d.player.team_id), v: d.production, c: accent },
            { label: "Freshman avg", v: d.freshman_avg, c: "rgba(255,255,255,0.25)" },
          ].map((r) => (
            <Flex key={r.label} align="center" gap="2cqmin" mt="1.6cqmin">
              <Box h="5cqmin" w={`${(r.v / max) * 70}%`} bg={r.c} borderRadius="sm" />
              <Text fontSize="4cqmin" fontWeight="black" color="white" flexShrink={0}>{r.v}</Text>
            </Flex>
          ))}
        </Box>
      </Flex>
    </Box>
  );
};
