import { VStack, Grid, Box, Flex, Text } from "@chakra-ui/react";
import { getDisplayName } from "./passingPresentation";

export const PassingStatsTable = ({ team, standard, passing }) => {
  const headers = [
    { key: "comp", label: "CMP" },
    { key: "att", label: "ATT" },
    { key: "yards", label: "YDS" },
    { key: "cmpPct", label: "CMP%" },
    { key: "int", label: "INT" },
    { key: "ypa", label: "YPA" },
  ];

  const teamCmpPct = team.attempts > 0 ? ((team.completions / team.attempts) * 100).toFixed(1) + "%" : "0%";
  const teamYpa = team.attempts > 0 ? (team.yards / team.attempts).toFixed(1) : "0.0";
  const stdCmpPct = standard.att > 0 ? ((standard.comp / standard.att) * 100).toFixed(1) + "%" : "0%";
  const stdYpa = standard.att > 0 ? (standard.yards / standard.att).toFixed(1) : "0.0";
  const passCmpPct = passing.att > 0 ? ((passing.comp / passing.att) * 100).toFixed(1) + "%" : "0%";
  const passYpa = passing.att > 0 ? (passing.yards / passing.att).toFixed(1) : "0.0";

  const rows = [
    { label: "Total", comp: team.completions, att: team.attempts, yards: team.yards, cmpPct: teamCmpPct, int: team.interceptions, ypa: teamYpa, isTotal: true },
    // TODO: Sacks currently show as "—" for standard/passing splits because the data pipeline
    // does not log which down type a sack occurred on. Need to add down_context to sack events.
    { label: "Standard", comp: standard.comp, att: standard.att, yards: standard.yards, cmpPct: stdCmpPct, int: standard.int, ypa: stdYpa, isTotal: false },
    { label: "Passing", comp: passing.comp, att: passing.att, yards: passing.yards, cmpPct: passCmpPct, int: passing.int, ypa: passYpa, isTotal: false },
  ];

  return (
    <VStack gap={0} align="stretch" w="full">
      <Grid templateColumns="60px repeat(6, 1fr)" gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.200">
        <Box />
        {headers.map((h) => (
          <Flex key={h.key} align="center" justify="center">
            <Text fontSize="clamp(7px, 0.6vw, 9px)" fontWeight="700" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">{h.label}</Text>
          </Flex>
        ))}
      </Grid>
      {rows.map((row, idx) => (
        <Grid key={row.label} templateColumns="60px repeat(6, 1fr)" gap={0} alignItems="center"
          py="2px"
          borderBottom={idx < rows.length - 1 ? "1px solid whiteAlpha.50" : "none"}
          bg={row.isTotal ? "whiteAlpha.80" : "transparent"}
        >
          <Box pl="6px">
            <Text fontSize={row.isTotal ? "clamp(9px, 0.8vw, 11px)" : "clamp(8px, 0.7vw, 10px)"}
              fontWeight={row.isTotal ? "800" : "600"}
              color={row.isTotal ? "text.primary" : "text.secondary"}
              textTransform={row.isTotal ? "uppercase" : "none"}
            >{row.label}</Text>
          </Box>
          {headers.map((h) => (
            <Flex key={h.key} align="center" justify="center">
              <Text fontSize={row.isTotal ? "clamp(10px, 0.9vw, 13px)" : "clamp(9px, 0.8vw, 11px)"}
                fontWeight={row.isTotal ? "800" : "600"}
                color={row.isTotal ? "#E53E3E" : "text.primary"}
              >{row[h.key]}</Text>
            </Flex>
          ))}
        </Grid>
      ))}
    </VStack>
  );
};

export const PlayerTable = ({ players, activeKey, onSelect, type }) => {
  const isPasser = type === "passer";
  const accent = isPasser ? "#E53E3E" : "#4A90D9";
  const headers = isPasser
    ? ["CMP", "ATT", "YDS", "TD", "INT", "CMP%"]
    : ["REC", "TGT", "YDS", "TD", "YPC", "YPT"];

  return (
    <VStack gap={0} align="stretch" w="full">
      {/* Section header */}
      <Flex align="center" gap={1} px="4px" py="2px" borderBottom="1px solid whiteAlpha.100">
        <Box w="3px" h="10px" bg={accent} borderRadius="sm" />
        <Text fontSize="clamp(7px, 0.6vw, 9px)" fontWeight="700" color="text.primary" textTransform="uppercase" letterSpacing="0.06em">
          {isPasser ? "Passing" : "Receiving"}
        </Text>
      </Flex>
      {/* Header row */}
      <Grid templateColumns={`110px repeat(${headers.length}, 1fr)`} gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.50">
        <Box pl="4px">
          <Text fontSize="clamp(8px, 0.7vw, 10px)" fontWeight="700" color="text.muted" textTransform="uppercase">Player</Text>
        </Box>
        {headers.map((h) => (
          <Flex key={h} align="center" justify="center">
            <Text fontSize="clamp(8px, 0.7vw, 10px)" fontWeight="700" color="text.muted" textTransform="uppercase">{h}</Text>
          </Flex>
        ))}
      </Grid>
      {/* Data rows */}
      {players.map((p) => {
        const isActive = p.key === activeKey;
        const cmpPct = isPasser && p.attempts > 0 ? ((p.completions / p.attempts) * 100).toFixed(1) + "%" : null;
        const ypc = !isPasser && p.receptions > 0 ? (p.yards / p.receptions).toFixed(1) : null;
        const ypt = !isPasser && p.targets > 0 ? (p.yards / p.targets).toFixed(1) : null;

        const cells = isPasser
          ? [p.completions, p.attempts, p.yards, p.touchdowns, p.interceptions, cmpPct]
          : [p.receptions, p.targets, p.yards, p.touchdowns, ypc, ypt];

        return (
          <Grid key={p.key}
            templateColumns={`110px repeat(${headers.length}, 1fr)`}
            gap={0} alignItems="center"
            py="2px" cursor="pointer"
            bg={isActive ? "whiteAlpha.80" : "transparent"}
            borderLeft={isActive ? `2px solid ${accent}` : "2px solid transparent"}
            _hover={{ bg: "whiteAlpha.60" }}
            onClick={() => onSelect({ ...p, _type: type })}
          >
            <Box pl="4px">
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={isActive ? "700" : "500"} color="text.primary" truncate>
                {getDisplayName(p.name)}
              </Text>
            </Box>
            {cells.map((v, i) => (
              <Flex key={i} align="center" justify="center">
                <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={isActive ? "700" : "500"} color={isActive ? accent : "text.primary"}>
                  {v ?? "0"}
                </Text>
              </Flex>
            ))}
          </Grid>
        );
      })}
    </VStack>
  );
};

export const PageArrow = ({ direction, onClick, disabled }) => {
  if (disabled) return null;
  return (
    <Flex
      w="20px"
      flex={1}
      minH="40px"
      align="center"
      justify="center"
      borderRadius="sm"
      bg="whiteAlpha.100"
      border="1px solid whiteAlpha.200"
      cursor="pointer"
      _hover={{ bg: "whiteAlpha.200" }}
      onClick={onClick}
      flexShrink={0}
    >
      <Text fontSize="14px" fontWeight="700" color="text.secondary">
        {direction === "prev" ? "‹" : "›"}
      </Text>
    </Flex>
  );
};
