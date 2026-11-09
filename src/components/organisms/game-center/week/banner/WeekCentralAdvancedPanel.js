import { Box, Text, Flex } from "@chakra-ui/react";
import { ACCENT } from "./WeekCentralBannerControls";
import { BannerTogglePill } from "../../../BannerControls";
import { Filter } from "lucide-react";

// Week Central advanced controls panel, retaining provider actions and filter behavior.

export const WeekCentralAdvancedPanel = ({
  season,
  seasonOptions,
  selectedWeek,
  weekOptions,
  includeNonConference,
  isLoading,
  onSeasonSelect,
  onWeekSelect,
  toggleNonConference,
}) => (
  <Box px="1rem" py="0.85rem">
    <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
      Season
    </Text>
    <Flex wrap="wrap" gap="0.4rem" mb="1.1rem">
      {seasonOptions.map((opt) => {
        const isActive = String(opt.value) === String(season);
        return (
          <Box
            key={opt.value}
            as="button"
            type="button"
            disabled={isLoading}
            onClick={() => onSeasonSelect(opt.value)}
            px="0.7rem"
            py="0.4rem"
            borderRadius="0"
            bg={isActive ? ACCENT : "#1C1C1F"}
            border="1px solid"
            borderColor={isActive ? ACCENT : "whiteAlpha.200"}
            opacity={isLoading ? 0.4 : 1}
          >
            <Text fontSize="0.7rem" fontWeight="black" color="white">
              {opt.label}
            </Text>
          </Box>
        );
      })}
    </Flex>

    <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
      Week
    </Text>
    <Flex direction="column" gap="0.3rem" mb="1.1rem" maxH="14rem" overflowY="auto">
      {weekOptions.map((opt) => {
        const isActive = String(opt.value) === String(selectedWeek);
        return (
          <Box
            key={opt.value}
            as="button"
            type="button"
            disabled={isLoading}
            onClick={() => onWeekSelect(opt.value)}
            w="full"
            textAlign="left"
            px="0.75rem"
            py="0.6rem"
            borderRadius="0"
            bg={isActive ? "whiteAlpha.100" : "transparent"}
            borderLeft="3px solid"
            borderColor={isActive ? ACCENT : "transparent"}
            opacity={isLoading ? 0.4 : 1}
          >
            <Text fontSize="0.8rem" fontWeight="black" color={isActive ? "white" : "whiteAlpha.700"}>
              {opt.label}
            </Text>
          </Box>
        );
      })}
    </Flex>

    <BannerTogglePill active={includeNonConference} onClick={toggleNonConference} icon={<Filter size={12} color={includeNonConference ? ACCENT : "white"} />}>
      Non-Conf {includeNonConference ? "On" : "Off"}
    </BannerTogglePill>
  </Box>
);
