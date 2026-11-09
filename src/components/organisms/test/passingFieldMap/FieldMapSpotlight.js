import { VStack, Grid, Flex, Text, Box } from "@chakra-ui/react";
import { getCellColor, getCellTextColor, getInitials, getDisplayName } from "./passingPresentation";

const FieldMapGrid = ({ grid, teamColor }) => {
  const depths = [
    { key: "deep", label: "DEEP", range: ">12" },
    { key: "medium", label: "MED", range: "4-12" },
    { key: "short", label: "SHORT", range: "<4" },
  ];
  const directions = ["left", "middle", "right"];

  return (
    <VStack gap="4px" align="stretch" w="full" h="full" minH={0}>
      <Grid templateColumns="46px minmax(0, 1fr)" gap="8px" alignItems="stretch" flex={1} minH={0}>
        <Grid templateRows="repeat(3, 1fr)" gap="2px">
          {depths.map((d) => (
            <Flex key={d.key} direction="column" align="flex-end" justify="center" pr="2px">
              <Text fontSize="clamp(9px, 0.78vw, 11px)" fontWeight="900" color="text.secondary" textTransform="uppercase" lineHeight={1}>
                {d.label}
              </Text>
              <Text fontSize="clamp(7px, 0.62vw, 9px)" color="text.muted" fontWeight="800" lineHeight={1.1} mt="2px">
                {d.range}
              </Text>
            </Flex>
          ))}
        </Grid>
        <Box position="relative" w="full" h="full" minH={0}>
          <Box position="absolute" inset="0" borderRadius="md" overflow="hidden"
            bg="linear-gradient(180deg, #1a3d1a 0%, #0d260d 100%)"
            border="1px solid rgba(255,255,255,0.15)"
          >
            <Box position="absolute" left="0" right="0" top="33.3%" h="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" left="0" right="0" top="66.6%" h="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" top="0" bottom="0" left="33.3%" w="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" top="0" bottom="0" left="66.6%" w="1px" bg="rgba(255,255,255,0.12)" />
          </Box>
          <Grid position="absolute" inset="3px" templateColumns="repeat(3, minmax(0, 1fr))" templateRows="repeat(3, minmax(0, 1fr))" gap="2px">
            {depths.map((d) =>
              directions.map((dir) => {
                const cell = grid[d.key][dir];
                const hasData = cell.att > 0;
                const bg = hasData ? getCellColor(cell.comp, cell.att, teamColor) : "rgba(0,0,0,0.35)";
                const textColor = hasData ? getCellTextColor(cell.comp, cell.att) : "text.muted";
                return (
                  <Flex key={`${d.key}-${dir}`} direction="column" align="center" justify="center"
                    bg={bg}
                    borderRadius="sm"
                    border={hasData ? `1px solid ${teamColor}66` : "1px solid rgba(255,255,255,0.06)"}
                    minW={0}
                    minH={0}
                  >
                    <Text fontSize="clamp(9px, 0.78vw, 12px)" fontWeight="800" color={textColor} lineHeight={1}>
                      {cell.comp}/{cell.att}
                    </Text>
                    <Text fontSize="clamp(6px, 0.55vw, 8px)" color={textColor} lineHeight={1} mt="1px" opacity={0.8}>
                      {cell.yards}y
                    </Text>
                  </Flex>
                );
              })
            )}
          </Grid>
        </Box>
      </Grid>
      <Grid templateColumns="46px minmax(0, 1fr)" gap="8px" flexShrink={0}>
        <Box />
        <Grid templateColumns="repeat(3, 1fr)">
          {["Left", "Middle", "Right"].map((d) => (
            <Text key={d} fontSize="clamp(7px, 0.62vw, 9px)" fontWeight="900" color="text.muted" textAlign="center" textTransform="uppercase">
              {d}
            </Text>
          ))}
        </Grid>
      </Grid>
    </VStack>
  );
};

export const PlayerSpotlight = ({ player, type, teamColor }) => {
  const isPasser = type === "passer";
  const accent = isPasser ? "#E53E3E" : "#4A90D9";

  const cmpPct = isPasser && player.attempts > 0 ? ((player.completions / player.attempts) * 100).toFixed(1) + "%" : "0%";
  const ypc = !isPasser && player.receptions > 0 ? (player.yards / player.receptions).toFixed(1) : "0.0";
  const ypt = !isPasser && player.targets > 0 ? (player.yards / player.targets).toFixed(1) : "0.0";

  const statLine1 = isPasser
    ? `${player.completions} CMP · ${player.attempts} ATT · ${player.yards} YDS`
    : `${player.receptions} REC · ${player.targets} TGT · ${player.yards} YDS`;

  const statLine2 = isPasser
    ? `${player.touchdowns} TD · ${player.interceptions} INT · ${cmpPct} CMP%`
    : `${player.touchdowns} TD · ${ypc} YPC · ${ypt} YPT`;

  return (
    <VStack gap="8px" align="stretch" w="full" h="full">
      {/* ── Top: big avatar | name + position + stats ── */}
      <Grid templateColumns="72px 1fr" border="1px solid rgba(255,255,255,0.13)" borderRadius="sm" overflow="hidden" bg="rgba(255,255,255,0.03)">
        <Flex minH="82px" align="center" justify="center" bg="rgba(255,255,255,0.035)" borderRight="1px solid rgba(255,255,255,0.12)">
          <Flex w="48px" h="48px" borderRadius="md" bg={teamColor} align="center" justify="center" border="1px solid rgba(255,255,255,0.18)">
            <Text fontSize="16px" fontWeight="900" color="white">{getInitials(player.name)}</Text>
          </Flex>
        </Flex>
        <Box minW={0} px={3} py="8px">
          <Text fontSize="clamp(15px, 1.28vw, 20px)" fontWeight="900" color="text.primary" truncate>
            {getDisplayName(player.name)}
          </Text>
          <Flex align="center" gap={1.5} mt="3px">
            <Box w="6px" h="6px" borderRadius="full" bg={accent} />
            <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.muted" fontWeight="800" textTransform="uppercase">
              {isPasser ? "Quarterback" : "Receiver"}
            </Text>
          </Flex>
          <Text fontSize="clamp(9px, 0.78vw, 11px)" color="text.secondary" fontWeight="800" mt="9px">
            {statLine1}
          </Text>
          <Text fontSize="clamp(9px, 0.78vw, 11px)" color="text.secondary" fontWeight="800" mt="2px">
            {statLine2}
          </Text>
        </Box>
      </Grid>

      {/* ── Bottom: 3x3 Field Grid ── */}
      <Flex flex={1} minH={0} align="stretch">
        <FieldMapGrid grid={player.grid} teamColor={teamColor} />
      </Flex>

      {/* ── Direction labels ── */}
    </VStack>
  );
};
