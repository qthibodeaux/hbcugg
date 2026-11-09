import { useRef, useMemo, useState } from "react";
import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { ExportCardButton } from "../../../components/organisms/stats/ExportCardButton";
import { exportName, ExportFrame, DESTINY_RING, TeamLogo, heatColor, MatrixControl } from "./StandingsPrimitives";
import { DivisionFinishMatrixMobile, CellMove } from "./StandingsMobile";
import { TEAM_BY_ID, teamLabel, recordText, GROUP_DEFS } from "./standingsData";

// Desktop division finish matrix and conference/division selection.

const DivisionFinishMatrix = ({ group }) => {
  const posterRef = useRef(null);
  const rowsById = useMemo(
    () => new Map(group.rows.map((row) => [row.id, row])),
    [group.rows]
  );
  return (
  <Box bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="xl" overflow="hidden">
    <style>{`
      @media (min-width: 641px) and (max-width: 900px) {
        .finish-matrix-team-name { display: none !important; }
        .finish-matrix-grid {
          grid-template-columns: 58px repeat(6, minmax(58px, 1fr)) !important;
          min-width: 430px !important;
        }
      }
    `}</style>
    <Flex px={5} py={4} align="center" justify="space-between" borderBottom="1px solid" borderColor="line">
      <Box>
        <Text fontSize="10px" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Finish Matrix
        </Text>
        <Text fontSize="2xl" color="var(--gg-ink)" fontWeight="black" textTransform="uppercase" lineHeight={1}>
          {group.label}
        </Text>
      </Box>
      <ExportCardButton target={posterRef} filename={exportName("finish-matrix", group)} />
    </Flex>
    <ExportFrame frameRef={posterRef}>
      <Box px="0.6rem" py="0.5rem" borderBottom="1px solid" borderColor="line">
        <Text fontSize="0.55rem" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">Finish Matrix</Text>
        <Text fontSize="1.1rem" color="var(--gg-ink)" fontWeight="black" textTransform="uppercase" lineHeight={1}>{group.label}</Text>
        <Flex mt="0.4rem" gap="0.9rem">
          <Text fontSize="0.6rem" color="text.secondary" fontWeight="black" textTransform="uppercase" letterSpacing="0.06em"><Text as="span" color="var(--gg-ink)">{group.completedGames}</Text> completed games</Text>
          <Text fontSize="0.6rem" color="text.secondary" fontWeight="black" textTransform="uppercase" letterSpacing="0.06em"><Text as="span" color="var(--gg-ink)">{group.remainingGames}</Text> remaining</Text>
        </Flex>
      </Box>
      <DivisionFinishMatrixMobile group={group} />
    </ExportFrame>
    <Flex px={5} py={3} gap={5} bg="blackAlpha.300" borderBottom="1px solid" borderColor="line" wrap="wrap">
      <Text fontSize="sm" color="text.secondary"><Text as="span" color="var(--gg-ink)" fontWeight="black">Teams:</Text> {group.rows.length}</Text>
      <Text fontSize="sm" color="text.secondary"><Text as="span" color="var(--gg-ink)" fontWeight="black">Completed Games:</Text> {group.completedGames}</Text>
      <Text fontSize="sm" color="text.secondary"><Text as="span" color="var(--gg-ink)" fontWeight="black">Remaining Games:</Text> {group.remainingGames}</Text>
    </Flex>

    <Box overflowX="auto">
      <Grid className="finish-matrix-grid" templateColumns={`190px repeat(${group.rows.length}, minmax(78px, 1fr))`} minW={`${190 + group.rows.length * 78}px`}>
        <Box px={4} py={3} bg="blackAlpha.300" borderRight="1px solid" borderBottom="1px solid" borderColor="line">
          <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">Team</Text>
        </Box>
        {group.rows.map((_, index) => (
          <Box key={index} px={3} py={3} bg="blackAlpha.300" borderBottom="1px solid" borderColor="line">
            <Text fontSize="9px" color={index === 0 ? group.accent : "text.muted"} fontWeight="black" textAlign="center" textTransform="uppercase">
              Finish {index + 1}
            </Text>
          </Box>
        ))}

        {group.finishMatrix.map((matrixRow) => {
          const row = rowsById.get(matrixRow.teamId);
          const team = TEAM_BY_ID[matrixRow.teamId];
          return (
            <Box key={matrixRow.teamId} display="contents">
              <Flex align="center" gap={2} minW={0} px={4} py={3} bg="blackAlpha.200" borderRight="1px solid" borderBottom="1px solid" borderColor="line" boxShadow={matrixRow.controlsDestiny ? DESTINY_RING : "none"}>
                <TeamLogo team={team} size="1.5rem" />
                <Box className="finish-matrix-team-name" minW={0}>
                  <Text fontSize="sm" color="var(--gg-ink)" fontWeight="black" lineClamp={1}>
                    {teamLabel(team)}
                  </Text>
                  <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">
                    {recordText(row?.cw ?? 0, row?.cl ?? 0)} - {row?.last5 ?? "-----"}
                  </Text>
                </Box>
              </Flex>
              {matrixRow.values.map((value, index) => (
                <Flex key={`${matrixRow.teamId}-${index}`} align="center" justify="center" gap="4px" minH="54px" bg={heatColor(value)} borderBottom="1px solid" borderLeft="1px solid" borderColor="rgba(var(--gg-fg), 0.08)">
                  <Text fontSize="sm" color={value >= 12 ? "#06110B" : "white"} fontWeight="black">
                    {value > 0 ? `${value}%` : "-"}
                  </Text>
                  <CellMove matrixRow={matrixRow} index={index} ink={value >= 12 ? "#06110B" : "white"} size="9px" />
                </Flex>
              ))}
            </Box>
          );
        })}
      </Grid>
    </Box>
  </Box>
);
};

export const DivisionFinishProbability = ({ groups }) => {
  const [conference, setConference] = useState("ALL");
  const [swacScope, setSwacScope] = useState("ALL");

  const visibleGroups = GROUP_DEFS.map((def) => groups[def.id]).filter((group) => {
    if (!group) return false;
    if (conference === "ALL") return true;
    if (conference === "MEAC") return group.id === "meac";
    if (swacScope === "ALL") return group.id === "swac-east" || group.id === "swac-west";
    return group.id === `swac-${swacScope.toLowerCase()}`;
  });

  return (
    <Flex direction="column" gap={4}>
      <Flex align="end" justify="space-between" gap={4} wrap="wrap">
        <Box>
          <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em" mb={1}>
            Scenario Sheet
          </Text>
          <Text fontSize="3xl" color="var(--gg-ink)" fontWeight="black" textTransform="uppercase" lineHeight={1}>
            Division Finish Probability
          </Text>
        </Box>
        <Flex gap={2} align="center" wrap="wrap" justify="end">
          {["ALL", "MEAC", "SWAC"].map((item) => (
            <MatrixControl key={item} active={conference === item} onClick={() => { setConference(item); if (item !== "SWAC") setSwacScope("ALL"); }}>
              {item}
            </MatrixControl>
          ))}
          <Flex gap={1} pl={2} borderLeft="1px solid" borderColor="line.strong">
            {["ALL", "WEST", "EAST"].map((item) => (
              <MatrixControl key={item} active={conference === "SWAC" && swacScope === item} disabled={conference !== "SWAC"} onClick={() => setSwacScope(item)}>
                {item}
              </MatrixControl>
            ))}
          </Flex>
        </Flex>
      </Flex>

      <Grid templateColumns="1fr" gap={4}>
        {visibleGroups.map((group) => (
          <DivisionFinishMatrix key={group.id} group={group} />
        ))}
      </Grid>
    </Flex>
  );
};
