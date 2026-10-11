import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { BannerTitleArea, BannerControlStrip, BannerDropdown, BannerIconButton } from "../../organisms/BannerControls";
import { GAME_CENTER_SEASONS } from "../../molecules/game/SeasonSelector";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { MobileSectionSwitcher } from "../../organisms/MobileSectionSwitcher";
import { BottomSheet } from "../../organisms/BottomSheet";

// Single shared launch.0 year scope — see GAME_CENTER_SEASONS.
const SCHEDULE_YEARS = GAME_CENTER_SEASONS;

const getStats = (games) => {
  const completed = games.filter((game) => game.result);
  const wins = completed.filter((game) => game.result === "W").length;
  const losses = completed.filter((game) => game.result === "L").length;
  const confWins = completed.filter((game) => game.conf_game && game.result === "W").length;
  const confLosses = completed.filter((game) => game.conf_game && game.result === "L").length;
  const homeWins = completed.filter((game) => game.home_away === "home" && game.result === "W").length;
  const homeLosses = completed.filter((game) => game.home_away === "home" && game.result === "L").length;
  const awayWins = completed.filter((game) => game.home_away === "away" && game.result === "W").length;
  const awayLosses = completed.filter((game) => game.home_away === "away" && game.result === "L").length;
  const pointsFor = completed.reduce((sum, game) => sum + Number(game.score_team ?? 0), 0);
  const pointsAgainst = completed.reduce((sum, game) => sum + Number(game.score_opp ?? 0), 0);

  const gamesPlayed = completed.length || 0;
  const avgFor = gamesPlayed ? (pointsFor / gamesPlayed).toFixed(1) : "--";
  const avgAgainst = gamesPlayed ? (pointsAgainst / gamesPlayed).toFixed(1) : "--";

  return {
    completed,
    gamesPlayed,
    wins,
    losses,
    cards: [
      { label: "Overall", value: `${wins}-${losses}` },
      { label: "Conference", value: `${confWins}-${confLosses}` },
      { label: "Home", value: `${homeWins}-${homeLosses}` },
      { label: "Away", value: `${awayWins}-${awayLosses}` },
      { label: "Scoring", value: pointsFor || "--", sub: `${avgFor} PPG` },
      { label: "Allowed", value: pointsAgainst || "--", sub: `${avgAgainst} OPP PPG` },
    ],
  };
};

// Migrated onto the current banner standard: title tier on top, opaque
// bottom control strip below holding both the KPI stat pills and the real
// Season control (pinned to the right via justify="space-between") instead
// of the old title/KPI-grid/season-panel three-way split with a native
// <select>. The separate "Next Game" side panel is dropped — everything
// now lives in title + one control strip.
// Mobile — this band had no mobile branch at all until 2026-08-28; the
// desktop banner (rounded card, KPI pills crammed into the control strip
// beside a dropdown) rendered as-is on phones. Now it matches the standard
// every other mobile banner uses: gradient title tier locked to the nav-bar
// height, section switcher + "+" advanced-controls sheet below it, square
// edges. The stat pills move out of the control strip into their own
// full-width row, where they have room to actually read.
const MobileTeamScheduleSummaryBand = ({ team, season, setSeason, stats, gradient, primary }) => {
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
