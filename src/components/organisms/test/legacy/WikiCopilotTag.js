import { Box } from "@chakra-ui/react";

// Copilot blue/green: #0A7CFF, #00C2B2; GPT-4.1 purple: #A259FF
export default function CopilotTag() {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      px={3}
      py={1}
      borderRadius="full"
      bgGradient="linear(to-r, #0A7CFF 0%, #00C2B2 60%, #A259FF 100%)"
      boxShadow="0 2px 8px rgba(10,124,255,0.12)"
      ml={4}
      minW="0"
      minH="0"
      fontSize="xs"
      fontWeight="bold"
      color="white"
      letterSpacing="0.08em"
      textTransform="uppercase"
      zIndex={10}
    >
      GitHub Copilot | GPT-4.1
    </Box>
  );
}
