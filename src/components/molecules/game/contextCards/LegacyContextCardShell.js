import { Box, Image, Flex, Text } from "@chakra-ui/react";

const getLogo = (team) => team?.logo ?? (team?.teamId ? `/assets/${team.teamId}.svg` : null);

export const ContextCardShell = ({ title, team, teamLabel, note, children }) => {
  const logo = getLogo(team);

  return (
    <Box
      h="100%"
      w="100%"
      containerType="size"
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      bg="#111114"
    >
      {logo && (
        <Image
          src={logo}
          alt=""
          position="absolute"
          right="-18cqmin"
          top="-12cqmin"
          w="60cqmin"
          h="60cqmin"
          objectFit="contain"
          opacity={0.12}
        />
      )}

      <Flex h="100%" direction="column" position="relative" px="6cqmin" pt="6cqmin" pb="5cqmin" gap="3cqmin">
        <Text flexShrink={0} fontSize="7cqmin" color="text.primary" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" lineHeight={1.2} lineClamp={1}>
          {title}
        </Text>

        {teamLabel && (
          <Flex align="center" gap="2.5cqmin" flexShrink={0}>
            {logo && <Image src={logo} alt="" w="10cqmin" h="10cqmin" objectFit="contain" />}
            <Text fontSize="6cqmin" color="white" fontWeight="bold" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.2}>
              {teamLabel}
            </Text>
          </Flex>
        )}

        <Box flex={1} minH={0} overflow="hidden">
          {children}
        </Box>

        {note && (
          <Text mt="auto" pt="2cqmin" fontSize="5.5cqmin" color="text.secondary" lineHeight={1.35} lineClamp={2} flexShrink={0}>
            {note}
          </Text>
        )}
      </Flex>
    </Box>
  );
};
