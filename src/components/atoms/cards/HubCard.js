import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * HubCard - Navigation hub card with icon and description
 * @param {Object} props
 * @param {Object} props.hub - Hub configuration object
 */
const HubCard = ({ hub }) => {
  const Icon = hub.icon;
  return (
    <Box
      as={Link}
      to={hub.path}
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="blackAlpha.300"
      p={5}
      _hover={{ borderColor: hub.accent, transform: "translateY(-2px)" }}
      transition="all 0.18s ease"
    >
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${hub.accent}18 0%, transparent 65%)`} />
      <Box position="relative">
        <Flex align="center" justify="space-between" mb={10}>
          <Box>
            <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.14em">
              {hub.eyebrow}
            </Text>
          </Box>
          <Box color={hub.accent}>
            <Icon size={18} />
          </Box>
        </Flex>

        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color="white" textTransform="uppercase" lineHeight={0.95} mb={3}>
          {hub.title}
        </Text>
        <Text fontSize="sm" color="text.secondary" maxW="320px">
          {hub.copy}
        </Text>

        <Flex mt={5} align="center" gap={2} color="white">
          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.1em">
            Open Hub
          </Text>
          <ArrowRight size={13} />
        </Flex>
      </Box>
    </Box>
  );
};

export default HubCard;
