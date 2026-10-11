import { Box, Text, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import CopilotTag from "./WikiCopilotTag";

const MotionBox = motion(Box);

export const WikiBannerCopilotCardStack = () => {
  // Simple parallax effect for 3 cards
  return (
    <Box
      w="100%"
      h="100%"
      bg="bg.primary"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      p={{ base: 6, md: 10 }}
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Flex direction="column" gap={3} zIndex={1}>
        <Text fontSize="xs" color="brand.400" fontWeight="black" letterSpacing="0.18em" textTransform="uppercase">
          Schools Wiki
        </Text>
        <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.04em">
          Editorial Card Stack Banner
        </Text>
        <Text fontSize="md" color="text.secondary" maxW="420px">
          Layered cards with a parallax animation. Editorial, tactile, and visually rich.
        </Text>
      </Flex>
      <Box position="relative" w="320px" h="120px" display={{ base: "none", md: "block" }}>
        <MotionBox
          position="absolute"
          top="0"
          left="0"
          w="240px"
          h="80px"
          bg="brand.500"
          borderRadius="xl"
          boxShadow="lg"
          zIndex={3}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        />
        <MotionBox
          position="absolute"
          top="20px"
          left="40px"
          w="200px"
          h="60px"
          bg="whiteAlpha.200"
          borderRadius="lg"
          zIndex={2}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <MotionBox
          position="absolute"
          top="40px"
          left="80px"
          w="160px"
          h="40px"
          bg="whiteAlpha.100"
          borderRadius="md"
          zIndex={1}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
      </Box>
      <CopilotTag />
    </Box>
  );
};

