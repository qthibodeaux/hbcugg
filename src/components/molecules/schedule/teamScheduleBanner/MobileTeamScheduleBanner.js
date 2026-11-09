import { Box, Grid, Image, Text, Flex } from "@chakra-ui/react";
import { TEAM_LIST } from "./bannerModel";

// Production mobile selector grid, reset bar and selected-team record panel.

export const MobileTeamScheduleBannerA = ({ team, selectedId, onChange, stats }) => (
  <Box bg="#0B0B0D">
    <Grid templateColumns="repeat(6, 1fr)" gap="0">
      {TEAM_LIST.map(t => {
        const isSelected = t.id === selectedId;
        return (
          <Box
            key={t.id}
            as="button"
            aria-label={t.label}
            borderRadius="0"
            cursor="pointer"
            aspectRatio="1"
            bg={isSelected ? t.primary : 'rgba(255,255,255,0.07)'}
            border="1px solid"
            borderColor={isSelected ? t.secondary : 'rgba(255,255,255,0.1)'}
            borderBottomWidth="0.2rem"
            borderBottomColor={t.primary}
            onClick={() => onChange(t.id)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="0.4rem"
          >
            <Image src={t.logo} alt={t.label} w="72%" h="72%" objectFit="contain" />
          </Box>
        );
      })}
    </Grid>

    <Box
      as="button"
      type="button"
      w="full"
      borderRadius="0"
      bg={!selectedId ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)'}
      borderTop="1px solid"
      borderColor="rgba(255,255,255,0.1)"
      onClick={() => onChange(null)}
      py="0.6rem"
    >
      <Text fontSize="0.65rem" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" color={!selectedId ? 'white' : 'rgba(255,255,255,0.4)'}>
        All Teams
      </Text>
      {!team && (
        <Text mt="0.15rem" fontSize="0.6rem" color="rgba(255,255,255,0.35)" fontStyle="italic">
          Select a team to view their schedule
        </Text>
      )}
    </Box>

    {team && (
      <Box
        borderTop="1px solid"
        borderColor="rgba(255,255,255,0.1)"
        bg={`linear-gradient(135deg, ${team.colors.primary}66 0%, ${team.colors.primary}24 42%, rgba(0,0,0,0.26) 100%)`}
        px="0.75rem"
        py="0.75rem"
      >
        <Flex align="center" gap="0.5rem" mb="0.5rem">
          {team.logo && <Image src={team.logo} alt="" w="1.8rem" h="1.8rem" objectFit="contain" flexShrink={0} />}
          <Text fontSize="1rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.02em" lineClamp={1}>
            {team.bannerShort ?? team.shortName}
          </Text>
        </Flex>

        <Grid templateColumns="repeat(3, 1fr)" gap="0.4rem">
          {stats.map(s => (
            <Box
              key={s.label}
              px="0.5rem"
              py="0.4rem"
              borderRadius="0"
              bg="rgba(0,0,0,0.28)"
              border="1px solid"
              borderColor="rgba(255,255,255,0.08)"
            >
              <Text fontSize="0.5rem" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em" mb="0.1rem" lineClamp={1}>
                {s.label}
              </Text>
              <Text fontSize="0.85rem" fontWeight="black" lineHeight={1} color={s.accent ?? 'white'}>
                {s.value}
              </Text>
            </Box>
          ))}
        </Grid>
      </Box>
    )}
  </Box>
);
