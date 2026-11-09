import { Box, Grid, Image, Text, Flex } from "@chakra-ui/react";

// Mobile team logo selector and selected-team stat panel.

export const MobilePicker = ({ teams, team, teamId, row, stats, season, onChange }) => (
  <Box bg="#0B0B0D">
    <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap={0}>
      {teams.map((t) => {
        const isSelected = t.id === teamId;
        return (
          <Box
            key={t.id}
            as="button"
            type="button"
            aria-label={t.name}
            aria-pressed={isSelected}
            aspectRatio="1"
            bg={isSelected ? t.primary : "rgba(255,255,255,0.07)"}
            border="1px solid"
            borderColor={isSelected ? t.secondary : "rgba(255,255,255,0.1)"}
            borderBottomWidth="0.2rem"
            borderBottomColor={t.primary}
            onClick={() => onChange(isSelected ? null : t.id)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="0.4rem"
          >
            {t.logo
              ? <Image src={t.logo} alt={t.name} w="72%" h="72%" objectFit="contain" />
              : <Text fontSize="0.7rem" fontWeight="black" color="whiteAlpha.800">{t.short}</Text>}
          </Box>
        );
      })}
    </Grid>

    {team && (
      <Box borderTop="0.25rem solid" borderColor={team.identity.primary} bg="#141416">
        <Flex align="center" gap="0.75rem" px="0.75rem" py="0.7rem">
          <Box flex={1} minW={0}>
            <Text fontSize="1.5rem" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.02em" lineClamp={2}>
              {team.identity.name}
            </Text>
            <Text fontSize="0.7rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.14em" mt="0.3rem">
              {team.identity.conference} {team.identity.division} · {season}
            </Text>
          </Box>
          {team.identity.logo && <Image src={team.identity.logo} alt="" w="3rem" h="3rem" objectFit="contain" flexShrink={0} />}
        </Flex>

        {row ? (
          <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="1px" bg="whiteAlpha.100" borderTop="1px solid" borderColor="whiteAlpha.100">
            {stats.map((s) => (
              <Flex key={s.label} direction="column" justify="center" minW={0} px="0.6rem" py="0.65rem" style={{ background: `linear-gradient(${s.fill}, ${s.fill}), #141416` }}>
                <Text fontSize="0.62rem" fontWeight="black" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1} mb="0.3rem">
                  {s.label}
                </Text>
                <Text fontSize="1.45rem" fontWeight="black" lineHeight={1} color="white" fontVariantNumeric="tabular-nums" lineClamp={1}>
                  {s.value}
                </Text>
                {s.sub && (
                  <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.800" letterSpacing="0.04em" mt="0.25rem" lineClamp={1} fontVariantNumeric="tabular-nums">
                    {s.sub}
                  </Text>
                )}
              </Flex>
            ))}
          </Grid>
        ) : (
          <Text fontSize="0.85rem" color="whiteAlpha.500" px="0.75rem" pb="0.75rem">—</Text>
        )}
      </Box>
    )}
  </Box>
);
