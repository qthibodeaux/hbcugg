import { Box, Flex, Text, Grid } from "@chakra-ui/react";

const UpArrow = ({ color }) => (
  <svg width="1.6rem" height="1.6rem" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M18 15l-6-6-6 6" />
  </svg>
);

const DownArrow = ({ color }) => (
  <svg width="1.6rem" height="1.6rem" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const DashIcon = ({ color }) => (
  <svg width="1.6rem" height="1.6rem" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M5 12h14" />
  </svg>
);

const getArrowStatus = (label, displayValue, value) => {
  const cleanValStr = String(displayValue || value || "0").replace(/[^0-9.]/g, "");
  const val = parseFloat(cleanValStr) || 0;
  
  let left = "dash";
  let right = "dash";
  let grade = "C";
  let gradeColor = "#A1A1AA";

  const isLowBest = label.toLowerCase().includes("allow") || label.toLowerCase().includes("prevent") || label.toLowerCase().includes("allowed");

  if (label.includes("Stop") || label.includes("Stop Rate") || label.includes("3rd Down Stop")) {
    if (val >= 60) { left = "up"; right = "up"; grade = "A+"; gradeColor = "#48BB78"; }
    else if (val >= 50) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
    else if (val >= 40) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
    else if (val >= 30) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
    else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
  } else if (label.includes("Stuff") || label.includes("Stuff Rate")) {
    if (val >= 22) { left = "up"; right = "up"; grade = "A+"; gradeColor = "#48BB78"; }
    else if (val >= 18) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
    else if (val >= 14) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
    else if (val >= 10) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
    else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
  } else if (label.includes("TFL") || label.includes("Sacks Forced") || label.includes("Sacks")) {
    if (val >= 6) { left = "up"; right = "up"; grade = "A"; gradeColor = "#48BB78"; }
    else if (val >= 4) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
    else if (val >= 2) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
    else if (val >= 1) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
    else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
  } else if (label.includes("Blitz") || label.includes("Pressure")) {
    if (val >= 35) { left = "up"; right = "up"; grade = "A+"; gradeColor = "#48BB78"; }
    else if (val >= 28) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
    else if (val >= 22) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
    else if (val >= 15) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
    else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
  } else {
    if (isLowBest) {
      if (val <= 20) { left = "up"; right = "up"; grade = "A+"; gradeColor = "#48BB78"; }
      else if (val <= 30) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
      else if (val <= 40) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
      else if (val <= 50) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
      else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
    } else {
      if (val >= 60) { left = "up"; right = "up"; grade = "A+"; gradeColor = "#48BB78"; }
      else if (val >= 45) { left = "up"; right = "dash"; grade = "B"; gradeColor = "#63B3ED"; }
      else if (val >= 30) { left = "dash"; right = "dash"; grade = "C"; gradeColor = "#A1A1AA"; }
      else if (val >= 15) { left = "dash"; right = "down"; grade = "D"; gradeColor = "#ED8936"; }
      else { left = "down"; right = "down"; grade = "F"; gradeColor = "#E53E3E"; }
    }
  }

  return { left, right, grade, gradeColor };
};

export const DisruptionPanel = ({ opponentName, metrics = [] }) => {
  return (
    <Box
      px="0.5rem"
      py="0.375rem"
      borderTop="0.0625rem solid"
      borderColor="whiteAlpha.100"
      flexShrink={0}
      bg="rgba(0,0,0,0.2)"
      w="full"
    >
      {/* Panel Header */}
      <Flex align="center" gap="0.375rem" mb="0.375rem">
        <Box w="0.1875rem" h="0.6875rem" bg="#E53E3E" borderRadius="0.125rem" />
        <Text
          fontSize="0.5625rem"
          color="text.primary"
          fontWeight="950"
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          {opponentName} Defensive Disruption Index (Leverage & Disruptive Indicators)
        </Text>
      </Flex>

      {/* Grid of indicators */}
      <Grid
        templateColumns={
          metrics.length === 8 ? "repeat(4, 1fr)" :
            metrics.length === 6 ? "repeat(3, 1fr)" :
              `repeat(${metrics.length || 6}, 1fr)`
        }
        gap="0.375rem"
        w="full"
      >
        {metrics.map((m, idx) => {
          const { left, right, grade, gradeColor } = getArrowStatus(m.label, m.displayValue, m.value);

          const renderArrow = (type) => {
            if (type === "up") return <UpArrow color="#48BB78" />;
            if (type === "down") return <DownArrow color="#E53E3E" />;
            return <DashIcon color="#71717A" />;
          };

          return (
            <Flex
              key={idx}
              direction="column"
              bg="rgba(255,255,255,0.015)"
              border="0.0625rem solid"
              borderColor="whiteAlpha.100"
              borderRadius="0.25rem"
              px="0.5rem"
              py="0.375rem"
              justify="space-between"
              align="stretch"
              _hover={{ bg: "rgba(255,255,255,0.03)" }}
            >
              {/* Row 1: Header typology (Title left, Grade right) */}
              <Flex align="center" justify="space-between" pb="0.25rem" borderBottom="0.0625rem solid" borderColor="whiteAlpha.150" w="full" mb="0.375rem">
                <Text
                  fontSize="0.5625rem"
                  fontWeight="950"
                  color="text.secondary"
                  textTransform="uppercase"
                  letterSpacing="0.03em"
                  truncate
                  maxW="75%"
                >
                  {m.label}
                </Text>
                <Text fontSize="0.625rem" fontWeight="950" color={gradeColor}>
                  {grade}
                </Text>
              </Flex>

              {/* Row 2: Metric & Visual Section (Huge value flanked by massive arrows on the same level) */}
              <Flex align="center" justify="center" gap="0.375rem" py="0.125rem" w="full">
                {renderArrow(left)}
                <Text
                  fontSize="1.375rem"
                  fontWeight="950"
                  color="text.primary"
                  fontFamily="heading"
                  lineHeight={1}
                >
                  {m.displayValue || m.value}
                </Text>
                {renderArrow(right)}
              </Flex>
            </Flex>
          );
        })}
      </Grid>
    </Box>
  );
};
