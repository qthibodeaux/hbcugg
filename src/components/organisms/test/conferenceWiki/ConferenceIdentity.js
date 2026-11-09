import { Flex, Box, Text, Circle, Image, SimpleGrid, Grid } from "@chakra-ui/react";
import { Fragment, useState } from "react";
import { Route, Trophy, BookOpen, Quote } from "lucide-react";
import useMountEffect from "../../../../hooks/useMountEffect";
import { Card } from "../../../molecules/wiki/ConferenceWikiCard";
import { Eyebrow, Title, Stat, Chip, HeaderCell, MatrixCell } from "./WikiPrimitives";
import { COMPARISON_IMAGE, SWAC, MEAC, SYSTEM_COMPARISON_ROWS } from "../../../../data/wiki_data";

// Existing implementation extracted along responsibility boundaries.

export const PathDiagram = ({ path, color }) => (
  <Flex align="center" gap={2} mt={3} bg="rgba(0,0,0,0.3)" p={3} borderRadius="6px" border="1px dashed" borderColor="whiteAlpha.200">
    {path.split("->").map((step, i, arr) => (
      <Fragment key={step}>
        <Box>
          <Text fontSize="10px" fontWeight="black" color="white" textTransform="uppercase">
            {step.trim()}
          </Text>
        </Box>
        {i < arr.length - 1 && (
          <Route size={12} color={color} style={{ opacity: 0.5 }} />
        )}
      </Fragment>
    ))}
  </Flex>
);

const TitleCarousel = ({ titles, color }) => {
  const [index, setIndex] = useState(0);

  useMountEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  });

  const current = titles[index];

  return (
    <Box bg="rgba(0,0,0,0.3)" p={2.5} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" mb={2} letterSpacing="0.1em">Historical Power</Text>
      <Flex align="center" gap={3}>
        <Box position="relative">
          <Circle size="32px" bg="whiteAlpha.100" />
          <Image
            src={current.logo}
            boxSize="22px"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            objectFit="contain"
          />
        </Box>
        <Box>
          <Text fontSize="11px" fontWeight="black" color="white" lineClamp={1}>{current.name}</Text>
          <Text fontSize="9px" fontWeight="black" color={color}>{current.count} Conference Titles</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export const ConferencePanel = ({ conf }) => {
  const isSWAC = conf.key === "SWAC";

  return (
    <Card
      accent={conf.colors.primary}
      bg={`linear-gradient(135deg, ${conf.colors.primary}44 0%, rgba(20,20,22,1) 48%, rgba(11,11,13,1) 100%)`}
      position="relative"
      overflow="hidden"
    >
      <Image
        src={conf.logo}
        alt=""
        position="absolute"
        right="-2%"
        top="-5%"
        boxSize="340px"
        opacity={0.07}
        filter="grayscale(1) brightness(1.5)"
        pointerEvents="none"
        zIndex={0}
      />

      <Box h="100%" p={5} position="relative" zIndex={1} display="flex" flexDirection="column">
        {/* TOP ROW: HERO BRANDING */}
        <Flex justify="space-between" align="flex-start" mb={6}>
          <Box>
            <Eyebrow color={conf.colors.secondary}>{conf.name}</Eyebrow>
            <Flex align="center" gap={4} mt={1}>
              <Title size="6xl" lineHeight={1}>{conf.key}</Title>
              <Image src={conf.logo} boxSize="48px" objectFit="contain" />
            </Flex>
            <Text fontSize="11px" fontStyle="italic" color={conf.colors.secondary} fontWeight="black" mt={2} textTransform="uppercase" letterSpacing="0.05em">
              "{conf.slogan}"
            </Text>
          </Box>

          <SimpleGrid columns={2} spacing={10}>
            <Stat label="Programs" value={conf.members.split(" ")[0]} color={conf.colors.secondary} size="xl" />
            <Stat label="Bowl Wins" value={conf.celebrationRecord.split(" ")[0]} color={conf.colors.secondary} size="xl" />
          </SimpleGrid>
        </Flex>

        {/* MIDDLE SECTION: THE CORE CONTENT BENTO */}
        <SimpleGrid columns={3} spacing={6} flex={1}>
          {/* Identity & Mission */}
          <Box gridColumn="span 2">
            <Box bg="whiteAlpha.50" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" backdropFilter="blur(12px)" h="full">
              <Text fontSize="sm" fontWeight="black" color="brand.400" textTransform="uppercase" mb={2} letterSpacing="0.1em">Identity Profile</Text>
              <Text fontSize="md" fontWeight="bold" color="text.primary" lineHeight={1.6}>
                {conf.identity}
              </Text>
              <Text fontSize="sm" color="text.secondary" mt={3} fontStyle="italic">
                {conf.gameStyle}
              </Text>
            </Box>
          </Box>

          {/* Governance & HQ */}
          <Box>
            <Box bg="rgba(0,0,0,0.4)" p={5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" h="full">
              <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={4}>Administration</Text>
              <Stat label="Commissioner" value={conf.commissioner} size="sm" mb={4} />
              <Stat label="Structure" value={isSWAC ? "Divisional" : "Single Table"} size="sm" mb={4} />
              <Box pt={4} borderTop="1px solid" borderColor="whiteAlpha.100">
                <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={1}>HQ Location</Text>
                <Text fontSize="sm" fontWeight="black" color="white">{conf.hq}</Text>
              </Box>
            </Box>
          </Box>

          {/* Footprint: States */}
          <Box>
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={3} letterSpacing="0.1em">Member States</Text>
            <Flex gap={2} flexWrap="wrap">
              {conf.states.map((state) => (
                <Chip key={state} color="white" bg={`${conf.colors.primary}aa`} border="1px solid" borderColor="whiteAlpha.200" px={3} py={1.5} fontSize="10px">
                  {state}
                </Chip>
              ))}
            </Flex>
          </Box>

          {/* Footprint: Market Hubs */}
          <Box gridColumn="span 2">
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={3} letterSpacing="0.1em">Key Market Hubs (Strategic Centers)</Text>
            <SimpleGrid columns={4} spacing={2}>
              {conf.cities.map((city) => (
                <Box key={city} bg="whiteAlpha.50" px={3} py={2} borderRadius="md" border="1px solid" borderColor="whiteAlpha.100">
                  <Text fontSize="10px" color="white" fontWeight="black" textAlign="center">{city}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </SimpleGrid>

        {/* BOTTOM ROW: RECOGNITION */}
        <Flex gap={4} mt={8} align="flex-end">
          <Box flex={1.2}>
            <TitleCarousel titles={conf.titles} color={conf.colors.secondary} />
          </Box>

          <Box flex={1}>
            <Box bg="rgba(0,0,0,0.6)" p={3.5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" position="relative">
              <Trophy size={16} style={{ position: 'absolute', top: 12, right: 12, opacity: 0.3 }} color={conf.colors.secondary} />
              <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" mb={2}>Reigning Champion</Text>
              <Flex align="center" gap={3}>
                <Image src={conf.recentChamp.logo} boxSize="28px" objectFit="contain" />
                <Box>
                  <Text fontSize="11px" fontWeight="black" color="white">{conf.recentChamp.year} Champion</Text>
                  <Text fontSize="14px" fontWeight="black" color={conf.colors.secondary}>{conf.recentChamp.name}</Text>
                </Box>
              </Flex>
            </Box>
          </Box>

          <Box w="120px" bg="whiteAlpha.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" textAlign="center">
            <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" mb={1}>Est.</Text>
            <Text fontSize="2xl" fontWeight="black" color="white" lineHeight={1}>{conf.founded}</Text>
          </Box>
        </Flex>
      </Box>
    </Card>
  );
};

export const ComparisonMatrix = ({ variant = "standard" }) => {
  if (variant === "compact") {
    return <ComparisonMatrixCompact />;
  }

  return <ComparisonMatrixStandard />;
};

const ComparisonMatrixStandard = () => (
  <Card
    accent="#FFD100"
    bg="linear-gradient(90deg, rgba(4,5,7,0.98) 0%, rgba(11,11,13,0.98) 44%, rgba(20,20,22,0.96) 100%)"
  >
    <Grid h="100%" templateColumns={{ base: "0.9fr 2.2fr", xl: "0.8fr 2.35fr" }} overflow="hidden">
      <Box position="relative" overflow="hidden" minW={0}>
        <Image
          src={COMPARISON_IMAGE}
          alt=""
          w="100%"
          h="100%"
          objectFit="cover"
          filter="grayscale(1) contrast(1.15)"
          opacity={0.58}
        />
        <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(0,0,0,0.2), rgba(11,11,13,0.96))" />
        <Box position="absolute" inset={0} bg="linear-gradient(0deg, rgba(111,38,51,0.32), rgba(75,0,130,0.18))" />
        <Text
          position="absolute"
          left="-16px"
          bottom="-10px"
          fontSize="clamp(2.6rem, 6vw, 5.6rem)"
          fontWeight="black"
          color="white"
          opacity={0.08}
          lineHeight={0.8}
          letterSpacing="-0.06em"
        >
          HBCU
        </Text>
      </Box>

      <Box p={{ base: 3, xl: 4 }} minW={0} h="100%" display="flex" flexDirection="column">
        <Flex align="start" justify="space-between" gap={4} mb={2}>
          <Box minW={0}>
            <Title size="xl">Same Fields, Different Systems</Title>
          </Box>
          <BookOpen size={20} color="#A1A1AA" />
        </Flex>

        <Grid
          templateColumns="0.8fr 1.2fr 1.2fr"
          gap={0}
          flex={1}
          minH={0}
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
        >
          <HeaderCell>Field</HeaderCell>
          <HeaderCell color={SWAC.colors.primary}>SWAC</HeaderCell>
          <HeaderCell color={MEAC.colors.secondary}>MEAC</HeaderCell>
          {SYSTEM_COMPARISON_ROWS.map(([field, swac, meac]) => (
            <Fragment key={field}>
              <MatrixCell muted>{field}</MatrixCell>
              <MatrixCell>{swac}</MatrixCell>
              <MatrixCell>{meac}</MatrixCell>
            </Fragment>
          ))}
        </Grid>
      </Box>
    </Grid>
  </Card>
);

const ComparisonMatrixCompact = () => (
  <Card
    accent="#FFD100"
    bg="linear-gradient(90deg, rgba(4,5,7,0.98) 0%, rgba(11,11,13,0.98) 44%, rgba(20,20,22,0.96) 100%)"
  >
    <Grid h="100%" templateColumns="0.85fr 2.4fr" overflow="hidden">
      <Box position="relative" overflow="hidden" minW={0}>
        <Image
          src={COMPARISON_IMAGE}
          alt=""
          w="100%"
          h="100%"
          objectFit="cover"
          filter="grayscale(1) contrast(1.15)"
          opacity={0.5}
        />
        <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(0,0,0,0.18), rgba(11,11,13,0.96))" />
        <Box position="absolute" inset={0} bg="linear-gradient(0deg, rgba(111,38,51,0.34), rgba(75,0,130,0.18))" />
        <Text
          position="absolute"
          left="-14px"
          bottom="-8px"
          fontSize="clamp(2.2rem, 5vw, 4.4rem)"
          fontWeight="black"
          color="white"
          opacity={0.075}
          lineHeight={0.8}
          letterSpacing="-0.06em"
        >
          HBCU
        </Text>
      </Box>

      <Box p={{ base: 2, xl: 3 }} minW={0} h="100%" display="flex" flexDirection="column">
        <Flex align="start" justify="space-between" gap={3} mb={1.5} flexShrink={0}>
          <Text
            fontSize="clamp(1.15rem, 2vw, 1.75rem)"
            color="white"
            fontWeight="black"
            lineHeight={0.84}
            textTransform="uppercase"
            letterSpacing="-0.045em"
            lineClamp={2}
          >
            Same Fields, Different Systems
          </Text>
          <BookOpen size={18} color="#A1A1AA" />
        </Flex>

        <Grid
          templateColumns="0.8fr 1.18fr 1.18fr"
          gap={0}
          flex={1}
          minH={0}
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
        >
          <HeaderCell density="compact">Field</HeaderCell>
          <HeaderCell density="compact" color={SWAC.colors.primary}>SWAC</HeaderCell>
          <HeaderCell density="compact" color={MEAC.colors.secondary}>MEAC</HeaderCell>
          {SYSTEM_COMPARISON_ROWS.map(([field, swac, meac]) => (
            <Fragment key={field}>
              <MatrixCell density="compact" muted>{field}</MatrixCell>
              <MatrixCell density="compact">{swac}</MatrixCell>
              <MatrixCell density="compact">{meac}</MatrixCell>
            </Fragment>
          ))}
        </Grid>
      </Box>
    </Grid>
  </Card>
);

export const ConferenceQuoteCard = ({ variant = "standard" }) => {
  const isCompact = variant === "compact";

  return (
  <Card
    accent="#A855F7"
    bg="radial-gradient(circle at 20% 10%, rgba(255,209,0,0.13), transparent 34%), linear-gradient(145deg, rgba(20,20,22,0.98), rgba(8,8,10,1))"
  >
    <Box h="100%" p={isCompact ? 4 : 5} display="flex" flexDirection="column" justifyContent="center" position="relative" overflow="hidden">
      <Text
        position="absolute"
        right="-12px"
        bottom="-18px"
        fontSize={isCompact ? "72px" : "88px"}
        fontWeight="black"
        color="white"
        opacity={0.035}
        lineHeight={1}
      >
        ATL
      </Text>
      <Quote size={isCompact ? 24 : 28} color="#FFD100" style={{ opacity: 0.72 }} />
      <Text
        mt={isCompact ? 3 : 4}
        fontSize={isCompact ? "clamp(1.08rem, 1.55vw, 1.45rem)" : "clamp(1.2rem, 1.8vw, 1.7rem)"}
        color="white"
        fontWeight="black"
        lineHeight={0.98}
        textTransform="uppercase"
        letterSpacing="-0.04em"
      >
        Two roads to Atlanta. One HBCU football stage.
      </Text>
      <Box h="1px" w="42px" bg="#FFD100" my={isCompact ? 3 : 4} />
      <Text fontSize={isCompact ? "8px" : "9px"} color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" lineClamp={3}>
        SWAC divisions. MEAC table. Celebration Bowl orbit.
      </Text>
    </Box>
  </Card>
  );
};
