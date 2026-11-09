import PageShell from "../../layouts/PageShell";
import { ConferenceWikiBanner } from "../../molecules/wiki/ConferenceWikiResponsiveBanner";
import { WikiDirectoryComponent } from "./conferenceWiki/WikiDirectory";
import { CategoryHeader } from "./conferenceWiki/WikiPrimitives";
import { ConferencePanel, ComparisonMatrix, ConferenceQuoteCard } from "./conferenceWiki/ConferenceIdentity";
import { SWAC, MEAC } from "../../../data/wiki_data";
import { CelebrationBowlLedger, CelebrationBowlPanel, CelebrationTable, MeacSwacChallengeBanner } from "./conferenceWiki/ConferencePostseason";
import { ClassicsAndRivalriesBanner, TitlePathTimelineBanner, SharedTimelinePanel, TimelinePanel, RivalryPanel } from "./conferenceWiki/ConferenceHistory";
import { TraditionPanel, MembershipPanel, MediaPanel, LeagueStatsSection, TeamDirectoryBottom } from "./conferenceWiki/ConferenceCulture";

export const ConferenceWikiPageLabA = () => (
  <PageShell>
    <PageShell.Slot cols={4} rows={1}>
      <ConferenceWikiBanner />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <WikiDirectoryComponent variant="compact" />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Governance" subtitle="Conference Identities" /></PageShell.Slot>
    <PageShell.Slot cols={2} rows={3}>
      <ConferencePanel conf={SWAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={2} rows={3}>
      <ConferencePanel conf={MEAC} />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Systems" subtitle="Comparison Matrix" /></PageShell.Slot>
    <PageShell.Slot cols={3} rows={1}>
      <ComparisonMatrix variant="compact" />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={1}>
      <ConferenceQuoteCard variant="compact" />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Postseason" subtitle="Celebration Bowl Ledger" /></PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <CelebrationBowlLedger />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <ClassicsAndRivalriesBanner />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <TitlePathTimelineBanner />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The History" subtitle="Era Timelines" /></PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <SharedTimelinePanel />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <TimelinePanel conf={SWAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <TimelinePanel conf={MEAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <TraditionPanel />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Postseason" subtitle="Celebration Bowl Orbit" /></PageShell.Slot>
    <PageShell.Slot cols={3} rows={2}>
      <CelebrationBowlPanel />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={4}>
      <CelebrationTable />
    </PageShell.Slot>

    <PageShell.Slot cols={3} rows={2}>
      <RivalryPanel />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Kickoff" subtitle="MEAC/SWAC Challenge" /></PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <MeacSwacChallengeBanner />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Members" subtitle="Realignment & Membership" /></PageShell.Slot>
    <PageShell.Slot cols={2} rows={2}>
      <MembershipPanel />
    </PageShell.Slot>
    <PageShell.Slot cols={2} rows={2}>
      <MediaPanel />
    </PageShell.Slot>

    <PageShell.Slot cols={4}><CategoryHeader title="The Scale" subtitle="Big Picture Stats" /></PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <LeagueStatsSection />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <TeamDirectoryBottom />
    </PageShell.Slot>
  </PageShell>
);

export { ConferenceWikiBanner } from "../../molecules/wiki/ConferenceWikiResponsiveBanner";
