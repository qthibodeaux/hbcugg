import { Flex, Box, Text, Grid } from "@chakra-ui/react";
import { POSTER_W, POSTER_H, BRAND, TEAM_BY_V5 } from "./qbMapPresentation";
import { QbPlot } from "./QbPlot";
import { KeyHead, KeyRow } from "./QbMapKey";

// Fixed-size QB-map export composition; reuses the page plot and key at poster scale.

export const QbMapPoster = ({ data, players, posterRef }) => {
  const { qualification } = data;
  const half = Math.ceil(players.length / 2);
  const cols = [players.slice(0, half), players.slice(half)];
  return (
    <Flex ref={posterRef} direction="column" w={`${POSTER_W}px`} h={`${POSTER_H}px`} bg="var(--gg-bg-primary)" color="var(--gg-ink)" px="48px" pt="44px" pb="36px" fontFamily="inherit">
      <Flex align="center" gap="12px" mb="8px">
        <Box w="8px" h="28px" bg={BRAND} />
        <Text fontSize="20px" fontWeight="900" letterSpacing="0.24em" textTransform="uppercase" color={BRAND}>HBCU GridIron Glory</Text>
      </Flex>
      <Text fontSize="84px" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.035em" lineHeight={0.92}>
        The {data.season} QB Map
      </Text>
      <Text fontSize="22px" fontWeight="800" color="text.secondary" mt="12px">
        {players.length} HBCU quarterbacks · Min. {qualification.min_dropbacks} dropbacks{data.through_date ? ` · Through ${data.through_date}` : ""}
      </Text>

      <Box flex={1} minH={0} mt="18px" display="flex">
        <Box flex={1}>
          <QbPlot data={data} players={players} hover={null} W={1104} H={830} R={24} s={1.55} />
        </Box>
      </Box>

      <Grid templateColumns="repeat(2, minmax(0, 1fr))" columnGap="32px" mt="10px">
        {cols.map((col, i) => (
          <Box key={i}>
            <KeyHead big />
            {col.map((p) => (
              <KeyRow key={p.player_id} p={p} team={TEAM_BY_V5[p.team_id]} photo={false} big />
            ))}
          </Box>
        ))}
      </Grid>

    </Flex>
  );
};
