import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const WikiBannerShell = ({ children, ...props }) => (
  <Box
    as={RouterLink}
    to="/schools/wiki"
    w="100%"
    h="100%"
    position="relative"
    overflow="hidden"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="2xl"
    transition="all 0.25s ease"
    _hover={{ transform: "translateY(-2px)", borderColor: "brand.400" }}
    {...props}
  >
    {children}
  </Box>
);

const WikiCTAButton = ({ children = "Explore Records" }) => (
  <Button
    bg="white"
    color="brand.600"
    fontSize="xs"
    fontWeight="black"
    textTransform="uppercase"
    letterSpacing="0.14em"
    px={8}
    py={6}
    borderRadius="sm"
    boxShadow="xl"
    _hover={{ bg: "whiteAlpha.900" }}
  >
    {children}
  </Button>
);

const WikiMetaChip = ({ children, accentColor = "whiteAlpha.700" }) => (
  <Badge
    variant="outline"
    borderColor="whiteAlpha.200"
    color={accentColor}
    fontSize="9px"
    fontWeight="black"
    letterSpacing="0.16em"
    textTransform="uppercase"
    px={3}
    py={1.5}
    borderRadius="full"
    bg="whiteAlpha.50"
  >
    {children}
  </Badge>
);

export const WikiBannerMonograph = () => (
  <WikiBannerShell
    bg="linear-gradient(135deg, rgba(11,11,13,0.96) 0%, rgba(20,20,22,0.94) 48%, rgba(229,62,62,0.18) 100%)"
    p={{ base: 6, md: 8 }}
  >
    <Box
      position="absolute"
      inset={0}
      bg="radial-gradient(circle at 15% 15%, rgba(229,62,62,0.18), transparent 32%), radial-gradient(circle at 85% 85%, rgba(246,173,85,0.10), transparent 28%)"
    />
    <Box
      position="absolute"
      inset={0}
      bgImage="linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)"
      bgSize="24px 24px"
      opacity={0.5}
    />
    <Flex
      position="relative"
      zIndex={1}
      h="full"
      align="stretch"
      justify="space-between"
      gap={6}
    >
      <Flex direction="column" justify="space-between" minW="0" maxW="760px">
        <Stack gap={4}>
          <Flex align="center" gap={3}>
            <Box
              w="18px"
              h="18px"
              borderRadius="full"
              bg="brand.500"
              boxShadow="0 0 24px rgba(229,62,62,0.5)"
            />
            <Text
              fontSize="10px"
              fontWeight="black"
              color="whiteAlpha.700"
              letterSpacing="0.32em"
              textTransform="uppercase"
            >
              Schools Wiki / Archive Atlas
            </Text>
          </Flex>
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            lineHeight="0.92"
            letterSpacing="-0.05em"
            maxW="14ch"
          >
            Institutional Records, bands, and campus context.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            color="text.secondary"
            maxW="560px"
            lineHeight="1.45"
          >
            A reference point for every program on the board: history,
            traditions, enrollment, geography, and the details that make each
            school distinct.
          </Text>
        </Stack>

        <HStack gap={2} wrap="wrap" mt={6}>
          <WikiMetaChip accentColor="white">18 Programs</WikiMetaChip>
          <WikiMetaChip accentColor="whiteAlpha.800">
            Bands + Traditions
          </WikiMetaChip>
          <WikiMetaChip accentColor="whiteAlpha.800">
            Enrollment Data
          </WikiMetaChip>
        </HStack>
      </Flex>

      <Flex
        direction="column"
        justify="space-between"
        align="flex-end"
        flexShrink={0}
        gap={4}
      >
        <Box textAlign="right">
          <Text
            fontSize="10px"
            fontWeight="black"
            color="brand.400"
            letterSpacing="0.26em"
            textTransform="uppercase"
            mb={2}
          >
            HBCU Heritage
          </Text>
          <Box position="relative">
            <Text
              fontSize={{ base: "72px", md: "112px" }}
              fontWeight="black"
              color="whiteAlpha.100"
              lineHeight="0.85"
              letterSpacing="-0.06em"
            >
              WIKI
            </Text>
            <Text
              position="absolute"
              right={0}
              bottom={1}
              fontSize="xs"
              fontWeight="black"
              color="whiteAlpha.700"
              letterSpacing="0.18em"
              textTransform="uppercase"
            >
              Open the archive
            </Text>
          </Box>
        </Box>
        <WikiCTAButton />
      </Flex>
    </Flex>
  </WikiBannerShell>
);

export const WikiBannerBlueprint = () => (
  <WikiBannerShell bg="bg.secondary" p={0}>
    <Flex h="full" minH="100%" direction={{ base: "column", md: "row" }}>
      <Box
        flex={{ base: "none", md: "0 0 32%" }}
        position="relative"
        bg="linear-gradient(180deg, rgba(229,62,62,0.98) 0%, rgba(20,20,22,0.98) 100%)"
        px={6}
        py={8}
      >
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 40%)"
        />
        <Text
          position="relative"
          zIndex={1}
          fontSize="10px"
          fontWeight="black"
          color="white"
          letterSpacing="0.30em"
          textTransform="uppercase"
          mb={4}
        >
          School Wiki
        </Text>
        <Text
          position="relative"
          zIndex={1}
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight="0.94"
          letterSpacing="-0.05em"
        >
          Blueprint
        </Text>
        <Text
          position="relative"
          zIndex={1}
          mt={3}
          fontSize="sm"
          color="whiteAlpha.800"
          maxW="220px"
          fontWeight="bold"
        >
          A clean entry point to the institutional record stack.
        </Text>
      </Box>

      <Flex
        flex={1}
        align="center"
        justify="space-between"
        gap={6}
        px={{ base: 6, md: 8 }}
        py={{ base: 6, md: 8 }}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          right="-10px"
          top="-28px"
          fontSize={{ base: "120px", md: "170px" }}
          fontWeight="black"
          color="whiteAlpha.050"
          lineHeight="1"
          pointerEvents="none"
          userSelect="none"
        >
          ARCHIVE
        </Box>
        <Stack gap={3} maxW="620px" position="relative" zIndex={1}>
          <Text
            fontSize="xs"
            fontWeight="black"
            color="text.muted"
            letterSpacing="0.22em"
            textTransform="uppercase"
          >
            Bands / Enrollment / Locations / Traditions
          </Text>
          <Text
            fontSize={{ base: "xl", md: "3xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            lineHeight="1.0"
            letterSpacing="-0.04em"
          >
            Fast access to the Schools archive, built like a broadcast command
            card.
          </Text>
          <Text
            fontSize="sm"
            color="text.secondary"
            maxW="520px"
            lineHeight="1.45"
          >
            Use this when the hub needs a more technical, reference-driven tone
            while staying on-brand.
          </Text>
          <HStack gap={2} wrap="wrap" pt={1}>
            <WikiMetaChip accentColor="brand.400">Records</WikiMetaChip>
            <WikiMetaChip accentColor="brand.400">Locations</WikiMetaChip>
            <WikiMetaChip accentColor="brand.400">Bands</WikiMetaChip>
          </HStack>
        </Stack>
        <Box position="relative" zIndex={1} flexShrink={0}>
          <WikiCTAButton />
        </Box>
      </Flex>
    </Flex>
  </WikiBannerShell>
);

export const WikiBannerBroadcast = () => (
  <WikiBannerShell
    bg="linear-gradient(135deg, rgba(11,11,13,0.98) 0%, rgba(20,20,22,0.96) 70%, rgba(229,62,62,0.12) 100%)"
    p={{ base: 6, md: 8 }}
  >
    <Box
      position="absolute"
      inset={0}
      bg="radial-gradient(circle at top right, rgba(229,62,62,0.20), transparent 36%), radial-gradient(circle at bottom left, rgba(255,255,255,0.06), transparent 28%)"
    />
    <Box
      position="absolute"
      insetX={0}
      top="22px"
      h="1px"
      bg="linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 25%, rgba(229,62,62,0.42) 50%, rgba(255,255,255,0.16) 75%, transparent 100%)"
    />
    <Flex
      position="relative"
      zIndex={1}
      h="full"
      align="center"
      justify="space-between"
      gap={6}
    >
      <Flex direction="column" justify="space-between" minW="0" maxW="700px">
        <Stack gap={3}>
          <Text
            fontSize="10px"
            fontWeight="black"
            color="whiteAlpha.600"
            letterSpacing="0.34em"
            textTransform="uppercase"
          >
            Broadcast Archive
          </Text>
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            lineHeight="0.92"
            letterSpacing="-0.05em"
          >
            The school wiki, presented like a live desk graphic.
          </Text>
          <Text
            fontSize="sm"
            color="text.secondary"
            maxW="530px"
            lineHeight="1.45"
          >
            A more cinematic treatment with an editorial headline, compact
            metadata, and a clear call-to-action.
          </Text>
        </Stack>

        <HStack gap={2} wrap="wrap" mt={6}>
          <WikiMetaChip accentColor="white">History</WikiMetaChip>
          <WikiMetaChip accentColor="white">Culture</WikiMetaChip>
          <WikiMetaChip accentColor="white">Campus</WikiMetaChip>
        </HStack>
      </Flex>

      <Flex
        direction="column"
        align="flex-end"
        justify="space-between"
        flexShrink={0}
        gap={4}
      >
        <Box textAlign="right">
          <Text
            fontSize="10px"
            fontWeight="black"
            color="brand.400"
            letterSpacing="0.26em"
            textTransform="uppercase"
            mb={2}
          >
            18 Programs / 1 Archive
          </Text>
          <Text
            fontSize={{ base: "72px", md: "108px" }}
            fontWeight="black"
            fontStyle="italic"
            color="whiteAlpha.100"
            lineHeight="0.85"
            letterSpacing="-0.08em"
          >
            WIKI
          </Text>
        </Box>
        <WikiCTAButton />
      </Flex>
    </Flex>
  </WikiBannerShell>
);

export const WikiBannerCampusHeritage = () => (
  <WikiBannerShell
    bg="linear-gradient(135deg, rgba(11,11,13,0.97) 0%, rgba(26,26,29,0.95) 45%, rgba(229,62,62,0.08) 100%)"
    p={{ base: 6, md: 8 }}
  >
    <Box
      position="absolute"
      inset={0}
      bg="radial-gradient(circle at 25% 75%, rgba(229,62,62,0.15), transparent 40%), radial-gradient(circle at 75% 25%, rgba(246,173,85,0.08), transparent 35%)"
    />
    <Box
      position="absolute"
      inset={0}
      bgImage="linear-gradient(rgba(255,255,255,0.020) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.020) 1px, transparent 1px)"
      bgSize="32px 32px"
      opacity={0.4}
    />
    <Flex
      position="relative"
      zIndex={1}
      h="full"
      align="center"
      justify="space-between"
      gap={6}
    >
      <Flex direction="column" justify="space-between" minW="0" maxW="680px">
        <Stack gap={4}>
          <Flex align="center" gap={3}>
            <Box
              w="16px"
              h="16px"
              borderRadius="full"
              bg="brand.500"
              boxShadow="0 0 20px rgba(229,62,62,0.4)"
            />
            <Text
              fontSize="10px"
              fontWeight="black"
              color="whiteAlpha.700"
              letterSpacing="0.28em"
              textTransform="uppercase"
            >
              Campus Geography & Locations
            </Text>
          </Flex>
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            lineHeight="0.92"
            letterSpacing="-0.04em"
          >
            From the Bayou to the Beltline.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            color="text.secondary"
            maxW="580px"
            lineHeight="1.45"
          >
            Explore the physical landscapes of HBCU football: campus maps,
            regional contexts, and the geographic stories that shape each
            program's identity.
          </Text>
        </Stack>

        <HStack gap={2} wrap="wrap" mt={6}>
          <WikiMetaChip accentColor="white">18 Locations</WikiMetaChip>
          <WikiMetaChip accentColor="whiteAlpha.800">
            Regional Maps
          </WikiMetaChip>
          <WikiMetaChip accentColor="whiteAlpha.800">Campus Tours</WikiMetaChip>
        </HStack>
      </Flex>

      <Flex
        direction="column"
        align="flex-end"
        justify="space-between"
        flexShrink={0}
        gap={4}
      >
        <Box textAlign="right">
          <Text
            fontSize="10px"
            fontWeight="black"
            color="brand.400"
            letterSpacing="0.24em"
            textTransform="uppercase"
            mb={2}
          >
            Geographic Archive
          </Text>
          <Box position="relative">
            <Text
              fontSize={{ base: "68px", md: "104px" }}
              fontWeight="black"
              color="whiteAlpha.100"
              lineHeight="0.85"
              letterSpacing="-0.06em"
            >
              CAMPUS
            </Text>
            <Text
              position="absolute"
              right={0}
              bottom={1}
              fontSize="xs"
              fontWeight="black"
              color="whiteAlpha.700"
              letterSpacing="0.16em"
              textTransform="uppercase"
            >
              Explore locations
            </Text>
          </Box>
        </Box>
        <WikiCTAButton />
      </Flex>
    </Flex>
  </WikiBannerShell>
);

export const WikiBannerTraditionsShowcase = () => (
  <WikiBannerShell
    bg="linear-gradient(135deg, rgba(11,11,13,0.98) 0%, rgba(20,20,22,0.96) 60%, rgba(229,62,62,0.15) 100%)"
    p={{ base: 6, md: 8 }}
  >
    <Box
      position="absolute"
      inset={0}
      bg="radial-gradient(circle at center, rgba(229,62,62,0.18), transparent 45%), radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 30%)"
    />
    <Box
      position="absolute"
      inset={0}
      bg="conic-gradient(from 45deg at 20% 80%, rgba(229,62,62,0.12) 0deg, transparent 60deg, rgba(229,62,62,0.12) 120deg, transparent 180deg, rgba(229,62,62,0.12) 240deg, transparent 300deg, rgba(229,62,62,0.12) 360deg)"
      opacity={0.6}
    />
    <Flex
      position="relative"
      zIndex={1}
      h="full"
      align="center"
      justify="space-between"
      gap={6}
    >
      <Flex direction="column" justify="space-between" minW="0" maxW="720px">
        <Stack gap={4}>
          <Flex align="center" gap={3}>
            <Box
              w="20px"
              h="20px"
              borderRadius="full"
              bg="brand.500"
              boxShadow="0 0 28px rgba(229,62,62,0.5)"
            />
            <Text
              fontSize="10px"
              fontWeight="black"
              color="whiteAlpha.700"
              letterSpacing="0.32em"
              textTransform="uppercase"
            >
              Bands, Culture & School Spirit
            </Text>
          </Flex>
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            lineHeight="0.92"
            letterSpacing="-0.05em"
          >
            The *sound* of HBCU tradition.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            color="text.secondary"
            maxW="600px"
            lineHeight="1.45"
          >
            Experience the heartbeat of HBCU culture: legendary marching bands,
            time-honored traditions, rivalries, and the unique spirit that
            defines each institution.
          </Text>
        </Stack>

        <HStack gap={2} wrap="wrap" mt={6}>
          <WikiMetaChip accentColor="white">Marching Bands</WikiMetaChip>
          <WikiMetaChip accentColor="whiteAlpha.800">Rivalries</WikiMetaChip>
          <WikiMetaChip accentColor="whiteAlpha.800">Traditions</WikiMetaChip>
        </HStack>
      </Flex>

      <Flex
        direction="column"
        align="flex-end"
        justify="space-between"
        flexShrink={0}
        gap={4}
      >
        <Box textAlign="right">
          <Text
            fontSize="10px"
            fontWeight="black"
            color="brand.400"
            letterSpacing="0.26em"
            textTransform="uppercase"
            mb={2}
          >
            Cultural Heritage
          </Text>
          <Box position="relative">
            <Text
              fontSize={{ base: "76px", md: "112px" }}
              fontWeight="black"
              fontStyle="italic"
              color="whiteAlpha.100"
              lineHeight="0.85"
              letterSpacing="-0.08em"
            >
              SPIRIT
            </Text>
            <Text
              position="absolute"
              right={0}
              bottom={1}
              fontSize="xs"
              fontWeight="black"
              color="whiteAlpha.700"
              letterSpacing="0.18em"
              textTransform="uppercase"
            >
              Feel the tradition
            </Text>
          </Box>
        </Box>
        <WikiCTAButton />
      </Flex>
    </Flex>
  </WikiBannerShell>
);

export const WikiBannerDataArchive = () => (
  <WikiBannerShell bg="bg.secondary" p={0}>
    <Flex h="full" minH="100%" direction={{ base: "column", md: "row" }}>
      <Box
        flex={{ base: "none", md: "0 0 28%" }}
        position="relative"
        bg="linear-gradient(180deg, rgba(229,62,62,0.95) 0%, rgba(20,20,22,0.98) 100%)"
        px={6}
        py={8}
      >
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%)"
        />
        <Box
          position="absolute"
          inset={0}
          bgImage="repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 16px)"
        />
        <Text
          position="relative"
          zIndex={1}
          fontSize="10px"
          fontWeight="black"
          color="white"
          letterSpacing="0.30em"
          textTransform="uppercase"
          mb={4}
        >
          Data Archive
        </Text>
        <Text
          position="relative"
          zIndex={1}
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight="0.94"
          letterSpacing="-0.05em"
        >
          Analytics
        </Text>
        <Text
          position="relative"
          zIndex={1}
          mt={3}
          fontSize="sm"
          color="whiteAlpha.800"
          maxW="200px"
          fontWeight="bold"
        >
          Enrollment, funding, and institutional metrics.
        </Text>
      </Box>

      <Flex
        flex={1}
        align="center"
        justify="space-between"
        gap={6}
        px={{ base: 6, md: 8 }}
        py={{ base: 6, md: 8 }}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          right="-8px"
          top="-24px"
          fontSize={{ base: "110px", md: "160px" }}
          fontWeight="black"
          color="whiteAlpha.040"
          lineHeight="1"
          pointerEvents="none"
          userSelect="none"
        >
          METRICS
        </Box>
        <Stack gap={3} maxW="600px" position="relative" zIndex={1}>
          <Text
            fontSize="xs"
            fontWeight="black"
            color="text.muted"
            letterSpacing="0.20em"
            textTransform="uppercase"
          >
            Enrollment / Funding / Rankings / Performance
          </Text>
          <Text
            fontSize={{ base: "xl", md: "3xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            lineHeight="1.0"
            letterSpacing="-0.04em"
          >
            Institutional data presented with analytical clarity.
          </Text>
          <Text
            fontSize="sm"
            color="text.secondary"
            maxW="500px"
            lineHeight="1.45"
          >
            Comprehensive metrics database covering enrollment trends, athletic
            budgets, academic rankings, and performance indicators for all 18
            HBCU programs.
          </Text>
          <HStack gap={2} wrap="wrap" pt={1}>
            <WikiMetaChip accentColor="brand.400">Enrollment</WikiMetaChip>
            <WikiMetaChip accentColor="brand.400">Funding</WikiMetaChip>
            <WikiMetaChip accentColor="brand.400">Rankings</WikiMetaChip>
          </HStack>
        </Stack>
        <Box position="relative" zIndex={1} flexShrink={0}>
          <WikiCTAButton />
        </Box>
      </Flex>
    </Flex>
  </WikiBannerShell>
);

export const WikiBannerLegacyPortal = () => (
  <WikiBannerShell
    bg="linear-gradient(135deg, rgba(11,11,13,0.99) 0%, rgba(20,20,22,0.97) 50%, rgba(229,62,62,0.10) 100%)"
    p={{ base: 6, md: 8 }}
  >
    <Box
      position="absolute"
      inset={0}
      bg="radial-gradient(ellipse at top left, rgba(229,62,62,0.22), transparent 50%), radial-gradient(ellipse at bottom right, rgba(255,255,255,0.04), transparent 40%)"
    />
    <Box
      position="absolute"
      inset={0}
      bg="linear-gradient(45deg, transparent 48%, rgba(229,62,62,0.08) 50%, transparent 52%)"
    />
    <Flex
      position="relative"
      zIndex={1}
      h="full"
      align="center"
      justify="space-between"
      gap={6}
    >
      <Flex direction="column" justify="space-between" minW="0" maxW="680px">
        <Stack gap={4}>
          <Flex align="center" gap={3}>
            <Box
              w="16px"
              h="16px"
              borderRadius="full"
              bg="brand.500"
              boxShadow="0 0 24px rgba(229,62,62,0.6)"
            />
            <Text
              fontSize="10px"
              fontWeight="black"
              color="whiteAlpha.700"
              letterSpacing="0.30em"
              textTransform="uppercase"
            >
              Historical Records & Institutional Memory
            </Text>
          </Flex>
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            lineHeight="0.92"
            letterSpacing="-0.05em"
          >
            Where *legacy* lives forever.
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            color="text.secondary"
            maxW="580px"
            lineHeight="1.45"
          >
            A comprehensive archive of HBCU institutional history: founding
            dates, notable alumni, championship moments, and the enduring legacy
            of each program's contribution to football culture.
          </Text>
        </Stack>

        <HStack gap={2} wrap="wrap" mt={6}>
          <WikiMetaChip accentColor="white">Founding History</WikiMetaChip>
          <WikiMetaChip accentColor="whiteAlpha.800">
            Notable Alumni
          </WikiMetaChip>
          <WikiMetaChip accentColor="whiteAlpha.800">
            Championships
          </WikiMetaChip>
        </HStack>
      </Flex>

      <Flex
        direction="column"
        align="flex-end"
        justify="space-between"
        flexShrink={0}
        gap={4}
      >
        <Box textAlign="right">
          <Text
            fontSize="10px"
            fontWeight="black"
            color="brand.400"
            letterSpacing="0.26em"
            textTransform="uppercase"
            mb={2}
          >
            Institutional Archive
          </Text>
          <Box position="relative">
            <Text
              fontSize={{ base: "72px", md: "108px" }}
              fontWeight="black"
              color="whiteAlpha.100"
              lineHeight="0.85"
              letterSpacing="-0.06em"
            >
              LEGACY
            </Text>
            <Text
              position="absolute"
              right={0}
              bottom={1}
              fontSize="xs"
              fontWeight="black"
              color="whiteAlpha.700"
              letterSpacing="0.18em"
              textTransform="uppercase"
            >
              Open the records
            </Text>
          </Box>
        </Box>
        <WikiCTAButton />
      </Flex>
    </Flex>
  </WikiBannerShell>
);
