import { useLayoutDensity, LAYOUT_DENSITY } from "../../../../hooks/useLayoutDensity";
import { useAllPlayersByYear } from "../../../../hooks/useSWACData";
import { Flex, Spinner, Box, Text, Grid } from "@chakra-ui/react";
import { PlayerCardMobile, PlayerCard } from "./playerCards/PlayerCards";

const PlayersTab = ({ team, year = 2025, players: playersOverride = null, cardVariant = null }) => {
  const { density, isMobile } = useLayoutDensity();
  const { players: allPlayers, isLoading } = useAllPlayersByYear(String(year), { exactSeason: true });

  const v5Id = team?.exportId?.replace(/25$/, "") ?? "";
  const players = playersOverride ?? allPlayers.filter((p) => (p.team_id ?? p._teamId) === v5Id);
  const resolvedCardVariant = cardVariant ?? (density === LAYOUT_DENSITY.STANDARD ? "standard" : "compact");

  if (!playersOverride && isLoading) {
    return (
      <Flex justify="center" py={16}>
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  }

  if (!players.length) {
    return (
      <Box py={16} textAlign="center">
        <Text fontSize="sm" color="text.muted">No player data found for this team.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <style>{`
        @keyframes rosterNamePan {
          0%, 30% { transform: translateX(0); }
          64%, 84% { transform: translateX(calc(-100% + 124px)); }
          100% { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .roster-name-pan {
            animation: none !important;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>
      <Grid
        // Mobile packs the cards 4-across rather than one full-width card
        // per row, which turned 126 players into an enormous scroll.
        templateColumns={isMobile
          ? "repeat(4, minmax(0, 1fr))"
          : resolvedCardVariant === "standard"
            ? {
                base: "repeat(1,1fr)",
                md: "repeat(3,1fr)",
                lg: "repeat(4,1fr)",
              }
            : {
                base: "repeat(1,1fr)",
                sm: "repeat(3,1fr)",
                lg: "repeat(3,1fr)",
                xl: "repeat(4,1fr)",
              }}
        gap={isMobile ? 1 : 3}
      >
        {players.map((p, i) =>
          isMobile ? (
            <PlayerCardMobile key={p.person_id ?? i} player={p} team={team} />
          ) : (
            <PlayerCard key={p.person_id ?? i} player={p} team={team} variant={resolvedCardVariant} />
          ),
        )}
      </Grid>
    </Box>
  );
};

export default PlayersTab;
