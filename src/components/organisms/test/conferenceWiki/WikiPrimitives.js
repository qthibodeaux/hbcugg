import { Text, Box } from "@chakra-ui/react";

// Existing implementation extracted along responsibility boundaries.

export const Eyebrow = ({ children, color = "brand.500" }) => (
  <Text fontSize="8px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
    {children}
  </Text>
);

export const Title = ({ children, size = "xl" }) => (
  <Text
    fontSize={size}
    color="white"
    fontWeight="black"
    lineHeight={0.8}
    textTransform="uppercase"
    letterSpacing="-0.04em"
  >
    {children}
  </Text>
);

export const Stat = ({ label, value, color = "white", ...props }) => (
  <Box minW={0} {...props}>
    <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" lineClamp={1} mb={0.5}>
      {label}
    </Text>
    <Text fontSize="md" color={color} fontWeight="black" lineHeight={1.1}>
      {value}
    </Text>
  </Box>
);

export const Chip = ({ children, color = "whiteAlpha.300", ...props }) => (
  <Box
    px={2}
    py={1}
    borderRadius="999px"
    border="1px solid"
    borderColor={color}
    bg="rgba(255,255,255,0.04)"
    minW={0}
    {...props}
  >
    <Text fontSize="9px" color="text.secondary" fontWeight="bold" lineClamp={1}>
      {children}
    </Text>
  </Box>
);

export const HeaderCell = ({ children, color = "white", density = "standard" }) => (
  <Box
    bg="rgba(255,255,255,0.06)"
    px={density === "compact" ? 2 : 3}
    py={density === "compact" ? 1 : 2}
    borderBottom="1px solid"
    borderRight="1px solid"
    borderColor="whiteAlpha.100"
    minW={0}
  >
    <Text fontSize={density === "compact" ? "8px" : "9px"} color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
      {children}
    </Text>
  </Box>
);

export const MatrixCell = ({ children, muted = false, density = "standard" }) => (
  <Box
    px={density === "compact" ? 2 : 3}
    py={density === "compact" ? 1 : 2}
    borderBottom="1px solid"
    borderRight="1px solid"
    borderColor="whiteAlpha.100"
    minW={0}
    overflow="hidden"
  >
    <Text
      fontSize={density === "compact" ? "8px" : "10px"}
      color={muted ? "text.muted" : "text.secondary"}
      fontWeight={muted ? "black" : "bold"}
      lineHeight={density === "compact" ? 1.18 : 1.35}
      lineClamp={density === "compact" ? 1 : 2}
    >
      {children}
    </Text>
  </Box>
);

export const CategoryHeader = ({ title, subtitle }) => (
  <Box mb={4} mt={8}>
    <Eyebrow color="brand.500">{title}</Eyebrow>
    <Title size="2xl">{subtitle}</Title>
    <Box h="1px" bg="whiteAlpha.100" mt={2} />
  </Box>
);
