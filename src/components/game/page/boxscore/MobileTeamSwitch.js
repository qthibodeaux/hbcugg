import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { teamAccent, teamLogo, teamShort } from "../../export/exportData";

// Phone-only header for each Player Stats unit (passing, rushing, defense,
// special teams): the unit's name, then two flush halves, away | home, the
// shown team lit with its color. The unit renders one team block under it.
export const MobileTeamSwitch = ({ title, awayId, homeId, value, onChange }) => (
  <Box>
    {title ? (
      <Flex align="center" gap="0.5rem" px="0.75rem" pt="0.85rem" pb="0.6rem">
        <Box w="0.4rem" h="0.4rem" bg={teamAccent(value)} borderRadius="full" flexShrink={0} />
        <Text fontSize="0.8rem" fontWeight="black" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.14em">{title}</Text>
      </Flex>
    ) : null}
  <Grid templateColumns="repeat(2, minmax(0, 1fr))" borderBottom="1px solid" borderColor="whiteAlpha.100">
    {[awayId, homeId].map((id) => {
      const on = id === value;
      const color = teamAccent(id);
      return (
        <Box
          key={id}
          as="button"
          type="button"
          onClick={() => onChange(id)}
          py="0.6rem"
          bg={on ? "whiteAlpha.100" : "rgba(0,0,0,0.3)"}
          borderBottom="3px solid"
          borderColor={on ? color : "transparent"}
        >
          <Flex align="center" justify="center" gap="0.45rem">
            <Image src={teamLogo(id)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" opacity={on ? 1 : 0.5} />
            <Text fontSize="0.85rem" fontWeight="black" color={on ? "white" : "whiteAlpha.500"} textTransform="uppercase" letterSpacing="0.06em">
              {teamShort(id)}
            </Text>
          </Flex>
        </Box>
      );
    })}
  </Grid>
  </Box>
);

export default MobileTeamSwitch;
