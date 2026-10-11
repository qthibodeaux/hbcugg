import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import PageShell from "../../layouts/PageShell";
import {
  GamesHubBannerClassicControlsE,
  GamesHubPhotoStripA,
  GamesHubBroadcastMatchupA,
  GamesHubScoreRhythmA,
  GamesHubTicketStubA,
} from "./GamesHubComponentExperiments";
import { GamesHubIdentityClashA } from "./GamesHubIdentityClashA";
import { GamesHubPlaymakerSpotlightA } from "./GamesHubPlaymakerSpotlightA";
import { GamesHubMarqueeMatchupA } from "./GamesHubMarqueeMatchupA";
import { GamesHubVintageCardA } from "./GamesHubVintageCardA";
import { GamesHubMetroFlipA } from "./GamesHubMetroFlipA";
import { GamesHubNeonGlitchA } from "./GamesHubNeonGlitchA";
import { GSUIdentitySplitCard } from "./GSUIdentitySplitCard";
import { WeekCentralGameRowJ__Lab } from "./WeekCentralGameRowJ";
import {
  GameRowGloryGhost,
  GameRowHeritageLedger,
} from "./WeekCentralCreativeRows";
import {
  GameRowCinematicCollision,
  GameRowMagazineSpread,
} from "./WeekCentralMagicRows";
import { WeekCentralMagicMarquee } from "./WeekCentralMagicRowsLab";

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

const testedDesignsRegistry = [
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

const sectionOrder = [
  "Editorial Banners",
  "Wide Matchups & Charts",
  "Modular Cards",
  "Identity Split Cards",
  "Week Central Archive",
];

export const TestedDesignsPage = () => {
  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <Box
          w="full"
          h="full"
          bg="bg.secondary"
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.100"
          p={8}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          position="relative"
          overflow="hidden"
        >
          <Text
            position="absolute"
            right="-20px"
            bottom="-20px"
            fontSize="140px"
            fontWeight="black"
            color="whiteAlpha.50"
            userSelect="none"
            pointerEvents="none"
          >
            GALLERY
          </Text>
          <Text fontSize="xs" fontWeight="black" color="brand.400" letterSpacing="widest" mb={2}>
            COMPONENT ARCHIVE
          </Text>
          <Text fontSize="4xl" fontWeight="black" color="white" textTransform="uppercase">
            Tested Designs
          </Text>
          <Text mt={2} color="text.secondary" maxW="700px" fontSize="sm">
            Visual patterns and UI variants graduated out of the active Component Lab for future reference.
          </Text>
        </Box>
      </PageShell.Slot>

      {sectionOrder.map((section) => (
        <React.Fragment key={section}>
          <SectionHeader title={section} />
          {testedDesignsRegistry
            .filter((item) => item.section === section)
            .map((item) => (
              <ArchivedSlot key={item.number} label={item.label} cols={item.cols} component={item.component} />
            ))}
        </React.Fragment>
      ))}
    </PageShell>
  );
};

const SectionHeader = ({ title }) => (
  <PageShell.Slot cols={4}>
    <Flex align="center" gap={4} h="full">
      <Box w="4px" h="20px" bg="brand.500" />
      <Text fontSize="md" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="widest">
        {title}
      </Text>
      <Box flex={1} h="1px" bg="whiteAlpha.100" />
    </Flex>
  </PageShell.Slot>
);

const ArchivedSlot = ({ label, cols, component: Component }) => (
  <PageShell.Slot cols={cols}>
    <Box w="full" h="full" position="relative" overflow="hidden">
      <Component />
      <Box
        position="absolute"
        top={2}
        left={2}
        bg="blackAlpha.800"
        backdropFilter="blur(8px)"
        px={2}
        py={1}
        borderRadius="sm"
        border="1px solid"
        borderColor="whiteAlpha.200"
        zIndex={10}
        pointerEvents="none"
      >
        <Text fontSize="8px" fontWeight="black" color="white" textTransform="uppercase">
          {label}
        </Text>
      </Box>
    </Box>
  </PageShell.Slot>
);
