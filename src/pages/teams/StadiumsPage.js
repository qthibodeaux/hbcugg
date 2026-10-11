import { Flex, Spinner, Text } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import { useVenues } from "../../hooks/useVenues";
import { VenuesBanner } from "../../components/molecules/venues/VenuesBanner";
import { VenueMapCard } from "../../components/molecules/venues/VenueMapCard";
import { VenueFortressCard } from "../../components/molecules/venues/VenueFortressCard";
import { CapacityLadderCard } from "../../components/molecules/venues/CapacityLadderCard";
import { NeutralGroundsStrip } from "../../components/molecules/venues/NeutralGroundsStrip";
import { VenueDirectoryList } from "../../components/molecules/venues/VenueDirectoryList";

// Stadiums & Venues — first real build (2026-09-20), off the ComingSoon stub.
// Reads only public/data/venues.json (34 venues: 19 campus, 15 neutral) plus
// bundled teams.json for logos/colors. Selection is URL-driven
// (/schools/stadiums/:venueId) so the sidebar's venue switcher, the map, the
// ladder, the strip and the directory all agree on which stadium is up.
// Attendance / fill % and results-by-venue wait on the game-file join.
//
// Desktop + compact only; leans on PageShell stacking like the School Wiki.

const StadiumsPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const venues = useVenues();

  const select = (id) => navigate(id ? `/schools/stadiums/${id}` : "/schools/stadiums");
  const selected = (venueId && venues.byId[venueId]) || venues.stats.largest || null;
  const selectedId = selected?.id ?? null;

  if (venues.isLoading) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <Flex justify="center" align="center" h="full"><Spinner color="brand.500" size="lg" /></Flex>
        </PageShell.Slot>
      </PageShell>
    );
  }

  if (venues.isError) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <Flex justify="center" align="center" h="full"><Text color="text.muted">Venue data not found.</Text></Flex>
        </PageShell.Slot>
      </PageShell>
    );
  }

  return (
    <PageShell listContent={<VenueDirectoryList venues={venues.campus} selectedId={selectedId} onSelect={select} />}>
      <PageShell.Slot cols={4}>
        <VenuesBanner stats={venues.stats} />
      </PageShell.Slot>

      <PageShell.Slot cols={2} rows={2}>
        <VenueMapCard venues={venues.venues} selectedId={selectedId} onSelect={select} />
      </PageShell.Slot>

      <PageShell.Slot cols={1} rows={2}>
        <VenueFortressCard venue={selected} />
      </PageShell.Slot>

      <PageShell.Slot cols={1} rows={2}>
        <CapacityLadderCard venues={venues.campus} selectedId={selectedId} onSelect={select} />
      </PageShell.Slot>

      <PageShell.Slot cols={4}>
        <NeutralGroundsStrip venues={venues.neutral} selectedId={selectedId} onSelect={select} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default StadiumsPage;
