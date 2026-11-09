import { useFootballCurrentContext } from "../../hooks/useFootballCurrentContext";
import { useState, useMemo } from "react";
import { DEFAULT_SEASON, GROUP_DEFS } from "./standings/standingsData";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useQuery } from "@tanstack/react-query";
import { fetchJson, gameCenterPaths } from "../../utils/gameCenterPayloads";
import { modelFromStandingsRace, buildContextItems, rankByPowerMetric } from "./standings/standingsRaceModel";
import { buildBaseRows, groupRows } from "./standings/standingsModel";
import { StandingsMobile } from "./standings/StandingsMobile";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { DivisionFinishProbability } from "./standings/DivisionFinishMatrix";
import PageShell from "../../components/layouts/PageShell";
import { BannerStandings } from "../../components/molecules/banners/StandingsBanner";
import { ContextRotationCard, DivisionLeaderCard, PowerRankingsCard } from "./standings/StandingsContextCards";
import { DivisionStandingsCard } from "./standings/DivisionStandingsTable";

const StandingsPage = () => {
  // Open on the live season, not a hardcoded year - same fix as Conference
  // Slate (2026-08-25). The selector sets an override; until it does, current
  // context decides which season's standings the page lands on.
  const { currentSeason, isLoading: isCurrentContextLoading } = useFootballCurrentContext();
  const [seasonOverride, setSeasonOverride] = useState(null);
  const season = seasonOverride ?? currentSeason ?? DEFAULT_SEASON;
  const setSeason = (value) => setSeasonOverride(Number(value));
  const [division, setDivision] = useState("all");
  const { isMobile } = useLayoutDensity();

  const { data, isLoading: isDataLoading, isError } = useQuery({
    queryKey: ["standings", season],
    queryFn: () => fetchJson(gameCenterPaths.standingsRace(season)),
    staleTime: Infinity,
  });
  const isLoading = isDataLoading || isCurrentContextLoading;

  const model = useMemo(() => {
    if (data?.groups) return modelFromStandingsRace(data);
    const games = data?.games ?? [];
    const rows = buildBaseRows(games);
    const groups = groupRows(rows, games);
    return {
      games,
      rows,
      groups,
      contextItems: buildContextItems(groups),
      powerRows: rankByPowerMetric(rows),
    };
  }, [data]);

  if (isMobile) {
    return (
      <StandingsMobile
        season={season}
        setSeason={setSeason}
        division={division}
        setDivision={setDivision}
        model={model}
        isLoading={isLoading}
        isError={isError}
      />
    );
  }

  const listContent = (
    <Box>
      {isLoading && <Flex justify="center" py={20}><Spinner color="brand.500" size="lg" /></Flex>}
      {isError && (
        <Box bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="xl" p={8} textAlign="center">
          <Text color="text.muted">Unable to load standings data.</Text>
        </Box>
      )}
      {!isLoading && !isError && <DivisionFinishProbability groups={model.groups} />}
    </Box>
  );

  return (
    <PageShell listContent={listContent}>
      <PageShell.Slot cols={4}>
        <BannerStandings season={season} setSeason={setSeason} division={division} setDivision={setDivision} />
      </PageShell.Slot>

      <PageShell.Slot cols={1}>
        <ContextRotationCard items={model.contextItems} />
      </PageShell.Slot>

      {GROUP_DEFS.map((def) => (
        <PageShell.Slot key={`leader-${def.id}`} cols={1}>
          <DivisionLeaderCard group={model.groups[def.id]} />
        </PageShell.Slot>
      ))}

      {GROUP_DEFS.map((def) => (
        <PageShell.Slot key={def.id} cols={2} rows={2}>
          {isLoading ? (
            <Flex h="100%" align="center" justify="center" bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="xl">
              <Spinner color="brand.500" />
            </Flex>
          ) : (
            <DivisionStandingsCard group={model.groups[def.id]} />
          )}
        </PageShell.Slot>
      ))}

      <PageShell.Slot cols={2} rows={2}>
        <PowerRankingsCard rows={model.powerRows} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default StandingsPage;
