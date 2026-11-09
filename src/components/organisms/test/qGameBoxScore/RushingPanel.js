import { Flex, Text, Grid, Box } from "@chakra-ui/react";
import { gradeVsLeague, arrowVsBaseline } from "../../../../utils/rushingGrades";
import { useState } from "react";
import { fmt2, fmt1, fmtPct, getDisplayName, getInitials } from "../../../../utils/gameBoxScore/statHelpers";

// Existing lab presentation extracted from QGameBoxScore; compact/standard JSX is preserved.

const DefensiveImpactPills = ({ data, isCompact }) => {
  const impact = data.defenseImpact ?? [];
  if (impact.length === 0) return null;

  const primary = data.meta.colors.primary;

  // Map pill category to the keys used in the fetched season-average JSONs
  const CATEGORY_TO_AVG_KEY = {
    run_stop: "stopRate",
    line_play: "stuffRate",
    disruption: "tflRate",
    short_yardage: "powerStopRate",
    down_success: "successRate",
    explosive_prevention: "opportunityRate",
  };

  const oppPrimary = data.opponent.colors?.primary ?? primary;
  const oppSecondary = data.opponent.colors?.secondary ?? "#FFFFFF";

  return (
    <Flex direction="column" w="full" gap={isCompact ? "2px" : "4px"} flexShrink={0}>
      {/* Section header — flat team color bg, secondary font color */}
      <Flex align="center" gap={1.5} py={isCompact ? "3px" : "5px"} px={isCompact ? "4px" : "6px"} bg={oppPrimary} borderRadius="sm">
        <Text fontSize={isCompact ? "9px" : "11px"} fontWeight="900" color={oppSecondary} textTransform="uppercase" letterSpacing="0.04em">
          {data.opponent.shortName} Defensive Impact
        </Text>
      </Flex>

      {/* 3×2 Pill grid — compact horizontal layout */}
      <Grid templateColumns="repeat(3, 1fr)" gap={isCompact ? "2px" : "4px"}>
        {impact.map((pill) => {
          const avgKey = CATEGORY_TO_AVG_KEY[pill.category];
          const grade = gradeVsLeague(pill.rawValue, pill.category, data.context?.leagueAvg ?? null);
          const offArrow = arrowVsBaseline(pill.rawValue, data.context?.offenseSeasonAvg?.[avgKey] ?? null);
          const defArrow = arrowVsBaseline(pill.rawValue, data.context?.defenseSeasonAvg?.[avgKey] ?? null);

          return (
            <Flex
              key={pill.category}
              direction="column"
              bg="bg.card"
              border="1px solid whiteAlpha.100"
              borderRadius="sm"
              p={isCompact ? "3px" : "5px"}
              gap={isCompact ? "1px" : "2px"}
              justify="space-between"
            >
              {/* Row 1: Category + Grade (top-right corner) */}
              <Flex justify="space-between" align="flex-start">
                <Text fontSize={isCompact ? "8px" : "11px"} fontWeight="900" color="text.primary" lineHeight={1.1}>
                  {pill.label}
                </Text>
                <Text fontSize={isCompact ? "8px" : "11px"} fontWeight="950" color={grade.color} lineHeight={1}>
                  {grade.grade}
                </Text>
              </Flex>

              {/* Row 2: [arrow/off avg] | big number | [arrow/def avg] */}
              <Flex align="center" justify="center" gap={isCompact ? "4px" : "8px"}>
                {/* OFF context */}
                <Flex direction="column" align="center">
                  <Text fontSize={isCompact ? "7px" : "9px"} color={offArrow.color} fontWeight="900" lineHeight={1}>
                    {offArrow.arrow}
                  </Text>
                  <Text fontSize={isCompact ? "5px" : "6px"} color="text.muted" fontWeight="800" lineHeight={1}>
                    OFF
                  </Text>
                </Flex>

                {/* Big number */}
                <Text fontSize={isCompact ? "16px" : "22px"} fontWeight="950" color={grade.color} lineHeight={1} textAlign="center">
                  {pill.value}
                </Text>

                {/* DEF context */}
                <Flex direction="column" align="center">
                  <Text fontSize={isCompact ? "7px" : "9px"} color={defArrow.color} fontWeight="900" lineHeight={1}>
                    {defArrow.arrow}
                  </Text>
                  <Text fontSize={isCompact ? "5px" : "6px"} color="text.muted" fontWeight="800" lineHeight={1}>
                    DEF
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          );
        })}
      </Grid>
    </Flex>
  );
};

export const RushingPanel = ({ data, avatarMap, isCompact }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(data.rushers[0]);
  const [rushPageIndex, setRushPageIndex] = useState(0);

  // State sync during render to prevent 0/0 grid de-sync bug when game/team changes
  const [prevTeamId, setPrevTeamId] = useState(null);
  if (data.meta.shortName !== prevTeamId) {
    setPrevTeamId(data.meta.shortName);
    setSelectedPlayer(data.rushers[0]);
    setRushPageIndex(0);
  }

  const accent = data.meta.colors.accent;
  const primary = data.meta.colors.primary;

  const stuffed = data.derived.stuffedCount ?? 0;
  const opp = data.derived.opportunityCount ?? 0;
  const blocked = Math.max(0, data.team.attempts - stuffed - opp);
  const stuffedPct = data.team.attempts > 0 ? (stuffed / data.team.attempts) * 100 : 0;
  const blockedPct = data.team.attempts > 0 ? (blocked / data.team.attempts) * 100 : 0;
  const oppPct = data.team.attempts > 0 ? (opp / data.team.attempts) * 100 : 0;

  const getImageUrl = (player) => {
    const key = player?.key?.replace(/^name:/, "");
    return avatarMap[key] || avatarMap[player?.name?.toLowerCase()] || null;
  };
  const imageUrl = getImageUrl(selectedPlayer);

  return (
    <Flex direction="column" w="full" h="full" minH={0}>
      {/* Header */}
      <Flex direction="column"
        bg={isCompact ? `linear-gradient(90deg, ${primary}33 0%, transparent 72%)` : primary}
        borderBottom="1px solid whiteAlpha.200"
        px={isCompact ? 1 : 2.5}
        py={isCompact ? "3px" : "2.5px"}
        gap={isCompact ? "3px" : "0.5px"}
        flexShrink={0}
      >
        {/* Team name + RUSHING label */}
        <Flex align="center" gap={1.5} py={isCompact ? "2px" : "1px"}>
          <Flex w={isCompact ? "22px" : "18px"} h={isCompact ? "22px" : "18px"} borderRadius="sm" bg={primary} align="center" justify="center" flexShrink={0} border="1px solid whiteAlpha.200">
            <Text fontSize={isCompact ? "9px" : "8px"} fontWeight="900" color={data.meta.colors.secondary}>{data.meta.shortName}</Text>
          </Flex>
          <Text fontSize={isCompact ? "13px" : "12px"} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em">RUSHING</Text>
        </Flex>

        {/* Row 1: Team totals — CAR · YDS · YPC · TD · EPA */}
        <Flex align="center" gap={isCompact ? 2 : 3} py="1px">
          {[
            { label: "CAR", val: data.team.attempts, color: accent },
            { label: "YDS", val: data.team.yards, color: accent },
            { label: "YPC", val: fmt2(data.team.ypc), color: accent },
            { label: "TD", val: data.team.touchdowns, color: accent },
            { label: "EPA", val: data.team.epa != null ? fmt2(data.team.epa) : "—", color: accent },
          ].map((col) => (
            <Flex key={col.label} direction="column" align="center" minW={0} flex={1}>
              <Text fontSize={isCompact ? "7px" : "8px"} fontWeight="800" color="text.muted" textTransform="uppercase">{col.label}</Text>
              <Text fontSize={isCompact ? "12px" : "13px"} fontWeight="950" color={col.color}>{col.val}</Text>
            </Flex>
          ))}
        </Flex>

        {/* Row 2: Three split sections — RB CREATED | SHARED | OL EARNED */}
        <Grid templateColumns="1.1fr 1fr 1fr" gap="3px" py="1px">
          {/* RB CREATED */}
          <Flex direction="column" bg="whiteAlpha.50" px="4px" py="3px" borderRadius="sm" gap="2px">
            <Flex align="center" gap={1}>
              <Box w="2px" h="6px" bg="#E53E3E" borderRadius="full" />
              <Text fontSize={isCompact ? "6.5px" : "7.5px"} fontWeight="900" color="text.secondary" textTransform="uppercase">RB Created</Text>
            </Flex>
            <Grid templateColumns="repeat(5, 1fr)" gap="1px">
              {[
                { label: "HL YDS", val: fmt1(data.team.highlightYards) },
                { label: "HL/C", val: fmt2(data.team.highlightYardsPerRush) },
                { label: "OPP", val: data.derived.opportunityCount },
                { label: "EXP", val: fmtPct(data.team.explosiveRate) },
                { label: "1D+10", val: data.derived.opportunityCount },
              ].map((c) => (
                <Flex key={c.label} direction="column" align="center" bg="rgba(0,0,0,0.2)" py="1px" px="1px" borderRadius="xs">
                  <Text fontSize={isCompact ? "5.5px" : "6px"} fontWeight="800" color="text.muted" textTransform="uppercase">{c.label}</Text>
                  <Text fontSize={isCompact ? "8px" : "9px"} fontWeight="950" color="text.primary">{c.val}</Text>
                </Flex>
              ))}
            </Grid>
          </Flex>

          {/* SHARED */}
          <Flex direction="column" bg="whiteAlpha.50" px="4px" py="3px" borderRadius="sm" gap="2px">
            <Flex align="center" gap={1}>
              <Box w="2px" h="6px" bg="#ECC94B" borderRadius="full" />
              <Text fontSize={isCompact ? "6.5px" : "7.5px"} fontWeight="900" color="text.secondary" textTransform="uppercase">Shared</Text>
            </Flex>
            <Grid templateColumns="repeat(5, 1fr)" gap="1px">
              {[
                { label: "SUCC", val: data.derived.successfulCount ?? "—" },
                { label: "RATE", val: fmtPct(data.team.successRate) },
                { label: "1D", val: "—" },
                { label: "EXP", val: fmtPct(data.team.explosiveRate) },
                { label: "EPA/C", val: fmt2(data.team.epaPerPlay) },
              ].map((c) => (
                <Flex key={c.label} direction="column" align="center" bg="rgba(0,0,0,0.2)" py="1px" px="1px" borderRadius="xs">
                  <Text fontSize={isCompact ? "5.5px" : "6px"} fontWeight="800" color="text.muted" textTransform="uppercase">{c.label}</Text>
                  <Text fontSize={isCompact ? "8px" : "9px"} fontWeight="950" color="text.primary">{c.val}</Text>
                </Flex>
              ))}
            </Grid>
          </Flex>

          {/* OL EARNED */}
          <Flex direction="column" bg="whiteAlpha.50" px="4px" py="3px" borderRadius="sm" gap="2px">
            <Flex align="center" gap={1}>
              <Box w="2px" h="6px" bg="#48BB78" borderRadius="full" />
              <Text fontSize={isCompact ? "6.5px" : "7.5px"} fontWeight="900" color="text.secondary" textTransform="uppercase">OL Earned</Text>
            </Flex>
            <Grid templateColumns="repeat(5, 1fr)" gap="1px">
              {[
                { label: "LY", val: fmt1(data.team.lineYards) },
                { label: "LY/C", val: fmt2(data.team.lineYardsPerRush) },
                { label: "STUFF", val: data.derived.stuffedCount },
                { label: "RATE", val: fmtPct(data.team.stuffRate) },
                { label: "STOP", val: fmtPct(data.team.stoppedRate) },
              ].map((c) => (
                <Flex key={c.label} direction="column" align="center" bg="rgba(0,0,0,0.2)" py="1px" px="1px" borderRadius="xs">
                  <Text fontSize={isCompact ? "5.5px" : "6px"} fontWeight="800" color="text.muted" textTransform="uppercase">{c.label}</Text>
                  <Text fontSize={isCompact ? "8px" : "9px"} fontWeight="950" color="text.primary">{c.val}</Text>
                </Flex>
              ))}
            </Grid>
          </Flex>
        </Grid>
      </Flex>

      {/* Middle: Tables + Spotlight stacked dynamically */}
      {isCompact ? (
        <Flex direction="column" flex={1} minH={0} overflow="hidden" p="2px" gap="4px">
          {/* Top Half of Middle: Player Rushing Table (Full Width) */}
          {(() => {
            const maxCompactRushers = 4;
            const hasRushOverflow = data.rushers.length > maxCompactRushers;
            const totalRushPages = Math.ceil(data.rushers.length / maxCompactRushers);
            const visibleRushers = hasRushOverflow
              ? data.rushers.slice(rushPageIndex * maxCompactRushers, (rushPageIndex + 1) * maxCompactRushers)
              : data.rushers;

            return (
              <Box flex={1.2} overflowY="hidden" display="flex" flexDirection="column" gap="4px">
                <Grid templateColumns="minmax(0, 1.8fr) repeat(4, 1fr)" gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.50">
                  <Flex flex={1} align="center" justify="space-between" pr="2px">
                    <Flex align="center" gap={1} pl="2px">
                      <Box w="2px" h="8px" bg={accent} borderRadius="sm" />
                      <Text fontSize="10.5px" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">Rushing</Text>
                    </Flex>
                    {hasRushOverflow && (
                      <Flex align="center" gap={1.5} flexShrink={0}>
                        <Text fontSize="9px" fontWeight="955" color="text.primary" cursor="pointer"
                          opacity={rushPageIndex > 0 ? 1 : 0.3}
                          pointerEvents={rushPageIndex > 0 ? "auto" : "none"}
                          onClick={() => setRushPageIndex(rushPageIndex - 1)}
                        >▲</Text>
                        <Text fontSize="8px" fontWeight="900" color="text.muted">P.{rushPageIndex + 1}/{totalRushPages}</Text>
                        <Text fontSize="9px" fontWeight="955" color="text.primary" cursor="pointer"
                          opacity={rushPageIndex < totalRushPages - 1 ? 1 : 0.3}
                          pointerEvents={rushPageIndex < totalRushPages - 1 ? "auto" : "none"}
                          onClick={() => setRushPageIndex(rushPageIndex + 1)}
                        >▼</Text>
                      </Flex>
                    )}
                  </Flex>
                  {["CAR", "YDS", "YPC", "TD"].map((h) => (
                    <Text key={h} fontSize="10px" fontWeight="800" color="text.muted" textAlign="center">{h}</Text>
                  ))}
                </Grid>
                {visibleRushers.map((p) => {
                  const isActive = p.key === selectedPlayer.key;
                  return (
                    <Grid key={p.key} templateColumns="minmax(0, 1.8fr) repeat(4, 1fr)" gap={0} alignItems="center"
                      py="3px" cursor="pointer"
                      bg={isActive ? "whiteAlpha.250" : "transparent"}
                      borderLeft={isActive ? `4px solid ${accent}` : "4px solid transparent"}
                      _hover={{ bg: "whiteAlpha.60" }}
                      onClick={() => setSelectedPlayer(p)}
                    >
                      <Box minW={0} pl="2px">
                        <Text fontSize="11px" fontWeight={isActive ? "900" : "600"} color="text.primary" truncate>{getDisplayName(p.name)}</Text>
                        <Text fontSize="8px" color="text.muted" fontWeight="800" textTransform="uppercase">{p.position}</Text>
                      </Box>
                      <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{p.attempts}</Text>
                      <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{p.yards}</Text>
                      <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{fmt1(p.ypc)}</Text>
                      <Text fontSize="11px" fontWeight={isActive ? "900" : "500"} color="text.primary" textAlign="center">{p.touchdowns}</Text>
                    </Grid>
                  );
                })}
              </Box>
            );
          })()}

          {/* Bottom Half: Defensive Impact Pills (Compact) */}
          <Flex w="full" flex={1} minH={0} borderTop="1px solid whiteAlpha.100" pt="4px" overflow="hidden">
            <DefensiveImpactPills data={data} isCompact={isCompact} />
          </Flex>
        </Flex>
      ) : (
        <Flex direction="column" flex={1} minH={0} overflow="hidden">
          {/* Top row: Tables + Spotlight */}
          <Flex flex={1} minH={0} overflow="hidden">
            {/* Left: Tables container with scroll buttons */}
            <Flex w="55%" borderRight="1px solid whiteAlpha.100" minH={0} position="relative">
              {(() => {
                const maxRushCapacity = 7;
                const hasRushOverflow = data.rushers.length > maxRushCapacity;
                const totalRushPages = Math.ceil(data.rushers.length / maxRushCapacity);
                const startIndex = rushPageIndex * maxRushCapacity;
                const visibleRushers = hasRushOverflow
                  ? data.rushers.slice(startIndex, startIndex + maxRushCapacity)
                  : data.rushers;

                return (
                  <>
                    {/* Scroll Buttons Column (Widescreen only, when not compact and has overflow) */}
                    {hasRushOverflow && !isCompact && (
                      <Flex direction="column" w="18px" bg="rgba(0,0,0,0.3)" borderRight="1px solid whiteAlpha.100" flexShrink={0} h="full">
                        <Flex flex={1} align="center" justify="center" cursor="pointer"
                          opacity={rushPageIndex > 0 ? 1 : 0.2}
                          pointerEvents={rushPageIndex > 0 ? "auto" : "none"}
                          _hover={{ bg: "whiteAlpha.150" }}
                          onClick={() => {
                            if (rushPageIndex > 0) setRushPageIndex(rushPageIndex - 1);
                          }}
                        >
                          <Text color="text.secondary" fontSize="11px" fontWeight="black">▲</Text>
                        </Flex>
                        <Box h="1px" bg="whiteAlpha.100" w="full" />
                        <Flex flex={1} align="center" justify="center" cursor="pointer"
                          opacity={rushPageIndex < totalRushPages - 1 ? 1 : 0.2}
                          pointerEvents={rushPageIndex < totalRushPages - 1 ? "auto" : "none"}
                          _hover={{ bg: "whiteAlpha.150" }}
                          onClick={() => {
                            if (rushPageIndex < totalRushPages - 1) setRushPageIndex(rushPageIndex + 1);
                          }}
                        >
                          <Text color="text.secondary" fontSize="11px" fontWeight="black">▼</Text>
                        </Flex>
                      </Flex>
                    )}

                    {/* Table list */}
                    <Box flex={1} p="2px" overflowY="hidden" display="flex" flexDirection="column" minH={0}>
                      <Grid templateColumns="minmax(0, 1.8fr) repeat(4, 0.5fr)" gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.50">
                        <Flex align="center" gap={1} pl="2px">
                          <Box w="2px" h="8px" bg={accent} borderRadius="sm" />
                          <Text fontSize="11px" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">Rushing</Text>
                        </Flex>
                        {["CAR", "YDS", "YPC", "TD"].map((h) => (
                          <Text key={h} fontSize="11px" fontWeight="900" color="text.muted" textAlign="center" textTransform="uppercase">{h}</Text>
                        ))}
                      </Grid>
                      {visibleRushers.map((p) => {
                        const isActive = p.key === selectedPlayer.key;
                        return (
                          <Grid key={p.key} templateColumns="minmax(0, 1.8fr) repeat(4, 0.5fr)" gap={0} alignItems="center"
                            py="4px" cursor="pointer"
                            bg={isActive ? "whiteAlpha.250" : "transparent"}
                            borderLeft={isActive ? `4px solid ${accent}` : "4px solid transparent"}
                            borderBottom="1px solid whiteAlpha.50"
                            _hover={{ bg: "whiteAlpha.60" }}
                            onClick={() => setSelectedPlayer(p)}
                          >
                            <Box minW={0} pl="2px">
                              <Text fontSize="12px" fontWeight="900" color="text.primary" truncate>{getDisplayName(p.name)}</Text>
                              <Text fontSize="9px" color="text.muted" fontWeight="800" textTransform="uppercase">{p.position}</Text>
                            </Box>
                            <Text fontSize="12px" fontWeight="850" color="text.secondary" textAlign="center">{p.attempts}</Text>
                            <Text fontSize="12px" fontWeight="950" color="text.primary" textAlign="center">{p.yards}</Text>
                            <Text fontSize="12px" fontWeight="900" color="text.primary" textAlign="center">{fmt1(p.ypc)}</Text>
                            <Text fontSize="12px" fontWeight="850" color="text.secondary" textAlign="center">{p.touchdowns}</Text>
                          </Grid>
                        );
                      })}
                    </Box>
                  </>
                );
              })()}
            </Flex>

            {/* Spotlight */}
            <Box w="45%" p="3px" minH={0}>
              <Flex direction="column" w="full" h="full" gap="3px">
                {/* Avatar + Info */}
                <Grid templateColumns="80px 1fr" h="80px" border="1px solid whiteAlpha.100" borderRadius="md" overflow="hidden" bg="rgba(255,255,255,0.02)" flexShrink={0}>
                  <Flex w="80px" h="full" align="stretch" justify="stretch" borderRight="1px solid rgba(255,255,255,0.12)" bg="rgba(255,255,255,0.02)" flexShrink={0}>
                    {imageUrl ? (
                      <Box as="img" src={imageUrl} alt="" w="full" h="full" objectFit="cover" display="block" />
                    ) : (
                      <Flex w="full" h="full" bg={primary} align="center" justify="center">
                        <Text fontSize="20px" fontWeight="950" color="white" letterSpacing="-0.05em">{getInitials(selectedPlayer.name)}</Text>
                      </Flex>
                    )}
                  </Flex>
                  <Box px={3} py="4px" display="flex" flexDirection="column" justify="center" minW={0}>
                    <Text fontSize="md" fontWeight="black" color="text.primary" truncate>{getDisplayName(selectedPlayer.name)}</Text>
                    <Flex align="center" gap={1.5} mt="2px">
                      <Box w="5px" h="5px" borderRadius="full" bg={accent} />
                      <Text fontSize="11px" color="text.muted" fontWeight="900" textTransform="uppercase" letterSpacing="0.04em">{selectedPlayer.position} selected player</Text>
                    </Flex>
                    <Text fontSize="11px" fontWeight="900" color="text.primary" mt="3px" letterSpacing="0.02em">{selectedPlayer.attempts} CAR · {selectedPlayer.yards} YDS · {selectedPlayer.touchdowns} TD</Text>
                    {/* Anatomy bar */}
                    <Box h="4px" w="full" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" display="flex" mt="2px">
                      {stuffedPct > 0 && <Box h="full" w={`${stuffedPct}%`} bg="#E53E3E" />}
                      {blockedPct > 0 && <Box h="full" w={`${blockedPct}%`} bg="#4A90D9" />}
                      {oppPct > 0 && <Box h="full" w={`${oppPct}%`} bg="#48BB78" />}
                    </Box>
                    <Flex justify="space-between" mt="1px">
                      <Text fontSize="5px" fontWeight="800" color="text.muted">STUFF: {fmtPct(stuffedPct / 100)}</Text>
                      <Text fontSize="5px" fontWeight="800" color="text.muted">BLOCK: {fmtPct(blockedPct / 100)}</Text>
                      <Text fontSize="5px" fontWeight="800" color="text.muted">EXPL: {fmtPct(oppPct / 100)}</Text>
                    </Flex>
                  </Box>
                </Grid>

                {/* Lane Grid */}
                <Grid templateColumns="repeat(3, 1fr)" gap="2px" flex={1} minH={0}>
                  {["left", "middle", "right"].map((k) => {
                    const lane = selectedPlayer.lanes[k];
                    const laneYpc = lane.attempts > 0 ? lane.yards / lane.attempts : 0;
                    const label = k === "left" ? "LEFT" : k === "middle" ? "MIDDLE" : "RIGHT";
                    return (
                      <Flex key={k} direction="column" justify="space-between" p="3px" bg="rgba(255,255,255,0.02)" border="1px solid whiteAlpha.100" borderRadius="sm">
                        <Text fontSize="7px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">{label}</Text>
                        <Box my="auto">
                          <Text fontSize="clamp(14px, 1.2vw, 18px)" color="text.primary" fontWeight="950" lineHeight={1.05}>{lane.attempts > 0 ? `${fmt1(laneYpc)}y` : "—"}</Text>
                          <Text fontSize="8px" color={laneYpc >= 4 ? "#48BB78" : laneYpc <= 2 && lane.attempts > 0 ? "#E53E3E" : "text.secondary"} fontWeight="900" mt="1px">{lane.attempts} CAR · {lane.yards} YDS</Text>
                        </Box>
                      </Flex>
                    );
                  })}
                </Grid>
              </Flex>
            </Box>
          </Flex>

          {/* Bottom row: Defensive Impact Pills (Standard) */}
          <Box borderTop="1px solid whiteAlpha.100" p="4px" flexShrink={0}>
            <DefensiveImpactPills data={data} isCompact={isCompact} />
          </Box>
        </Flex>
      )}
    </Flex>
  );
};
