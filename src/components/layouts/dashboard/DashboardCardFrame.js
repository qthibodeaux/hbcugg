import { Box, Flex, Spinner, Text } from "@chakra-ui/react";

const DashboardCardFrame = ({
  kicker,
  title,
  actions,
  isLoading = false,
  error = null,
  isEmpty = false,
  loadingLabel = "Loading...",
  errorLabel = "Unable to load this panel.",
  emptyLabel = "No data available yet.",
  minH = "160px",
  children,
}) => {
  const hasError = Boolean(error);

  return (
    <Box
      h="100%"
      minH={minH}
      bg="blackAlpha.300"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
    >
      {(kicker || title || actions) && (
        <Flex justify="space-between" align="center" gap={3} mb={3}>
          <Box minW={0}>
            {kicker && (
              <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={1}>
                {kicker}
              </Text>
            )}
            {title && (
              <Text fontSize="sm" color="text.primary" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
                {title}
              </Text>
            )}
          </Box>
          {actions}
        </Flex>
      )}

      {isLoading && (
        <Flex minH="110px" align="center" justify="center" direction="column" gap={2}>
          <Spinner color="brand.500" />
          <Text fontSize="xs" color="text.muted">{loadingLabel}</Text>
        </Flex>
      )}

      {!isLoading && hasError && (
        <Flex minH="110px" align="center" justify="center">
          <Text fontSize="xs" color="red.300">{errorLabel}</Text>
        </Flex>
      )}

      {!isLoading && !hasError && isEmpty && (
        <Flex minH="110px" align="center" justify="center">
          <Text fontSize="xs" color="text.muted">{emptyLabel}</Text>
        </Flex>
      )}

      {!isLoading && !hasError && !isEmpty && children}
    </Box>
  );
};

export default DashboardCardFrame;
