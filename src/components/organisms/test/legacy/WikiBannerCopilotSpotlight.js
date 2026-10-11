import { Box, Text, Flex } from "@chakra-ui/react";
import { useRef, useState } from "react";
import CopilotTag from "./WikiCopilotTag";

export const WikiBannerCopilotSpotlight = () => {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef();

  return (
    <Box
      ref={ref}
      w="100%"
      h="100%"
      bg="bg.primary"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      p={{ base: 6, md: 10 }}
      position="relative"
      overflow="hidden"
      onMouseMove={e => {
        const rect = ref.current.getBoundingClientRect();
        setPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
      style={{
        background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(229,62,62,0.18) 0%, transparent 60%)`,
        transition: "background 0.2s",
      }}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Flex direction="column" gap={3} zIndex={1}>
        <Text fontSize="xs" color="brand.400" fontWeight="black" letterSpacing="0.18em" textTransform="uppercase">
          Schools Wiki
        </Text>
        <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.04em">
          Interactive Spotlight Banner
        </Text>
        <Text fontSize="md" color="text.secondary" maxW="420px">
          Mouse-follow spotlight effect highlights key info. Engaging and interactive.
        </Text>
      </Flex>
      <CopilotTag />
    </Box>
  );
};

