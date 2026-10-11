import React from "react";
import { Box, Text,  Button, VStack, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

/**
 * WikiTab - Redirect / CTA Tab
 * Now acts as a gateway to the standalone /schools/:id/wiki route.
 */
const WikiTab = ({ team }) => {
  const navigate = useNavigate();
  const wikiUrl = `/schools/${team?.id}/wiki`;

  return (
    <Box 
      h="80vh" 
      bg="bg.secondary" 
      borderRadius="xl" 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      m={4}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Background Texture Overlay */}
      <Box 
        position="absolute"
        top={0} left={0} right={0} bottom={0}
        opacity={0.03}
        bgImage={`url(${team?.logo})`}
        bgSize="50%"
        bgPos="center"
        bgRepeat="no-repeat"
        filter="grayscale(1)"
      />

      <VStack spacing={6} zIndex={2} textAlign="center" maxW="500px" px={8}>
        <Box p={4} borderRadius="full" bg="whiteAlpha.50" border="1px solid" borderColor="brand.500">
          <BookOpen size={48} color="#E53E3E" />
        </Box>
        
        <VStack spacing={2}>
          <Heading size="xl" fontWeight="black" letterSpacing="tighter" color="text.primary">
            THE {team?.name?.toUpperCase()} WIKI
          </Heading>
          <Text color="text.secondary" fontSize="md">
            The complete historical documentation, traditions, and program identity of the {team?.mascot}.
          </Text>
        </VStack>

        <Button
          size="xl"
          bg="brand.500"
          color="white"
          px={10}
          height="60px"
          _hover={{ bg: "brand.600", transform: "translateY(-2px)" }}
          onClick={() => navigate(wikiUrl)}
          transition="all 0.2s"
          fontSize="lg"
          fontWeight="black"
          letterSpacing="widest"
        >
          ENTER IMMERSIVE WIKI
        </Button>

        <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="widest">
            Best experienced in full display mode
        </Text>
      </VStack>
    </Box>
  );
};

export default WikiTab;
