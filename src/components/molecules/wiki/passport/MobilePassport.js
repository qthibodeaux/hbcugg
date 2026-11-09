import { Flex, Box, Text, Image, Grid } from "@chakra-ui/react";
import { CONFERENCE_FACTS, CHAMPIONS, compactTeamName } from "./passportModel";
import { Watermark } from "./PassportPrimitives";
import { BadgeCheck, Users, Trophy } from "lucide-react";

const FactCellMobile = ({ label, value, icon: Icon, color }) => (
  <Flex
    minW={0}
    align="center"
    gap="0.4rem"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="rgba(255,255,255,0.045)"
    px="0.5rem"
    py="0.4rem"
    overflow="hidden"
  >
    <Flex boxSize="1.5rem" align="center" justify="center" flexShrink={0} borderRadius="6px" bg={`${color}1F`} border="1px solid" borderColor={`${color}66`}>
      <Icon size={13} color={color} />
    </Flex>
    <Box minW={0} flex="1">
      <Text fontSize="0.55rem" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" lineHeight={1} lineClamp={1}>
        {label}
      </Text>
      <Text mt="1px" fontSize="1rem" color="white" fontWeight="black" lineHeight={1} lineClamp={1}>
        {value}
      </Text>
    </Box>
  </Flex>
);

export const MobilePassportCard = ({ conf }) => {
  const facts = CONFERENCE_FACTS[conf.key];
  const champion = CHAMPIONS[conf.key];
  const titleLeader = conf.titles[0];

  return (
    <Box
      w="100%"
      minW={0}
      overflow="hidden"
      position="relative"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(105deg, ${conf.colors.primary}38 0%, rgba(11,11,13,0.98) 48%, rgba(8,8,10,1) 100%)`}
      boxShadow={`inset 0 -3px 0 ${conf.colors.secondary}`}
      p="0.85rem"
    >
      <Watermark conf={conf} compact />

      <Flex direction="column" position="relative" zIndex={1} gap="0.55rem">
        <Flex align="center" justify="space-between" gap="0.5rem">
          <Box minW={0}>
            <Text fontSize="0.65rem" color={conf.colors.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
              {conf.name}
            </Text>
            <Text fontSize="2.4rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.02em" lineHeight={0.85}>
              {conf.key}
            </Text>
          </Box>
          <Image src={conf.logo} alt="" boxSize="2.5rem" objectFit="contain" flexShrink={0} />
        </Flex>

        <Grid templateColumns="repeat(2, minmax(0, 1fr))" templateRows="repeat(2, minmax(0, 1fr))" gap="0.4rem">
          <FactCellMobile label="Est." value={conf.founded} icon={BadgeCheck} color={conf.colors.secondary} />
          <FactCellMobile label="Programs" value={facts.programs} icon={Users} color={conf.colors.secondary} />
          <FactCellMobile label="Bowl Wins" value={facts.bowlWins} icon={Trophy} color={conf.colors.secondary} />
          <FactCellMobile label="Postseason" value={facts.postseason} icon={Trophy} color={conf.colors.secondary} />
        </Grid>

        <Box border="1px solid" borderColor="whiteAlpha.100" bg="rgba(255,255,255,0.04)" px="0.65rem" py="0.4rem">
          <Text fontSize="0.55rem" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
            Most Titles
          </Text>
          <Text fontSize="1rem" fontWeight="black" color="white" lineClamp={1}>
            {compactTeamName(titleLeader.name)} · {titleLeader.count}
          </Text>
        </Box>

        <Flex
          align="center"
          gap="0.65rem"
          border="1px solid"
          borderColor={`${conf.colors.secondary}66`}
          bg={`linear-gradient(135deg, ${conf.colors.primary}55 0%, rgba(0,0,0,0.46) 78%)`}
          px="0.75rem"
          py="0.55rem"
        >
          <Image src={champion.logo} alt="" boxSize="2.25rem" objectFit="contain" flexShrink={0} />
          <Box minW={0} flex="1">
            <Text fontSize="0.6rem" color={conf.colors.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1}>
              {champion.year} Champion
            </Text>
            <Text fontSize="1.2rem" color="white" fontWeight="black" lineHeight={1.05} lineClamp={1}>
              {compactTeamName(champion.name)}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
