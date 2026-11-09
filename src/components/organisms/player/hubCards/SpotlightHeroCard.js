import { useNavigate } from "react-router-dom";
import { teamOf, accentFor, hrefFor, fmt } from "./cardPresentation";
import { Flex, Text, Box, Image } from "@chakra-ui/react";
import { Sparkles } from "lucide-react";
import { Kicker, Num } from "./CardPrimitives";

export const SpotlightHeroCard = ({ spotlight }) => {
  const navigate = useNavigate();
  const entry = spotlight?.primary;
  const player = entry?.player;
  if (!player) return null;

  const team = teamOf(player.school_id);
  const accent = accentFor(player.school_id);

  return (
    <Flex
      position="relative"
      h="100%"
      overflow="hidden"
      borderRadius="lg"
      border="1px solid"
      borderColor="whiteAlpha.100"
      cursor="pointer"
      onClick={() => navigate(hrefFor(player))}
      bg={`linear-gradient(115deg, ${accent} 0%, ${accent}A6 26%, rgba(12,12,15,0.97) 68%)`}
      _hover={{ borderColor: "whiteAlpha.300" }}
      style={{ transition: "border-color 0.18s" }}
    >
      <Text
        position="absolute"
        right="-3%"
        bottom="-14%"
        fontSize="clamp(5rem, 13vw, 11rem)"
        fontWeight="900"
        fontStyle="italic"
        color="whiteAlpha.100"
        lineHeight={0.78}
        letterSpacing="-0.05em"
        whiteSpace="nowrap"
        pointerEvents="none"
        aria-hidden="true"
      >
        {team?.shortName ?? ""}
      </Text>

      <Box position="relative" w={{ base: "40%", lg: "36%" }} flexShrink={0} overflow="hidden">
        {player.image_url && (
          <Image src={player.image_url} alt={player.full_name} position="absolute" inset={0} w="100%" h="100%" objectFit="cover" objectPosition="top center" />
        )}
        <Box position="absolute" inset={0} bg={`linear-gradient(100deg, transparent 34%, ${accent}4D 72%, rgba(12,12,15,0.96) 100%)`} />
      </Box>

      <Flex position="relative" zIndex={1} direction="column" justify="center" gap={2} flex={1} minW={0} px={5} py={5}>
        <Flex align="center" gap={2}>
          <Sparkles size={13} color="white" />
          <Kicker color="whiteAlpha.900">{entry.spotlight_type ?? "Spotlight"}</Kicker>
        </Flex>

        <Text
          fontSize="clamp(1.5rem, 3.2vw, 2.6rem)"
          fontWeight="900"
          fontStyle="italic"
          color="white"
          textTransform="uppercase"
          lineHeight={0.88}
          letterSpacing="-0.035em"
          textShadow="0 3px 0 rgba(0,0,0,0.32)"
          lineClamp={2}
        >
          {player.full_name}
        </Text>

        <Flex align="center" gap={1.5}>
          {team?.logo && <Image src={team.logo} alt="" w="16px" h="16px" objectFit="contain" />}
          <Kicker color="whiteAlpha.800">
            {player.position} · {player.school_name} · {player.class_year}
          </Kicker>
        </Flex>

        <Box w="2.4rem" h="3px" bg="white" borderRadius="full" my={1} />

        <Text fontSize={{ base: "xs", lg: "sm" }} color="whiteAlpha.900" fontWeight="bold" lineClamp={3} maxW="24rem">
          {entry.dek ?? entry.headline}
        </Text>

        <Flex align="flex-end" gap={{ base: 4, lg: 6 }} mt={2}>
          {(entry.stat_strip ?? []).slice(0, 3).map((stat, i) => (
            <Box key={stat.label}>
              <Num size={i === 0 ? "clamp(1.8rem, 3.4vw, 2.8rem)" : "clamp(1rem, 1.6vw, 1.3rem)"}>
                {fmt(stat.value, Number(stat.value) % 1 === 0 ? 0 : 1)}
              </Num>
              <Kicker color={i === 0 ? "white" : "whiteAlpha.700"} mt={1.5}>
                {stat.label}
              </Kicker>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
