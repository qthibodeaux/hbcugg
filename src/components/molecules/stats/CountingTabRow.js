import { Box, Flex, Grid, Text } from "@chakra-ui/react";

// The Sidearm-style tab strip under the counting-stats banners: every tab
// takes equal width across the row, the active one is filled. Plain buttons
// — the tab is URL state (`?tab=`), the parent owns it.
export const CountingTabRow = ({ tabs, value, onChange }) => (
  <Flex
    role="tablist"
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="md"
    overflow="hidden"
    w="100%"
  >
    {tabs.map((t) => {
      const active = t.id === value;
      return (
        <Flex
          key={t.id}
          as="button"
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(t.id)}
          flex="1 1 0"
          minW={0}
          align="center"
          justify="center"
          py={3}
          px={2}
          bg={active ? "brand.500" : "transparent"}
          borderRight="1px solid"
          borderColor="whiteAlpha.100"
          _last={{ borderRight: "none" }}
          _hover={{ bg: active ? "brand.500" : "whiteAlpha.100" }}
          transition="background 0.15s"
        >
          <Text
            fontSize="clamp(0.6rem, 0.8vw, 0.78rem)"
            fontWeight="black"
            color={active ? "white" : "text.secondary"}
            textTransform="uppercase"
            letterSpacing="0.1em"
            lineClamp={1}
          >
            {t.label}
          </Text>
        </Flex>
      );
    })}
  </Flex>
);

// The same tabs as a 4x1 slot: a 5 x 2 grid of equal cells, sized off the
// slot. `trailing` fills the spare cell when the tab count doesn't divide
// evenly (Team Stats has nine tabs in ten cells).
export const CountingTabGrid = ({ tabs, value, onChange, columns = 5, rows = 2, trailing = null }) => (
  <Box h="100%" w="100%" containerType="size">
    <Grid
      role="tablist"
      templateColumns={`repeat(${columns}, minmax(0, 1fr))`}
      templateRows={`repeat(${rows}, minmax(0, 1fr))`}
      gap="1.5cqmin"
      h="100%"
      w="100%"
    >
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <Flex
            key={t.id}
            as="button"
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            minW={0}
            minH={0}
            align="center"
            justify="center"
            px="2cqmin"
            borderRadius="md"
            border="1px solid"
            borderColor={active ? "brand.500" : "whiteAlpha.100"}
            bg={active ? "brand.500" : "#141416"}
            _hover={{ bg: active ? "brand.500" : "#1C1C20", borderColor: active ? "brand.500" : "whiteAlpha.300" }}
            transition="background 0.15s, border-color 0.15s"
          >
            <Text
              fontSize="4.6cqmin"
              fontWeight="black"
              color={active ? "white" : "rgba(255,255,255,0.7)"}
              textTransform="uppercase"
              letterSpacing="0.08em"
              lineHeight={1}
              lineClamp={1}
            >
              {t.label}
            </Text>
          </Flex>
        );
      })}
      {trailing}
    </Grid>
  </Box>
);

export default CountingTabRow;
