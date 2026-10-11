import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTeam } from "../../hooks/useTeams";
import { useFootballCurrentContext } from "../../hooks/useFootballCurrentContext";
import { LAYOUT_DENSITY, useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useRosterHub, useSWACRoster, useTeamRosterHubDoc } from "../../hooks/useSWACData";
import PageShell from "../../components/layouts/PageShell";
import { Box, Text, Center, Spinner } from "@chakra-ui/react";
import { RosterHubBanner } from "../../components/molecules/roster/RosterHubBanner";
import { RosterFeatureRail } from "../../components/molecules/roster/RosterFeatureRail";
import { RosterHubGrid } from "../../components/molecules/roster/RosterHubGrid";
import {
  DEFAULT_ROSTER_HUB_YEAR,
  ROSTER_HUB_YEARS,
  buildTeamRosterHubModel,
  buildTeamRosterHubModelFromDoc,
  normalizeRosterHubYear,
  toRosterHubTeamId,
} from "./models/rosterHubModel";

/**
 * TeamRosterHubPage
 * Direct route for /teams/:teamId/roster
 */
const TeamRosterHubPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { data: team, isLoading } = useTeam(teamId);
  const { density, isMobile } = useLayoutDensity();
  const { currentSeason, isLoading: contextLoading } = useFootballCurrentContext();
  const [selectedYear, setSelectedYear] = useState(null);
  const year = selectedYear ?? normalizeRosterHubYear(currentSeason ?? DEFAULT_ROSTER_HUB_YEAR);
  const { hub, isLoading: hubLoading } = useRosterHub(year);
  const { roster: legacyPlayers, isLoading: rosterLoading } = useSWACRoster(team?.exportId);
  // The new per-team roster_hub_team doc (composition/frame_profile/
  // experience_by_room/players[] in one file) is live for PVAMU/2025 only —
  // every other team/season 404s and `doc` comes back null, so this falls
  // through to the existing all-18-teams model below with no visible change.
  const rosterTeamId = toRosterHubTeamId(team?.exportId);
  const { doc: rosterHubDoc, isLoading: docLoading } = useTeamRosterHubDoc(year, rosterTeamId);
  const model = useMemo(
    () =>
      rosterHubDoc
        ? buildTeamRosterHubModelFromDoc({ team, doc: rosterHubDoc, year })
        : buildTeamRosterHubModel({ team, hub, year }),
    [rosterHubDoc, hub, team, year],
  );
  const players = rosterHubDoc ? model.players : legacyPlayers;
  const rosterFeatureVariant = density === LAYOUT_DENSITY.STANDARD ? "standard" : "compact";
  const rosterGridVariant = density === LAYOUT_DENSITY.STANDARD ? "standard" : "compact";

  if (isLoading || contextLoading || hubLoading || rosterLoading || docLoading) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Spinner color="brand.500" size="xl" thickness="4px" />
        </Center>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <Center h="400px">
          <Text color="text.primary" fontWeight="black" letterSpacing="widest">TEAM NOT FOUND</Text>
        </Center>
      </Box>
    );
  }

  if (!model.hasData) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <RosterHubBanner
            team={team}
            model={model}
            year={year}
            years={ROSTER_HUB_YEARS}
            onYearChange={(nextYear) => setSelectedYear(normalizeRosterHubYear(nextYear))}
          />
        </PageShell.Slot>
        <PageShell.Slot cols={4}>
          <Center h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg">
            <Text color="text.secondary" fontSize="sm" fontWeight="bold">
              Roster profile data is not available for this team and season.
            </Text>
          </Center>
        </PageShell.Slot>
      </PageShell>
    );
  }

  // Mobile — no PageShell (its fixed autoRows forced the banner slot taller
  // than the banner's real content, leaving the dead gap above the rail),
  // no page padding, no rounded corners. The rail keeps an explicit row-unit
  // height since it's built assuming PageShell.Slot gives it h="full".
  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        <RosterHubBanner
          team={team}
          model={model}
          year={year}
          years={ROSTER_HUB_YEARS}
          onYearChange={(nextYear) => setSelectedYear(normalizeRosterHubYear(nextYear))}
        />
        {/* Taller than the shared row unit on purpose — the rail packs the
            carousel plus a two-row sidebar, and at 160px each sidebar half
            got ~80px, too short for the class rows to breathe. */}
        <Box h="230px">
          <RosterFeatureRail
            team={team}
            model={model}
            players={players}
            variant={rosterFeatureVariant}
            onFullRoster={() => navigate(`/teams/${teamId}/roster/full`)}
          />
        </Box>
        <RosterHubGrid
          team={team}
          model={model}
          year={year}
          players={players}
          variant={rosterGridVariant}
          onFullRoster={() => navigate(`/teams/${teamId}/roster/full`)}
        />
      </Box>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <RosterHubBanner
          team={team}
          model={model}
          year={year}
          years={ROSTER_HUB_YEARS}
          onYearChange={(nextYear) => setSelectedYear(normalizeRosterHubYear(nextYear))}
        />
      </PageShell.Slot>

      <PageShell.Slot cols={4} radius="lg">
        <RosterFeatureRail
          team={team}
          model={model}
          players={players}
          variant={rosterFeatureVariant}
          onFullRoster={() => navigate(`/teams/${teamId}/roster/full`)}
        />
      </PageShell.Slot>

      <RosterHubGrid
        team={team}
        model={model}
        year={year}
        players={players}
        variant={rosterGridVariant}
        onFullRoster={() => navigate(`/teams/${teamId}/roster/full`)}
      />
    </PageShell>
  );
};

export default TeamRosterHubPage;
