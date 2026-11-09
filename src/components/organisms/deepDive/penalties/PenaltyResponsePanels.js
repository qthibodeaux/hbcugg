import { fgOf, S, tab, pct, shortOf } from "./penaltyPosterModel";
import { Card, Team, Tiles, Tile } from "./PenaltyPosterPrimitives";
import { Grid, Flex, Box, Text } from "@chakra-ui/react";

// Offensive recovery and third-down callouts after a flag.

export const BounceBack = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = [...S.bounce_back.by_team].sort((a, b) => b.rate - a.rate);
  const cols = "220px minmax(0,1fr) 90px 80px";
  return (
    <Card pal={pal} kicker="After its own flag, did the offense still move the chains or score?">
      {rows.map((r) => (
        <Grid key={r.team_id} templateColumns={cols} columnGap="16px" alignItems="center" minH="50px" py="6px" borderBottom={`1px solid ${fg(0.06)}`}>
          <Team id={r.team_id} />
          <Flex gap="4px" wrap="wrap">
            {Array.from({ length: r.flags }, (_, i) => (
              <Box key={i} w="18px" h="18px" bg={i < r.recovered ? pal.orange : "transparent"} border={`3px solid ${i < r.recovered ? pal.orange : fg(0.25)}`} />
            ))}
          </Flex>
          <Text fontSize="18px" fontWeight="900" color={fg(0.6)} textAlign="right" {...tab}>{r.recovered} of {r.flags}</Text>
          <Text fontSize="24px" fontWeight="950" textAlign="right" {...tab}>{pct(r.rate)}</Text>
        </Grid>
      ))}
    </Card>
  );
};

export const ThirdDown = ({ pal }) => {
  const off = S.third_down_flags.offense;
  const mvsu = off.find((r) => r.team_id === "swacmvsu");
  const alc = off.find((r) => r.team_id === "swacalc");
  return (
    <Tiles n={2}>
      {mvsu && <Tile pal={pal} value={`${mvsu.series_continued}/${mvsu.flags}`} ink={pal.brand} title={`${shortOf(mvsu.team_id)}'s offense after a 3rd-down flag`}
        text="The most 3rd-down flags in the SWAC, and the series went on once." />}
      {alc && <Tile pal={pal} value={`${alc.series_continued}/${alc.flags}`} ink={pal.orange} title={`${shortOf(alc.team_id)} beat its own 3rd-down flags`}
        text={`It kept the series going ${alc.series_continued} times, and all ${alc.drives_scored} drives scored.`} />}
    </Tiles>
  );
};
