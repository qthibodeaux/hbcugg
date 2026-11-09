import { useState } from "react";
import { Flex, Text, Box, VStack, Grid } from "@chakra-ui/react";

export const SmartTable = ({ headers = [], data = [], limit = 5, renderRow, activeKey, onSelect, accentColor }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.length / limit);
  const hasPagination = totalPages > 1;
  const startIndex = page * limit;
  const visibleData = data.slice(startIndex, startIndex + limit);

  // Column templates (maximize horizontal space)
  const colTemplate = ["1.3fr", ...Array(headers.length - 1).fill("0.6fr")].join(" ");

  return (
    <Flex direction="column" h="full" minH={0} justify="space-between" w="full">
      <Flex flex={1} minH={0} w="full" direction="row" align="stretch">
        {/* Left Gutter Pagination Track (Page buttons on the left!) */}
        {hasPagination && (
          <Flex
            direction="column"
            w="18px"
            bg="rgba(0,0,0,0.2)"
            borderRight="1px solid"
            borderColor="whiteAlpha.100"
            flexShrink={0}
            h="full"
            mr="0.375rem"
          >
            {/* UP Page Arrow */}
            <Flex
              flex={1}
              align="center"
              justify="center"
              cursor={page === 0 ? "not-allowed" : "pointer"}
              opacity={page === 0 ? 0.2 : 0.7}
              pointerEvents={page === 0 ? "none" : "auto"}
              _hover={page !== 0 ? { bg: "whiteAlpha.150", opacity: 1, color: accentColor || "brand.500" } : {}}
              transition="all 0.2s"
              color="text.secondary"
              onClick={() => {
                if (page > 0) setPage(page - 1);
              }}
            >
              <Text fontSize="11px" fontWeight="black">
                ▲
              </Text>
            </Flex>

            {/* Divider */}
            <Box h="1px" bg="whiteAlpha.100" w="full" />

            {/* DOWN Page Arrow */}
            <Flex
              flex={1}
              align="center"
              justify="center"
              cursor={page === totalPages - 1 ? "not-allowed" : "pointer"}
              opacity={page === totalPages - 1 ? 0.2 : 0.7}
              pointerEvents={page === totalPages - 1 ? "none" : "auto"}
              _hover={page !== totalPages - 1 ? { bg: "whiteAlpha.150", opacity: 1, color: accentColor || "brand.500" } : {}}
              transition="all 0.2s"
              color="text.secondary"
              onClick={() => {
                if (page < totalPages - 1) setPage(page + 1);
              }}
            >
              <Text fontSize="11px" fontWeight="black">
                ▼
              </Text>
            </Flex>
          </Flex>
        )}

        <VStack align="stretch" gap={0} flex={1} minH={0} w="full">
          {/* Table Headers */}
          <Grid templateColumns={colTemplate} gap={1} py="0.25rem" borderBottom="1px solid" borderColor="whiteAlpha.200" flexShrink={0} w="full">
            {headers.map((h, i) => (
              <Text
                key={i}
                fontSize="0.55rem"
                fontWeight="900"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.05em"
                textAlign={i === 0 ? "left" : "right"}
              >
                {h}
              </Text>
            ))}
          </Grid>

          {/* Scroll Pinned Rows */}
          <Box flex={1} overflow="hidden" minH={0} w="full">
            {visibleData.map((item, index) => {
              const isActive = activeKey && item.key === activeKey;
              return (
                <Grid
                  key={item.key || index}
                  templateColumns={colTemplate}
                  gap={1}
                  py="0.25rem"
                  alignItems="center"
                  cursor={onSelect ? "pointer" : "default"}
                  bg={isActive ? "whiteAlpha.100" : "transparent"}
                  borderLeft={isActive && accentColor ? `3px solid ${accentColor}` : "3px solid transparent"}
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.50"
                  _hover={onSelect ? { bg: "whiteAlpha.50" } : {}}
                  onClick={() => onSelect && onSelect(item)}
                  w="full"
                >
                  {renderRow(item)}
                </Grid>
              );
            })}
            {data.length === 0 && (
              <Flex align="center" justify="center" h="5.5rem">
                <Text fontSize="0.625rem" color="text.muted">No entries found</Text>
              </Flex>
            )}
          </Box>
        </VStack>
      </Flex>

      {/* Low-profile bottom indicator label */}
      {hasPagination && (
        <Flex justify="flex-start" align="center" pt="0.125rem" pl={hasPagination ? "24px" : 0} flexShrink={0}>
          <Text fontSize="0.48rem" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.02em">
            PAGE {page + 1} OF {totalPages}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
