import { Box, Text, Grid, Flex } from "@chakra-ui/react";
import { registry } from "../componentLabRegistry";

export const LabIntroCard = () => (
  <Box
    h="100%"
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="linear-gradient(135deg, rgba(229,62,62,0.18) 0%, rgba(11,11,13,0.96) 62%)"
    px={{ base: 4, lg: 6 }}
    py={{ base: 4, lg: 5 }}
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
  >
    <Box>
      <Text
        fontSize="10px"
        color="brand.500"
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.16em"
        mb={2}
      >
        Development
      </Text>
      <Text
        fontSize="clamp(2rem, 5vw, 4.25rem)"
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        lineHeight={0.88}
        letterSpacing="-0.04em"
      >
        Component{" "}
        <Text as="span" color="brand.500">
          Lab
        </Text>
      </Text>
    </Box>

    <Box>
      <Text fontSize="sm" color="text.secondary" maxW="780px">
        The lab renders components in production-like PageShell slots with visible registry labels above each active variant.
      </Text>
      <Text fontSize="xs" color="text.muted" mt={2}>
        {registry.length} active variant{registry.length !== 1 ? "s" : ""} registered
      </Text>
    </Box>
  </Box>
);

export const LabRegistryList = () => (
  <Grid templateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))" }} gap={3}>
    {registry.map((entry) => (
      <Box
        key={`meta-${entry.number}`}
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        bg="bg.secondary"
        px={4}
        py={3}
      >
        <Flex align="center" gap={3}>
          <Box
            w="24px"
            h="24px"
            borderRadius="md"
            bg="brand.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Text fontSize="9px" fontWeight="black" color="white">
              {String(entry.number).padStart(2, "0")}
            </Text>
          </Box>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="black" color="white" lineClamp={1}>
              {entry.name}
            </Text>
            <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
              {entry.size ?? "?x?"} | {entry.agent} | {entry.date}
            </Text>
          </Box>
        </Flex>
      </Box>
    ))}
  </Grid>
);
