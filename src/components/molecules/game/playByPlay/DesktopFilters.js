import { Flex, Box, Text, Grid } from "@chakra-ui/react";
import { useState, useDeferredValue, useMemo } from "react";
import { X } from "lucide-react";
import { FILTER_GROUPS } from "../../../../utils/playByPlayModel";

// Extracted from the live PlayByPlayPanel; behavior preserved.

const TogglePill = ({ label, checked, onChange, accent }) => (
  <Flex
    align="center"
    justify="center"
    gap={1.5}
    px={3}
    py={1.5}
    borderRadius="md"
    bg={checked ? `${accent}22` : "rgba(255,255,255,0.03)"}
    border="1px solid"
    borderColor={checked ? `${accent}88` : "whiteAlpha.100"}
    cursor="pointer"
    onClick={onChange}
    transition="all 0.15s ease"
    _hover={{ bg: checked ? `${accent}28` : "rgba(255,255,255,0.06)" }}
    flex={1}
    minW="60px"
    maxW="120px"
  >
    {checked && (
      <Box w="6px" h="6px" borderRadius="full" bg={accent} flexShrink={0} />
    )}
    <Text fontSize="10px" color={checked ? "white" : "text.muted"} fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" textAlign="center">
      {label}
    </Text>
  </Flex>
);

const PlayerSearch = ({ players, selected, onSelect, onClear, teamShortFn }) => {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const suggestions = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (q.length < 2) return [];
    return players
      .filter((p) => p.search.includes(q))
      .slice(0, 8);
  }, [players, deferred]);

  const pick = (player) => {
    onSelect(player);
    setQuery("");
  };

  return (
    <Flex direction="column" gap={1} position="relative">
      <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
        Player
      </Text>
      {selected ? (
        <Flex align="center" justify="space-between" gap={1} px={2} py="3px" borderRadius="md" bg="brand.500" cursor="pointer" onClick={onClear}>
          <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>{selected.display}</Text>
          <X size={10} color="white" />
        </Flex>
      ) : (
        <Box
          as="input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions[0]) pick(suggestions[0]);
            if (e.key === "Escape") setQuery("");
          }}
          placeholder={players.length ? "Search..." : "No players on file"}
          disabled={players.length === 0}
          w="full"
          bg="rgba(255,255,255,0.04)"
          border="1px solid"
          borderColor="whiteAlpha.100"
          borderRadius="md"
          px={2}
          py="3px"
          fontSize="11px"
          color="white"
          fontWeight="black"
          outline="none"
          _focus={{ borderColor: "brand.500" }}
          _placeholder={{ color: "text.muted" }}
        />
      )}
      {!selected && deferred.trim().length >= 2 && (
        <Flex
          direction="column"
          gap="2px"
          maxH="160px"
          overflow="auto"
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={5}
          mt={1}
          p={1}
          bg="#141416"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="md"
          boxShadow="0 12px 30px rgba(0,0,0,0.5)"
        >
          {suggestions.length === 0 ? (
            <Text px={2} py="3px" fontSize="10px" color="text.muted" fontWeight="black">No match</Text>
          ) : suggestions.map((p) => (
            <Flex
              key={p.id}
              align="center"
              justify="space-between"
              gap={2}
              px={2}
              py="3px"
              borderRadius="sm"
              cursor="pointer"
              onClick={() => pick(p)}
              _hover={{ bg: "rgba(255,255,255,0.08)" }}
            >
              <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>{p.display}</Text>
              <Text fontSize="9px" color="text.muted" fontWeight="black" flexShrink={0}>
                {p.team ? `${teamShortFn?.(p.team) ?? ""} · ` : ""}{p.playCount}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export const FilterBar = ({ filters, onToggle, awayColor, homeColor, players, selectedPlayer, onSelectPlayer, onClearPlayer, teamShortFn }) => {
  const getAccent = (groupKey, optionKey) => {
    if (groupKey === "team" && optionKey === "away") return awayColor;
    if (groupKey === "team" && optionKey === "home") return homeColor;
    return "#E53E3E";
  };

  return (
    <Box p={2} bg="rgba(255,255,255,0.02)" borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, minmax(0, 1fr))", xl: "repeat(5, minmax(0, 1fr))" }} gap={2}>
        {/* Quarter column */}
        <Flex direction="column" gap={1}>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
            Quarter
          </Text>
          <Flex direction="column" gap="4px">
            {FILTER_GROUPS.quarter.options.map((opt) => (
              <TogglePill
                key={opt.key}
                label={opt.label}
                checked={!!filters.quarter?.[opt.key]}
                onChange={() => onToggle("quarter", opt.key)}
                accent="#E53E3E"
              />
            ))}
          </Flex>
        </Flex>

        {/* Team column */}
        <Flex direction="column" gap={1}>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
            Team
          </Text>
          <Flex direction="column" gap="4px">
            {FILTER_GROUPS.team.options.map((opt) => (
              <TogglePill
                key={opt.key}
                label={opt.label}
                checked={!!filters.team?.[opt.key]}
                onChange={() => onToggle("team", opt.key)}
                accent={getAccent("team", opt.key)}
              />
            ))}
          </Flex>
        </Flex>

        {/* Play Type column */}
        <Flex direction="column" gap={1}>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
            Play Type
          </Text>
          <Flex direction="column" gap="4px">
            {FILTER_GROUPS.playType.options.map((opt) => (
              <TogglePill
                key={opt.key}
                label={opt.label}
                checked={!!filters.playType?.[opt.key]}
                onChange={() => onToggle("playType", opt.key)}
                accent="#E53E3E"
              />
            ))}
          </Flex>
        </Flex>

        {/* Highlights column */}
        <Flex direction="column" gap={1}>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb="2px">
            Highlights
          </Text>
          <Flex direction="column" gap="4px">
            {FILTER_GROUPS.highlights.options.map((opt) => (
              <TogglePill
                key={opt.key}
                label={opt.label}
                checked={!!filters.highlights?.[opt.key]}
                onChange={() => onToggle("highlights", opt.key)}
                accent="#E53E3E"
              />
            ))}
          </Flex>
        </Flex>

        {/* Player column */}
        <PlayerSearch players={players} selected={selectedPlayer} onSelect={onSelectPlayer} onClear={onClearPlayer} teamShortFn={teamShortFn} />
      </Grid>
    </Box>
  );
};
