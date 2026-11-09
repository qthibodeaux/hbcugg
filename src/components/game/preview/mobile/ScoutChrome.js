import { Flex, Image, Text, Box, Grid } from "@chakra-ui/react";
import { teamLogo, teamShort, teamAccent, withAlpha } from "../../export/exportData";
import PreviewCountdown from "../PreviewCountdown";
import { longDate } from "../../../../utils/gamePreview";
import { useState } from "react";
import { BANNER_STRIP_BG } from "../../../organisms/BannerControls";
import { ACCENT } from "./scoutMobilePresentation";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "../../../organisms/BottomSheet";

// Mobile matchup banner and jump/navigation header.

const BannerSide = ({ side }) => (
  <Flex direction="column" align="center" gap="0.3rem" minW={0}>
    <Image src={teamLogo(side.team_id)} alt="" w="3.8rem" h="3.8rem" objectFit="contain" />
    <Text fontSize="1.6rem" fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1} letterSpacing="-0.02em">{teamShort(side.team_id)}</Text>
    <Flex align="baseline" gap="0.25rem">
      <Text fontSize="0.85rem" fontWeight="900" color="white">{side.conference_record ?? "—"}</Text>
      <Text fontSize="0.72rem" fontWeight="800" color="whiteAlpha.600">({side.record ?? "—"})</Text>
    </Flex>
  </Flex>
);

export const Banner = ({ m }) => {
  const a = teamAccent(m.away.team_id);
  const h = teamAccent(m.home.team_id);
  return (
    <Box position="relative" overflow="hidden" bg="#08080A" px="0.75rem" py="1rem">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${withAlpha(a, 0.3)} 0%, #08080A 40%, #08080A 60%, ${withAlpha(h, 0.3)} 100%)`} />
      <Grid position="relative" templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="center" gap="0.5rem">
        <BannerSide side={m.away} />
        <Flex direction="column" align="center" gap="0.35rem" maxW="9.5rem">
          <Box px="0.75rem" py="0.15rem" bg="brand.500" transform="skewX(-10deg)">
            <Text fontSize="0.62rem" fontWeight="900" color="white" letterSpacing="0.08em" transform="skewX(10deg)">PREVIEW</Text>
          </Box>
          <PreviewCountdown kickoffAt={m.kickoff_at ?? null} date={m.date} />
          <Text fontSize="0.8rem" fontWeight="900" color="white" textTransform="uppercase" textAlign="center" lineHeight={1.15}>{longDate(m.date)}</Text>
          <Text fontSize="0.65rem" fontWeight="800" color="whiteAlpha.650" textAlign="center">{[m.week_label, m.kickoff_label ?? "Kickoff TBA"].filter(Boolean).join(" · ")}</Text>
          {m.venue && <Text fontSize="0.6rem" fontWeight="800" color="whiteAlpha.500" textAlign="center" lineHeight={1.25} lineClamp={2}>{m.venue}</Text>}
        </Flex>
        <BannerSide side={m.home} />
      </Grid>
    </Box>
  );
};

export const JumpHeader = ({ m, parts, current, onJump }) => {
  const [open, setOpen] = useState(false);
  const part = parts.find((p) => p.id === current) ?? parts[0];
  return (
    <>
      <Flex position="sticky" top="var(--app-header-height)" zIndex={20} align="stretch" justify="space-between" bg={BANNER_STRIP_BG} borderBottom="1px solid" borderColor="whiteAlpha.100" minH="2.6rem">
        <Flex as="button" type="button" onClick={() => setOpen(true)} align="center" gap="0.45rem" pl="0.75rem" pr="1.5rem" minW={0}
          bg={`linear-gradient(110deg, ${ACCENT} 0%, ${BANNER_STRIP_BG} 100%)`} borderBottomRightRadius="1.75rem">
          <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.08em" flexShrink={0}>Preview</Text>
          <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.600">/</Text>
          <Text fontSize="0.8rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>{part.label}</Text>
          <ChevronDown size={15} color="white" style={{ flexShrink: 0 }} />
        </Flex>
        <Flex align="center" gap="0.4rem" px="0.75rem" flexShrink={0}>
          <Image src={teamLogo(m.away.team_id)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" />
          <Text fontSize="0.72rem" fontWeight="black" color="white">{teamShort(m.away.team_id)}</Text>
          <Text fontSize="0.62rem" fontWeight="black" color="whiteAlpha.500">AT</Text>
          <Text fontSize="0.72rem" fontWeight="black" color="white">{teamShort(m.home.team_id)}</Text>
          <Image src={teamLogo(m.home.team_id)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" />
        </Flex>
      </Flex>
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Jump to">
        <Flex direction="column" py="0.4rem">
          {parts.map((p) => {
            const on = p.id === part.id;
            return (
              <Box key={p.id} as="button" type="button" onClick={() => { setOpen(false); onJump(p.id); }} w="full" textAlign="left" px="1rem" py="0.85rem"
                bg={on ? "whiteAlpha.100" : "transparent"} borderLeft="3px solid" borderColor={on ? ACCENT : "transparent"}>
                <Text fontSize="0.85rem" fontWeight="black" color={on ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.04em">{p.label}</Text>
              </Box>
            );
          })}
        </Flex>
      </BottomSheet>
    </>
  );
};
