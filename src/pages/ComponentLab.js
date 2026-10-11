import React from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import PageShell from "../components/layouts/PageShell";
import { registry } from "../components/organisms/test/componentLabRegistry";

const parseSize = (size = "1x1") => {
  const [c, r] = size.split("x").map(Number);
  return { cols: Number.isNaN(c) ? 1 : c, rows: Number.isNaN(r) ? 1 : r };
};

const LabIntroCard = () => (
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

const LabRegistryList = () => (
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

const LabSlot = ({ entry }) => {
  const Component = entry.component;
  const hideOverlay = entry.hideOverlay === true;

  return (
    <Flex h="100%" minH={0} direction="column" gap={2} position="relative">
      <Flex
        align="center"
        justify="space-between"
        gap={3}
        minH="38px"
        px={3}
        py={2}
        borderRadius="lg"
        bg="rgba(20,20,22,0.96)"
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Flex align="center" gap={2.5} minW={0}>
          <Box
            minW="34px"
            h="22px"
            px={2}
            borderRadius="md"
            bg="brand.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Text fontSize="9px" fontWeight="black" color="white">
              {entry.number}
            </Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
            {entry.name}
          </Text>
        </Flex>
        <Text
          flexShrink={0}
          fontSize="10px"
          color="text.muted"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.12em"
        >
          {entry.size ?? "?x?"} | {entry.agent}
        </Text>
      </Flex>

      {!hideOverlay && (
        <Box position="absolute" top="46px" left={2} zIndex={2} px={2.5} py={1.5} borderRadius="lg" bg="rgba(11,11,13,0.82)" border="1px solid" borderColor="whiteAlpha.200" backdropFilter="blur(8px)" maxW="calc(100% - 16px)">
          <Text fontSize="9px" color="brand.500" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            {String(entry.number).padStart(2, "0")} | {entry.size ?? "?x?"}
          </Text>
          <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>
            {entry.name}
          </Text>
        </Box>
      )}

      <Box flex="1" minH={0} w="100%">
        {Component ? (
          <Component />
        ) : (
          <Flex h="100%" align="center" justify="center">
            <Text fontSize="sm" color="red.400" fontWeight="bold">
              Component missing. Check registry import.
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

const ComponentLab = () => (
  <PageShell listContent={<LabRegistryList />}>
    <PageShell.Slot cols={4}>
      <LabIntroCard />
    </PageShell.Slot>

    {registry.length === 0 ? (
      <PageShell.Slot cols={4}>
        <Box
          h="100%"
          border="1px dashed"
          borderColor="whiteAlpha.200"
          borderRadius="xl"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={6}
          textAlign="center"
        >
          <Text fontSize="sm" color="text.muted">
            No components registered yet. Add entries to `src/components/organisms/test/componentLabRegistry.js`.
          </Text>
        </Box>
      </PageShell.Slot>
    ) : (
      registry.map((entry) => {
        const { cols, rows } = parseSize(entry.size);
        return (
          <PageShell.Slot key={`${entry.number}-${entry.name}`} cols={cols} rows={rows}>
            <LabSlot entry={entry} />
          </PageShell.Slot>
        );
      })
    )}
  </PageShell>
);

export default ComponentLab;
