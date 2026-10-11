import { useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";

// PageShell list region — every campus stadium as a row. Not a grid slot:
// nineteen rows is however tall it is, and the page scrolls. Sort by
// capacity (default), name, or team; click selects the venue via URL.

const COLS = "2.5rem minmax(0, 2fr) minmax(0, 1.4fr) minmax(0, 1fr) 6.5rem";

const SORTS = {
  capacity: (a, b) => (b.capacity ?? 0) - (a.capacity ?? 0),
  name: (a, b) => a.name.localeCompare(b.name),
  team: (a, b) => (a.team?.name ?? "").localeCompare(b.team?.name ?? ""),
  state: (a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city),
};

const HeaderCell = ({ children, active, onClick, align = "left" }) => (
  <Text
    as="button"
    onClick={onClick}
    fontSize="0.6rem"
    fontWeight="black"
    color={active ? "white" : "whiteAlpha.500"}
    textTransform="uppercase"
    letterSpacing="0.2em"
    textAlign={align}
    cursor={onClick ? "pointer" : "default"}
    _hover={onClick ? { color: "white" } : undefined}
  >
    {children}
  </Text>
);

export const VenueDirectoryList = ({ venues, selectedId, onSelect }) => {
  const [sort, setSort] = useState("capacity");
  const rows = [...venues].sort(SORTS[sort]);

  return (
    <Box bg="#141416" border="1px solid rgba(255,255,255,0.07)" borderRadius="xl" overflow="hidden">
      <Flex align="center" justify="space-between" px={5} pt={5} pb={3}>
        <Flex align="center" gap={2}>
          <Box w="3px" h="14px" bg="brand.500" />
          <Text fontSize="9px" fontWeight="black" letterSpacing="0.4em" color="text.muted">
            CAMPUS DIRECTORY
          </Text>
        </Flex>
        <Text fontSize="9px" fontWeight="bold" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.1em">
          {rows.length} stadiums
        </Text>
      </Flex>

      <Grid templateColumns={COLS} gap={3} px={5} py={2} borderBottom="1px solid" borderColor="whiteAlpha.100" alignItems="center">
        <Box />
        <HeaderCell active={sort === "name"} onClick={() => setSort("name")}>Stadium</HeaderCell>
        <HeaderCell active={sort === "team"} onClick={() => setSort("team")}>Home team</HeaderCell>
        <HeaderCell active={sort === "state"} onClick={() => setSort("state")}>Location</HeaderCell>
        <HeaderCell active={sort === "capacity"} onClick={() => setSort("capacity")} align="right">Capacity</HeaderCell>
      </Grid>

      {rows.map((v, i) => {
        const isSelected = v.id === selectedId;
        return (
          <Grid
            key={v.id}
            as="button"
            onClick={() => onSelect?.(v.id)}
            w="full"
            textAlign="left"
            templateColumns={COLS}
            gap={3}
            px={5}
            py={3}
            alignItems="center"
            borderBottom={i === rows.length - 1 ? "none" : "1px solid"}
            borderColor="whiteAlpha.50"
            bg={isSelected ? `${v.accent ?? "#E53E3E"}26` : "transparent"}
            borderLeft="3px solid"
            borderLeftColor={isSelected ? v.accent ?? "#E53E3E" : "transparent"}
            _hover={{ bg: `${v.accent ?? "#E53E3E"}1A` }}
            transition="background 0.15s"
          >
            {v.logo ? <Image src={v.logo} alt="" w="2rem" h="2rem" objectFit="contain" /> : <Box w="2rem" h="2rem" />}
            <Box minW={0}>
              <Text fontSize="sm" fontWeight="black" color="white" lineClamp={1}>{v.name}</Text>
              {v.aliases?.length > 1 && (
                <Text fontSize="xs" color="whiteAlpha.500" lineClamp={1}>{v.aliases.filter((a) => a !== v.name).join(" · ")}</Text>
              )}
            </Box>
            <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.03em" lineClamp={1}>
              {v.team?.name ?? v.home_team_id ?? "—"}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.700" lineClamp={1}>{v.location}</Text>
            <Text fontSize="md" fontWeight="black" color="white" textAlign="right">{(v.capacity ?? 0).toLocaleString()}</Text>
          </Grid>
        );
      })}
    </Box>
  );
};

export default VenueDirectoryList;
