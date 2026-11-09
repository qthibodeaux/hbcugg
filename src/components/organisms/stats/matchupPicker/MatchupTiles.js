import { Text, Box, Image, Flex, Grid } from "@chakra-ui/react";

const Kicker = ({ children, color = "text.muted", ...rest }) => (
  <Text fontSize="9px" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.13em" lineClamp={1} {...rest}>
    {children}
  </Text>
);

export const LEAGUE_ID = "__league";

export const TeamTile = ({ team, active, disabled, onClick }) => (
  <Box
    as="button"
    type="button"
    aria-label={team.name}
    aria-pressed={active}
    onClick={onClick}
    aspectRatio="1"
    minW={0}
    bg={active ? team.primary ?? "whiteAlpha.300" : "rgba(255,255,255,0.05)"}
    border="1px solid"
    borderColor={active ? team.secondary ?? "whiteAlpha.400" : "rgba(255,255,255,0.08)"}
    borderBottomWidth="0.2rem"
    borderBottomColor={team.primary ?? "whiteAlpha.400"}
    display="flex"
    alignItems="center"
    justifyContent="center"
    p="0.35rem"
    opacity={disabled ? 0.35 : 1}
    transition="background 0.15s, border-color 0.15s"
    _hover={{ bg: active ? team.primary ?? "whiteAlpha.300" : "rgba(255,255,255,0.12)" }}
  >
    {team.logo ? (
      <Image src={team.logo} alt="" w="74%" h="74%" objectFit="contain" />
    ) : (
      <Text fontSize="10px" fontWeight="black" color="white">{team.short}</Text>
    )}
  </Box>
);

export const Slot = ({ label, teams, value, other, onChange, accent }) => {
  const picked = teams.find((t) => t.id === value) ?? null;
  return (
    <Box flex="1" minW={0}>
      <Flex align="center" justify="space-between" gap={2} mb={2} minW={0}>
        <Kicker color={accent}>{label}</Kicker>
        <Flex align="center" gap={2} minW={0}>
          {picked?.logo && <Image src={picked.logo} alt="" w="16px" h="16px" objectFit="contain" />}
          <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>
            {picked?.name ?? "—"}
          </Text>
        </Flex>
      </Flex>

      <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap="1px" bg="whiteAlpha.100" borderRadius="md" overflow="hidden">
        {teams.map((t) => (
          <TeamTile key={t.id} team={t} active={t.id === value} disabled={t.id === other} onClick={() => onChange(t.id)} />
        ))}
      </Grid>

      <Box
        as="button"
        type="button"
        w="100%"
        mt="1px"
        py={2.5}
        borderRadius="md"
        bg={value === LEAGUE_ID ? "brand.500" : "whiteAlpha.100"}
        _hover={{ bg: value === LEAGUE_ID ? "brand.500" : "whiteAlpha.200" }}
        onClick={() => onChange(LEAGUE_ID)}
        transition="background 0.15s"
      >
        <Text fontSize="0.62rem" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em" color={value === LEAGUE_ID ? "white" : "whiteAlpha.600"}>
          League Average · 18
        </Text>
      </Box>
    </Box>
  );
};
