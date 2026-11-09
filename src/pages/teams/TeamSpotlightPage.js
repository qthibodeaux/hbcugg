import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import PageShell from "../../components/layouts/PageShell";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useTeamSpotlight } from "../../hooks/useTeamSpotlight";
import { SpotlightBanner, SpotlightBannerMobile } from "../../components/organisms/spotlight/SpotlightBanner";
import { SpotKpiStrip } from "../../components/organisms/spotlight/SpotKpiStrip";
import { LAYOUT, StoryTile } from "../../components/organisms/spotlight/SpotStory";
import { paletteOf } from "../../components/organisms/spotlight/spotlightModel";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM SPOTLIGHT — /schools/spotlight (Schools hub). The week's Team of the
// Week, built like the team page: the team banner, the KPI strip (ticker over
// four cells), then the backend's story cards as tiles — the `editorial`
// cards marked `selected`, in its order, each its own exportable image.
//
// Desktop: PageShell — banner and KPI strip as 4x1s, each story a 2-row tile,
// one or two columns wide by kind (SpotStory LAYOUT). Mobile: its own tree, no
// PageShell — banner, strip, then the tiles flush, full width, natural height.
// Data: useTeamSpotlight (a copy of the backend's weekly file until it's
// published; see the hook).
// ─────────────────────────────────────────────────────────────────────────────

const ROW_UNIT = "clamp(160px, 20vw, 260px)";

// The selected stories, each with its tone: two record-book tiles in a row
// alternate white and black so they don't read as one block.
const storiesOf = (spotlight) => {
  let books = 0;
  return (spotlight?.editorial ?? [])
    .filter((c) => c.selected)
    .map((card) => {
      const layout = LAYOUT[card.kind] ?? { cols: 2, tone: "dark" };
      const isBook = card.kind === "historic" || card.kind === "historic_team";
      const tone = isBook ? (books++ % 2 === 0 ? "white" : "black") : layout.tone;
      return { card, cols: layout.cols, tone };
    });
};

const TeamSpotlightPage = () => {
  const { spotlight, isLoading, isError } = useTeamSpotlight();
  const { isMobile } = useLayoutDensity();
  const palette = paletteOf(spotlight?.team_id);
  const stories = storiesOf(spotlight);
  const stamp = spotlight ? `${spotlight.season}-w${spotlight.through_week}-${spotlight.team_id}` : "";
  const tile = ({ card, tone }, i, mobile) => (
    <StoryTile card={card} index={i} palette={palette} teamId={spotlight.team_id} season={spotlight.season} tone={tone} mobile={mobile}
      filename={`spotlight-${stamp}-${i + 1}-${card.kind}.png`.replace(/_/g, "-")} />
  );

  const status = isLoading ? (
    <Flex justify="center" py={20}><Spinner color="brand.500" size="lg" /></Flex>
  ) : isError || !spotlight ? (
    <Flex justify="center" py={20}><Text color="text.muted">No Team Spotlight this week yet.</Text></Flex>
  ) : null;

  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        {status ?? (
          <>
            <SpotlightBannerMobile spotlight={spotlight} palette={palette} />
            <Box h={ROW_UNIT}><SpotKpiStrip spotlight={spotlight} palette={palette} /></Box>
            <Flex direction="column">
              {stories.map((s, i) => <Box key={i}>{tile(s, i, true)}</Box>)}
            </Flex>
          </>
        )}
      </Box>
    );
  }

  if (status) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>{status}</PageShell.Slot>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <SpotlightBanner spotlight={spotlight} palette={palette} />
      </PageShell.Slot>
      <PageShell.Slot cols={4}>
        <SpotKpiStrip spotlight={spotlight} palette={palette} />
      </PageShell.Slot>
      {stories.map((s, i) => (
        <PageShell.Slot key={i} cols={s.cols} rows={2} radius="lg">
          {tile(s, i, false)}
        </PageShell.Slot>
      ))}
    </PageShell>
  );
};

export default TeamSpotlightPage;
