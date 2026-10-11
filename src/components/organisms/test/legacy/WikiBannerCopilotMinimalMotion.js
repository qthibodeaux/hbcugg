import { Box, Text, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import CopilotTag from "./WikiCopilotTag";

const MotionBox = motion(Box);

export const WikiBannerCopilotMinimalMotion = () => (
  <MotionBox
    w="100%"
    h="100%"
    bgGradient="linear(to-r, bg.primary 60%, brand.500 100%)"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    p={{ base: 6, md: 10 }}
    position="relative"
    overflow="hidden"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    display="flex"
    alignItems="center"
    justifyContent="space-between"
  >
    <Flex direction="column" gap={3} zIndex={1}>
      <Text fontSize="xs" color="brand.400" fontWeight="black" letterSpacing="0.18em" textTransform="uppercase">
        Schools Wiki
      </Text>
      <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.04em">
        Minimalist Motion Banner
      </Text>
      <Text fontSize="md" color="text.secondary" maxW="420px">
        Clean, animated text reveal with a subtle moving gradient background. Simple, modern, and on-brand.
      </Text>
    </Flex>
    <CopilotTag />
  </MotionBox>
);

