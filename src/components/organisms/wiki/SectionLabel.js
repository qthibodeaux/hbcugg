import { Box, HStack, Text } from '@chakra-ui/react';

const SectionLabel = ({ children, color }) => (
  <HStack gap={2} mb={4}>
    <Box w="3px" h="14px" bg={color || "brand.500"} />
    <Text fontSize="9px" fontWeight="black" letterSpacing="0.4em" color="text.muted">{children}</Text>
  </HStack>
);

export default SectionLabel;
