import { useMemo, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ExportCardButton } from "../stats/ExportCardButton";
import { paletteOf } from "../../molecules/export/posterPalette";
import { useColorScheme } from "../../../theme/colorScheme";
import { DLINE } from "./deepDiveModel";
import { DLINE_POSTERS, POSTER_W } from "./DlinePosters";
import { PROFILE } from "./teamProfileModel";
import { TEAM_PROFILE_POSTERS } from "./TeamProfilePosters";
import { PENALTY_POSTERS, PEN_META } from "./PenaltyPosters";
import { PASSING_POSTERS, PG_META } from "./PassingGridPosters";
import { RUSHING_LANES_POSTERS, RL_META } from "./RushingLanesPosters";
import { PassDefenseSection } from "./PassDefenseSection";
import { PASS_DEFENSE_POSTERS, PD_META } from "./PassDefensePosters";

// ─────────────────────────────────────────────────────────────────────────────
// Deep Dive — Team Analytics > Charts, the mode beside Down & Distance. Export
// only: the page shows the poster itself (shrunk to fit) with an Export
// button; the PNG comes off a hidden full-size copy (1400 wide, as tall as
// its content) in the Light / Night palette. It holds the SWAC D-line deep
// dive and the PVAMU team profile; the next one adds its own posters list
// here. Desktop only.
// (D-line, PVAMU profile, SWAC penalties, SWAC passing grid, SWAC rushing lanes.)
// ─────────────────────────────────────────────────────────────────────────────

const DIVES = [
  { id: "dline", label: "SWAC D-line", file: DLINE, slug: "swac-dline", posters: DLINE_POSTERS },
  { id: "profile", label: "PVAMU profile", file: PROFILE, slug: "pvamu-profile", posters: TEAM_PROFILE_POSTERS },
  { id: "penalties", label: "SWAC penalties", file: PEN_META, slug: "swac-penalties", posters: PENALTY_POSTERS },
  { id: "passing", label: "SWAC passing grid", file: PG_META, slug: "swac-passing-grid", posters: PASSING_POSTERS },
  { id: "rushing", label: "SWAC rushing lanes", file: RL_META, slug: "swac-rushing-lanes", posters: RUSHING_LANES_POSTERS },
  { id: "passd", label: "Pass defense", file: PD_META, slug: "pass-defense", posters: PASS_DEFENSE_POSTERS },
];

const Chip = ({ on, onClick, children }) => (
  <Flex as="button" type="button" onClick={onClick}
    px={3.5} h="2.2rem" align="center" borderRadius="md" border="1px solid"
    borderColor={on ? "brand.500" : "line.strong"} bg={on ? "line" : "transparent"} _hover={{ bg: "line" }}>
    <Text fontSize="sm" fontWeight={on ? "900" : "700"} color={on ? "text.primary" : "text.secondary"} whiteSpace="nowrap">{children}</Text>
  </Flex>
);

export const DeepDiveCharts = () => {
  const [scheme] = useColorScheme();
  const pal = paletteOf(scheme);
  const [diveId, setDiveId] = useState(DIVES[0].id);
  const dive = DIVES.find((d) => d.id === diveId) ?? DIVES[0];
  const [id, setId] = useState(dive.posters[0].id);
  const posterRef = useRef(null);
  const item = useMemo(() => dive.posters.find((p) => p.id === id) ?? dive.posters[0], [dive, id]);
  const { Poster } = item;
  const zoom = Math.max(0.35, Math.min(0.75, (window.innerWidth - 520) / POSTER_W));

  return (
    <Box>
      <Flex gap={2} wrap="wrap" mb={3}>
        {DIVES.map((d) => (
          <Chip key={d.id} on={d.id === diveId} onClick={() => { setDiveId(d.id); setId(d.posters[0].id); }}>{d.label}</Chip>
        ))}
        {/* The pass-defense series as first built (stock Recharts, every PD view); kept for comparison while the house-style posters replace it. */}
        <Chip on={diveId === "pass-defense"} onClick={() => setDiveId("pass-defense")}>Pass Defense (series draft)</Chip>
      </Flex>
      {diveId === "pass-defense" ? <PassDefenseSection pal={pal} scheme={scheme} /> : <>
      <Flex align="center" justify="space-between" gap={3} mb={5} wrap="wrap">
        <Flex gap={2} wrap="wrap">
          {dive.posters.map((p) => <Chip key={p.id} on={p.id === item.id} onClick={() => setId(p.id)}>{p.chip}</Chip>)}
        </Flex>
        <ExportCardButton target={posterRef} filename={() => `${dive.slug}-${item.id}-${dive.file.season}-w${dive.file.through_week}-${scheme}.png`} />
      </Flex>

      {/* The post's headline, for writing the tweet; outside the poster, so never in the export. */}
      {item.tweet && (
        <Flex align="baseline" gap={3} mb={4} px={4} py={3} bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="md" maxW="fit-content">
          <Text fontSize="xs" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" flexShrink={0}>Tweet title</Text>
          <Text fontSize="lg" fontWeight="900" color="text.primary" userSelect="all">{item.tweet}</Text>
        </Flex>
      )}
      <Box w="fit-content" boxShadow="0 1rem 3rem rgba(0,0,0,0.5)" style={{ zoom }}>
        <Poster pal={pal} />
      </Box>

      {/* Export source: off screen, full size. */}
      <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
        <Poster pal={pal} innerRef={posterRef} />
      </Box>
      </>}
    </Box>
  );
};
