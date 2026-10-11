
import React, { Fragment } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { BookOpen } from "lucide-react";
import { SWAC, MEAC, SYSTEM_COMPARISON_ROWS, COMPARISON_IMAGE } from "../../../data/wiki_data";

// ─── Standard Variant ───
function ComparisonMatrixStandard() {
  return (
    <Box
      h="full"
      w="full"
      minW={0}
      overflow="hidden"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(20,20,22,0.96)"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        bg: "#FFD100",
        opacity: 0.9,
      }}
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
          <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(0,0,0,0.18), rgba(11,11,13,0.96))" />
          <Box position="absolute" inset={0} bg="linear-gradient(0deg, rgba(111,38,51,0.34), rgba(75,0,130,0.18))" />
          <Text
            position="absolute"
            left="-14px"
            bottom="-8px"
            fontSize="clamp(2.6rem, 6vw, 5.6rem)"
            fontWeight="black"
            color="white"
            opacity={0.075}
            lineHeight={0.8}
            letterSpacing="-0.06em"
          >
            HBCU
          </Text>
        </Box>
        <Box p={4} minW={0} h="100%" display="flex" flexDirection="column">
          <Flex align="start" justify="space-between" gap={4} mb={2} flexShrink={0}>
            <Text
              fontSize="xl"
              color="white"
              fontWeight="black"
              lineHeight={0.84}
              textTransform="uppercase"
              letterSpacing="-0.045em"
              lineClamp={2}
            >
              Same Fields, Different Systems
            </Text>
            <BookOpen size={20} color="#A1A1AA" />
          </Flex>
          <Box flex={1} minH={0} overflow="hidden" border="1px solid" borderColor="whiteAlpha.100" borderRadius="6px">
            <Grid
              templateColumns="1.2fr 1fr 1fr"
              h="100%"
              templateRows={`repeat(${SYSTEM_COMPARISON_ROWS.length + 1}, minmax(0, 1fr))`}
            >
              <HeaderCell>Comparison Attribute</HeaderCell>
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
        </Box>
      </Grid>
    </Box>
  );
}

// ─── Compact Variant ───
function ComparisonMatrixCompact() {
  return (
    <Box
      h="full"
      w="full"
      minW={0}
      overflow="hidden"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(20,20,22,0.96)"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        bg: "#FFD100",
        opacity: 0.9,
      }}
    >
      <Grid h="100%" templateColumns="0.62fr 2.7fr" overflow="hidden">
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
            fontSize="clamp(1.8rem, 4.4vw, 3.8rem)"
            fontWeight="black"
            color="white"
            opacity={0.075}
            lineHeight={0.8}
            letterSpacing="-0.06em"
          >
            HBCU
          </Text>
        </Box>
        <Box p={{ base: 1.5, xl: 2.5 }} minW={0} h="100%" display="flex" flexDirection="column">
          <Flex align="start" justify="space-between" gap={3} mb={1.25} flexShrink={0}>
            <Text
              fontSize="clamp(1rem, 1.8vw, 1.45rem)"
              color="white"
              fontWeight="black"
              lineHeight={0.88}
              textTransform="uppercase"
              letterSpacing="-0.045em"
              lineClamp={1}
            >
              Same Fields, Different Systems
            </Text>
            <BookOpen size={16} color="#A1A1AA" />
          </Flex>
          <Box flex={1} minH={0} overflow="hidden">
            <Grid
              templateColumns="0.8fr 1.18fr 1.18fr"
              h="100%"
              templateRows={`repeat(${SYSTEM_COMPARISON_ROWS.length + 1}, minmax(0, 1fr))`}
              borderTop="1px solid"
              borderColor="whiteAlpha.100"
            >
              <HeaderCell density="compact">Field</HeaderCell>
              <HeaderCell color={SWAC.colors.primary} density="compact">SWAC</HeaderCell>
              <HeaderCell color={MEAC.colors.secondary} density="compact">MEAC</HeaderCell>
              {SYSTEM_COMPARISON_ROWS.map(([field, swac, meac]) => (
                <Fragment key={field}>
                  <MatrixCell muted density="compact">{field}</MatrixCell>
                  <MatrixCell density="compact">{swac}</MatrixCell>
                  <MatrixCell density="compact">{meac}</MatrixCell>
                </Fragment>
              ))}
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}

// ─── Shared Cells ───
function HeaderCell({ children, color = "white", density = "standard" }) {
  return (
    <Box
      bg="rgba(255,255,255,0.06)"
      px={density === "compact" ? 1.75 : 3}
      py={density === "compact" ? 0.75 : 2}
      borderBottom="1px solid"
      borderRight="1px solid"
      borderColor="whiteAlpha.100"
      minW={0}
    >
      <Text
        fontSize={density === "compact" ? "7px" : "9px"}
        color={color}
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing={density === "compact" ? "0.08em" : "0.12em"}
        lineClamp={1}
      >
        {children}
      </Text>
    </Box>
  );
}

function MatrixCell({ children, muted = false, density = "standard" }) {
  return (
    <Box
      px={density === "compact" ? 1.75 : 3}
      py={density === "compact" ? 0.75 : 2}
      borderBottom="1px solid"
      borderRight="1px solid"
      borderColor="whiteAlpha.100"
      minW={0}
      overflow="hidden"
    >
      <Text
        fontSize={density === "compact" ? "7.5px" : "10px"}
        color={muted ? "text.muted" : "text.secondary"}
        fontWeight={muted ? "black" : "bold"}
        lineHeight={density === "compact" ? 1.1 : 1.35}
        lineClamp={density === "compact" ? 1 : 2}
      >
        {children}
      </Text>
    </Box>
  );
}

// ─── Parent Switch ───
export const ComparisonMatrix = ({ variant = "standard" }) => {
  if (variant === "compact") return <ComparisonMatrixCompact />;
  return <ComparisonMatrixStandard />;
};
