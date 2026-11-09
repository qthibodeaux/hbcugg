import { Card } from "../../../molecules/wiki/ConferenceWikiCard";
import { Box, Flex, SimpleGrid, Text, Grid, Image } from "@chakra-ui/react";
import { Eyebrow, Title } from "./WikiPrimitives";
import { Users, Tv, Radio, Globe, Music, Star, Award, MapPin } from "lucide-react";
import { MEMBERSHIP, TEAMS } from "./ConferenceWikiData";
import { SWAC, MEAC } from "../../../../data/wiki_data";
import { LEGACY_STATS } from "../../../molecules/wiki/ConferenceWikiResponsiveBanner";

// Existing implementation extracted along responsibility boundaries.

export const MembershipPanel = () => (
  <Card accent="#A855F7">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow>Membership And Alignment</Eyebrow>
          <Title size="lg">Football Members Plus Context</Title>
        </Box>
        <Users size={24} color="#A855F7" />
      </Flex>
      <SimpleGrid columns={4} gap={3} flex={1}>
        <MemberGroup title="SWAC East" items={MEMBERSHIP.swacEast} color={SWAC.colors.primary} />
        <MemberGroup title="SWAC West" items={MEMBERSHIP.swacWest} color={SWAC.colors.secondary} />
        <MemberGroup title="MEAC Football" items={MEMBERSHIP.meacFootball} color={MEAC.colors.primary} />
        <MemberGroup title="Historic Context" items={MEMBERSHIP.formerContext} color="whiteAlpha.400" />
      </SimpleGrid>
    </Box>
  </Card>
);

const MemberGroup = ({ title, items, color }) => (
  <Box minW={0}>
    <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
      {title}
    </Text>
    <Flex direction="column" gap={1}>
      {items.map((school) => (
        <Flex key={school} align="center" gap={2}>
          <Box w="2px" h="10px" bg={color} borderRadius="full" />
          <Text fontSize="9px" color="white" fontWeight="bold" lineClamp={1}>{school}</Text>
        </Flex>
      ))}
    </Flex>
  </Box>
);

export const MediaPanel = () => (
  <Card accent="#4A90D9">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color="#4A90D9">Media & Broadcast</Eyebrow>
          <Title size="lg">The National Stage</Title>
        </Box>
        <Tv size={24} color="#4A90D9" />
      </Flex>
      <SimpleGrid columns={2} gap={4} flex={1}>
        <Box>
          <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={2}>SWAC Coverage</Text>
          <Flex direction="column" gap={1.5}>
            {SWAC.media.map(m => (
              <Flex key={m} align="center" gap={2}>
                <Radio size={10} color="#6F2633" />
                <Text fontSize="9px" color="text.secondary" fontWeight="bold">{m}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
        <Box>
          <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={2}>MEAC Coverage</Text>
          <Flex direction="column" gap={1.5}>
            {MEAC.media.map(m => (
              <Flex key={m} align="center" gap={2}>
                <Globe size={10} color="#4B0082" />
                <Text fontSize="9px" color="text.secondary" fontWeight="bold">{m}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </SimpleGrid>
    </Box>
  </Card>
);

export const TraditionPanel = () => (
  <Card accent="#FFD100" bg="rgba(0,0,0,0.4)">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color="#FFD100">Culture & Pageantry</Eyebrow>
          <Title size="lg">Signature Traditions</Title>
        </Box>
        <Music size={24} color="#FFD100" />
      </Flex>
      <SimpleGrid columns={2} gap={2} flex={1}>
        {[...SWAC.traditions, ...MEAC.traditions].map(t => (
          <Flex key={t} align="center" gap={2} bg="whiteAlpha.100" p={2} borderRadius="4px">
            <Star size={10} color="#FFD100" />
            <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase">{t}</Text>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  </Card>
);

export const LeagueStatsSection = () => (
  <Card accent="#FFFFFF">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color="text.muted">League Scale</Eyebrow>
          <Title size="lg">Combined Legacy Stats</Title>
        </Box>
        <Award size={24} color="white" />
      </Flex>
      <SimpleGrid columns={3} gap={3} flex="1" minW={0}>
        {LEGACY_STATS.map(([value, label]) => (
          <Box key={label} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" p={3} bg="rgba(0,0,0,0.22)">
            <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>
              {value}
            </Text>
            <Text mt={1} fontSize="8px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.1em">
              {label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  </Card>
);

export const TeamDirectoryBottom = () => (
  <Card accent="#71717A">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow>Member Team Directory</Eyebrow>
          <Title size="lg">At The Bottom, Where It Belongs</Title>
        </Box>
        <MapPin size={24} color="#A1A1AA" />
      </Flex>
      <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap={2} flex={1}>
        {TEAMS.map((team) => (
          <Box key={`bottom-${team.id}`} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" p={2} bg="rgba(255,255,255,0.035)" minW={0}>
            <Flex align="center" gap={2}>
              <Image src={team.logo} boxSize="22px" objectFit="contain" flexShrink={0} />
              <Box minW={0}>
                <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>{team.name}</Text>
                <Text fontSize="8px" color="text.muted" fontWeight="bold" lineClamp={1}>{team.conference} / {team.division || "MEAC"}</Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </Grid>
    </Box>
  </Card>
);
