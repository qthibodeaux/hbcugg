import { BANNER_STRIP_BG, BannerTitleArea, BannerGhostWord, BannerIconButton } from "../../organisms/BannerControls";
import { useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { MobileSectionSwitcher } from "../../organisms/MobileSectionSwitcher";
import { Plus } from "lucide-react";
import { BottomSheet } from "../../organisms/BottomSheet";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { BannerShell, FilterPills } from "./HubBannerPrimitives";

const PEOPLE_HUB_ACCENT = "#A855F7";

const PEOPLE_HUB_GRADIENT = `linear-gradient(110deg, ${PEOPLE_HUB_ACCENT} 0%, #6B21A8 28%, #1B0630 58%, ${BANNER_STRIP_BG} 100%)`;

const PEOPLE_HUB_FOCUS_OPTIONS = [
  { id: "all", label: "Overview" },
  { id: "players", label: "Players" },
  { id: "coaches", label: "Coaches" },
];

const MobileBannerPeopleHub = ({ focus, setFocus }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={PEOPLE_HUB_GRADIENT}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <BannerGhostWord text="PERSONNEL" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              People Hub
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={PEOPLE_HUB_ACCENT} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="People Hub Controls">
        <Box px="1rem" py="0.85rem">
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
            Focus
          </Text>
          <Flex wrap="wrap" gap="0.4rem">
            {PEOPLE_HUB_FOCUS_OPTIONS.map((o) => {
              const isActive = o.id === focus;
              return (
                <Box
                  key={o.id}
                  as="button"
                  type="button"
                  onClick={() => {
                    setFocus(o.id);
                    setIsAdvancedOpen(false);
                  }}
                  px="0.7rem"
                  py="0.4rem"
                  borderRadius="0"
                  bg={isActive ? PEOPLE_HUB_ACCENT : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? PEOPLE_HUB_ACCENT : "whiteAlpha.200"}
                >
                  <Text fontSize="0.7rem" fontWeight="black" color="white">{o.label}</Text>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </BottomSheet>
    </Box>
  );
};

export const BannerPeopleHub = ({ focus: extFocus, setFocus: extSetFocus } = {}) => {
  const [intFocus, setIntFocus] = useState("all");
  const focus = extFocus !== undefined ? extFocus : intFocus;
  const setFocus = extSetFocus !== undefined ? extSetFocus : setIntFocus;

  const { isMobile } = useLayoutDensity();
  if (isMobile) {
    return <MobileBannerPeopleHub focus={focus} setFocus={setFocus} />;
  }

  return (
    <BannerShell
      ghost="PERSONNEL"
      title="PEOPLE HUB"
      editorial="THE DISTINGUISHED INDIVIDUALS WHO CAPTIVATE ON SATURDAYS"
      tickerLines={["PLAYERS | COACHES | LEADERSHIP", "PROFILES | MOVEMENT | SIGNALS", "SWAC & MEAC PEOPLE INDEX"]}
    >
      <FilterPills label="Focus" options={PEOPLE_HUB_FOCUS_OPTIONS} active={focus} setActive={setFocus} />
    </BannerShell>
  );
};
