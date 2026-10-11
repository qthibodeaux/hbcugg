import { Box, Flex,  Image, Text } from "@chakra-ui/react";
import { cleanName, fmt } from "../../../../utils/gameHelpers";
import { getTeamLabel } from "../utils/teamHelpers";
import { SectionShell } from "../panels/SectionShell";

export const GloryMVPPanel = ({ awayId, homeId, productionScores, imageMap }) => {
  const allPlayers = [
    ...(productionScores[awayId] ?? []),
    ...(productionScores[homeId] ?? []),
  ].sort((a, b) => (b.production_total ?? 0) - (a.production_total ?? 0));

  const mvp = allPlayers[0];
  if (!mvp) return <SectionShell title="Glory MVP"><Text color="text.muted" fontSize="sm">No data.</Text></SectionShell>;

  const mvpTeamId = Object.entries(productionScores).find(([, players]) =>
    players.some((p) => p.player_key === mvp.player_key),
  )?.[0];
  const imgUrl = imageMap[mvp.player_key];

  return (
    <SectionShell title="Glory MVP">
      <Flex align="center" gap={4} mb={4}>
        <Box w="56px" h="56px" borderRadius="lg" overflow="hidden" bg="whiteAlpha.100" flexShrink={0}>
          {imgUrl
            ? <Image src={imgUrl} w="full" h="full" objectFit="cover" />
            : <Flex w="full" h="full" align="center" justify="center">
                <Text fontSize="xl" fontWeight="black" color="text.muted">{cleanName(mvp.name)?.[0] ?? "?"}</Text>
              </Flex>
          }
        </Box>
        <Box>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{cleanName(mvp.name)}</Text>
          <Text fontSize="xs" color="text.muted">{mvp.position} · {getTeamLabel(mvpTeamId)}</Text>
          <Text fontSize="2xl" fontWeight="black" color="brand.400" lineHeight={1.1} mt={1}>{fmt(mvp.production_total, 1)}</Text>
          <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="wider">Production Score</Text>
        </Box>
      </Flex>
      {mvp.components && Object.entries(mvp.components).map(([k, v]) => (
        <Flex key={k} justify="space-between" py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
          <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="wider">{k.replace(/_/g, " ")}</Text>
          <Text fontSize="xs" fontWeight="bold" color="text.primary">{fmt(v, 1)}</Text>
        </Flex>
      ))}
    </SectionShell>
  );
};
