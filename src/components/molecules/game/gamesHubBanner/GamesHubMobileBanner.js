import { BANNER_STRIP_BG, BannerTitleArea, BannerGhostWord, BannerIconButton } from "../../../organisms/BannerControls";
import { Box, Text, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { MobileSectionSwitcher } from "../../../organisms/MobileSectionSwitcher";
import { SlidersHorizontal } from "lucide-react";
import { BottomSheet } from "../../../organisms/BottomSheet";

const ACCENT = "#A855F7";

export const GRADIENT = `linear-gradient(110deg, ${ACCENT} 0%, #5B2D9A 26%, #1E0A2A 60%, ${BANNER_STRIP_BG} 100%)`;

const SheetGroup = ({ label, options, value, onChange }) => (
  <Box mb="1.1rem">
    <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
      {label}
    </Text>
    <Flex wrap="wrap" gap="0.4rem">
      {options.map((opt) => {
        const on = String(opt.value) === String(value);
        return (
          <Box
            key={opt.value}
            as="button"
            type="button"
            onClick={() => onChange?.(opt.value)}
            px="0.7rem"
            py="0.4rem"
            bg={on ? ACCENT : "#1C1C1F"}
            border="1px solid"
            borderColor={on ? ACCENT : "whiteAlpha.200"}
          >
            <Text fontSize="0.7rem" fontWeight="black" color="white">{opt.label}</Text>
          </Box>
        );
      })}
    </Flex>
  </Box>
);

export const MobileBanner = ({ groups, summary }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box position="relative" w="full" display="flex" flexDirection="column">
      <Box position="relative" overflow="hidden" h="var(--app-header-height)" flexShrink={0} bg={GRADIENT} display="flex" flexDirection="column">
        <BannerTitleArea>
          <BannerGhostWord text="GAMES" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Games
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between" gap="0.5rem">
        <MobileSectionSwitcher accent={ACCENT} />
        <Flex align="center" gap="0.35rem" pt="0.6rem" pr="0.6rem" minW={0}>
          <Box as="button" type="button" onClick={() => setOpen(true)} minW={0} px="0.25rem">
            <Text fontSize="0.7rem" fontWeight="black" color="white" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{summary}</Text>
          </Box>
          <BannerIconButton ariaLabel="Filters" onClick={() => setOpen(true)}>
            <SlidersHorizontal size={14} color="white" />
          </BannerIconButton>
        </Flex>
      </Flex>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Games Filters">
        <Box px="1rem" py="0.85rem">
          {groups.map((g) => (
            <SheetGroup key={g.label} {...g} />
          ))}
        </Box>
      </BottomSheet>
    </Box>
  );
};
