import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

/**
 * 4x1 Wiki Banner CTA for the Schools Hub.
 */
export const WikiBannerCTA = () => {
  return (
    <Box 
      w="100%" 
      h="100%" 
      bg="brand.500" 
      p={8} 
      position="relative"
      overflow="hidden"
      display="flex" 
      alignItems="center" 
      justifyContent="space-between"
      as={RouterLink} 
      to="/schools/wiki"
      _hover={{ bg: "brand.600", transform: "translateY(-2px)" }}
      transition="all 0.3s ease"
    >
      {/* Background Decor */}
      <Box 
        position="absolute" 
        bottom="-20px" 
        right="-10px" 
        fontSize="120px" 
        fontWeight="black" 
        color="whiteAlpha.100"
        pointerEvents="none"
        userSelect="none"
        lineHeight="1"
      >
        WIKI
      </Box>

      <Flex direction="column" zIndex={1}>
        <Flex align="center" gap={3} mb={1}>
          <Box h="2px" w="20px" bg="white" />
          <Text fontSize="10px" fontWeight="black" color="white" letterSpacing="0.3em" textTransform="uppercase">
            HBCU HERITAGE
          </Text>
        </Flex>
        
        <Text fontSize={{ base: "xl", md: "3xl" }} fontWeight="black" color="white" textTransform="uppercase" lineHeight="1" mb={2}>
          Institutional Records & School Wiki
        </Text>
        <Text fontSize="sm" color="whiteAlpha.800" fontWeight="bold" maxW="450px" lineHeight="1.2">
          Dive into the history, culture, bands, and enrollment records of all 18 HBCU programs.
        </Text>
      </Flex>

      <Box zIndex={1}>
        <Button 
          size="lg" 
          bg="white" 
          color="brand.600" 
          _hover={{ bg: "whiteAlpha.900" }} 
          textTransform="uppercase" 
          fontWeight="black"
          fontSize="xs"
          px={8}
          borderRadius="sm"
          boxShadow="xl"
        >
          Explore Records
        </Button>
      </Box>
    </Box>
  );
};
