import { accentOf } from "./cardPresentation";
import { Panel, PersonLead, Headline, Num, Kicker } from "./CardPrimitives";
import { Box, Flex } from "@chakra-ui/react";
import { Viz } from "./CardVisuals";

export const SoloTallCard = ({ card }) => {
  const person = card.subject[0];
  const accent = accentOf(person.team_id);
  return (
    <Panel to={person.href}>
      <PersonLead person={person} icon={card.icon} accent={accent} size="48px" />
      <Headline>{card.headline}</Headline>
      <Box flex={1} minH={0} py={1}>
        <Viz viz={card.viz} accent={accent} />
      </Box>
      <Flex align="baseline" gap={2}>
        <Num>{card.stat_primary.value}</Num>
        <Kicker>{card.stat_primary.label}</Kicker>
      </Flex>
    </Panel>
  );
};

export const SoloCard = ({ card }) => {
  const person = card.subject[0];
  const accent = accentOf(person.team_id);
  return (
    <Panel to={person.href}>
      <PersonLead person={person} icon={card.icon} accent={accent} size="40px" nameSize="0.95rem" />
      <Headline>{card.headline}</Headline>
      <Box mt="auto">
        <Flex align="baseline" gap={2} mb={2}>
          <Num size="1.5rem">{card.stat_primary.value}</Num>
          <Kicker>{card.stat_primary.label}</Kicker>
        </Flex>
        <Viz viz={card.viz} accent={accent} />
      </Box>
    </Panel>
  );
};
