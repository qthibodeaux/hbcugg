import React from 'react';
import { WikiCtx, wikiDataFallback } from './WikiCtx';
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import PageShell from '../../layouts/PageShell';
import WikiHeroBanner from './WikiHeroBanner';
import IdentityCard from './IdentityCard';
import QuickFactsCard from './QuickFactsCard';
import StadiumCard from './StadiumCard';
import BandShowcaseCard from './BandShowcaseCard';
import TraditionsBanner from './TraditionsBanner';
import RivalryCard from './RivalryCard';
import HistoryTimelineCard from './HistoryTimelineCard';
import NotableAlumniCard from './NotableAlumniCard';
import FootballLegacyCard from './FootballLegacyCard';
import FunFactsCard from './FunFactsCard';
import SocialInfluencerCard from './SocialInfluencerCard';
import BrandingCard from './BrandingCard';

const mergeWikiData = (team, data) => ({
  ...wikiDataFallback,
  name: team?.name || wikiDataFallback.name,
  shortName: team?.shortName || wikiDataFallback.shortName,
  bannerShort: team?.bannerShort || wikiDataFallback.bannerShort,
  mascot: team?.mascot || wikiDataFallback.mascot,
  founded: team?.founded || wikiDataFallback.founded,
  enrollment: team?.enrollment || wikiDataFallback.enrollment,
  conference: team?.conference || wikiDataFallback.conference,
  division: team?.division || wikiDataFallback.division,
  logo: team?.logo || wikiDataFallback.logo,
  colors: {
    primary: team?.colors?.primary || wikiDataFallback.colors.primary,
    secondary: team?.colors?.secondary || wikiDataFallback.colors.secondary,
    accent: team?.colors?.accent || wikiDataFallback.colors.accent,
  },
  location: {
    ...wikiDataFallback.location,
    city: team?.city || wikiDataFallback.location.city,
    state: team?.state || wikiDataFallback.location.state,
    ...(data?.location || {}),
  },
  ...(data || {}),
  stadium: {
    ...wikiDataFallback.stadium,
    name: team?.stadium || wikiDataFallback.stadium.name,
    capacity: team?.stadiumCapacity || wikiDataFallback.stadium.capacity,
    ...(data?.stadium || {}),
  },
  marching_band: {
    ...wikiDataFallback.marching_band,
    ...(data?.marching_band || {}),
  },
  gameday: {
    ...wikiDataFallback.gameday,
    ...(data?.gameday || {}),
  },
  athletics: {
    ...wikiDataFallback.athletics,
    ...(data?.athletics || {}),
  },
  history: {
    ...wikiDataFallback.history,
    ...data?.history,
    briefHistory: data?.briefHistory || data?.history?.briefHistory || wikiDataFallback.history.briefHistory,
  },
  social: {
    ...wikiDataFallback.social,
    ...(data?.social || {}),
  },
});

// Square corners on mobile — one wrapper instead of editing every slot, and
// it stays a plain PageShell.Slot on desktop. `mobileCols` lets a slot claim
// a different span on mobile, for cards too cramped to share a row there.
const Slot = ({ radius = "none", cols, rows, mobileCols, mobileRows, children, ...rest }) => {
  const { isMobile } = useLayoutDensity();
  return (
    <PageShell.Slot
      cols={isMobile && mobileCols ? mobileCols : cols}
      rows={isMobile && mobileRows ? mobileRows : rows}
      radius={isMobile ? "none" : radius}
      {...rest}
    >
      {children}
    </PageShell.Slot>
  );
};

const WikiVariantGrid = ({ team, data }) => (
  <WikiCtx.Provider value={mergeWikiData(team, data)}>
    <PageShell embedded>
      <Slot cols={4}><WikiHeroBanner /></Slot>
      <Slot cols={2} rows={2} radius="xl"><IdentityCard /></Slot>
      {/* Mobile stacks these two as single rows in the right-hand half,
          beside the school column, instead of each taking a quarter-width
          column of their own (which wrapped "Suburban / Urban" and
          "SWAC · East" onto three lines apiece). */}
      <Slot cols={1} mobileCols={2} rows={2} mobileRows={1} radius="xl"><QuickFactsCard /></Slot>
      <Slot cols={1} mobileCols={2} rows={2} mobileRows={1} radius="xl"><StadiumCard /></Slot>
      <Slot cols={4} radius="xl"><BandShowcaseCard /></Slot>
      <Slot cols={4} radius="xl"><TraditionsBanner /></Slot>
      <Slot cols={1} radius="xl"><RivalryCard /></Slot>
      <Slot cols={2} radius="xl"><HistoryTimelineCard /></Slot>
      <Slot cols={1} radius="xl"><NotableAlumniCard /></Slot>
      <Slot cols={4} radius="xl"><FootballLegacyCard /></Slot>
      <Slot cols={1} radius="xl"><FunFactsCard /></Slot>
      <Slot cols={2} radius="xl"><SocialInfluencerCard /></Slot>
      <Slot cols={1} radius="xl"><BrandingCard /></Slot>
    </PageShell>
  </WikiCtx.Provider>
);

export default WikiVariantGrid;
