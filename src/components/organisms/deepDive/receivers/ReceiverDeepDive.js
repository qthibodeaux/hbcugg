import { useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ExportCardButton } from "../../stats/ExportCardButton";
import { paletteOf } from "../../../molecules/export/posterPalette";
import { useColorScheme } from "../../../../theme/colorScheme";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { DATA, POSTER_W } from "./kit";
import { SECTIONS } from "./sections";

// ─────────────────────────────────────────────────────────────────────────────
// Stats > Deep Dive: the receiver series. Eight sections, each two isos and an infographic
// (sections.js); the page shows the poster shrunk to fit with Export, and the PNG comes off a
// hidden full-size copy in the Light / Night palette.
// ─────────────────────────────────────────────────────────────────────────────

const Chip = ({ on, onClick, children }) => (
  <Flex as="button" type="button" onClick={onClick} px={3.5} h="2.2rem" align="center" borderRadius="md" border="1px solid"
    borderColor={on ? "brand.500" : "line.strong"} bg={on ? "line" : "transparent"} _hover={{ bg: "line" }}>
    <Text fontSize="sm" fontWeight={on ? "900" : "700"} color={on ? "text.primary" : "text.secondary"} whiteSpace="nowrap">{children}</Text>
  </Flex>
);

export const ReceiverDeepDive = () => {
  const [scheme] = useColorScheme();
  const pal = paletteOf(scheme);
  const { isMobile } = useLayoutDensity();
  const [sectionId, setSectionId] = useState(SECTIONS[0].id);
  const section = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0];
  const [posterId, setPosterId] = useState(section.posters[0].id);
  const all = [...section.posters, ...section.spares];
  const item = all.find((p) => p.id === posterId) ?? all[0];
  const posterRef = useRef(null);
  const { Poster } = item;
  const zoom = isMobile ? (window.innerWidth - 24) / POSTER_W : Math.max(0.35, Math.min(0.75, (window.innerWidth - 520) / POSTER_W));
  const pickSection = (s) => { setSectionId(s.id); setPosterId(s.posters[0].id); };

  return (
    <Box>
      <Flex gap={2} wrap="wrap" mb={3}>
        {SECTIONS.map((s) => <Chip key={s.id} on={s.id === section.id} onClick={() => pickSection(s)}>{s.label}</Chip>)}
      </Flex>
      <Flex align="center" justify="space-between" gap={3} mb={4} wrap="wrap">
        <Flex gap={2} wrap="wrap">
          {all.map((p) => <Chip key={p.id} on={p.id === item.id} onClick={() => setPosterId(p.id)}>{p.chip}</Chip>)}
        </Flex>
        <ExportCardButton target={posterRef} filename={() => `receivers-${section.id}-${item.id}-${DATA.season}-w${DATA.through_week}-${scheme}.png`} />
      </Flex>

      <Box w="fit-content" boxShadow="0 1rem 3rem rgba(0,0,0,0.5)" style={{ zoom }}>
        <Poster pal={pal} />
      </Box>

      {/* Export source: off screen, full size. */}
      <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
        <Poster pal={pal} innerRef={posterRef} />
      </Box>
    </Box>
  );
};
