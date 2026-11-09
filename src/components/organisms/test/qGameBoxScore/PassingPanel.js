import { Flex, Text, Grid, Box } from "@chakra-ui/react";
import { useState } from "react";
import { getLastNameOnly, getDisplayName, getInitials } from "../../../../utils/gameBoxScore/statHelpers";
import { DefenseIdentityCompact } from "./DefenseIdentityCompact";

// Existing lab presentation extracted from QGameBoxScore; compact/standard JSX is preserved.

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
};

const getCellColor = (comp, att, color) => {
  if (att === 0) return "transparent";
  const rate = comp / att;
  const rgb = hexToRgb(color);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.15 + rate * 0.65})`;
};

const getCellTextColor = (comp, att) => {
  if (att === 0) return "#71717A";
  return comp / att >= 0.5 ? "#FFFFFF" : "#F4F4F5";
};

const StatPill = ({ label, value }) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    bg="whiteAlpha.50"
    border="1px solid whiteAlpha.100"
    borderRadius="sm"
    px="6px"
    py="2px"
    flex={1}
    gap="1px"
  >
    <Text fontSize="7px" fontWeight="800" color="text.muted" textTransform="uppercase" lineHeight={1}>{label}</Text>
    <Text fontSize="11px" fontWeight="950" color="text.primary" lineHeight={1}>{value}</Text>
  </Flex>
);

export const PassingPanel = ({ data, avatarMap, isCompact }) => {
  const [activePlayer, setActivePlayer] = useState({ ...data.passers[0], _type: "passer" });
  const [wrPageIndex, setWrPageIndex] = useState(0);

  // State sync during render to prevent 0/0 grid de-sync bug when game/team changes
  const [prevTeamId, setPrevTeamId] = useState(null);
  if (data.meta.shortName !== prevTeamId) {
    setPrevTeamId(data.meta.shortName);
    setActivePlayer({ ...data.passers[0], _type: "passer" });
    setWrPageIndex(0);
  }

  const isPasser = activePlayer._type === "passer";
  const accent = isPasser ? "#E53E3E" : "#4A90D9";

  const getImageUrl = (player) => {
    const key = player?.key?.replace(/^name:/, "");
    return avatarMap[key] || avatarMap[player?.name?.toLowerCase()] || null;
  };
  const imageUrl = getImageUrl(activePlayer);

  const teamCmpPct = data.passing.attempts > 0 ? ((data.passing.completions / data.passing.attempts) * 100).toFixed(1) + "%" : "0%";
  const teamYpa = data.passing.attempts > 0 ? (data.passing.yards / data.passing.attempts).toFixed(1) : "0.0";
  const stdCmpPct = data.downSplit.standard.att > 0 ? ((data.downSplit.standard.comp / data.downSplit.standard.att) * 100).toFixed(1) + "%" : "0%";
  const stdYpa = data.downSplit.standard.att > 0 ? (data.downSplit.standard.yards / data.downSplit.standard.att).toFixed(1) : "0.0";
  const passCmpPct = data.downSplit.passing.att > 0 ? ((data.downSplit.passing.comp / data.downSplit.passing.att) * 100).toFixed(1) + "%" : "0%";
  const passYpa = data.downSplit.passing.att > 0 ? (data.downSplit.passing.yards / data.downSplit.passing.att).toFixed(1) : "0.0";

  return (
    <Flex direction="column" w="full" h="full" minH={0}>
      {/* Header */}
      <Flex direction="column"
        bg={isCompact ? `linear-gradient(90deg, ${data.meta.colors.primary}44 0%, transparent 70%)` : data.meta.colors.primary}
        borderBottom="1px solid whiteAlpha.200"
        px={isCompact ? 1 : 2.5}
        py={isCompact ? "3px" : "2.5px"}
        gap={isCompact ? 0 : "0.5px"}
        flexShrink={0}
      >
        {isCompact ? (
          <Flex align="center" gap={1.5} py="2px">
            <Flex w="18px" h="18px" borderRadius="sm" bg={data.meta.colors.primary} align="center" justify="center" flexShrink={0} border="1px solid whiteAlpha.200">
              <Text fontSize="8px" fontWeight="800" color={data.meta.colors.secondary}>{data.meta.shortName}</Text>
            </Flex>
            <Text fontSize="11px" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.06em">PASSING</Text>
          </Flex>
        ) : (
          <Flex align="center" gap={1.5} py="1px">
            <Flex w="18px" h="18px" borderRadius="sm" bg={data.meta.colors.primary} align="center" justify="center" flexShrink={0} border="1px solid whiteAlpha.200">
              <Text fontSize="8px" fontWeight="900" color={data.meta.colors.secondary}>{data.meta.shortName}</Text>
            </Flex>
            <Text fontSize="12px" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em">PASSING</Text>
          </Flex>
        )}

        <Grid templateColumns={isCompact ? "35px repeat(6, 1fr)" : "48px repeat(6, 1fr)"} gap={0} alignItems="center">
          <Box />
          {["CMP", "ATT", "YDS", "CMP%", "INT", "YPA"].map((h) => (
            <Text key={h} fontSize={isCompact ? "6.5px" : "8px"} fontWeight="800" color={isCompact ? "text.muted" : "whiteAlpha.800"} textAlign="center" textTransform="uppercase">{h}</Text>
          ))}
          {[
            { label: "Total", comp: data.passing.completions, att: data.passing.attempts, yards: data.passing.yards, cmpPct: teamCmpPct, int: data.passing.interceptions, ypa: teamYpa, bold: true },
            ...(!isCompact ? [
              { label: "Standard", comp: data.downSplit.standard.comp, att: data.downSplit.standard.att, yards: data.downSplit.standard.yards, cmpPct: stdCmpPct, int: 0, ypa: stdYpa, bold: false },
              { label: "Passing", comp: data.downSplit.passing.comp, att: data.downSplit.passing.att, yards: data.downSplit.passing.yards, cmpPct: passCmpPct, int: 0, ypa: passYpa, bold: false }
            ] : [])
          ].map((row) => (
            <Flex key={row.label} gridColumn="span 7" alignItems="center" py={isCompact ? "2px" : "0.5px"}>
              <Text fontSize={row.bold ? (isCompact ? "7.5px" : "8.5px") : (isCompact ? "6.5px" : "7.5px")} fontWeight="900" color={row.bold ? "text.primary" : (isCompact ? "text.secondary" : "whiteAlpha.800")} w={isCompact ? "35px" : "48px"} textTransform={row.bold ? "uppercase" : "none"} pl="2px">{row.label}</Text>
              <Text fontSize={row.bold ? (isCompact ? "8.5px" : "10px") : (isCompact ? "7.5px" : "8.5px")} fontWeight="900" color={row.bold ? (isCompact ? "brand.400" : "white") : (isCompact ? "text.primary" : "whiteAlpha.900")} flex={1} textAlign="center">{row.comp}</Text>
              <Text fontSize={row.bold ? (isCompact ? "8.5px" : "10px") : (isCompact ? "7.5px" : "8.5px")} fontWeight="900" color={row.bold ? (isCompact ? "brand.400" : "white") : (isCompact ? "text.primary" : "whiteAlpha.900")} flex={1} textAlign="center">{row.att}</Text>
              <Text fontSize={row.bold ? (isCompact ? "8.5px" : "10px") : (isCompact ? "7.5px" : "8.5px")} fontWeight="900" color={row.bold ? (isCompact ? "brand.400" : "white") : (isCompact ? "text.primary" : "whiteAlpha.900")} flex={1} textAlign="center">{row.yards}</Text>
              <Text fontSize={row.bold ? (isCompact ? "8.5px" : "10px") : (isCompact ? "7.5px" : "8.5px")} fontWeight="900" color={row.bold ? (isCompact ? "brand.400" : "white") : (isCompact ? "text.primary" : "whiteAlpha.900")} flex={1} textAlign="center">{row.cmpPct}</Text>
              <Text fontSize={row.bold ? (isCompact ? "8.5px" : "10px") : (isCompact ? "7.5px" : "8.5px")} fontWeight="900" color={row.bold ? (isCompact ? "brand.400" : "white") : (isCompact ? "text.primary" : "whiteAlpha.900")} flex={1} textAlign="center">{row.int}</Text>
              <Text fontSize={row.bold ? (isCompact ? "8.5px" : "10px") : (isCompact ? "7.5px" : "8.5px")} fontWeight="900" color={row.bold ? (isCompact ? "brand.400" : "white") : (isCompact ? "text.primary" : "whiteAlpha.900")} flex={1} textAlign="center">{row.ypa}</Text>
            </Flex>
          ))}
        </Grid>
      </Flex>

      {/* Middle: Tables + Spotlight stacked dynamically */}
      {isCompact ? (
        <Flex direction="column" flex={1} minH={0} overflow="hidden" p="2px" gap="4px">
          {/* Top Half of Middle: Player Lists (Full Width) */}
          <Box flex={1.2} overflowY="hidden" display="flex" flexDirection="column" gap="4px">
            {/* Passer list */}
            <Box>
              <Grid templateColumns="minmax(0, 1.1fr) repeat(6, 0.85fr)" gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.50">
                <Flex align="center" gap={1} pl="2px">
                  <Box w="2px" h="8px" bg="#E53E3E" borderRadius="sm" />
                  <Text fontSize="10px" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">Passing</Text>
                </Flex>
                {["CMP", "ATT", "YDS", "TD", "INT", "CMP%"].map((h) => (
                  <Text key={h} fontSize="9px" fontWeight="800" color="text.muted" textAlign="center">{h}</Text>
                ))}
              </Grid>
              {data.passers.map((p) => {
                const isActive = p.key === activePlayer.key && isPasser;
                const cmpPct = p.attempts > 0 ? ((p.completions / p.attempts) * 100).toFixed(1) + "%" : "0%";
                return (
                  <Grid key={p.key} templateColumns="minmax(0, 1.2fr) repeat(6, 0.8fr)" gap={0} alignItems="center"
                    py="2px" cursor="pointer"
                    bg={isActive ? "whiteAlpha.150" : "transparent"}
                    borderLeft={isActive ? "3px solid #E53E3E" : "3px solid transparent"}
                    _hover={{ bg: "whiteAlpha.60" }}
                    onClick={() => setActivePlayer({ ...p, _type: "passer" })}
                  >
                    <Text fontSize="11px" fontWeight={isActive ? "900" : "600"} color={isActive ? "#F56565" : "text.primary"} pl="2px" truncate>{getLastNameOnly(p.name)}</Text>
                    <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{p.completions}</Text>
                    <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{p.attempts}</Text>
                    <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{p.yards}</Text>
                    <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{p.touchdowns}</Text>
                    <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{p.interceptions}</Text>
                    <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{cmpPct}</Text>
                  </Grid>
                );
              })}
            </Box>

            {/* Receiver list */}
            {(() => {
              const maxCompactWrs = 3;
              const hasWrOverflow = data.receivers.length > maxCompactWrs;
              const totalWrPages = Math.ceil(data.receivers.length / maxCompactWrs);
              const visibleReceivers = hasWrOverflow
                ? data.receivers.slice(wrPageIndex * maxCompactWrs, (wrPageIndex + 1) * maxCompactWrs)
                : data.receivers;

              return (
                <Box>
                  <Grid templateColumns="minmax(0, 1.1fr) repeat(6, 0.85fr)" gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.50">
                    <Flex flex={1} align="center" justify="space-between" pr="2px">
                      <Flex align="center" gap={1} pl="2px">
                        <Box w="2px" h="8px" bg="#4A90D9" borderRadius="sm" />
                        <Text fontSize="10px" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">Receiving</Text>
                      </Flex>
                      {hasWrOverflow && (
                        <Flex align="center" gap={1} flexShrink={0}>
                          <Text fontSize="8px" fontWeight="950" color="text.primary" cursor="pointer"
                            opacity={wrPageIndex > 0 ? 1 : 0.3}
                            pointerEvents={wrPageIndex > 0 ? "auto" : "none"}
                            onClick={() => setWrPageIndex(wrPageIndex - 1)}
                          >▲</Text>
                          <Text fontSize="7px" fontWeight="900" color="text.muted">{wrPageIndex + 1}/{totalWrPages}</Text>
                          <Text fontSize="8px" fontWeight="950" color="text.primary" cursor="pointer"
                            opacity={wrPageIndex < totalWrPages - 1 ? 1 : 0.3}
                            pointerEvents={wrPageIndex < totalWrPages - 1 ? "auto" : "none"}
                            onClick={() => setWrPageIndex(wrPageIndex + 1)}
                          >▼</Text>
                        </Flex>
                      )}
                    </Flex>
                    {["REC", "TGT", "YDS", "TD", "YPC", "YPT"].map((h) => (
                      <Text key={h} fontSize="9px" fontWeight="800" color="text.muted" textAlign="center">{h}</Text>
                    ))}
                  </Grid>
                  {visibleReceivers.map((r) => {
                    const isActive = r.key === activePlayer.key && !isPasser;
                    const ypc = r.receptions > 0 ? (r.yards / r.receptions).toFixed(1) : "0.0";
                    const ypt = r.targets > 0 ? (r.yards / r.targets).toFixed(1) : "0.0";
                    return (
                      <Grid key={r.key} templateColumns="minmax(0, 1.2fr) repeat(6, 0.8fr)" gap={0} alignItems="center"
                        py="2px" cursor="pointer"
                        bg={isActive ? "whiteAlpha.150" : "transparent"}
                        borderLeft={isActive ? "3px solid #4A90D9" : "3px solid transparent"}
                        _hover={{ bg: "whiteAlpha.60" }}
                        onClick={() => setActivePlayer({ ...r, _type: "receiver" })}
                      >
                        <Text fontSize="11px" fontWeight={isActive ? "900" : "600"} color={isActive ? "#63B3ED" : "text.primary"} pl="2px" truncate>{getLastNameOnly(r.name)}</Text>
                        <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{r.receptions}</Text>
                        <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{r.targets}</Text>
                        <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{r.yards}</Text>
                        <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{r.touchdowns}</Text>
                        <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{ypc}</Text>
                        <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{ypt}</Text>
                      </Grid>
                    );
                  })}
                </Box>
              );
            })()}
          </Box>

          {/* Bottom Half of Middle: Spotlight & Map (Side-by-Side) */}
          <Flex w="full" flex={1} minH="120px" gap="4px" borderTop="1px solid whiteAlpha.100" pt="4px">
            {/* Spotlight — no picture, smaller width */}
            <Box w="28%" h="full" minW={0}>
              <Flex direction="column" justify="center" h="full" px={2} py="2px" gap="1px"
                bg={`${data.meta.colors.primary}18`}
                border={`1px solid ${data.meta.colors.primary}35`}
                borderRadius="sm"
              >
                <Text fontSize="12px" fontWeight="black" color="text.primary" truncate>{getLastNameOnly(activePlayer.name)}</Text>
                <Text fontSize="8px" color={accent} fontWeight="900" textTransform="uppercase">{activePlayer.position || (isPasser ? "QB" : "WR")}</Text>
                <Text fontSize="10px" color="text.primary" fontWeight="bold">
                  {isPasser
                    ? `${activePlayer.completions}/${activePlayer.attempts} C/A`
                    : `${activePlayer.receptions}/${activePlayer.targets} R/T`
                  }
                </Text>
                <Text fontSize="10px" color="brand.400" fontWeight="black">
                  {activePlayer.yards} YDS · {activePlayer.touchdowns} TD
                </Text>
              </Flex>
            </Box>

            {/* Map — wider */}
            <Box flex={1} h="full">
              <PassingFieldMap grid={activePlayer.grid} teamColor={data.meta.colors.primary} isCompact={true} />
            </Box>
          </Flex>
        </Flex>
      ) : (
        <Flex flex={1} minH={0} overflow="hidden">
          {/* Left: Tables container with scroll buttons */}
          <Flex w="55%" borderRight="1px solid whiteAlpha.100" minH={0} position="relative">
            {/* Dynamic real-estate pagination calculations */}
            {(() => {
              const qbCount = data.passers.length;
              const maxWrCapacity = 8 - qbCount;
              const hasWrOverflow = data.receivers.length > maxWrCapacity;
              const totalWrPages = Math.ceil(data.receivers.length / maxWrCapacity);
              const startIndex = wrPageIndex * maxWrCapacity;
              const visibleReceivers = hasWrOverflow
                ? data.receivers.slice(startIndex, startIndex + maxWrCapacity)
                : data.receivers;

              return (
                <>
                  {/* Scroll Buttons Column (Widescreen only, when not compact and has WR overflow) */}
                  {hasWrOverflow && !isCompact && (
                    <Flex direction="column" w="18px" bg="rgba(0,0,0,0.3)" borderRight="1px solid whiteAlpha.100" flexShrink={0} h="full">
                      {/* Up page button */}
                      <Flex flex={1} align="center" justify="center" cursor="pointer"
                        opacity={wrPageIndex > 0 ? 1 : 0.2}
                        pointerEvents={wrPageIndex > 0 ? "auto" : "none"}
                        _hover={{ bg: "whiteAlpha.150" }}
                        onClick={() => {
                          if (wrPageIndex > 0) setWrPageIndex(wrPageIndex - 1);
                        }}
                      >
                        <Text color="text.secondary" fontSize="11px" fontWeight="black">▲</Text>
                      </Flex>
                      {/* Divider */}
                      <Box h="1px" bg="whiteAlpha.100" w="full" />
                      {/* Down page button */}
                      <Flex flex={1} align="center" justify="center" cursor="pointer"
                        opacity={wrPageIndex < totalWrPages - 1 ? 1 : 0.2}
                        pointerEvents={wrPageIndex < totalWrPages - 1 ? "auto" : "none"}
                        _hover={{ bg: "whiteAlpha.150" }}
                        onClick={() => {
                          if (wrPageIndex < totalWrPages - 1) setWrPageIndex(wrPageIndex + 1);
                        }}
                      >
                        <Text color="text.secondary" fontSize="11px" fontWeight="black">▼</Text>
                      </Flex>
                    </Flex>
                  )}

                  {/* Table list */}
                  <Box flex={1} p="3px" overflowY="hidden" display="flex" flexDirection="column" gap="3px">
                    {/* Passers */}
                    <Box>
                      <Grid templateColumns="minmax(0, 2.2fr) repeat(6, 0.8fr)" gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.50">
                        <Flex align="center" gap={1} pl="2px">
                          <Box w="2px" h="8px" bg="#E53E3E" borderRadius="sm" />
                          <Text fontSize="11px" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">Passing</Text>
                        </Flex>
                        {["CMP", "ATT", "YDS", "TD", "INT", "CMP%"].map((h) => (
                          <Text key={h} fontSize="11px" fontWeight="700" color="text.muted" textAlign="center" textTransform="uppercase">{h}</Text>
                        ))}
                      </Grid>
                      {data.passers.map((p) => {
                        const isActive = p.key === activePlayer.key && isPasser;
                        const cmpPct = p.attempts > 0 ? ((p.completions / p.attempts) * 100).toFixed(1) + "%" : "0%";
                        return (
                          <Grid key={p.key} templateColumns="minmax(0, 2.2fr) repeat(6, 0.8fr)" gap={0} alignItems="center"
                            py="3px" cursor="pointer"
                            bg={isActive ? "whiteAlpha.250" : "transparent"}
                            borderLeft={isActive ? "4px solid #E53E3E" : "4px solid transparent"}
                            _hover={{ bg: "whiteAlpha.60" }}
                            onClick={() => setActivePlayer({ ...p, _type: "passer" })}
                          >
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color="text.primary" pl="2px" truncate>{getDisplayName(p.name)}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#E53E3E" : "text.primary"} textAlign="center">{p.completions}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#E53E3E" : "text.primary"} textAlign="center">{p.attempts}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#E53E3E" : "text.primary"} textAlign="center">{p.yards}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#E53E3E" : "text.primary"} textAlign="center">{p.touchdowns}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#E53E3E" : "text.primary"} textAlign="center">{p.interceptions}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#E53E3E" : "text.primary"} textAlign="center">{cmpPct}</Text>
                          </Grid>
                        );
                      })}
                    </Box>

                    {/* Receivers */}
                    <Box mt="3px">
                      <Grid templateColumns="minmax(0, 2.2fr) repeat(6, 0.8fr)" gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.50">
                        <Flex align="center" gap={1} pl="2px">
                          <Box w="2px" h="8px" bg="#4A90D9" borderRadius="sm" />
                          <Text fontSize="11px" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">Receiving</Text>
                        </Flex>
                        {["REC", "TGT", "YDS", "TD", "YPC", "YPT"].map((h) => (
                          <Text key={h} fontSize="11px" fontWeight="700" color="text.muted" textAlign="center" textTransform="uppercase">{h}</Text>
                        ))}
                      </Grid>
                      {visibleReceivers.map((r) => {
                        const isActive = r.key === activePlayer.key && !isPasser;
                        const ypc = r.receptions > 0 ? (r.yards / r.receptions).toFixed(1) : "0.0";
                        const ypt = r.targets > 0 ? (r.yards / r.targets).toFixed(1) : "0.0";
                        return (
                          <Grid key={r.key} templateColumns="minmax(0, 2.2fr) repeat(6, 0.8fr)" gap={0} alignItems="center"
                            py="3px" cursor="pointer"
                            bg={isActive ? "whiteAlpha.250" : "transparent"}
                            borderLeft={isActive ? "4px solid #4A90D9" : "4px solid transparent"}
                            _hover={{ bg: "whiteAlpha.60" }}
                            onClick={() => setActivePlayer({ ...r, _type: "receiver" })}
                          >
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color="text.primary" pl="2px" truncate>{getDisplayName(r.name)}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#4A90D9" : "text.primary"} textAlign="center">{r.receptions}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#4A90D9" : "text.primary"} textAlign="center">{r.targets}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#4A90D9" : "text.primary"} textAlign="center">{r.yards}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#4A90D9" : "text.primary"} textAlign="center">{r.touchdowns}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#4A90D9" : "text.primary"} textAlign="center">{ypc}</Text>
                            <Text fontSize="12px" fontWeight={isActive ? "850" : "500"} color={isActive ? "#4A90D9" : "text.primary"} textAlign="center">{ypt}</Text>
                          </Grid>
                        );
                      })}
                    </Box>
                  </Box>
                </>
              );
            })()}
          </Flex>

          {/* Right: Spotlight */}
          <Box w="45%" p="3px" overflow="hidden">
            <Flex direction="column" w="full" h="full" gap="4px">
              <Grid templateColumns="80px 1fr" h="80px" border="1px solid rgba(255,255,255,0.15)" borderRadius="md" overflow="hidden" bg="rgba(255,255,255,0.02)" flexShrink={0}>
                <Flex w="80px" h="full" align="stretch" justify="stretch" borderRight="1px solid rgba(255,255,255,0.12)" bg="rgba(255,255,255,0.02)" flexShrink={0}>
                  {imageUrl ? (
                    <Box as="img" src={imageUrl} alt="" w="full" h="full" objectFit="cover" display="block" />
                  ) : (
                    <Flex w="full" h="full" bg={data.meta.colors.primary} align="center" justify="center">
                      <Text fontSize="20px" fontWeight="950" color="white">{getInitials(activePlayer.name)}</Text>
                    </Flex>
                  )}
                </Flex>
                <Box px={3} py="4px" display="flex" flexDirection="column" justify="center" minW={0} gap="6px">
                  {/* Row 1: Name + Position accent */}
                  <Flex justify="space-between" align="baseline" gap={2}>
                    <Text fontSize="md" fontWeight="black" color="text.primary" truncate lineHeight={1}>{getDisplayName(activePlayer.name)}</Text>
                    <Text fontSize="10px" color={accent} fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1} flexShrink={0}>{isPasser ? "QB" : "WR"}</Text>
                  </Flex>

                  {/* Row 2: 3 stat pills */}
                  <Flex gap="4px">
                    {isPasser ? (
                      <>
                        <StatPill label="CMP" value={activePlayer.completions} />
                        <StatPill label="ATT" value={activePlayer.attempts} />
                        <StatPill label="YDS" value={activePlayer.yards} />
                      </>
                    ) : (
                      <>
                        <StatPill label="TGT" value={activePlayer.targets} />
                        <StatPill label="REC" value={activePlayer.receptions} />
                        <StatPill label="YDS" value={activePlayer.yards} />
                      </>
                    )}
                  </Flex>

                  {/* Row 3: 3 stat pills */}
                  <Flex gap="4px">
                    {isPasser ? (
                      <>
                        <StatPill label="CMP%" value={activePlayer.attempts > 0 ? ((activePlayer.completions / activePlayer.attempts) * 100).toFixed(1) + "%" : "0.0%"} />
                        <StatPill label="Y/A" value={activePlayer.attempts > 0 ? (activePlayer.yards / activePlayer.attempts).toFixed(1) : "0.0"} />
                        <StatPill label="EPA" value={activePlayer.epa != null ? activePlayer.epa.toFixed(2) : "—"} />
                      </>
                    ) : (
                      <>
                        <StatPill label="SUCC%" value={activePlayer.targets > 0 ? ((activePlayer.receptions / activePlayer.targets) * 100).toFixed(1) + "%" : "0.0%"} />
                        <StatPill label="Y/C" value={activePlayer.receptions > 0 ? (activePlayer.yards / activePlayer.receptions).toFixed(1) : "0.0"} />
                        <StatPill label="Y/T" value={activePlayer.targets > 0 ? (activePlayer.yards / activePlayer.targets).toFixed(1) : "0.0"} />
                      </>
                    )}
                  </Flex>
                </Box>
              </Grid>
              {/* Field Map */}
              <Box flex={1} minH={0}>
                <PassingFieldMap grid={activePlayer.grid} teamColor={data.meta.colors.primary} isCompact={false} />
              </Box>
            </Flex>
          </Box>
        </Flex>
      )}
      {/* Footer Defense Identity */}
      <Box px={isCompact ? 1 : 2} py={isCompact ? "2px" : "4px"} borderTop="1px solid whiteAlpha.100" flexShrink={0}>
        <DefenseIdentityCompact defense={data.oppDefense} isCompact={isCompact} />
      </Box>
    </Flex>
  );
};

const PassingFieldMap = ({ grid, teamColor, isCompact }) => {
  const depths = [
    { key: "deep", label: "DEEP", range: ">12" },
    { key: "medium", label: "MED", range: "4-12" },
    { key: "short", label: "SHORT", range: "<4" },
  ];
  const directions = ["left", "middle", "right"];

  return (
    <Flex direction="column" w="full" h="full" gap="1px">
      <Flex flex={1} gap="2px" minH={0}>
        <Flex direction="column" gap="1px" w={isCompact ? "28px" : "44px"} flexShrink={0}>
          {depths.map((d) => (
            <Flex key={d.key} direction="column" align="flex-end" justify="center" flex={1} pr="2px">
              <Text fontSize={isCompact ? "8px" : "13px"} fontWeight="800" color="text.secondary" textTransform="uppercase" lineHeight={1}>{d.label}</Text>
              <Text fontSize={isCompact ? "6px" : "10px"} color="text.muted" fontWeight="700" lineHeight={1}>{d.range}</Text>
            </Flex>
          ))}
        </Flex>
        <Box flex={1} position="relative" borderRadius="sm" overflow="hidden"
          bg="linear-gradient(180deg, #1a3d1a 0%, #0d260d 100%)"
          border="1px solid rgba(255,255,255,0.15)"
        >
          <Box position="absolute" left="0" right="0" top="33.3%" h="1px" bg="rgba(255,255,255,0.12)" />
          <Box position="absolute" left="0" right="0" top="66.6%" h="1px" bg="rgba(255,255,255,0.12)" />
          <Box position="absolute" top="0" bottom="0" left="33.3%" w="1px" bg="rgba(255,255,255,0.12)" />
          <Box position="absolute" top="0" bottom="0" left="66.6%" w="1px" bg="rgba(255,255,255,0.12)" />

          {/* Faint yard markers */}
          {!isCompact && (
            <Flex position="absolute" inset="0" direction="column" justify="space-around" pointerEvents="none" opacity={0.15}>
              <Box w="full" h="1px" borderTop="1px dashed white" />
              <Box w="full" h="1px" borderTop="1px dashed white" />
              <Box w="full" h="1px" borderTop="1px dashed white" />
              <Box w="full" h="1px" borderTop="1px dashed white" />
            </Flex>
          )}

          <Grid position="absolute" inset="1px" templateColumns="repeat(3, 1fr)" templateRows="repeat(3, 1fr)" gap="1px">
            {depths.map((d) =>
              directions.map((dir) => {
                const cell = grid?.[d.key]?.[dir] ?? { comp: 0, att: 0, yards: 0 };
                const hasData = cell.att > 0;
                const bg = hasData ? getCellColor(cell.comp, cell.att, teamColor) : (isCompact ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.04)");
                const textColor = hasData ? getCellTextColor(cell.comp, cell.att) : "#71717A";
                return (
                  <Flex key={`${d.key}-${dir}`} direction="column" align="center" justify="center"
                    bg={bg}
                    borderRadius="sm"
                    border={hasData ? `1px solid ${teamColor}66` : (isCompact ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.12)")}
                  >
                    <Text fontSize={isCompact ? "clamp(8px, 0.7vw, 12px)" : "16px"} fontWeight="950" color={textColor} lineHeight={1}>{cell.comp}/{cell.att}</Text>
                    <Text fontSize={isCompact ? "clamp(6px, 0.5vw, 9px)" : "12px"} fontWeight="800" color={textColor} lineHeight={1} mt="2px" opacity={0.9}>{cell.yards}y</Text>
                  </Flex>
                );
              })
            )}
          </Grid>
        </Box>
      </Flex>
      <Flex gap="2px" pl={isCompact ? "28px" : "44px"}>
        {["Left", "Middle", "Right"].map((d) => (
          <Text key={d} flex={1} fontSize={isCompact ? "8px" : "13px"} fontWeight="800" color="text.muted" textAlign="center" textTransform="uppercase">{d}</Text>
        ))}
      </Flex>
    </Flex>
  );
};
