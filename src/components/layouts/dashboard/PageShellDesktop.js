import { Box, Flex } from "@chakra-ui/react";

const PageShellDesktop = ({
  sidebar,
  banner,
  children,
  topOffset = "var(--app-header-height)",
  sidebarWidth = "280px",
  contentMaxW = "1600px",
  contentPx = { base: 4, md: 6, xl: 8 },
  contentPy = 6,
}) => {
  return (
    <Box minH="100vh" bg="bg.primary" pt={topOffset}>
      <Flex align="stretch">
        <Box
          as="aside"
          display={{ base: "none", lg: "block" }}
          position="sticky"
          top={topOffset}
          w={sidebarWidth}
          h={`calc(100vh - ${topOffset})`}
          borderRight="1px solid"
          borderColor="whiteAlpha.100"
          bg="blackAlpha.300"
          overflowY="auto"
          sx={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
        >
          {sidebar}
        </Box>

        <Box flex="1" minW={0}>
          <Box w="100%" maxW={contentMaxW} mx="auto" px={contentPx} py={contentPy}>
            {banner}
            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default PageShellDesktop;
