import { useMemo } from "react";
import { GLOSSARY } from "../../../../pages/analytics/metricGlossary";
import { ANALYTICS_TABS, itemOf, TEAM_BY_V5, colorOf } from "./menuPresentation";
import { MOCK_TILE } from "../../../molecules/home/statsTileMock";
import { Face, Kicker, Big, Bleed, TeamFace, IdentityFace } from "./MenuPrimitives";
import { Text, Box, Image } from "@chakra-ui/react";

export const useAnalyticsFaces = () =>
  useMemo(() => {
    const core = GLOSSARY.filter((g) => g.tier === "core");
    const term = core[Math.floor(Math.random() * core.length)];
    const tabs = ANALYTICS_TABS.map((tab) => {
      const item = tab.key ? itemOf(MOCK_TILE, tab.key) : null;
      const team = item?.teams?.[0] ? TEAM_BY_V5[item.teams[0]] : null;
      const second = item?.teams?.[1] ? TEAM_BY_V5[item.teams[1]] : null;
      let node;
      if (tab.id === "glossary" || !item) {
        node = (
          <Face key={tab.id} bg="#1E1433">
            <Text position="absolute" right="-4cqmin" top="50%" transform="translateY(-50%)" fontSize="120cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.8} color="rgba(168,85,247,0.35)">?</Text>
            <Kicker>{tab.label}</Kicker>
            <Big size={22} bottom="10cqmin" right="5cqmin">{String(term?.term ?? "").toUpperCase()}</Big>
          </Face>
        );
      } else if (second) {
        node = (
          <Face key={tab.id} bg={colorOf(second)}>
            <Box position="absolute" inset={0} bg={colorOf(team)} style={{ clipPath: "polygon(0 0, 62% 0, 46% 100%, 0 100%)" }} />
            <Image src={team.logo} alt="" position="absolute" left="30%" top="50%" transform="translate(-50%, -50%)" h="110cqmin" w="110cqmin" objectFit="contain" opacity={0.9} />
            <Bleed src={second.logo} size={130} right={-14} />
            <Kicker>{tab.label}</Kicker>
          </Face>
        );
      } else if (team) {
        node = (
          <TeamFace key={tab.id} team={team} kicker={tab.label}>
            {item.primary?.display ? <Big size={44} bottom="8cqmin" right="40%">{item.primary.display}</Big> : null}
          </TeamFace>
        );
      } else {
        node = (
          <Face key={tab.id} bg="#1E1433">
            <Kicker>{tab.label}</Kicker>
            {item.primary?.display ? <Big size={60} bottom="6cqmin">{item.primary.display}</Big> : null}
          </Face>
        );
      }
      return { href: `/team-analytics?tab=${tab.id}`, node };
    });
    return [{ href: "/stats", node: <IdentityFace key="id" words={["Stats", "Ratings", "Glossary"]} /> }, ...tabs];
  }, []);
