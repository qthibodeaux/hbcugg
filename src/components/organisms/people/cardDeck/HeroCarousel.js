import { teamOf, accentOf, markOf, ICONS, HOLD_SECONDS, PANEL_BORDER } from "./cardPresentation";
import { Flex, Text, Box, Image } from "@chakra-ui/react";
import { Kicker, Num } from "./CardPrimitives";
import { Viz } from "./CardVisuals";
import { Link } from "react-router-dom";

const HeroSlide = ({ card }) => {
  const person = card.subject[0];
  const team = teamOf(person.team_id);
  const accent = accentOf(person.team_id);
  const mark = markOf(person.team_id);
  const Icon = ICONS[card.icon];

  return (
    <Flex position="absolute" inset={0} align="stretch" bg={`linear-gradient(125deg, ${accent} 0%, ${accent}B3 30%, rgba(12,12,15,0.97) 74%)`}>
      <Text position="absolute" right="-2%" bottom="-16%" fontSize="clamp(6rem, 17vw, 15rem)" fontWeight="900" fontStyle="italic"
        color="whiteAlpha.100" lineHeight={0.78} letterSpacing="-0.05em" whiteSpace="nowrap" pointerEvents="none" aria-hidden="true">
        {person.team_short}
      </Text>

      <Box position="relative" w={{ base: "36%", md: "27%", lg: "23%" }} flexShrink={0} overflow="hidden">
        {person.image_url && <Image src={person.image_url} alt={person.name} position="absolute" inset={0} w="100%" h="100%" objectFit="cover" objectPosition="top center" />}
        <Box position="absolute" inset={0} bg={`linear-gradient(100deg, transparent 36%, ${accent}52 74%, rgba(12,12,15,0.97) 100%)`} />
      </Box>

      <Flex position="relative" zIndex={1} direction="column" justify="center" gap={1.5} flex={1} minW={0} px={{ base: 4, lg: 7 }} py={5}>
        <Flex align="center" gap={2}>
          {Icon && <Icon size={14} color={mark} />}
          {team?.logo && <Image src={team.logo} alt="" w="18px" h="18px" objectFit="contain" />}
          <Kicker color="whiteAlpha.900">{person.position} · {team?.name ?? person.team_short}</Kicker>
        </Flex>

        <Text fontSize="clamp(1.6rem, 4vw, 3rem)" fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase"
          lineHeight={0.88} letterSpacing="-0.035em" textShadow="0 3px 0 rgba(0,0,0,0.35)" lineClamp={2}>
          {person.name}
        </Text>

        <Box w="2.5rem" h="3px" bg={mark} borderRadius="full" my={1} />
        <Text fontSize={{ base: "xs", lg: "sm" }} color="whiteAlpha.900" fontWeight="bold" lineClamp={2} maxW="26rem">{card.headline}</Text>

        <Flex align="flex-end" gap={{ base: 4, lg: 7 }} mt={2}>
          <Box>
            <Num size="clamp(2rem, 5vw, 3.4rem)">{card.stat_primary.value}</Num>
            <Kicker color={mark} mt={1.5}>{card.stat_primary.label}</Kicker>
          </Box>
          {card.stat_support.slice(0, 2).map((stat) => (
            <Box key={stat.label} pb={1}>
              <Text fontSize={{ base: "md", lg: "xl" }} fontWeight="900" fontStyle="italic" color="whiteAlpha.900" lineHeight={1}>{stat.value}</Text>
              <Kicker color="whiteAlpha.600" mt={1}>{stat.label}</Kicker>
            </Box>
          ))}
        </Flex>
      </Flex>

      <Flex display={{ base: "none", xl: "flex" }} position="relative" zIndex={1} direction="column" justify="center" w="150px" flexShrink={0} pr={6}>
        <Viz viz={card.viz} accent={mark} />
      </Flex>
    </Flex>
  );
};

export const HeroCarousel = ({ cards }) => {
  const count = cards.length;
  if (!count) return null;
  const cycle = count * HOLD_SECONDS;
  const visible = 100 / count;
  const delayFor = (i) => `-${((count - i) % count) * HOLD_SECONDS}s`;

  return (
    <Box className="people-hero" position="relative" overflow="hidden" borderRadius="xl" border="1px solid" borderColor={PANEL_BORDER}
      h="100%">
      <style>{`
        @keyframes peopleHeroSlide { 0%{opacity:0} 2%{opacity:1} ${Math.max(3, visible - 2)}%{opacity:1} ${visible}%{opacity:0} 100%{opacity:0} }
        .people-hero .people-slide, .people-hero .people-dot { animation: peopleHeroSlide ${cycle}s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .people-hero .people-slide, .people-hero .people-dot { animation:none; opacity:0; }
          .people-hero .people-slide:first-of-type, .people-hero .people-dot:first-of-type { opacity:1; }
        }
      `}</style>
      {cards.map((card, i) => (
        <Box key={card.card_id} className="people-slide" position="absolute" inset={0} as={Link} to={card.subject[0].href} style={{ animationDelay: delayFor(i) }}>
          <HeroSlide card={card} />
        </Box>
      ))}
      <Flex position="absolute" bottom={4} right={5} gap="7px" zIndex={2}>
        {cards.map((card, i) => (
          <Box key={card.card_id} position="relative" w="22px" h="2px" borderRadius="full" bg="whiteAlpha.300">
            <Box className="people-dot" position="absolute" inset={0} borderRadius="full" bg="white" style={{ animationDelay: delayFor(i) }} />
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
