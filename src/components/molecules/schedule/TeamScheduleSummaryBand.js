import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { getStats, SCHEDULE_YEARS } from "./summaryBand/summaryModel";
import { MobileTeamScheduleSummaryBand } from "./summaryBand/MobileSummaryBand";
import { Box, Image, Text, Flex } from "@chakra-ui/react";
import { BannerTitleArea, BannerControlStrip, BannerDropdown } from "../../organisms/BannerControls";

export const TeamScheduleSummaryBand = ({ team, season, setSeason, seasonGames }) => {
  const { isMobile } = useLayoutDensity();
  if (!team) return null;

  const primary = team.colors?.primary ?? "#27272A";
  const stats = getStats(seasonGames);
  const gradient = `linear-gradient(110deg, ${primary} 0%, ${primary} 28%, #111113 58%, #0B0B0D 100%)`;

  if (isMobile) {
    return (
      <MobileTeamScheduleSummaryBand
        team={team}
        season={season}
        setSeason={setSeason}
        stats={stats}
        gradient={gradient}
        primary={primary}
      />
    );
  }

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      h="full"
      w="full"
      bg={gradient}
      display="flex"
      flexDirection="column"
    >
      <Image
        src={team.logo}
        alt=""
        position="absolute"
        right="-38px"
        top="50%"
        transform="translateY(-50%)"
        w={{ base: "220px", xl: "300px" }}
        h={{ base: "220px", xl: "300px" }}
        objectFit="contain"
        opacity={0.18}
        pointerEvents="none"
      />
      <Text
        position="absolute"
        left="0"
        bottom="-18px"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        opacity={0.05}
        textTransform="uppercase"
        lineHeight={1}
        whiteSpace="nowrap"
        pointerEvents="none"
        style={{ fontSize: "clamp(72px, 14vw, 170px)" }}
      >
        Schedule
      </Text>

      <BannerTitleArea>
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

      <BannerControlStrip justify="space-between">
        <Flex gap="0.5rem" wrap="wrap">
          {stats.cards.map((stat) => (
            <Box
              key={stat.label}
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderRadius="md"
              px="0.6rem"
              py="0.35rem"
            >
              <Text fontSize="7px" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.1em">
                {stat.label}
              </Text>
              <Text fontSize="sm" fontWeight="black" color="white" lineHeight={1.2}>
                {stat.value}
              </Text>
              {stat.sub && (
                <Text fontSize="7px" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.06em">
                  {stat.sub}
                </Text>
              )}
            </Box>
          ))}
        </Flex>

        <BannerDropdown
          label="Season"
          options={SCHEDULE_YEARS.map((year) => ({ value: year, label: String(year) }))}
          value={season}
          onChange={(year) => setSeason(Number(year))}
        />
      </BannerControlStrip>
    </Box>
  );
};
