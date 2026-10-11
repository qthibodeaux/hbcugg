import { Box, Flex, Text } from "@chakra-ui/react";
import ZoneGrid from "../../atoms/charts/ZoneGrid";

/**
 * FieldZoneRatings - Field zone ratings with section header
 * @param {Object} props
 * @param {number} props.parScore - Player PAR score
 */
const FieldZoneRatings = ({ parScore }) => {
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <Flex align="center" gap={2} mb={4}>
        <Box w="3px" h="16px" bg="brand.500" borderRadius="full" />
        <Text fontSize="xs" fontWeight="bold" color="white" textTransform="uppercase" letterSpacing="0.1em">
          Field Zone Ratings
        </Text>
      </Flex>
      <ZoneGrid parScore={parScore} />
    </Box>
  );
};

export default FieldZoneRatings;
