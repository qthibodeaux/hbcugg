import { useGameCenterHubData } from "../../../../hooks/useGameCenterHubData";
import { useMemo } from "react";
import { IdentityFace, TeamFace, Big, Face, Bleed, Kicker } from "./MenuPrimitives";
import { TEAMS, abbr, INFO, itemOf, TEAM_BY_V5, colorOf } from "./menuPresentation";
import { Text, Image } from "@chakra-ui/react";
import { TEAMS_MOCK_TILE } from "../../../molecules/home/teamsTileMock";
import { PLAYERS_MOCK_TILE } from "../../../molecules/home/playersTileMock";
import { lastName } from "../../../molecules/home/LiveTile";

export const useSchoolsFaces = () => {
  const { standings } = useGameCenterHubData();
  return useMemo(() => {
    const faces = [<IdentityFace key="id" words={["Teams", "Wiki", "Rosters"]} />];
    const leader = standings?.meac?.rows?.[0];
    if (leader?.team) {
      faces.push(
        <TeamFace key="leader" team={leader.team} kicker="MEAC leader">
          <Big size={44} bottom="8cqmin" right="42%">{leader.confRecord ?? "0-0"}</Big>
        </TeamFace>,
      );
    }
    // A wiki fun fact from a school picked once per menu mount.
    const withFacts = TEAMS.filter((t) => t.wiki?.history?.funFacts?.length);
    const factTeam = withFacts[Math.floor(Math.random() * withFacts.length)];
    if (factTeam) {
      faces.push(
        <TeamFace key="fact" team={factTeam} kicker={abbr(factTeam)} logoOpacity={0.35}>
          <Text position="absolute" top="24cqmin" right="5cqmin" maxW="66%" textAlign="right" fontSize="11cqmin" fontWeight="black" color={INFO} lineHeight={1.15} lineClamp={4} textShadow="0 1px 8px rgba(0,0,0,0.7)">
            {factTeam.wiki.history.funFacts[0]}
          </Text>
        </TeamFace>,
      );
    }
    const dna = itemOf(TEAMS_MOCK_TILE, "roster_dna");
    if (dna) {
      const t = TEAM_BY_V5[dna.data.team_id];
      faces.push(
        <TeamFace key="roster" team={t} kicker={`${abbr(t)} transfers`}>
          <Big size={52} bottom="6cqmin" right="40%">{Math.round(dna.data.transfer_rate * 100)}%</Big>
        </TeamFace>,
      );
    }
    const top = itemOf(PLAYERS_MOCK_TILE, "collage")?.data?.players?.[0];
    if (top) {
      const t = TEAM_BY_V5[top.team_id];
      faces.push(
        <Face key="player" bg={colorOf(t)}>
          {top.image_url ? (
            <Image src={top.image_url} alt="" position="absolute" right={0} top={0} h="100%" w="48%" objectFit="cover" objectPosition="top" />
          ) : (
            <Bleed src={t?.logo} />
          )}
          <Kicker>{`${top.position ?? ""} · ${abbr(t)}`}</Kicker>
          <Big size={30} bottom="8cqmin" right="50%">{lastName(top.name).toUpperCase()}</Big>
        </Face>,
      );
    }
    const coach = itemOf(TEAMS_MOCK_TILE, "head_coach");
    if (coach) {
      const t = TEAM_BY_V5[coach.data.team_id];
      faces.push(
        <TeamFace key="coach" team={t} kicker={`Head coach · ${abbr(t)}`}>
          <Big size={34} bottom="8cqmin" right="40%">{lastName(coach.data.coach_name).toUpperCase()}</Big>
        </TeamFace>,
      );
    }
    return faces;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standings]);
};
