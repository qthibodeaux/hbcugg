import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Pause, Play } from "lucide-react";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const CLASS_YEAR_MAP = {
  "Fr.": 1, "So.": 2, "Jr.": 3, "Sr.": 4, "Gr.": 5,
  FR: 1, SO: 2, JR: 3, SR: 4, GR: 5,
  Fr: 1, So: 2, Jr: 3, Sr: 4, Gr: 5,
};

const getClassYearNum = (classYear) => {
  if (typeof classYear === "number") return classYear;
  return CLASS_YEAR_MAP[classYear] || 1;
};

const formatHeight = (player) => {
  if (player.height_raw && typeof player.height_raw === "string") return player.height_raw;
  const inches = Number(player.height);
  if (!Number.isFinite(inches) || inches <= 0) return "--";
  return `${Math.floor(inches / 12)}'${Math.round(inches % 12)}"`;
};

const getPlayerName = (player) => {
  if (player.full_name) return player.full_name;
  if (player.first_name && player.last_name) return `${player.first_name} ${player.last_name}`;
  return "Unknown";
};

const getRemainingYears = (classYearNum) => {
  if (classYearNum >= 4) return 1;
  return 5 - classYearNum;
};

const TICK_KEYFRAMES = "rosterOutlookTick";

const SQUARE_W = "1.5rem";

const SUFFIX_RE = /^(Jr|Sr|I{2,3}|IV|V)\.?$/i;

const getLastName = (player) => {
  // A stored last_name is sometimes just the suffix ("Jr."), which is how a
  // row ended up literally labelled "Jr." — fall through to parsing the full
  // name in that case.
  if (player.last_name && !SUFFIX_RE.test(player.last_name.trim())) return player.last_name;
  const full = getPlayerName(player);
  if (full === "Unknown") return full;
  const parts = full.replace(/,/g, " ").trim().split(/\s+/).filter(Boolean);
  while (parts.length > 1 && SUFFIX_RE.test(parts[parts.length - 1])) parts.pop();
  return parts[parts.length - 1] || full;
};

// `mobile` squares off the boxes: no gap between them, square corners, and
// a white hairline border so each year still reads as its own cell.
const EligibilityBar = ({ player, teamColors, mobile = false }) => {
  const classYearNum = getClassYearNum(player.class_year);
  const remaining = getRemainingYears(classYearNum);
  const isRedshirt = player.is_redshirt === true || player.is_redshirt === "true";
  const primary = teamColors?.primary || "#E53E3E";

  const squareProps = mobile
    ? { borderRadius: 0, border: "1px solid", borderColor: "whiteAlpha.700" }
    : { borderRadius: "3px" };

  return (
    <Flex align="stretch" gap={mobile ? 0 : 1} h="full" alignSelf="stretch">
      {[0, 1, 2, 3, 4].map((offset) => {
        const isEligible = offset < remaining;
        const isRedshirtYear = isRedshirt && offset === remaining;
        const bg = isEligible ? primary : isRedshirtYear ? "#E53E3E" : "whiteAlpha.100";

        return <Box key={offset} w={SQUARE_W} h="full" bg={bg} flexShrink={0} {...squareProps} />;
      })}
    </Flex>
  );
};

const SchoolCell = ({ player, team }) => {
  if (player.is_transfer && player.previous_school) {
    return (
      <Text fontSize="10px" fontWeight="bold" color="text.muted" lineClamp={2} textAlign="right" lineHeight={1.2}>
        {player.previous_school}
      </Text>
    );
  }
  if (getClassYearNum(player.class_year) === 1) {
    return (
      <Text fontSize="10px" fontWeight="bold" color="text.muted" lineClamp={1} textAlign="right">
        HS
      </Text>
    );
  }
  if (team?.logo) {
    return <Image src={team.logo} alt="" h="14px" objectFit="contain" />;
  }
  return <Text fontSize="10px" fontWeight="bold" color="text.muted">--</Text>;
};

/* ─── Standard row — wide layout ─── */

const PlayerRowStandard = ({ player, teamColors, team }) => {
  const navigate = useNavigate();
  const name = getPlayerName(player);
  const height = formatHeight(player);
  const weight = player.weight ? `${player.weight}` : "--";
  const score = player.experience_score ?? "--";
  const goToPlayer = () => navigate(`/player/${encodeURIComponent(`${name}__${player.team_id}`)}`, { state: { player } });

  return (
    <Grid
      templateColumns="2.5rem 1fr 3.5rem 4rem 3rem 6rem auto"
      alignItems="center"
      gap={3}
      py={1}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      minW={0}
    >
      <Text fontSize="md" fontWeight="black" color="text.primary" textAlign="center">
        {player.jersey_number ?? "--"}
      </Text>
      <Box as="button" type="button" onClick={goToPlayer} minW={0} textAlign="left" bg="transparent" border="none" p={0} cursor="pointer">
        <Text fontSize="lg" fontWeight="black" color="text.primary" lineClamp={1} _hover={{ textDecoration: "underline" }}>
          {name}
        </Text>
      </Box>
      <Text fontSize="sm" fontWeight="bold" color="text.muted" lineClamp={1}>
        {height}
      </Text>
      <Text fontSize="sm" fontWeight="bold" color="text.muted" lineClamp={1}>
        {weight} lbs
      </Text>
      <Text fontSize="lg" fontWeight="black" color="text.primary" textAlign="center">
        {score}
      </Text>
      <Flex justify="flex-end" align="center" minW={0}>
        <SchoolCell player={player} team={team} />
      </Flex>
      <EligibilityBar player={player} teamColors={teamColors} />
    </Grid>
  );
};

/* ─── Compact row — narrow layout ─── */

const PlayerRowCompact = ({ player, teamColors, team }) => {
  const navigate = useNavigate();
  const name = getPlayerName(player);
  const height = formatHeight(player);
  const weight = player.weight ? `${player.weight}` : "--";
  const score = player.experience_score ?? "--";
  const goToPlayer = () => navigate(`/player/${encodeURIComponent(`${name}__${player.team_id}`)}`, { state: { player } });

  return (
    <Grid
      templateColumns="2rem 1fr 2.5rem 4rem auto"
      alignItems="center"
      gap={2}
      py={1}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      minW={0}
    >
      <Text fontSize="sm" fontWeight="black" color="text.primary" textAlign="center">
        {player.jersey_number ?? "--"}
      </Text>
      <Box as="button" type="button" onClick={goToPlayer} minW={0} textAlign="left" bg="transparent" border="none" p={0} cursor="pointer">
        <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1} _hover={{ textDecoration: "underline" }}>
          {name}
        </Text>
        <Text fontSize="9px" color="text.muted" lineClamp={1}>
          {height} / {weight} lbs
        </Text>
      </Box>
      <Text fontSize="sm" fontWeight="black" color="text.primary" textAlign="center">
        {score}
      </Text>
      <Flex justify="flex-end" align="center" minW={0}>
        <SchoolCell player={player} team={team} />
      </Flex>
      <EligibilityBar player={player} teamColors={teamColors} />
    </Grid>
  );
};

// Mobile — jersey #, Score and Prev(ious school) columns are dropped; only
// the name (with height/weight beneath it) and the eligibility year boxes
// survive. At phone width the seven- and five-column tables squeezed the
// name to ~90px, clipping every one of them to "Nicholas..." / "Latarie...".
const MOBILE_COLUMNS = "minmax(0, 1fr) 2.4rem 2.4rem auto";

const PlayerRowMobile = ({ player, teamColors }) => {
  const navigate = useNavigate();
  const name = getPlayerName(player);
  const height = formatHeight(player);
  const weight = player.weight ? `${player.weight}` : "--";
  const goToPlayer = () => navigate(`/player/${encodeURIComponent(`${name}__${player.team_id}`)}`, { state: { player } });

  return (
    // alignItems=stretch + zero vertical padding on the grid itself: the
    // eligibility boxes run the full height of the row, edge to edge. The
    // text cells carry their own padding so they still sit centered with
    // breathing room.
    <Grid
      templateColumns={MOBILE_COLUMNS}
      alignItems="stretch"
      gap={2}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      minW={0}
    >
      <Flex as="button" type="button" onClick={goToPlayer} align="center" minW={0} textAlign="left" bg="transparent" border="none" px={0} py={2} cursor="pointer">
        <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1}>
          {getLastName(player)}
        </Text>
      </Flex>
      <Flex align="center" justify="center" minW={0}>
        <Text fontSize="11px" color="text.muted" lineClamp={1}>{height}</Text>
      </Flex>
      <Flex align="center" justify="center" minW={0}>
        <Text fontSize="11px" color="text.muted" lineClamp={1}>{weight}</Text>
      </Flex>
      <EligibilityBar player={player} teamColors={teamColors} mobile />
    </Grid>
  );
};

const POSITION_GROUPS = [
  { key: "QB", label: "Quarterbacks" },
  { key: "RB", label: "Running Backs" },
  { key: "WR", label: "Wide Receivers" },
  { key: "TE", label: "Tight Ends" },
  { key: "OL", label: "Offensive Line" },
  { key: "DL", label: "Defensive Line" },
  { key: "LB", label: "Linebackers" },
  { key: "DB", label: "Defensive Backs" },
  { key: "ST", label: "Special Teams" },
];

export const RosterOutlookCarousel = ({ team, players, year }) => {
  const { isMobile } = useLayoutDensity();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const isPaused = isHovering || isManuallyPaused;
  const group = POSITION_GROUPS[activeIndex];

  const groupPlayers = useMemo(() => {
    if (!players || !group) return [];
    return players
      .filter((p) => p.position_group === group.key)
      .sort((a, b) => (b.experience_score ?? 0) - (a.experience_score ?? 0));
  }, [players, group]);

  const teamColors = team?.colors || {};
  const primary = teamColors?.primary || "#E53E3E";
  const secondary = teamColors?.secondary || "#F56565";

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border={isMobile ? "none" : "1px solid"}
      borderColor="whiteAlpha.100"
      borderRadius={0}
      overflow="hidden"
      position="relative"
      px={{ base: 3, lg: 4 }}
      py={2}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* CSS-driven timer — pausable via animationPlayState */}
      <style>{`
        @keyframes ${TICK_KEYFRAMES} {
          from { opacity: 0; }
          to { opacity: 0; }
        }
      `}</style>
      <Box
        position="absolute"
        opacity={0}
        pointerEvents="none"
        w="1px"
        h="1px"
        style={{
          animation: `${TICK_KEYFRAMES} 6s infinite`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
        onAnimationIteration={() => setActiveIndex((prev) => (prev + 1) % POSITION_GROUPS.length)}
      />

      {/* Team-colored left bar is desktop-only */}
      {!isMobile && <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={primary} />}
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${primary}11 0%, transparent 50%)`} pointerEvents="none" />

      <Flex position="relative" zIndex={1} h="full" direction="column" minH={0}>
        {/* Combined indicator strip — pause/play, dots flanking the active position-group label */}
        <Flex align="center" justify="center" gap={2} mb={2} minW={0}>
          <Box
            as="button"
            type="button"
            onClick={() => setIsManuallyPaused((value) => !value)}
            w="18px"
            h="18px"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={primary}
            color="white"
            borderRadius="sm"
            cursor="pointer"
            border="none"
            title={isPaused ? "Resume rotation" : "Pause rotation"}
          >
            {isPaused ? <Play size={9} /> : <Pause size={9} />}
          </Box>

          <Flex align="center" gap={1.5} flexShrink={0}>
            {POSITION_GROUPS.slice(0, activeIndex).map((pg, idx) => (
              <Box
                key={pg.key}
                as="button"
                w="6px"
                h="6px"
                borderRadius="full"
                bg="whiteAlpha.300"
                onClick={() => setActiveIndex(idx)}
                cursor="pointer"
                border="none"
                p={0}
              />
            ))}
          </Flex>

          <Text fontSize={{ base: "sm", lg: "md" }} fontWeight="black" color="text.primary" textTransform="uppercase" lineClamp={1} textAlign="center">
            {group?.label}
          </Text>

          <Flex align="center" gap={1.5} flexShrink={0}>
            {POSITION_GROUPS.slice(activeIndex).map((pg, i) => {
              const idx = activeIndex + i;
              return (
                <Box
                  key={pg.key}
                  as="button"
                  w="6px"
                  h="6px"
                  borderRadius="full"
                  bg={idx === activeIndex ? secondary : "whiteAlpha.300"}
                  onClick={() => setActiveIndex(idx)}
                  cursor="pointer"
                  border="none"
                  p={0}
                />
              );
            })}
          </Flex>
        </Flex>

        {/* Mobile header — name + year boxes only */}
        {isMobile && (
          <Grid
            templateColumns={MOBILE_COLUMNS}
            alignItems="center"
            gap={2}
            py={1}
            borderBottom="1px solid"
            borderColor="whiteAlpha.200"
            mb={1}
          >
            <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase">Player</Text>
            <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">HT</Text>
            <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">WT</Text>
            <Flex align="center" gap={0}>
              {[0, 1, 2, 3, 4].map((offset) => (
                <Text key={offset} fontSize="7px" fontWeight="black" color="text.muted" w={SQUARE_W} textAlign="center">
                  {String(year + offset).slice(-2)}
                </Text>
              ))}
            </Flex>
          </Grid>
        )}

        {/* Standard header — hidden on compact */}
        <Grid
          display={isMobile ? "none" : { base: "none", lg: "grid" }}
          templateColumns="2.5rem 1fr 3.5rem 4rem 3rem 6rem auto"
          alignItems="center"
          gap={3}
          py={1}
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          mb={1}
        >
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">#</Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase">Player</Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase">HT</Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase">WT</Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">Score</Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="right">Prev</Text>
          <Flex align="center" gap={1}>
            {[0, 1, 2, 3, 4].map((offset) => (
              <Text key={offset} fontSize="9px" fontWeight="black" color="text.muted" w={SQUARE_W} textAlign="center">
                {String(year + offset).slice(-2)}
              </Text>
            ))}
          </Flex>
        </Grid>

        {/* Compact header — hidden on normal */}
        <Grid
          display={isMobile ? "none" : { base: "grid", lg: "none" }}
          templateColumns="2rem 1fr 2.5rem 4rem auto"
          alignItems="center"
          gap={2}
          py={1}
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          mb={1}
        >
          <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">#</Text>
          <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase">Player</Text>
          <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">Score</Text>
          <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="right">Prev</Text>
          <Flex align="center" gap={1}>
            {[0, 1, 2, 3, 4].map((offset) => (
              <Text key={offset} fontSize="7px" fontWeight="black" color="text.muted" w={SQUARE_W} textAlign="center">
                {String(year + offset).slice(-2)}
              </Text>
            ))}
          </Flex>
        </Grid>

        {/* Table rows */}
        <Box flex={1} overflow="auto" minH={0} pr={2}>
          {groupPlayers.length === 0 ? (
            <Text fontSize="xs" color="text.muted" py={4} textAlign="center">
              No {group?.label} data
            </Text>
          ) : (
            groupPlayers.map((player) => (
              <Box key={player.id || player.jersey_number || Math.random()}>
                {isMobile ? (
                  <PlayerRowMobile player={player} teamColors={teamColors} />
                ) : (
                  <>
                    <Box display={{ base: "none", lg: "block" }}>
                      <PlayerRowStandard player={player} teamColors={teamColors} team={team} />
                    </Box>
                    <Box display={{ base: "block", lg: "none" }}>
                      <PlayerRowCompact player={player} teamColors={teamColors} team={team} />
                    </Box>
                  </>
                )}
              </Box>
            ))
          )}
        </Box>
      </Flex>
    </Box>
  );
};
