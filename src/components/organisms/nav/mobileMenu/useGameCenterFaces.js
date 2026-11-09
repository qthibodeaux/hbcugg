import { useGameCenterHubData } from "../../../../hooks/useGameCenterHubData";
import { useFootballCurrentContext } from "../../../../hooks/useFootballCurrentContext";
import { useMemo } from "react";
import { IdentityFace, Face, Kicker, MatchupFace, TeamFace } from "./MenuPrimitives";
import { Text, Flex, Image } from "@chakra-ui/react";
import { BRAND, INFO } from "./menuPresentation";

export const useGameCenterFaces = () => {
  const { featuredGames, scheduleRailCards, standings, contextCards } = useGameCenterHubData();
  const { currentWeek } = useFootballCurrentContext();
  return useMemo(() => {
    const faces = [<IdentityFace key="id" words={["Scores", "Schedules", "Standings"]} />];
    if (currentWeek != null) {
      faces.push(
        <Face key="week" bg="#2A1745">
          <Text position="absolute" right="-6cqmin" top="50%" transform="translateY(-50%)" fontSize="150cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.8} color={BRAND} letterSpacing="-0.06em">
            {currentWeek}
          </Text>
          <Kicker>This week</Kicker>
        </Face>,
      );
    }
    const [gotw, ...rest] = featuredGames ?? [];
    if (gotw) faces.push(<MatchupFace key="gotw" game={gotw} kicker="Game of the week" />);
    const next = (featuredGames ?? []).find((g) => g.status !== "final" && g.id !== gotw?.id) ?? rest[0];
    if (next) faces.push(<MatchupFace key="next" game={next} kicker={`Next up${next.dateLabel ? ` · ${next.dateLabel}` : ""}`} />);
    const last = (scheduleRailCards ?? []).find((g) => g.status === "final");
    if (last) faces.push(<MatchupFace key="last" game={last} kicker="Last final" />);
    const leaders = standings?.swacEast?.rows?.slice(0, 3) ?? [];
    if (leaders[0]?.team) {
      faces.push(
        <TeamFace key="standings" team={leaders[0].team} kicker="SWAC East">
          <Flex position="absolute" top="26cqmin" right="5cqmin" gap="4cqmin" align="flex-end">
            {leaders.map((r) => (
              <Flex key={r.teamId} direction="column" align="center" gap="1cqmin" bg="rgba(0,0,0,0.35)" px="2cqmin" py="1.5cqmin">
                <Image src={r.team?.logo} alt="" w="20cqmin" h="20cqmin" objectFit="contain" />
                <Text fontSize="11cqmin" fontWeight="black" color={INFO}>{r.confRecord ?? "0-0"}</Text>
              </Flex>
            ))}
          </Flex>
        </TeamFace>,
      );
    }
    const card = contextCards?.[0];
    if (card?.title) {
      faces.push(
        <TeamFace key="context" team={card.team} kicker={card.teamLabel ?? "Game Center"} logoOpacity={0.55}>
          <Text position="absolute" bottom="8cqmin" right="5cqmin" maxW="60%" textAlign="right" fontSize="14cqmin" fontWeight="black" fontStyle="italic" color={INFO} textTransform="uppercase" lineHeight={0.95} lineClamp={2} textShadow="0 2px 12px rgba(0,0,0,0.6)">
            {card.title}
          </Text>
        </TeamFace>,
      );
    }
    return faces;
  }, [featuredGames, scheduleRailCards, standings, contextCards, currentWeek]);
};
