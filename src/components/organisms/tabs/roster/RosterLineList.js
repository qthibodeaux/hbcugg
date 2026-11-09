import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { MOBILE_LINE_COLUMNS, RosterLineRow } from "./RosterLineRow";

export { formatClassYear } from "./RosterLineRow";

export const RosterLineList = ({ groupedRoster = [], team }) => {
  const navigate = useNavigate();
  const primary = team?.colors?.primary ?? "#E53E3E";
  const secondary = team?.colors?.secondary ?? "#F56565";

  return (
    <Flex direction="column" gap={5}>
      {groupedRoster.map((group) => (
        <Box key={group.key}>
          {group.label && (
            <Flex align="center" gap={2.5} mb={2}>
              <Box w="3px" h="1.1rem" bg={primary} borderRadius="full" />
              <Text fontSize="sm" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
                {group.label}
              </Text>
              <Text fontSize="xs" color="text.muted">{group.players.length} players</Text>
            </Flex>
          )}

          <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden" bg="bg.secondary">
            <Flex
              display={{ base: "none", lg: "grid" }}
              gridTemplateColumns="80px 1.7fr 140px 90px 130px 80px 70px 70px"
              px={3}
              py={1.5}
              borderBottom="1px solid"
              borderColor="whiteAlpha.100"
              bg="whiteAlpha.50"
            >
              {["Jersey", "Player", "Hometown", "POS", "HT/WT", "CLS", "XFR", "RS"].map((header) => (
                <Text
                  key={header}
                  fontSize="9px"
                  color="text.muted"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  fontWeight="black"
                >
                  {header}
                </Text>
              ))}
            </Flex>

            {/* Mobile header, matching the row columns */}
            <Grid
              display={{ base: "grid", lg: "none" }}
              templateColumns={MOBILE_LINE_COLUMNS}
              gap={2}
              px={2}
              py={1}
              borderBottom="1px solid"
              borderColor="whiteAlpha.100"
              bg="whiteAlpha.50"
            >
              <Box />
              <Text fontSize="0.62rem" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black">
                Player
              </Text>
              <Text fontSize="0.62rem" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black" textAlign="center">
                CLS
              </Text>
              <Text fontSize="0.62rem" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black" textAlign="center">
                POS
              </Text>
              <Text fontSize="0.62rem" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black" textAlign="right">
                HT/WT
              </Text>
            </Grid>

            {group.players.map((player, index) => (
              <RosterLineRow
                key={player.id || player.person_id || `${group.key}-${index}`}
                player={player}
                index={index}
                primary={primary}
                secondary={secondary}
                navigate={navigate}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Flex>
  );
};
