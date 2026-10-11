import { Box, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

/**
 * CoachCard - Coach profile card with tier indicators
 * @param {Object} props
 * @param {Object} props.coach - Coach data object
 * @param {string} props.tier - Coach tier ("staff", "coord", "hc")
 */
const CoachCard = ({ coach, tier = "staff" }) => {
  const navigate = useNavigate();
  const isHC = tier === "hc";
  const isCoord = tier === "coord";
  const borderCol = isHC ? "brand.500" : isCoord ? "whiteAlpha.300" : "whiteAlpha.100";
  
  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor={borderCol}
      borderRadius="lg"
      p={isHC ? 5 : 3}
      position="relative"
      cursor="pointer"
      onClick={() => navigate(`/coaches/${coach.person_id}`)}
      _hover={{ borderColor: isHC ? "brand.400" : "whiteAlpha.300", bg: "whiteAlpha.50" }}
      transition="all 0.15s"
    >
      {isHC && (
        <Box
          position="absolute" top={3} right={3}
          bg="brand.500" color="white"
          fontSize="9px" fontWeight="black" letterSpacing="widest"
          px={2} py="2px" borderRadius="full" textTransform="uppercase"
        >
          HC
        </Box>
      )}
      {isCoord && (
        <Box
          position="absolute" top={2} right={2}
          bg="whiteAlpha.200" color="text.secondary"
          fontSize="9px" fontWeight="bold"
          px="6px" py="1px" borderRadius="full" textTransform="uppercase"
        >
          COORD
        </Box>
      )}
      <Text
        fontSize={isHC ? "md" : "sm"}
        fontWeight="bold"
        color="text.primary"
        mb={1}
        pr={isHC || isCoord ? 10 : 0}
        lineClamp={1}
      >
        {coach.name}
      </Text>
      <Text fontSize="xs" color={isHC ? "brand.400" : "text.secondary"} lineHeight="short" lineClamp={2}>
        {coach.title}
      </Text>
    </Box>
  );
};

export default CoachCard;
