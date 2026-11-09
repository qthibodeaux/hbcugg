import { TEAM_BY_ID, ACCENT, teamLabel, recordText, GROUP_DEFS } from "./standingsData";
import { Box, Text, Image, Flex, Grid, Spinner } from "@chakra-ui/react";
import { TeamLogo, FormBoxes, DESTINY_RING, heatColor } from "./StandingsPrimitives";
import { BannerStandings } from "../../../components/molecules/banners/StandingsBanner";
import { ContextRotationCard, PowerRankingsCard } from "./StandingsContextCards";

// Phone-specific leader, standings and finish-matrix presentation, retaining separate sizing and labels.

const DivisionLeaderCardMobile = ({ def, group }) => {
  const leaderTeam = TEAM_BY_ID[group?.rows?.[0]?.id];
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="line" p="0.75rem" display="flex" flexDirection="column" alignItems="center" gap="0.5rem">
      <Text fontSize="0.6rem" fontWeight="black" color={ACCENT[def.id]} textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
        {def.label}
      </Text>
      <TeamLogo team={leaderTeam} size="3rem" />
    </Box>
  );
};

const MOBILE_TEAM_SHORT_NAME = {
  swacasu: "Bama State",
  swacjsu: "J State",
  swacbcu: "Bethune",
  swacfamu: "Florida A&M",
  swacaamu: "Alabama A&M",
  swacmvsu: "Valley",
  swacpvamu: "Prairie View",
  swactsu: "Texas Southern",
  swacgsu: "Grambling",
  swacalc: "Alcorn",
  swacuapb: "Pine Bluff",
  swacsu: "Southern",
  meacscsu: "SC State",
  meacdsu: "Del State",
  meacnccu: "NC Central",
  meachu: "Howard",
  meacmsu: "Morgan",
  meacnsu: "Norfolk",
};

const mobileTeamLabel = (team) => MOBILE_TEAM_SHORT_NAME[team?.exportId?.replace(/25$/, "")] ?? teamLabel(team);

const DivisionStandingsRowMobile = ({ row, index, accent }) => {
  const team = TEAM_BY_ID[row.id];
  const isLeader = index === 0;

  return (
    <Box
      position="relative"
      overflow="hidden"
      px="0.6rem"
      py="0.45rem"
      borderBottom="1px solid"
      borderColor="line"
      borderLeft={isLeader ? "0.1875rem solid" : "0.1875rem solid transparent"}
      borderLeftColor={isLeader ? accent : "transparent"}
      bg={`linear-gradient(90deg, ${team?.colors?.primary ?? "#27272A"}26 0%, transparent 65%)`}
    >
      {team?.logo && (
        <Image
          src={team.logo}
          alt=""
          position="absolute"
          left="-0.75rem"
          top="50%"
          transform="translateY(-50%)"
          w="4rem"
          h="4rem"
          objectFit="contain"
          opacity={0.26}
          pointerEvents="none"
        />
      )}
      <Flex position="relative" zIndex={1} align="center" justify="space-between" gap="0.5rem">
        <Flex align="baseline" gap="0.5rem" minW={0}>
          <Text fontSize="0.85rem" fontWeight="black" fontStyle="italic" color={isLeader ? accent : "text.muted"} flexShrink={0} lineHeight={1}>
            {index + 1}
          </Text>
          <Box minW={0}>
            <Text fontSize="1rem" fontWeight="black" fontStyle="italic" color="var(--gg-ink)" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} lineClamp={1}>
              {mobileTeamLabel(team)}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap="0.5rem" flexShrink={0}>
          {/* Conference record, the overall record beside it in parentheses. */}
          <Flex align="baseline" gap="0.3rem">
            <Text fontSize="1rem" fontWeight="black" color="var(--gg-ink)" lineHeight={1}>
              {recordText(row.cw, row.cl)}
            </Text>
            <Text fontSize="0.75rem" fontWeight="black" color="text.muted" lineHeight={1}>
              ({recordText(row.w, row.l)})
            </Text>
          </Flex>
          <FormBoxes form={row.last5} />
        </Flex>
      </Flex>
    </Box>
  );
};

export const DivisionTableMobile = ({ group }) => {
  if (!group?.rows?.length) return null;
  const leaderTeam = TEAM_BY_ID[group.rows[0].id];

  return (
    <Box>
      <Flex align="center" justify="space-between" px="0.6rem" py="0.5rem" borderBottom="1px solid" borderColor="line">
        <Box>
          <Text fontSize="0.55rem" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            Division Table
          </Text>
          <Text fontSize="1.1rem" color="var(--gg-ink)" fontWeight="black" textTransform="uppercase" lineHeight={1}>
            {group.label}
          </Text>
        </Box>
        <Flex align="center" gap="0.4rem">
          <TeamLogo team={leaderTeam} size="1.75rem" />
          <Box textAlign="right">
            <Text fontSize="0.55rem" color="text.muted" fontWeight="black" textTransform="uppercase">
              Leader
            </Text>
            <Text fontSize="1rem" color="var(--gg-ink)" fontWeight="black" lineHeight={1}>
              {mobileTeamLabel(leaderTeam)}
            </Text>
          </Box>
        </Flex>
      </Flex>

      {group.rows.map((row, index) => (
        <DivisionStandingsRowMobile key={row.id} row={row} index={index} accent={group.accent} />
      ))}
    </Box>
  );
};

export const CellMove = ({ matrixRow, index, ink, size }) => {
  if (!matrixRow.prevValues) return null;
  const d = Number(matrixRow.values[index] ?? 0) - Number(matrixRow.prevValues[index] ?? 0);
  if (Math.abs(d) < 0.05) return null;
  return (
    <Text fontSize={size} color={ink} opacity={0.8} fontWeight="black" lineHeight={1}>
      {d > 0 ? "▲" : "▼"}
    </Text>
  );
};

export const DivisionFinishMatrixMobile = ({ group }) => {
  const rowsById = new Map((group?.rows ?? []).map((row) => [row.id, row]));
  if (!group?.rows?.length) return null;
  const teamCount = group.rows.length;

  return (
    <Box mt="0.75rem">
      <Grid templateColumns={`repeat(${teamCount + 1}, minmax(0, 1fr))`}>
        <Box aspectRatio="1" bg="blackAlpha.300" borderRight="1px solid" borderBottom="1px solid" borderColor="line" />
        {group.rows.map((_, index) => (
          <Flex key={`finish-${index}`} aspectRatio="1" align="center" justify="center" bg="blackAlpha.300" borderLeft="1px solid" borderBottom="1px solid" borderColor="line">
            <Text fontSize="0.7rem" color={index === 0 ? group.accent : "text.muted"} fontWeight="black">
              {index + 1}
            </Text>
          </Flex>
        ))}

        {group.finishMatrix.map((matrixRow) => {
          const team = TEAM_BY_ID[matrixRow.teamId];
          const row = rowsById.get(matrixRow.teamId);
          return (
            <Box key={matrixRow.teamId} display="contents">
              <Flex direction="column" align="center" justify="center" gap="0.1rem" aspectRatio="1" bg="blackAlpha.200" borderRight="1px solid" borderBottom="1px solid" borderColor="line" boxShadow={matrixRow.controlsDestiny ? DESTINY_RING : "none"}>
                <TeamLogo team={team} size="1.2rem" />
                <Text fontSize="0.55rem" color="var(--gg-ink)" fontWeight="black" lineHeight={1} fontVariantNumeric="tabular-nums">
                  {recordText(row?.cw ?? 0, row?.cl ?? 0)}
                </Text>
              </Flex>
              {matrixRow.values.map((value, index) => (
                <Flex key={`${matrixRow.teamId}-${index}`} gap="0.15rem" aspectRatio="1" align="center" justify="center" bg={heatColor(value)} borderLeft="1px solid" borderBottom="1px solid" borderColor="rgba(var(--gg-fg), 0.08)">
                  <Text fontSize="0.65rem" color={value >= 12 ? "#06110B" : "white"} fontWeight="black">
                    {value > 0 ? `${value}%` : "-"}
                  </Text>
                  <CellMove matrixRow={matrixRow} index={index} ink={value >= 12 ? "#06110B" : "white"} size="0.5rem" />
                </Flex>
              ))}
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};

export const StandingsMobile = ({ season, setSeason, division, setDivision, model, isLoading, isError }) => {
  const visibleGroupDefs = division === "all" ? GROUP_DEFS : GROUP_DEFS.filter((def) => def.id === division);

  return (
  <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
    <BannerStandings season={season} setSeason={setSeason} division={division} setDivision={setDivision} />

    <Flex direction="column" gap="0.75rem" p="0.75rem">
      {isLoading && <Flex justify="center" py={20}><Spinner color="brand.500" size="lg" /></Flex>}
      {isError && (
        <Box bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="xl" p={8} textAlign="center">
          <Text color="text.muted">Unable to load standings data.</Text>
        </Box>
      )}

      {!isLoading && !isError && (<>
        <Box h="7.5rem">
          <ContextRotationCard items={model.contextItems} />
        </Box>

        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="0.75rem">
          {GROUP_DEFS.map((def) => (
            <DivisionLeaderCardMobile key={def.id} def={def} group={model.groups[def.id]} />
          ))}
        </Grid>

        {visibleGroupDefs.map((def) => (
          <Box key={def.id}>
            <DivisionTableMobile group={model.groups[def.id]} />
            <DivisionFinishMatrixMobile group={model.groups[def.id]} />
          </Box>
        ))}

        <Box h="24rem">
          <PowerRankingsCard rows={model.powerRows} />
        </Box>
      </>)}
    </Flex>
  </Box>
  );
};
