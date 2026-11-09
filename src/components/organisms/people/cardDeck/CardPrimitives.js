import { Text, Box, Image, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { PANEL_BG, PANEL_BORDER, teamOf, ICONS } from "./cardPresentation";

export const Kicker = ({ children, color = "text.muted", ...rest }) => (
  <Text fontSize="9px" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.13em" lineClamp={1} {...rest}>
    {children}
  </Text>
);

export const Num = ({ children, size = "clamp(1.4rem, 2.3vw, 1.9rem)", color = "white" }) => (
  <Text fontSize={size} fontWeight="900" fontStyle="italic" color={color} lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
    {children}
  </Text>
);

export const Portrait = ({ src, alt, size, ring = "whiteAlpha.200" }) => (
  <Box w={size} h={size} flexShrink={0} borderRadius="md" overflow="hidden" bg="blackAlpha.500" border="1px solid" borderColor={ring}>
    {src ? <Image src={src} alt={alt} w="100%" h="100%" objectFit="cover" objectPosition="top center" /> : null}
  </Box>
);

export const Panel = ({ children, to, ...rest }) => (
  <Flex
    as={to ? Link : undefined} to={to} direction="column" h="100%" minW={0} p={3.5} gap={2}
    bg={PANEL_BG} border="1px solid" borderColor={PANEL_BORDER} borderRadius="lg" overflow="hidden"
    _hover={to ? { borderColor: "whiteAlpha.300" } : undefined}
    style={{ transition: "border-color 0.18s" }}
    {...rest}
  >
    {children}
  </Flex>
);

export const PersonLead = ({ person, icon, accent, size = "44px", nameSize = "clamp(0.95rem, 1.5vw, 1.25rem)" }) => {
  const team = teamOf(person.team_id);
  const Icon = ICONS[icon];
  return (
    <Flex align="center" gap={2.5} minW={0}>
      <Portrait src={person.image_url} alt={person.name} size={size} ring={`${accent}88`} />
      <Box minW={0} flex={1}>
        <Text fontSize={nameSize} fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.02em" lineClamp={1}>
          {person.name}
        </Text>
        <Flex align="center" gap={1} mt={1}>
          {team?.logo && <Image src={team.logo} alt="" w="12px" h="12px" objectFit="contain" flexShrink={0} />}
          <Kicker color="whiteAlpha.600">{person.position} · {team?.shortName ?? person.team_short}</Kicker>
        </Flex>
      </Box>
      {Icon && <Icon size={14} color={accent} style={{ flexShrink: 0 }} />}
    </Flex>
  );
};

export const Headline = ({ children, ...rest }) => (
  <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.800" lineHeight={1.35} lineClamp={2} {...rest}>
    {children}
  </Text>
);
