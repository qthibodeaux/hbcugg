import { shouldPanName } from "./playerCardModel";
import { Box, Text, Grid, Flex } from "@chakra-ui/react";

const NameRail = ({ children, variant = "standard" }) => {
  const text = String(children || "");
  const shouldPan = shouldPanName(text);
  const compact = variant !== "standard";

  return (
    <Box
      maxW="100%"
      overflow="hidden"
      style={shouldPan ? {
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 10%, #000 88%, transparent 100%)",
        maskImage: "linear-gradient(90deg, transparent 0%, #000 10%, #000 88%, transparent 100%)",
      } : undefined}
    >
      <Text
        as="span"
        className={shouldPan ? "roster-name-pan" : undefined}
        display="inline-block"
        pr={shouldPan ? 10 : 0}
        fontSize={compact ? { base: "2xl", md: "3xl" } : { base: "2xl", md: "3xl", xl: shouldPan ? "3xl" : "4xl" }}
        fontWeight="black"
        color="text.primary"
        lineHeight="0.78"
        textTransform="uppercase"
        whiteSpace="nowrap"
        style={shouldPan ? {
          animation: "rosterNamePan 12s ease-in-out infinite",
          willChange: "transform",
        } : undefined}
      >
        {text}
      </Text>
    </Box>
  );
};

const CompactField = ({ label, value, highlight }) => (
  <Box minW={0} title={`${label}: ${value}`}>
    <Text
      fontSize="sm"
      color={highlight ? "inherit" : "text.primary"}
      fontWeight="black"
      lineHeight="1"
      textTransform="uppercase"
      lineClamp={1}
    >
      {value}
    </Text>
  </Box>
);

export const StandardPlayerPlate = ({ nameParts, sideFields, secondary }) => (
  <Grid
    templateColumns="minmax(0, 64%) minmax(96px, 36%)"
    gap={2.5}
    h="full"
    minH={{ base: "72px", xl: "80px" }}
  >
    <Flex direction="column" justify="center" minW={0} overflow="hidden">
      <NameRail>{nameParts.first}</NameRail>
      {nameParts.last && <NameRail>{nameParts.last}</NameRail>}
    </Flex>

    <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={1.5} alignContent="center" borderLeft="1px solid" borderColor="whiteAlpha.100" pl={2.5}>
      {sideFields.map(([label, value], index) => (
        <Box key={label}>
          <Text fontSize="7px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">
            {label}
          </Text>
          <Text
            mt="1px"
            fontSize={index === 0 ? "md" : "xs"}
            color={index === 0 ? secondary : "text.primary"}
            fontWeight="black"
            lineHeight="1"
            textTransform="uppercase"
            lineClamp={1}
          >
            {value}
          </Text>
        </Box>
      ))}
    </Grid>
  </Grid>
);

export const CompactPlayerPlate = ({ nameParts, sideFields, secondary }) => (
  <Flex direction="column" justify="center" gap={2} minH="84px">
    <Box minW={0} overflow="hidden">
      <NameRail variant="compact">{nameParts.first}</NameRail>
      {nameParts.last && <NameRail variant="compact">{nameParts.last}</NameRail>}
    </Box>

    <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap={2.5} color={secondary} alignItems="center">
      {sideFields.map(([label, value], index) => (
        <CompactField key={label} label={label} value={value} highlight={index === 0} />
      ))}
    </Grid>
  </Flex>
);
