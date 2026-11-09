import { useState } from "react";
import { Box, Image, Text, Flex } from "@chakra-ui/react";
import { BannerTitleArea, BannerIconButton } from "../../../organisms/BannerControls";
import { MobileSectionSwitcher } from "../../../organisms/MobileSectionSwitcher";
import { Plus } from "lucide-react";
import { BottomSheet } from "../../../organisms/BottomSheet";
import { SCHEDULE_YEARS } from "./summaryModel";

// Phone team-schedule summary banner, stat row and season sheet.

export const MobileTeamScheduleSummaryBand = ({ team, season, setSeason, stats, gradient, primary }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <Box position="relative" overflow="hidden" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={gradient}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <Box position="absolute" right="-1rem" top="50%" style={{ transform: "translateY(-50%)" }} pointerEvents="none">
            <Image src={team.logo} alt="" w="5.5rem" h="5.5rem" objectFit="contain" style={{ opacity: 0.25 }} />
          </Box>
          <Box position="relative" zIndex={1}>
            <Text
              fontSize="clamp(2.6rem, 7vw, 7.5rem)"
              fontWeight="black"
              fontStyle="italic"
              lineHeight="0.85"
              textTransform="uppercase"
              letterSpacing="-0.04em"
              whiteSpace="nowrap"
              color="white"
            >
              {team.bannerName ?? team.name}
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <Flex align="flex-start" justify="space-between">
        <MobileSectionSwitcher accent={primary} />
        <Box pt="0.6rem" pr="0.6rem">
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      {/* Stat pills — own row now, not squeezed into the control strip */}
      <Flex gap="0.4rem" wrap="wrap" px="0.6rem" pb="0.6rem">
        {stats.cards.map((stat) => (
          <Box key={stat.label} bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" px="0.5rem" py="0.3rem">
            <Text fontSize="7px" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.1em">
              {stat.label}
            </Text>
            <Text fontSize="xs" fontWeight="black" color="white" lineHeight={1.2}>
              {stat.value}
            </Text>
          </Box>
        ))}
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title={`${team.bannerName ?? team.name} Controls`}>
        <Box px="1rem" py="0.85rem">
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
            Season
          </Text>
          <Flex wrap="wrap" gap="0.4rem">
            {SCHEDULE_YEARS.map((year) => {
              const isActive = Number(year) === Number(season);
              return (
                <Box
                  key={year}
                  as="button"
                  type="button"
                  onClick={() => {
                    setSeason(Number(year));
                    setIsAdvancedOpen(false);
                  }}
                  px="0.7rem"
                  py="0.4rem"
                  borderRadius="0"
                  bg={isActive ? primary : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? primary : "whiteAlpha.200"}
                >
                  <Text fontSize="0.7rem" fontWeight="black" color="white">{year}</Text>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </BottomSheet>
    </Box>
  );
};
