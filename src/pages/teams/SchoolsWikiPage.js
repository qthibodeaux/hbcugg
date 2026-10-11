import React from "react";
import { Box, Flex, useMediaQuery } from "@chakra-ui/react";
import PageShell from "../../components/layouts/PageShell";
import { ConferenceWikiBanner } from "../../components/organisms/test/ConferenceWikiPageLabA";
import { WikiDirectory } from "../../components/molecules/wiki/WikiDirectory";
import { ConferenceIdentityPassportCard, ConferencePassportCarousel } from "../../components/molecules/wiki/ConferenceIdentityPassport";
import { ConferenceFootprint } from "../../components/molecules/wiki/ConferenceFootprint";
import { MeacSwacChallengeBanner } from "../../components/molecules/postseason/MeacSwacChallengeBanner";
import { CelebrationBowlLedger } from "../../components/molecules/postseason/CelebrationBowlLedger";
import {
  ClassicsAndRivalriesBanner,
  TitlePathTimelineBanner
} from "../../components/molecules/wiki/WikiHistoryBanners";
import { SWAC, MEAC } from "../../data/wiki_data";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";

// Desktop cards below all render h="full" and rely on PageShell.Slot's
// explicit row-unit height to resolve it — reproduce that same row unit here
// so they don't collapse when stacked in a plain auto-height column instead
// (same fix as Teams.js/StandingsPage.js's mobile branches).
const PAGE_SHELL_ROW_UNIT = "clamp(160px, 20vw, 260px)";
const rowUnitHeight = (rows = 1) => (rows === 1 ? PAGE_SHELL_ROW_UNIT : `calc(${rows} * ${PAGE_SHELL_ROW_UNIT} + ${(rows - 1) * 0.25}rem)`);

// Mobile — separate render tree, not PageShell (same architecture as every
// other converted page). Only the banner has a mobile design so far; the
// directory / passports / footprint / ledger / history banners below it are
// the same desktop cards, just stacked full-width for now rather than
// redesigned.
const SchoolsWikiMobile = () => (
  <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
    <ConferenceWikiBanner />
    <Box h={rowUnitHeight(1)}><WikiDirectory /></Box>
    <Flex direction="column" gap="0.75rem" p="0.75rem">
      <ConferencePassportCarousel />
      <ConferenceFootprint />
      <CelebrationBowlLedger />
      <MeacSwacChallengeBanner />
      <ClassicsAndRivalriesBanner />
      <TitlePathTimelineBanner />
    </Flex>
  </Box>
);

/**
 * SchoolsWikiPage — The definitive HBCU conference knowledge hub.
 * Promoted from ConferenceWikiPageLabA.
 */
const SchoolsWikiPage = () => {
  const [isCompact] = useMediaQuery("(max-width: 1023px)");
  const { isMobile } = useLayoutDensity();

  if (isMobile) return <SchoolsWikiMobile />;

  return (
    <PageShell>
      {/* 4x1: Conference Wiki Banner */}
      <PageShell.Slot cols={4}>
        <ConferenceWikiBanner variant="compact" />
      </PageShell.Slot>

      {/* 4x1 HERO: Directory Shuffle */}
      <PageShell.Slot cols={4}>
        <WikiDirectory />
      </PageShell.Slot>

      {/* 2x1: Conference Identity Passport Cards */}
      <PageShell.Slot cols={2}>
        <ConferenceIdentityPassportCard conf={SWAC} density="compact" />
      </PageShell.Slot>
      <PageShell.Slot cols={2}>
        <ConferenceIdentityPassportCard conf={MEAC} density="compact" />
      </PageShell.Slot>

      {/* 4x2: Shared Conference Footprint */}
      <PageShell.Slot cols={4} rows={2}>
        <ConferenceFootprint compact={isCompact} />
      </PageShell.Slot>

      {/* 4x1: Championship Ledger */}
      <PageShell.Slot cols={4}>
        <CelebrationBowlLedger />
      </PageShell.Slot>

      {/* 4x1: Showcase Event */}
      <PageShell.Slot cols={4}>
        <MeacSwacChallengeBanner />
      </PageShell.Slot>

      {/* 4x1: Classics & Rivalries Rotation */}
      <PageShell.Slot cols={4}>
        <ClassicsAndRivalriesBanner />
      </PageShell.Slot>

      {/* 4x1: History Timeline */}
      <PageShell.Slot cols={4}>
        <TitlePathTimelineBanner />
      </PageShell.Slot>
    </PageShell>
  );
};

export default SchoolsWikiPage;
