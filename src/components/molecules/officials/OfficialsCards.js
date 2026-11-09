import { Box, Text, Flex } from "@chakra-ui/react";

// Official partner cards and crew-role cards with their existing conference/role labels.

const CONF_LABELS = { meac: "MEAC", swac: "SWAC" };

const CONF_BG = { meac: "#003A63", swac: "#006747" };

const ROLE_ORDER = [
  "REFEREE",
  "UMPIRE",
  "LINESMAN",
  "LINE JUDGE",
  "BACK JUDGE",
  "FIELD JUDGE",
  "SIDE JUDGE",
];

const ROLE_SHORT = {
  REFEREE: "R",
  UMPIRE: "U",
  LINESMAN: "L",
  "LINE JUDGE": "LJ",
  "BACK JUDGE": "BJ",
  "FIELD JUDGE": "FJ",
  "SIDE JUDGE": "SJ",
};

export const OfficialCard = ({ official }) => {
  const confs = official.conference_affiliations ?? [];
  const partners =
    official.crew_analytics?.frequent_crew_partners?.slice(0, 3) ?? [];

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      p={4}
      _hover={{ borderColor: "whiteAlpha.200" }}
      transition="border-color 0.15s"
    >
      <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={2}>
        {official.name}
      </Text>
      <Flex gap={2} mb={3} flexWrap="wrap">
        {confs.map((c) => (
          <Box
            key={c}
            px={2}
            py="1px"
            borderRadius="full"
            fontSize="9px"
            fontWeight="black"
            letterSpacing="widest"
            textTransform="uppercase"
            color="white"
            bg={CONF_BG[c] ?? "whiteAlpha.300"}
          >
            {CONF_LABELS[c] ?? c.toUpperCase()}
          </Box>
        ))}
      </Flex>
      {partners.length > 0 && (
        <Box>
          <Text
            fontSize="9px"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="widest"
            mb={1}
          >
            Frequent partners
          </Text>
          {partners.map((p) => (
            <Text key={p.person_id} fontSize="xs" color="text.secondary">
              {p.name}
              <Box as="span" color="text.muted">
                {" "}
                · {p.games_together}g
              </Box>
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

export const CrewCard = ({ crew, officialsById }) => {
  const sorted = [...crew.officials].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
  );

  // Derive a readable game label from crew_id like "meachuswacfamu2025"
  const gameLabel = crew.game_id?.replace(/(\d{4})$/, " '$1") ?? crew.crew_id;

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      p={4}
    >
      <Text
        fontSize="xs"
        color="brand.400"
        fontWeight="bold"
        letterSpacing="widest"
        textTransform="uppercase"
        mb={3}
      >
        {gameLabel}
      </Text>
      <Flex direction="column" gap={2}>
        {sorted.map((slot) => {
          const off = officialsById[slot.person_id];
          return (
            <Flex key={slot.person_id} align="center" gap={2}>
              <Box
                w={7}
                h={7}
                borderRadius="md"
                bg="whiteAlpha.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="9px"
                fontWeight="black"
                color="text.muted"
                flexShrink={0}
              >
                {ROLE_SHORT[slot.role] ?? "?"}
              </Box>
              <Box flex={1} minW={0}>
                <Text
                  fontSize="xs"
                  fontWeight="medium"
                  color="text.primary"
                  lineClamp={1}
                >
                  {off?.name ?? slot.person_id}
                </Text>
                <Text fontSize="10px" color="text.muted">
                  {slot.role}
                </Text>
              </Box>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
