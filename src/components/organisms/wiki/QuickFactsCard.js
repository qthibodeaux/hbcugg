import React from 'react';
import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { MapPin, Users, Trophy, Flag, Landmark, Award, Briefcase } from 'lucide-react';
import { WikiCtx } from './WikiCtx';

const QuickFactsCard = () => {
  const wikiData = React.useContext(WikiCtx);
  const facts = [
    { icon: MapPin,    label: "LOCATION",         value: `${wikiData.location?.city || "[[TBA]]"}, ${wikiData.location?.state || "[[TBA]]"}` },
    { icon: Landmark,  label: "CAMPUS NICKNAME",   value: wikiData.location?.campusNickname || "[[TBA]]" },
    { icon: Flag,      label: "INSTITUTION TYPE",  value: wikiData.location?.campusType || "[[TBA]]" },
    { icon: Users,     label: "ENROLLMENT",        value: wikiData.enrollment?.toLocaleString() || "[[TBA]]" },
    { icon: Trophy,    label: "CONFERENCE / DIV",  value: `${wikiData.conference || "SWAC"} · ${wikiData.division || "[[TBA]]"}` },
    { icon: Briefcase, label: "ATHLETIC DIRECTOR", value: wikiData.athleticDirector || "[[TBA]]" },
    { icon: Award,     label: "HALL OF FAMERS",    value: (wikiData.athletics?.hallOfFamers || []).map(h => h.name || h).join(", ") || "[[TBA]]" },
  ];
  return (
    <Box h="full" bg="#FFFFFF" overflow="hidden">
      {/* header strip in school primary color */}
      <Box px={5} py={3} bg={wikiData.colors.primary}>
        <Text fontSize="8px" fontWeight="black" letterSpacing="0.4em" color={wikiData.colors.secondary}>QUICK FACTS</Text>
      </Box>
      {/* facts list — rows filling remaining height evenly, no overflow */}
      <Flex direction="column" h="calc(100% - 40px)">
        {facts.map((f, i) => (
          <HStack
            key={i} px={5} flex={1} gap={3}
            borderBottom={i < facts.length - 1 ? `1px solid ${wikiData.colors.primary}18` : "none"}
          >
            <Icon as={f.icon} boxSize={3.5} color={wikiData.colors.primary} flexShrink={0} />
            <Box flex={1}>
              <Text fontSize="7px" fontWeight="black" color={wikiData.colors.primary} letterSpacing="0.25em" opacity={0.5}>{f.label}</Text>
              <Text fontSize="sm" fontWeight="black" color={wikiData.colors.primary} letterSpacing="-0.01em" lineHeight="1.2">{f.value}</Text>
            </Box>
          </HStack>
        ))}
      </Flex>
    </Box>
  );
};

export default QuickFactsCard;
