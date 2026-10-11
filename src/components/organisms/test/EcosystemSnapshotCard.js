import React from 'react';
import { Box, Flex, Text, Heading } from '@chakra-ui/react';

/**
 * EcosystemSnapshotCard
 * Compact 1x1 summary card for the Coaches Hub Row 2.
 */
export const EcosystemSnapshotCard = ({ 
  title, 
  value, 
  subtitle, 
  detail, 
  icon: Icon, 
  color = "brand.500",
  onClick 
}) => {
  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
      cursor={onClick ? "pointer" : "default"}
      _hover={onClick ? { bg: "whiteAlpha.100", borderColor: color } : {}}
      onClick={onClick}
      transition="all 0.2s"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Flex justify="space-between" align="start">
        <Box p={2} bg={`${color}15`} borderRadius="lg">
          <Icon size={18} color={color} />
        </Box>
        <Text fontSize="10px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
          {title}
        </Text>
      </Flex>

      <Box my={2}>
        <Heading fontSize="2xl" fontWeight="black" color="text.primary" letterSpacing="tight">
          {value}
        </Heading>
        <Text fontSize="xs" color="text.secondary" fontWeight="bold">
          {subtitle}
        </Text>
      </Box>

      {detail && (
        <Flex align="center" gap={2} pt={2} borderTop="1px solid" borderColor="whiteAlpha.50">
          <Box w={1} h={1} borderRadius="full" bg={color} />
          <Text fontSize="10px" color="text.muted" lineClamp={1}>
            {detail}
          </Text>
        </Flex>
      )}
    </Box>
  );
};
