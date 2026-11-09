import { memo } from "react";
import { DEFAULT_ACCENT } from "./sideNavPresentation";
import { Box, Flex, Image, Text } from "@chakra-ui/react";

export const HubHeaderBlock = memo(({ stack }) => {
  if (!stack || stack.length === 0) return null;
  const entity = stack[0];
  if (entity.id === "team") return null;

  const primary = entity.primary || DEFAULT_ACCENT;
  const secondary = entity.secondary || primary;
  const initial = (entity.shortName || entity.label || "?").slice(0, 2);

  return (
    <Box mb={4}>
      <Flex align="center" gap={3} p={4} bg="bg.secondary">
        {entity.logo ? (
          <Box w={9} h={9} minW={9} display="flex" alignItems="center" justifyContent="center">
            <Image src={entity.logo} alt="" w="full" h="full" objectFit="contain" />
          </Box>
        ) : (
          <Flex
            align="center"
            justify="center"
            w={9}
            h={9}
            minW={9}
            bg={primary}
            borderRadius="lg"
            color="white"
            fontWeight="black"
            fontSize="sm"
            boxShadow="sm"
          >
            {initial}
          </Flex>
        )}
        <Box minW={0}>
          <Text
            fontSize="clamp(0.8rem, 6.8cqw, 1.09rem)"
            fontWeight="extrabold"
            letterSpacing="widest"
            color="text.primary"
            textTransform="uppercase"
            lineHeight="1.25"
          >
            {entity.label}
          </Text>
          {entity.breadcrumb && (
            <Text fontSize="0.78rem" fontWeight="bold" letterSpacing="wider" color="text.muted" mt={0.5}>
              {entity.breadcrumb}
            </Text>
          )}
        </Box>
      </Flex>
      <Flex w="full" h="3px">
        <Box flex="1" bg={primary} />
        <Box flex="1" bg={secondary} />
      </Flex>
    </Box>
  );
});

HubHeaderBlock.displayName = "HubHeaderBlock";
