import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { ArrowLeft } from "lucide-react";
import { MOCK_SEASON_GAMES, useGameSpotlight, GameReadout, SeasonBarChart } from "./GameSpotlightColumn";
import { PlayerProductionMap } from "./PlayerProductionMaps";

// Both mobile content rows share one height so they're equal by
// construction. Was `auto auto`, which let row 1 grow to fit its eight data
// lines while row 2 got squeezed into whatever was left.
const MOBILE_ROW_H = "11.5rem";

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const formatHeight = (inches) => {
  if (!inches) return "-";
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};

// PIPELINE NOTE: class_year comes through as a raw 1-5 number, which means
// nothing on its own — this local FR/SO/JR/SR/GR lookup exists in three other
// files this session (PlayersTab.js, RosterLineList.js) purely to paper over
// that. The export pipeline should send the classification as text directly.
const CLASS_YEAR_LABELS = { 1: "Freshman", 2: "Sophomore", 3: "Junior", 4: "Senior", 5: "Graduate" };
const formatClassYear = (classYear) => {
  if (classYear == null || classYear === "") return "-";
  const num = Number(classYear);
  if (Number.isFinite(num) && CLASS_YEAR_LABELS[num]) return CLASS_YEAR_LABELS[num];
  return String(classYear);
};

const POSITION_FULL = {
  QB: "Quarterback", RB: "Running Back", FB: "Fullback", WR: "Wide Receiver", TE: "Tight End",
  OL: "Offensive Line", OT: "Offensive Tackle", OG: "Offensive Guard", C: "Center",
  DL: "Defensive Line", DT: "Defensive Tackle", DE: "Defensive End", EDGE: "Edge Rusher",
  LB: "Linebacker", ILB: "Inside Linebacker", OLB: "Outside Linebacker",
  DB: "Defensive Back", CB: "Cornerback", S: "Safety", FS: "Free Safety", SS: "Strong Safety",
  K: "Kicker", P: "Punter", LS: "Long Snapper", ST: "Special Teams", ATH: "Athlete",
};
const formatPosition = (pos) => POSITION_FULL[String(pos).toUpperCase()] ?? pos;

// Lab-safe fallbacks — ComponentLab.js renders every registry entry with zero props,
// so this needs to stand on its own the same way the other mock data above does.
const MOCK_TABS = [
  { id: "profile", label: "Profile", shortLabel: "Profile" },
  { id: "production", label: "Season Stats", shortLabel: "Stats" },
  { id: "stats", label: "Advanced Analytics", shortLabel: "Advanced" },
];
const MOCK_PLAYER = { position_group: "RB", jersey_number: 23, class_year: "Jr", par: 18.4 };
const MOCK_TEAM_META = { shortName: "AAMU", colors: { primary: "#E53E3E", secondary: "#FFFFFF" } };

// ═══════════════════════════════════════════════════════════════
// COLUMN 1: IDENTITY BLOCK — back button + title + basic info, merged
// into one leftmost column (was two separate columns).
// ═══════════════════════════════════════════════════════════════

const IdentityBlock = ({ onBack, player, classLabel, height, weight, homeCity, homeState, highSchool, previousSchool, primary }) => {
  const position = String(player?.position_group ?? player?.position ?? player?.position_abbr ?? "ATH").toUpperCase();
  const number = player?.jersey_number != null ? `#${player.jersey_number}` : "-";

  const rows = [
    { label: "Position", value: formatPosition(position) },
    { label: "Number", value: number },
    { label: "Class", value: classLabel ?? formatClassYear(player?.class_year) },
    { label: "Height", value: formatHeight(height) },
    { label: "Weight", value: weight ? `${weight}` : "-" },
    { label: "Hometown", value: homeCity && homeState ? `${homeCity}, ${homeState}` : "-" },
  ];
  if (previousSchool) rows.push({ label: "Prev School", value: previousSchool });
  if (highSchool) rows.push({ label: "High School", value: highSchool });

  return (
    <Flex
      direction="column"
      h="full"
      position="relative"
      overflow="hidden"
      borderRight="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(135deg, ${primary}99 0%, rgba(10,10,12,0.9) 62%)`}
    >
      {/* Ghost watermark */}
      <Text
        position="absolute"
        right="-0.15rem"
        bottom="-0.32rem"
        fontSize="clamp(1.8rem, 3vw, 2.6rem)"
        fontWeight="black"
        color="rgba(255,255,255,0.06)"
        lineHeight={0.8}
      >
        BACK
      </Text>

      {/* Back + title */}
      <Box p="clamp(0.5rem, 0.8vw, 0.7rem)" pb="0.25rem" position="relative" zIndex={1}>
        <Box
          as="button"
          type="button"
          onClick={onBack}
          display="flex"
          alignItems="center"
          gap="0.3rem"
          w="fit-content"
          px="0.4rem"
          py="0.22rem"
          bg="rgba(255,255,255,0.14)"
          border="1px solid"
          borderColor="rgba(255,255,255,0.3)"
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: "rgba(255,255,255,0.22)" }}
          transition="background 0.16s ease"
        >
          <ArrowLeft size={11} color="white" />
          <Text fontSize="0.55rem" fontWeight="black" color="white" letterSpacing="0.06em">
            BACK
          </Text>
        </Box>
      </Box>

      {/* Basic info */}
      <Flex direction="column" flex={1} minH={0} px="clamp(0.5rem, 0.8vw, 0.7rem)" pb="clamp(0.5rem, 0.8vw, 0.7rem)" pt="0.15rem" borderTop="1px solid" borderColor="whiteAlpha.100" position="relative" zIndex={1}>
        <Flex direction="column" justify="space-evenly" flex={1} minH={0}>
          {rows.map((row) => (
            <Flex key={row.label} justify="space-between" align="center" gap="0.5rem" minW={0}>
              <Text fontSize="0.46rem" color="rgba(255,255,255,0.5)" fontWeight="black" letterSpacing="0.03em" textTransform="uppercase" flexShrink={0}>
                {row.label}
              </Text>
              <Text fontSize="clamp(0.62rem, 1.1vw, 0.95rem)" color="white" fontWeight="black" lineHeight={1.05} lineClamp={1} textAlign="right">
                {row.value}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// COLUMNS 2-4: GAME READOUT, SEASON BAR CHART, PRODUCTION CHART — three
// separate columns sharing one active-game index (see useGameSpotlight),
// instead of one combined block.
// ═══════════════════════════════════════════════════════════════

const ReadoutColumn = ({ game, visible, primary, secondary }) => (
  <Box h="full" gridRow={{ md: "1 / 3" }} borderRight="1px solid" borderColor="whiteAlpha.100" position="relative" overflow="hidden">
    <GameReadout game={game} visible={visible} primary={primary} secondary={secondary} />
  </Box>
);

const BarChartColumn = ({ games, activeIndex, primary, secondary, onSelect }) => (
  <Box h="full" gridRow={{ md: "1 / 3" }} borderRight="1px solid" borderColor="whiteAlpha.100" position="relative" overflow="hidden">
    <SeasonBarChart games={games} activeIndex={activeIndex} primary={primary} secondary={secondary} onSelect={onSelect} />
  </Box>
);

const SpatialColumn = ({ player, primary, secondary, gameOverride, fieldMap, fieldMapViews, depthBands, productionComponents }) => (
  <Box h="full" gridRow={{ md: "1 / 3" }} position="relative" overflow="hidden">
    <PlayerProductionMap
      player={player}
      primary={primary}
      secondary={secondary}
      gameOverride={gameOverride}
      fieldMap={fieldMap}
      fieldMapViews={fieldMapViews}
      depthBands={depthBands}
      productionComponents={productionComponents}
    />
  </Box>
);

// ═══════════════════════════════════════════════════════════════
// FLOATING TAB BUTTONS
// ═══════════════════════════════════════════════════════════════

const TabButton = ({ tab, isActive, onClick, primary }) => (
  <Box
    as="button"
    onClick={onClick}
    px={{ base: 2, md: 2.5 }}
    py={2}
    minW="0"
    flex="1"
    border="1px solid"
    borderColor={isActive ? primary : "rgba(255,255,255,0.12)"}
    bg={isActive ? `${primary}22` : "rgba(255,255,255,0.05)"}
    cursor="pointer"
    _hover={{
      bg: isActive ? `${primary}30` : "rgba(255,255,255,0.1)",
    }}
    transition="all 0.15s ease"
  >
    <Text
      fontSize="0.6rem"
      fontWeight="black"
      color={isActive ? "white" : "rgba(255,255,255,0.55)"}
      textTransform="uppercase"
      letterSpacing="0.04em"
      whiteSpace="nowrap"
      textAlign="center"
    >
      {tab.shortLabel ?? tab.label}
    </Text>
  </Box>
);

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

export const PlayerProfileControlStripV2 = ({
  player = MOCK_PLAYER,
  teamMeta = MOCK_TEAM_META,
  classLabel,
  height = 71,
  weight = 205,
  homeCity,
  homeState,
  highSchool,
  previousSchool,
  tabs = MOCK_TABS,
  activeTab = MOCK_TABS[0].id,
  setActiveTab = () => {},
  onBack = () => {},
  seasonGames,
  fieldMapViews,
  depthBands,
  productionComponents,
}) => {
  const { isMobile } = useLayoutDensity();
  const primary = teamMeta?.colors?.primary ?? "#E53E3E";
  const secondary = teamMeta?.colors?.secondary ?? "#FFFFFF";
  const games = seasonGames ?? MOCK_SEASON_GAMES;
  const { index: activeIndex, setIndex, visible } = useGameSpotlight(games);
  // useGameSpotlight's cycle timer starts against whatever `games` array is
  // present on mount (MOCK_SEASON_GAMES, 12 items, before a real profile
  // document loads) and keeps ticking against that length even after
  // `games` swaps to the real, shorter array — activeIndex can walk past
  // the new array's last index for a beat. Guard the read rather than the
  // timer; games[0] always exists once games.length > 0.
  const activeGame = games[activeIndex] ?? games[0];

  return (
    <Box
      w="full"
      h="full"
      bg="linear-gradient(180deg, #17171a 0%, #09090b 100%)"
      border={isMobile ? "none" : "1px solid"}
      borderColor="whiteAlpha.100"
      borderRadius={isMobile ? 0 : "xl"}
      overflow="hidden"
      position="relative"
    >
      {/* Desktop: 4 columns (bio, game readout, bar chart, spatial chart)
          with the tabs as a bottom row under column 1.
          Mobile: three rows of a 2-column grid — identity | spotlight, then
          PAR-by-game | production map, then the tabs spanning full width —
          instead of all four blocks stacking into one long scroll. */}
      <Grid
        h="full"
        templateColumns={isMobile
          ? "repeat(2, minmax(0, 1fr))"
          : { base: "1fr", md: "1fr 0.9fr 1fr 1.1fr" }}
        templateRows={isMobile ? `${MOBILE_ROW_H} ${MOBILE_ROW_H} auto` : "1fr auto"}
      >
        {/* Row 1: Content */}
        <IdentityBlock
          onBack={onBack}
          player={player}
          classLabel={classLabel}
          height={height}
          weight={weight}
          homeCity={homeCity}
          homeState={homeState}
          highSchool={highSchool}
          previousSchool={previousSchool}
          primary={primary}
        />
        <ReadoutColumn game={activeGame} visible={visible} primary={primary} secondary={secondary} />
        <BarChartColumn games={games} activeIndex={activeIndex} primary={primary} secondary={secondary} onSelect={setIndex} />
        <SpatialColumn
          player={player}
          primary={primary}
          secondary={secondary}
          gameOverride={activeGame.stats}
          fieldMap={activeGame.fieldMap}
          fieldMapViews={fieldMapViews}
          depthBands={depthBands}
          productionComponents={productionComponents}
        />

        {/* Row 2: Floating tabs — anchored under column 1 (leftmost) only. Columns 2-4
            span both rows (above) so they get the banner's full height instead of
            reserving an empty row-2 strip they no longer use. */}
        <Flex
          gridColumn={isMobile ? "1 / -1" : { md: "1" }}
          gridRow={isMobile ? undefined : { md: "2" }}
          align="center"
          justify={isMobile ? "space-between" : "flex-start"}
          gap="0.35rem"
          px="0.6rem"
          pb="0.5rem"
          pt="0.35rem"
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              primary={primary}
            />
          ))}
        </Flex>
      </Grid>
    </Box>
  );
};
