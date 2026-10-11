import React from "react";
import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";

export const WikiBannerCopilotMatrix = () => (
  <Box
    w="100%"
    minH="200px"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    position="relative"
    overflow="hidden"
    p={{ base: 8, md: 12 }}
    bg="bg.primary"
  >
    {/* Animated grid dots */}
    <SimpleGrid columns={20} spacing={2} position="absolute" inset={0} zIndex={0}>
      {Array.from({ length: 120 }).map((_, i) => (
        <Box
          key={i}
          w="6px"
          h="6px"
          borderRadius="full"
          bg={i % 7 === 0 ? "brand.500" : "whiteAlpha.100"}
          style={{ animation: `matrixDot 1.8s ${i * 0.03}s infinite alternate` }}
        />
      ))}
    </SimpleGrid>
    <Flex direction="row" align="center" justify="space-between" h="100%" position="relative" zIndex={1}>
      <Flex direction="column" gap={3}>
        <Text fontSize="xs" color="brand.400" fontWeight="black" letterSpacing="0.18em" textTransform="uppercase">
          Schools Wiki
        </Text>
        <TypewriterHeadline />
        <Text fontSize="md" color="text.secondary" maxW="420px">
          Animated grid of data dots, typewriter headline, Copilot tag in the corner.
        </Text>
      </Flex>
      <CopilotMatrixTag />
    </Flex>
    <style>{`
      @keyframes matrixDot {
        0% { opacity: 0.5; transform: scale(1); }
        100% { opacity: 1; transform: scale(1.4); }
      }
    `}</style>
  </Box>
);

const TypewriterHeadline = () => {
  const [text, setText] = React.useState("");
  React.useEffect(() => {
    const full = "Matrix Data Banner";
    let i = 0;
    const timer = setInterval(() => {
      setText(full.slice(0, i + 1));
      i++;
      if (i === full.length) clearInterval(timer);
    }, 60);
    return () => clearInterval(timer);
  }, []);
  return (
    <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.04em">
      {text}
    </Text>
  );
};

export const CopilotMatrixTag = () => (
  <Box
    px={4}
    py={2}
    borderRadius="full"
    bgGradient="linear(to-r, #0A7CFF 0%, #00C2B2 60%, #A259FF 100%)"
    boxShadow="0 2px 8px rgba(10,124,255,0.12)"
    fontSize="xs"
    fontWeight="bold"
    color="white"
    letterSpacing="0.08em"
    textTransform="uppercase"
    style={{ position: "absolute", top: 16, right: 24, filter: "drop-shadow(0 0 12px #0A7CFF)" }}
  >
    GitHub Copilot | GPT-4.1
  </Box>
);
