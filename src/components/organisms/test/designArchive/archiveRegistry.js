import { Box } from "@chakra-ui/react";
import { GameRowGloryGhost, GameRowHeritageLedger } from "../WeekCentralCreativeRows";
import { GameRowMagazineSpread, GameRowCinematicCollision } from "../WeekCentralMagicRows";
import { GamesHubBannerClassicControlsE, GamesHubPhotoStripA, GamesHubBroadcastMatchupA, GamesHubScoreRhythmA, GamesHubTicketStubA } from "../gamesHubExperiments/RetainedCards";
import { GamesHubMarqueeMatchupA } from "../GamesHubMarqueeMatchupA";
import { GamesHubIdentityClashA } from "../GamesHubIdentityClashA";
import { GamesHubPlaymakerSpotlightA } from "../GamesHubPlaymakerSpotlightA";
import { GamesHubVintageCardA } from "../GamesHubVintageCardA";
import { GamesHubMetroFlipA } from "../GamesHubMetroFlipA";
import { GamesHubNeonGlitchA } from "../GamesHubNeonGlitchA";
import { GSUIdentitySplitCard } from "../GSUIdentitySplitCard";
import { WeekCentralGameRowJ__Lab } from "../WeekCentralGameRowJ";
import { WeekCentralMagicMarquee } from "../WeekCentralMagicRowsLab";

// Retained design archive entries, order and frame wrappers; not the active experiment registry.

const ArchiveFrame = ({ children, h = "100%" }) => (
  <Box w="full" h={h} bg="bg.primary" p={3} overflow="hidden">
    {children}
  </Box>
);

const GloryGhost = () => (
  <ArchiveFrame h="120px">
    <GameRowGloryGhost />
  </ArchiveFrame>
);

const GloryGhostSqueezed = () => (
  <ArchiveFrame h="86px">
    <GameRowGloryGhost squeezed />
  </ArchiveFrame>
);

const HeritageLedger = () => (
  <ArchiveFrame h="112px">
    <GameRowHeritageLedger />
  </ArchiveFrame>
);

const MagazineSpread = () => (
  <ArchiveFrame h="160px">
    <GameRowMagazineSpread />
  </ArchiveFrame>
);

const CollisionSqueezed = () => (
  <ArchiveFrame h="142px">
    <GameRowCinematicCollision squeezed />
  </ArchiveFrame>
);

export const testedDesignsRegistry = [
  {
    number: 601,
    section: "Editorial Banners",
    label: "601: Classic Controls Banner",
    cols: 4,
    component: GamesHubBannerClassicControlsE,
  },
  {
    number: 603,
    section: "Editorial Banners",
    label: "603: Photo Strip Story Tiles",
    cols: 4,
    component: GamesHubPhotoStripA,
  },
  {
    number: 604,
    section: "Wide Matchups & Charts",
    label: "604: Broadcast Matchup Split",
    cols: 2,
    component: GamesHubBroadcastMatchupA,
  },
  {
    number: 605,
    section: "Wide Matchups & Charts",
    label: "605: Score Rhythm Analytics",
    cols: 2,
    component: GamesHubScoreRhythmA,
  },
  {
    number: 608,
    section: "Wide Matchups & Charts",
    label: "608: Marquee Matchup Wide",
    cols: 2,
    component: GamesHubMarqueeMatchupA,
  },
  {
    number: 602,
    section: "Modular Cards",
    label: "602: Ticket Stub Story",
    cols: 1,
    component: GamesHubTicketStubA,
  },
  {
    number: 606,
    section: "Modular Cards",
    label: "606: Identity Clash Comparison",
    cols: 1,
    component: GamesHubIdentityClashA,
  },
  {
    number: 607,
    section: "Modular Cards",
    label: "607: Playmaker Spotlight",
    cols: 1,
    component: GamesHubPlaymakerSpotlightA,
  },
  {
    number: 609,
    section: "Modular Cards",
    label: "609: 1989 Vintage Sports Card",
    cols: 1,
    component: GamesHubVintageCardA,
  },
  {
    number: 610,
    section: "Modular Cards",
    label: "610: Metro Flip Live Tile",
    cols: 1,
    component: GamesHubMetroFlipA,
  },
  {
    number: 612,
    section: "Modular Cards",
    label: "612: Neon Glitch Metric",
    cols: 1,
    component: GamesHubNeonGlitchA,
  },
  {
    number: 701,
    section: "Identity Split Cards",
    label: "701: GSU Identity Split Card 1x1",
    cols: 1,
    component: GSUIdentitySplitCard,
  },
  {
    number: 702,
    section: "Week Central Archive",
    label: "702: Team Gradient Cool - Editorial",
    cols: 4,
    component: WeekCentralGameRowJ__Lab,
  },
  {
    number: 703,
    section: "Week Central Archive",
    label: "703: Magic Row - Marquee Sheet",
    cols: 4,
    component: WeekCentralMagicMarquee,
  },
  {
    number: 704,
    section: "Week Central Archive",
    label: "704: The Glory Ghost (Cinematic)",
    cols: 4,
    component: GloryGhost,
  },
  {
    number: 705,
    section: "Week Central Archive",
    label: "705: The Glory Ghost (Squeezed)",
    cols: 4,
    component: GloryGhostSqueezed,
  },
  {
    number: 706,
    section: "Week Central Archive",
    label: "706: The Heritage Ledger (Editorial)",
    cols: 4,
    component: HeritageLedger,
  },
  {
    number: 707,
    section: "Week Central Archive",
    label: "707: Magic 3 - The Magazine Spread",
    cols: 4,
    component: MagazineSpread,
  },
  {
    number: 708,
    section: "Week Central Archive",
    label: "708: Squeezed State - Collision",
    cols: 4,
    component: CollisionSqueezed,
  },
];

export const sectionOrder = [
  "Editorial Banners",
  "Wide Matchups & Charts",
  "Modular Cards",
  "Identity Split Cards",
  "Week Central Archive",
];
