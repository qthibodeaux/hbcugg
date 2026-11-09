import { useState } from "react";
import { SEASONS } from "./bannerPresentation";
import { Flex, Text } from "@chakra-ui/react";
import { BannerDropdown, BannerActionButton, BannerIconButton } from "../../../organisms/BannerControls";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Team-detail season commit controls and retained lab team cycling.

export const SeasonControl = ({ season, setSeason, primary }) => {
  const [pending, setPending] = useState(season);
  const isDirty = pending !== season;
  const seasonOptions = SEASONS.map((s) => ({ value: s, label: String(s) }));

  return (
    <Flex align="center" gap="0.5rem">
      <BannerDropdown label="Season" value={pending} onChange={(v) => setPending(Number(v))} options={seasonOptions} minW="7rem" />
      <BannerActionButton primary={primary} disabled={!isDirty} onClick={() => setSeason(pending)}>
        Go
      </BannerActionButton>
    </Flex>
  );
};

export const TeamToggle = ({ onPrev, onNext, index, count }) => (
  <Flex align="center" gap="0.4rem" ml="auto">
    <BannerIconButton ariaLabel="Previous team" onClick={onPrev}>
      <ChevronLeft size={13} color="white" />
    </BannerIconButton>
    <Text fontSize="0.65rem" fontWeight="black" color="whiteAlpha.600" letterSpacing="0.08em" minW="3.5rem" textAlign="center">
      {index + 1} / {count}
    </Text>
    <BannerIconButton ariaLabel="Next team" onClick={onNext}>
      <ChevronRight size={13} color="white" />
    </BannerIconButton>
  </Flex>
);
