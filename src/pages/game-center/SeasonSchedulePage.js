import { useState } from "react";
import { Box, Flex, Grid, Image, Spinner, Text } from "@chakra-ui/react";
import { Filter, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import { useSeasonScheduleData } from "../../hooks/useSeasonScheduleData";
import { GROUPS, TEAM_BY_ID, label, logo, resolveOpponent, scoreLabel } from "../../utils/seasonScheduleModel";
import { GAME_CENTER_SEASONS } from "../../components/molecules/game/SeasonSelector";
import {
  BannerGhostWord,
  BannerTitleArea,
  BannerControlStrip,
  BannerDropdown,
  BannerSegmentedPills,
  BannerTogglePill,
  BannerIconButton,
  BANNER_STRIP_BG,
} from "../../components/organisms/BannerControls";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { MobileSectionSwitcher } from "../../components/organisms/MobileSectionSwitcher";
import { BottomSheet } from "../../components/organisms/BottomSheet";

const TeamLogo = ({ team, size = "30px" }) => (
  <Image src={logo(team)} alt={label(team)} w={size} h={size} objectFit="contain" />
);

const ACCENT = "#A855F7";
const GRADIENT = `linear-gradient(135deg, ${ACCENT} 0%, #260A3D 58%, ${BANNER_STRIP_BG} 100%)`;

// Migrated to the banner standard locked in AgentDesignBible.md §2b (2026-07-29) —
// controls moved from the old right-side vertical column into the bottom opaque
// control strip, native season <select> replaced with the real themed dropdown.
const DesktopScheduleBanner = ({ season, setSeason, groupId, setGroupId, includeNonConference, setIncludeNonConference }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="full"
    w="full"
    bg={GRADIENT}
    display="flex"
    flexDirection="column"
  >
    <BannerTitleArea>
      <BannerGhostWord text="SCHED" />
      <Box position="relative" zIndex={1}>
        <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
          Season Schedule
        </Text>
      </Box>
    </BannerTitleArea>

    <BannerControlStrip>
      <BannerDropdown
        label="Season"
        options={GAME_CENTER_SEASONS.map((year) => ({ value: year, label: String(year) }))}
        value={season}
        onChange={setSeason}
      />
      <BannerSegmentedPills
        options={Object.entries(GROUPS).map(([id, group]) => ({ value: id, label: group.label }))}
        value={groupId}
        onChange={setGroupId}
      />
      <Box ml="auto">
        <BannerTogglePill
          active={includeNonConference}
          onClick={() => setIncludeNonConference((value) => !value)}
          icon={<Filter size={12} color={includeNonConference ? "#A855F7" : "white"} />}
        >
          Non-Conf {includeNonConference ? "On" : "Off"}
        </BannerTogglePill>
      </Box>
    </BannerControlStrip>
  </Box>
);

// Mobile — tier 1 locked to nav-bar height, no subtext, section switcher on
// its own row (flush left, unchanged from every other page). Below that, a
// dedicated 5-button control bar: Year + the three division quick-toggles
// (set groupId immediately, no sheet) + "+" for Non-Conf, the one thing left
// over. Five buttons needed their own full-width row rather than squeezing
// in next to the switcher — that's a lot more than the single "+" every
// other page has had room for beside it.
const DIVISION_QUICK_BUTTONS = [
  { id: "swac-west", short: "WEST" },
  { id: "swac-east", short: "EAST" },
  { id: "meac", short: "MEAC" },
];

const MobileScheduleBanner = ({ season, setSeason, groupId, setGroupId, includeNonConference, setIncludeNonConference }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <Box
        position="relative"
        overflow="hidden"
        h="var(--app-header-height)"
        flexShrink={0}
        bg={GRADIENT}
        display="flex"
        flexDirection="column"
      >
        <BannerTitleArea>
          <BannerGhostWord text="SCHED" />
          <Box position="relative" zIndex={1}>
            <Text fontSize="clamp(2.6rem, 7vw, 7.5rem)" color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.85} letterSpacing="-0.04em" whiteSpace="nowrap">
              Season Schedule
            </Text>
          </Box>
        </BannerTitleArea>
      </Box>

      <MobileSectionSwitcher accent={ACCENT} />

      <Flex align="stretch" borderTop="1px solid" borderColor="whiteAlpha.100">
        <Box
          as="button"
          type="button"
          onClick={() => setIsAdvancedOpen(true)}
          flexShrink={0}
          px="0.6rem"
          display="flex"
          alignItems="center"
        >
          <Text fontSize="0.7rem" fontWeight="black" color="white" whiteSpace="nowrap">{season}</Text>
        </Box>
        {DIVISION_QUICK_BUTTONS.map((d) => {
          const isActive = groupId === d.id;
          return (
            <Box
              key={d.id}
              as="button"
              type="button"
              onClick={() => setGroupId(d.id)}
              flex="1"
              py="0.55rem"
              bg={isActive ? ACCENT : "transparent"}
              borderLeft="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="0.6rem" fontWeight="black" color="white" textAlign="center" lineClamp={1}>
                {d.short}
              </Text>
            </Box>
          );
        })}
        <Box borderLeft="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <BannerIconButton ariaLabel="Advanced controls" onClick={() => setIsAdvancedOpen(true)}>
            <Plus size={14} color="white" />
          </BannerIconButton>
        </Box>
      </Flex>

      <BottomSheet isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Season Schedule Controls">
        <Box px="1rem" py="0.85rem">
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb="0.5rem">
            Season
          </Text>
          <Flex wrap="wrap" gap="0.4rem" mb="1.1rem">
            {GAME_CENTER_SEASONS.map((year) => {
              const isActive = String(year) === String(season);
              return (
                <Box
                  key={year}
                  as="button"
                  type="button"
                  onClick={() => {
                    setSeason(String(year));
                    setIsAdvancedOpen(false);
                  }}
                  px="0.7rem"
                  py="0.4rem"
                  borderRadius="0"
                  bg={isActive ? ACCENT : "#1C1C1F"}
                  border="1px solid"
                  borderColor={isActive ? ACCENT : "whiteAlpha.200"}
                >
                  <Text fontSize="0.7rem" fontWeight="black" color="white">{year}</Text>
                </Box>
              );
            })}
          </Flex>

          <BannerTogglePill
            active={includeNonConference}
            onClick={() => setIncludeNonConference((value) => !value)}
            icon={<Filter size={12} color={includeNonConference ? ACCENT : "white"} />}
          >
            Non-Conf {includeNonConference ? "On" : "Off"}
          </BannerTogglePill>
        </Box>
      </BottomSheet>
    </Box>
  );
};

const ScheduleBanner = (props) => {
  const { isMobile } = useLayoutDensity();
  return isMobile ? <MobileScheduleBanner {...props} /> : <DesktopScheduleBanner {...props} />;
};

const GameCell = ({ game, teamId }) => {
  if (!game) return <Box minH="78px" bg="#070708" borderLeft="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100" />;
  if (game.state === "idle") return <Box minH="78px" bg="#070708" borderLeft="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100" />;

  const opponent = resolveOpponent(game);
  const team = TEAM_BY_ID[teamId];
  const isAway = game.home_away === "away";
  const hasScore = game.state === "final" || game.status === "final" || (game.score_team != null && game.score_opp != null);
  const won = game.result === "W" || (game.score && String(game.score).startsWith("W"));
  const winner = won ? team : opponent;
  const score = scoreLabel(game, hasScore);

  return (
    <Box minH="78px" bg="linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)" borderLeft="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100" position="relative" overflow="hidden">
      {isAway && (
        <Text position="absolute" top="4px" left="5px" color="white" fontSize="13px" fontWeight="black" lineHeight={1}>
          @
        </Text>
      )}
      <Flex h="100%" minH="78px" align="center" justify="center" px={1.5} pb="18px">
        {opponent ? (
          <TeamLogo team={opponent} size={game.conf_game ? "34px" : "25px"} />
        ) : (
          <Text fontSize="10px" color="white" fontWeight="black" textAlign="center" textTransform="uppercase" lineClamp={2}>
          {game.opponent?.short_name ?? game.opponent?.name ?? game.opponent_name}
          </Text>
        )}
      </Flex>
      {!(game.conf_game || String(game.game_type ?? "").includes("conference")) && (
        <Box position="absolute" top="4px" right="5px" px="4px" py="1px" bg="whiteAlpha.200" borderRadius="2px">
          <Text fontSize="7px" color="text.secondary" fontWeight="black">NC</Text>
        </Box>
      )}
      <Box position="absolute" left={0} right={0} bottom={0} py="2px" bg={hasScore ? winner?.colors?.primary ?? "whiteAlpha.200" : "whiteAlpha.100"}>
        <Text fontSize="10px" color="white" fontWeight="black" textAlign="center" lineHeight={1.2}>
          {score}
        </Text>
      </Box>
    </Box>
  );
};

const SeasonScheduleGrid = ({ group, includeNonConference, model }) => {
  const teamIds = model.teamIds ?? group.teams;
  return (
    <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
      <Flex align="center" justify="space-between" px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Box>
          <Text fontSize="10px" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
            Division Board
          </Text>
          <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
            {group.label} Schedule
          </Text>
        </Box>
        <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">
          @ = away · {includeNonConference ? "all games" : "conference only"} · weeks fixed by date
        </Text>
      </Flex>

      <Box overflow="auto" h="calc(100% - 69px)">
      <Grid templateColumns="58px repeat(6, minmax(0, 1fr))" minW="0">
          <Flex position="sticky" top={0} left={0} zIndex={4} align="center" justify="center" bg="bg.secondary" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">Week</Text>
          </Flex>
          {teamIds.map((teamId) => {
            const team = TEAM_BY_ID[teamId];
            return (
              <Flex key={teamId} position="sticky" top={0} zIndex={3} direction="column" align="center" justify="center" gap={1} minH="70px" bg="bg.secondary" borderBottom="1px solid" borderColor="whiteAlpha.100">
                <TeamLogo team={team} size="30px" />
                <Text fontSize="9px" color="white" fontWeight="black">{label(team)}</Text>
              </Flex>
            );
          })}

          {model.weeks.map((week) => [
            <Flex key={`week-${week.week}`} position="sticky" left={0} zIndex={2} align="center" justify="center" bg="bg.secondary" borderRight="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100">
              <Box minW="46px" px={2} py={1} bg="black" borderRadius="full" textAlign="center">
                <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" whiteSpace="nowrap" lineHeight={1}>{`WK ${week.week}`}</Text>
              </Box>
            </Flex>,
            ...teamIds.map((teamId) => (
              <GameCell key={`${week.week}-${teamId}`} game={model.byTeamWeek[teamId]?.[week.week]} teamId={teamId} />
            )),
          ])}
        </Grid>
      </Box>
    </Box>
  );
};

// ─── Mobile — the actual grid, resized ──────────────────────────────────────
// Reversed course from the swipeable-card version: this reuses desktop
// GameCell's exact visual composition (square-ish logo zone, "@" for away,
// colored score banner pinned to the bottom of the cell) rather than
// flattening into a per-team list. Bolder text, tighter padding than
// desktop ("space conscious") — square corners, no decorative pill chrome.
const MobileGameCell = ({ game, teamId }) => {
  if (!game || game.state === "idle") {
    return <Box minH="4.25rem" bg="#070708" borderLeft="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100" />;
  }

  const opponent = resolveOpponent(game);
  const team = TEAM_BY_ID[teamId];
  const isAway = game.home_away === "away";
  const hasScore = game.state === "final" || game.status === "final" || (game.score_team != null && game.score_opp != null);
  const won = game.result === "W" || (game.score && String(game.score).startsWith("W"));
  const winner = won ? team : opponent;
  const score = scoreLabel(game, hasScore);
  const isConf = game.conf_game || String(game.game_type ?? "").includes("conference");

  return (
    <Box minH="4.25rem" bg="linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)" borderLeft="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100" position="relative" overflow="hidden">
      {isAway && (
        <Text position="absolute" top="0.2rem" left="0.25rem" color="white" fontSize="0.7rem" fontWeight="black" lineHeight={1}>
          @
        </Text>
      )}
      <Flex h="100%" minH="4.25rem" align="center" justify="center" px="0.15rem" pb="1.1rem">
        {opponent ? (
          <Image src={logo(opponent)} alt={label(opponent)} w={isConf ? "1.9rem" : "1.4rem"} h={isConf ? "1.9rem" : "1.4rem"} objectFit="contain" />
        ) : (
          <Text fontSize="0.55rem" color="white" fontWeight="black" textAlign="center" textTransform="uppercase" lineClamp={2}>
            {game.opponent?.short_name ?? game.opponent?.name ?? game.opponent_name}
          </Text>
        )}
      </Flex>
      {!isConf && (
        <Box position="absolute" top="0.2rem" right="0.2rem" px="0.2rem" bg="whiteAlpha.200">
          <Text fontSize="0.4rem" color="text.secondary" fontWeight="black">NC</Text>
        </Box>
      )}
      <Box position="absolute" left={0} right={0} bottom={0} py="0.1rem" bg={hasScore ? winner?.colors?.primary ?? "whiteAlpha.200" : "whiteAlpha.100"}>
        <Text fontSize="0.55rem" color="white" fontWeight="black" textAlign="center" lineHeight={1.2}>
          {score}
        </Text>
      </Box>
    </Box>
  );
};

// A week counts as a conference week when a team in view plays another team
// in view (MEAC vs MEAC) — a game against a SWAC school does not count, even
// though the data flags those as conference games.
const isGroupGame = (g, teamIds) => {
  if (!g || g.state === "idle") return false;
  const opp = resolveOpponent(g);
  return !!opp && teamIds.some((id) => TEAM_BY_ID[id] === opp);
};

const SeasonScheduleMobileGrid = ({ group, model, confWeeksOnly = false }) => {
  const teamIds = model.teamIds ?? group.teams;
  const weeks = confWeeksOnly
    ? model.weeks.filter((w) => teamIds.some((id) => isGroupGame(model.byTeamWeek[id]?.[w.week], teamIds)))
    : model.weeks;
  return (
  <Box overflow="auto">
    <Grid templateColumns={`2.75rem repeat(${teamIds.length}, minmax(0, 1fr))`} minW="0">
      <Flex position="sticky" top={0} left={0} zIndex={4} align="center" justify="center" bg="bg.secondary" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100" py="0.4rem">
        <Text fontSize="0.5rem" color="text.muted" fontWeight="black" textTransform="uppercase">Wk</Text>
      </Flex>
      {teamIds.map((teamId) => {
        const team = TEAM_BY_ID[teamId];
        return (
          <Flex key={teamId} position="sticky" top={0} zIndex={3} align="center" justify="center" minH="2.75rem" bg="bg.secondary" borderBottom="1px solid" borderColor="whiteAlpha.100" p="0.2rem">
            <Image src={logo(team)} alt={label(team)} w="1.6rem" h="1.6rem" objectFit="contain" />
          </Flex>
        );
      })}

      {weeks.map((week) => [
        <Flex key={`week-${week.week}`} position="sticky" left={0} zIndex={2} align="center" justify="center" bg="bg.secondary" borderRight="1px solid" borderTop="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="0.6rem" color="white" fontWeight="black" textTransform="uppercase" whiteSpace="nowrap" lineHeight={1}>
            {week.week}
          </Text>
        </Flex>,
        ...teamIds.map((teamId) => (
          <MobileGameCell key={`${week.week}-${teamId}`} game={model.byTeamWeek[teamId]?.[week.week]} teamId={teamId} />
        )),
      ])}
    </Grid>
  </Box>
  );
};

const SeasonSchedulePage = () => {
  const params = useParams();
  const {
    season,
    setSeason,
    groupId,
    setGroupId,
    includeNonConference,
    setIncludeNonConference,
    group,
    model,
    isLoading,
    isError,
  } = useSeasonScheduleData({ routeYear: params.year });
  const { isMobile } = useLayoutDensity();
  // Mobile, MEAC only: show just the conference weeks (the header row stays).
  const [confWeeksOnly, setConfWeeksOnly] = useState(false);

  const bannerProps = {
    season,
    setSeason,
    groupId,
    setGroupId,
    includeNonConference,
    setIncludeNonConference,
  };

  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        <ScheduleBanner {...bannerProps} />
        {isLoading && (
          <Flex h="12rem" align="center" justify="center">
            <Spinner color="brand.500" />
          </Flex>
        )}
        {isError && (
          <Flex h="12rem" align="center" justify="center">
            <Text color="text.muted">Unable to load season schedule.</Text>
          </Flex>
        )}
        {!isLoading && !isError && groupId === "meac" && (
          <Flex borderTop="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
            {[[false, "All weeks"], [true, "MEAC weeks"]].map(([on, text]) => (
              <Box key={text} as="button" type="button" onClick={() => setConfWeeksOnly(on)} flex={1} py="0.55rem"
                bg={confWeeksOnly === on ? ACCENT : "transparent"} borderLeft={on ? "1px solid" : "none"} borderColor="whiteAlpha.100">
                <Text fontSize="0.65rem" fontWeight="black" color="white" textAlign="center" textTransform="uppercase" letterSpacing="0.06em">{text}</Text>
              </Box>
            ))}
          </Flex>
        )}
        {!isLoading && !isError && <SeasonScheduleMobileGrid group={group} model={model} confWeeksOnly={groupId === "meac" && confWeeksOnly} />}
      </Box>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <ScheduleBanner {...bannerProps} />
      </PageShell.Slot>

      <PageShell.Slot cols={4} rows={9}>
        {isLoading && (
          <Flex h="100%" align="center" justify="center" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl">
            <Spinner color="brand.500" />
          </Flex>
        )}
        {isError && (
          <Flex h="100%" align="center" justify="center" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl">
            <Text color="text.muted">Unable to load season schedule.</Text>
          </Flex>
        )}
        {!isLoading && !isError && (
          <SeasonScheduleGrid
            group={group}
            includeNonConference={includeNonConference}
            model={model}
          />
        )}
      </PageShell.Slot>
    </PageShell>
  );
};

export default SeasonSchedulePage;
