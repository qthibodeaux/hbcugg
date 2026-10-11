import { Flex, Spinner, Text } from "@chakra-ui/react";
import PageShell from "../../components/layouts/PageShell";
import { useEventInstances } from "../../hooks/useEventInstances";
import { EventsBanner } from "../../components/molecules/events/EventsBanner";
import { UpNextStrip } from "../../components/molecules/events/UpNextStrip";
import { ClassicsFeatureCard } from "../../components/molecules/events/ClassicsFeatureCard";
import { HomecomingSlateCard } from "../../components/molecules/events/HomecomingSlateCard";
import { ThemeBoardCard } from "../../components/molecules/events/ThemeBoardCard";
import { SeasonCalendarList } from "../../components/molecules/events/SeasonCalendarList";

// Classics & Homecoming Hub — first real build (2026-09-20), off the
// ComingSoon stub. Reads public/data/event_instances.json (1,175 team-game
// tags, 2010–2026) shaped by utils/eventsModel.js, with venues resolved
// through venues.json. Results and attendance are not in the events file;
// they arrive with the game-file join, and no card here fakes them.
//
// Desktop + compact only; leans on PageShell stacking like the School Wiki.

const ClassicsHomecomingHubPage = () => {
  const events = useEventInstances();

  if (events.isLoading) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <Flex justify="center" align="center" h="full"><Spinner color="brand.500" size="lg" /></Flex>
        </PageShell.Slot>
      </PageShell>
    );
  }

  if (events.isError) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <Flex justify="center" align="center" h="full"><Text color="text.muted">Event data not found.</Text></Flex>
        </PageShell.Slot>
      </PageShell>
    );
  }

  return (
    <PageShell listContent={<SeasonCalendarList occurrences={events.seasonOccurrences} season={events.season} />}>
      <PageShell.Slot cols={4}>
        <EventsBanner season={events.season} seasons={events.seasons} onSeasonChange={events.setSeason} stats={events.stats} />
      </PageShell.Slot>

      <PageShell.Slot cols={4}>
        <UpNextStrip occurrences={events.upcoming} season={events.season} />
      </PageShell.Slot>

      <PageShell.Slot cols={2} rows={2}>
        <ClassicsFeatureCard classics={events.classics} />
      </PageShell.Slot>

      <PageShell.Slot cols={1} rows={2}>
        <HomecomingSlateCard homecomings={events.homecomings} season={events.season} />
      </PageShell.Slot>

      <PageShell.Slot cols={1} rows={2}>
        <ThemeBoardCard colorOuts={events.colorOuts} themes={events.themes} season={events.season} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default ClassicsHomecomingHubPage;
