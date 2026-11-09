import { accentOf, ICONS, PANEL_BG, teamOf } from "./cardPresentation";
import { Panel, Kicker, Headline, Num, Portrait } from "./CardPrimitives";
import { Flex, Image, Box, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Viz } from "./CardVisuals";
import { MapPin, ClipboardList } from "lucide-react";
import { StateShape } from "../../../molecules/maps";

export const DuoFeatureCard = ({ card }) => {
  const accent = accentOf(card.subject[0].team_id);
  const Icon = ICONS[card.icon];
  return (
    <Panel>
      <Flex align="center" justify="space-between" gap={2}>
        <Kicker color={accent}>{card.stat_primary.context}</Kicker>
        {Icon && <Icon size={14} color={accent} />}
      </Flex>

      <Flex gap={2.5} flex={1} minH={0}>
        {card.subject.map((person, i) => (
          <Flex key={person.person_id} as={Link} to={person.href} direction="column" flex={1} minW={0} justify="flex-end"
            position="relative" overflow="hidden" borderRadius="md" bg="blackAlpha.500" border="1px solid" borderColor="whiteAlpha.100"
            _hover={{ borderColor: `${accent}` }} style={{ transition: "border-color 0.18s" }}>
            {person.image_url && <Image src={person.image_url} alt={person.name} position="absolute" inset={0} w="100%" h="100%" objectFit="cover" objectPosition="top center" />}
            <Box position="absolute" inset={0} bg="linear-gradient(180deg, transparent 34%, rgba(8,8,10,0.95) 92%)" />
            <Box position="relative" zIndex={1} p={2.5}>
              <Text fontSize="clamp(0.95rem, 1.6vw, 1.35rem)" fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.95} lineClamp={1}>
                {person.last_name}
              </Text>
              <Kicker color="whiteAlpha.700" mt={1}>{person.position} · {card.stat_support[i]?.value ?? ""}</Kicker>
            </Box>
          </Flex>
        ))}
      </Flex>

      <Headline>{card.headline}</Headline>
      <Flex align="baseline" gap={2}>
        <Num>{card.stat_primary.value}</Num>
        <Kicker>{card.stat_primary.label}</Kicker>
      </Flex>
    </Panel>
  );
};

export const CohortCard = ({ card }) => {
  const lead = card.subject[0];
  const accent = accentOf(lead?.team_id);
  const Icon = ICONS[card.icon];
  return (
    <Panel>
      <Flex align="center" justify="space-between" gap={2}>
        <Flex align="center" gap={1.5} minW={0}>
          {Icon && <Icon size={13} color={accent} style={{ flexShrink: 0 }} />}
          <Kicker color={accent}>{card.stat_primary.label}</Kicker>
        </Flex>
        <Num size="1.4rem">{card.stat_primary.value}</Num>
      </Flex>

      {/* Exemplar faces — the people this cohort claim is actually about */}
      <Flex align="center" gap={2} minW={0}>
        <Flex flexShrink={0}>
          {card.subject.slice(0, 3).map((person, i) => (
            <Box key={person.person_id} ml={i === 0 ? 0 : "-9px"} zIndex={3 - i}>
              <Portrait src={person.image_url} alt={person.name} size="32px" ring={PANEL_BG} />
            </Box>
          ))}
        </Flex>
        <Text fontSize="10px" fontWeight="900" color="white" lineClamp={1} minW={0}>
          {card.subject.slice(0, 3).map((p) => p.last_name).join(" · ")}
        </Text>
      </Flex>

      <Headline>{card.headline}</Headline>
      <Box mt="auto" pt={1} h="76px">
        <Viz viz={card.viz} accent={accent} />
      </Box>
    </Panel>
  );
};

export const StateCohortCard = ({ card }) => {
  const lead = card.subject[0];
  const accent = accentOf(lead?.team_id);
  return (
    <Panel>
      <Flex align="center" gap={1.5}>
        <MapPin size={13} color={accent} style={{ flexShrink: 0 }} />
        <Kicker color={accent}>{card.viz.state_name}</Kicker>
      </Flex>

      <Flex gap={2} flex={1} minH={0} align="center">
        <Box flex={1} minW={0}>
          <Num>{card.stat_primary.value}</Num>
          <Kicker mt={1}>{card.stat_primary.label}</Kicker>
        </Box>
        <Box w="46%" h="100%" flexShrink={0} opacity={0.95}>
          <StateShape state={card.viz.state} fill={accent} stroke="rgba(255,255,255,0.5)" strokeWidth={1.1} padding={4} />
        </Box>
      </Flex>

      <Flex align="center" gap={2} minW={0}>
        <Flex flexShrink={0}>
          {card.subject.slice(0, 3).map((person, i) => (
            <Box key={person.person_id} ml={i === 0 ? 0 : "-9px"} zIndex={3 - i}>
              <Portrait src={person.image_url} alt={person.name} size="28px" ring={PANEL_BG} />
            </Box>
          ))}
        </Flex>
        <Text fontSize="9px" fontWeight="900" color="whiteAlpha.800" lineClamp={1} minW={0}>
          {card.subject.slice(0, 3).map((p) => p.last_name).join(" · ")}
        </Text>
      </Flex>
    </Panel>
  );
};

export const CoachCard = ({ card }) => {
  const accent = accentOf(card.subject[0]?.team_id);
  return (
    <Panel>
      <Flex align="center" gap={1.5}>
        <ClipboardList size={13} color={accent} style={{ flexShrink: 0 }} />
        <Kicker color={accent}>Coaching</Kicker>
      </Flex>
      <Flex align="baseline" gap={2}>
        <Num>{card.stat_primary.value}</Num>
        <Kicker>{card.stat_primary.label}</Kicker>
      </Flex>
      <Headline>{card.headline}</Headline>
      <Flex gap={1.5} mt="auto" wrap="wrap">
        {card.subject.slice(0, 7).map((coach) => {
          const team = teamOf(coach.team_id);
          return team?.logo ? <Image key={coach.coach_id} src={team.logo} alt={coach.team_name} w="22px" h="22px" objectFit="contain" opacity={0.85} /> : null;
        })}
      </Flex>
    </Panel>
  );
};
