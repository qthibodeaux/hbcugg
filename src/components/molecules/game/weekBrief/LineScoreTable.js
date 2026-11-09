import { Box, Grid, Text } from "@chakra-ui/react";
import { SectionLabel } from "./BriefPrimitives";
import { displayValue } from "./briefModel";

export const LineScoreTable = ({ game, selectedAccent }) => {
  const periodCount = game.lineScore.length + 1; // periods + total
  const columns = {
    base: `minmax(42px, 1fr) repeat(${periodCount}, minmax(22px, 28px))`,
    xl: `minmax(76px, 1fr) repeat(${periodCount}, 34px)`,
  };
  return (
  <Box mx={{ base: -3, xl: -4 }} mt={{ base: -3, xl: -4 }} overflow="hidden" bg="rgba(0,0,0,0.22)" flexShrink={0}>
    <Grid
      templateColumns={columns}
      px={{ base: 2, xl: 3 }}
      py={{ base: "6px", xl: 2 }}
      alignItems="center"
      borderBottom="1px solid"
      borderColor={`${selectedAccent}55`}
    >
      <SectionLabel color="rgba(255,255,255,0.62)">Team</SectionLabel>
      {game.lineScore.map((q) => (
        <Text key={q.period} fontSize={{ base: "8px", xl: "9px" }} color="rgba(255,255,255,0.62)" fontWeight="black" textAlign="center">
          {q.period}
        </Text>
      ))}
      <Text fontSize={{ base: "8px", xl: "9px" }} color={selectedAccent} fontWeight="black" textAlign="center">T</Text>
    </Grid>
    {[game.away, game.home].map((team, index) => (
      <Grid
        key={`${team.id}-${index}`}
        templateColumns={columns}
        px={{ base: 2, xl: 3 }}
        py={{ base: "7px", xl: 2 }}
        minH={{ base: "30px", xl: "36px" }}
        alignItems="center"
        bg={index === 0 ? "rgba(0,0,0,0.18)" : "transparent"}
      >
        <Text fontSize={{ base: "12px", xl: "sm" }} color="white" fontWeight="black" lineClamp={1}>{team.shortName}</Text>
        {game.lineScore.map((q) => (
          <Text key={`${team.id}-${q.period}`} fontSize={{ base: "12px", xl: "sm" }} color="rgba(255,255,255,0.58)" fontWeight="black" textAlign="center" lineHeight={1}>
            {displayValue(index === 0 ? q.away : q.home)}
          </Text>
        ))}
        <Text fontSize={{ base: "12px", xl: "sm" }} color="white" fontWeight="black" textAlign="center" lineHeight={1}>{displayValue(team.score)}</Text>
      </Grid>
    ))}
  </Box>
  );
};
