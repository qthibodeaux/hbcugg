import { useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "../../../organisms/BottomSheet";
import { BANNER_STRIP_BG } from "../../../organisms/BannerControls";
import { teamLogo, teamShort } from "../../export/exportData";
import { SECTIONS } from "./GameBannerMobile";

// The sticky header on the mobile game page: where you are (section · part) on
// the left, the score on the right. Tapping it opens the shared BottomSheet —
// the five sections across the top, then every part of the current section to
// jump to, the one on screen lit.
const ACCENT = "#A855F7";

export const GameSectionHeader = ({ activeTab, onTabChange, parts = [], current, onJump, awayId, homeId, awayScore, homeScore }) => {
  const [isOpen, setIsOpen] = useState(false);
  const section = SECTIONS.find((s) => s.tab === activeTab) ?? SECTIONS[0];
  const part = parts.find((p) => p.id === current);

  return (
    <>
      <Flex
        position="sticky"
        top="var(--app-header-height)"
        zIndex={20}
        align="stretch"
        justify="space-between"
        bg={BANNER_STRIP_BG}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        minH="2.6rem"
      >
        <Flex
          as="button"
          type="button"
          onClick={() => setIsOpen(true)}
          align="center"
          gap="0.45rem"
          pl="0.75rem"
          pr="1.5rem"
          minW={0}
          bg={`linear-gradient(110deg, ${ACCENT} 0%, ${BANNER_STRIP_BG} 100%)`}
          borderBottomRightRadius="1.75rem"
        >
          <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.08em" flexShrink={0}>
            {section.short}
          </Text>
          {part ? (
            <>
              <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.600">/</Text>
              <Text fontSize="0.8rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>
                {part.label}
              </Text>
            </>
          ) : null}
          <ChevronDown size={15} color="white" style={{ flexShrink: 0 }} />
        </Flex>

        <Flex align="center" gap="0.4rem" px="0.75rem" flexShrink={0}>
          <Image src={teamLogo(awayId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" />
          <Text fontSize="0.72rem" fontWeight="black" color="whiteAlpha.700">{teamShort(awayId)}</Text>
          <Text fontSize="0.95rem" fontWeight="950" fontStyle="italic" color={awayScore > homeScore ? "white" : "whiteAlpha.500"}>{awayScore}</Text>
          <Text fontSize="0.95rem" fontWeight="950" fontStyle="italic" color={homeScore > awayScore ? "white" : "whiteAlpha.500"}>{homeScore}</Text>
          <Text fontSize="0.72rem" fontWeight="black" color="whiteAlpha.700">{teamShort(homeId)}</Text>
          <Image src={teamLogo(homeId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" />
        </Flex>
      </Flex>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Jump to">
        <Grid templateColumns="repeat(5, minmax(0, 1fr))" borderBottom="1px solid" borderColor="whiteAlpha.100">
          {SECTIONS.map((s) => {
            const on = s.tab === activeTab;
            return (
              <Box
                key={s.tab}
                as="button"
                type="button"
                onClick={() => {
                  onTabChange?.(s.tab);
                  if (!on) setIsOpen(false);
                }}
                py="0.8rem"
                bg={on ? "whiteAlpha.100" : "transparent"}
                borderBottom="2px solid"
                borderColor={on ? ACCENT : "transparent"}
              >
                <Text fontSize="0.72rem" fontWeight="black" color={on ? "white" : "whiteAlpha.600"} textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
                  {s.short}
                </Text>
              </Box>
            );
          })}
        </Grid>
        <Flex direction="column" py="0.4rem">
          {parts.map((p) => {
            const on = p.id === current;
            return (
              <Box
                key={p.id}
                as="button"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onJump?.(p.id);
                }}
                w="full"
                textAlign="left"
                px="1rem"
                py="0.85rem"
                bg={on ? "whiteAlpha.100" : "transparent"}
                borderLeft="3px solid"
                borderColor={on ? ACCENT : "transparent"}
              >
                <Text fontSize="0.85rem" fontWeight="black" color={on ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.04em">
                  {p.label}
                </Text>
              </Box>
            );
          })}
        </Flex>
      </BottomSheet>
    </>
  );
};

export default GameSectionHeader;
