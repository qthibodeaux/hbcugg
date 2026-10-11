import React from "react";
import { Box, Text } from "@chakra-ui/react";

export const Eyebrow = ({ children, color = "brand.400" }) => (
  <Text
    fontSize="10px"
    fontWeight="black"
    color={color}
    textTransform="uppercase"
    letterSpacing="0.25em"
    mb={1}
  >
    {children}
  </Text>
);

export const Title = ({ children, size = "2xl", color = "white" }) => (
  <Text
    fontSize={size}
    fontWeight="black"
    color={color}
    textTransform="uppercase"
    letterSpacing="-0.02em"
    lineHeight={1}
  >
    {children}
  </Text>
);

export const CategoryHeader = ({ title, subtitle }) => (
  <Box borderLeft="4px solid" borderColor="brand.500" pl={4} py={1} mb={6}>
    <Text
      fontSize="xs"
      fontWeight="black"
      color="text.muted"
      textTransform="uppercase"
      letterSpacing="0.2em"
    >
      {title}
    </Text>
    <Text
      fontSize="2xl"
      fontWeight="black"
      color="white"
      textTransform="uppercase"
      letterSpacing="-0.02em"
    >
      {subtitle}
    </Text>
  </Box>
);
