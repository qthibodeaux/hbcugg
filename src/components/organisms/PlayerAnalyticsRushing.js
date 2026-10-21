import { useMemo, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useAllPlayersByYear } from "../../hooks/useSWACData";
import { buildIdentityIndex, resolveImages } from "../../utils/headshots";
import { ExportCardButton } from "./stats/ExportCardButton";
import { RushingPlot } from "./rushing/RushingPlot";
import { RushingDirectionPlot } from "./rushing/RushingDirectionPlot";
import { RushingDumbbell } from "./rushing/RushingDumbbell";
import { RushingLine } from "./rushing/RushingLine";
import { CHARTS, DATA, SUBTITLE } from "./rushing/rushingModel";

// Rushing — SWAC rushing, 2026 through Week 6. TEMPORARY tab: the backend sent
// these charts as a one-off (src/data/swacRushing2026W6.json), and there is no
// permanent home for them yet, so they sit beside the QB Map. One chart at a
// time; each exports as a 1200 x 1200 PNG built from a hidden fixed-size copy
// (title and subtitle, no footnote).
// Players show their face, found by person_id; the PNG uses team marks, since
// outside-hosted photos don't survive the capture.
// Delete with src/components/organisms/rushing/ and the data file.

const BRAND = "#A855F7";
const POSTER = 1200;

const Chart = ({ item, hover, setHover, srcsFor, poster }) => {
  if (item.kind === "scatter" || item.kind === "bubble") {
    return <RushingPlot id={item.id} chart={item.chart} hover={hover} setHover={setHover} srcsFor={srcsFor} />;
  }
  if (item.kind === "dot_plot") return <RushingDirectionPlot chart={item.chart} />;
  if (item.kind === "dumbbell") return <RushingDumbbell chart={item.chart} leaders={item.slide.leaders} srcsFor={srcsFor} faces={!poster} />;
  if (item.kind === "line") return <RushingLine tidbit={item.tidbit} teamId={item.teamId} />;
  return null;
};

const RushingPoster = ({ item, posterRef }) => (
  <Flex ref={posterRef} direction="column" w={`${POSTER}px`} h={`${POSTER}px`} bg="#0B0B0D" color="white" px="48px" pt="44px" pb="44px" fontFamily="inherit">
    <Flex align="center" gap="12px" mb="8px">
      <Box w="8px" h="28px" bg={BRAND} />
      <Text fontSize="20px" fontWeight="900" letterSpacing="0.24em" textTransform="uppercase">HBCU GRIDIRON <Text as="span" color={BRAND}>GLORY</Text></Text>
    </Flex>
    <Text fontSize="64px" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.035em" lineHeight={0.95}>{item.title}</Text>
    <Text fontSize="22px" fontWeight="800" color="whiteAlpha.700" mt="12px">{SUBTITLE}</Text>
    <Box flex={1} minH={0} mt="22px" w="1104px">
      <Chart item={item} hover={null} setHover={null} srcsFor={() => []} poster />
    </Box>
  </Flex>
);

const PlayerAnalyticsRushing = () => {
  const [id, setId] = useState(CHARTS[0].id);
  const [hover, setHover] = useState(null);
  const posterRef = useRef(null);
  const item = CHARTS.find((c) => c.id === id) ?? CHARTS[0];

  const roster = useAllPlayersByYear(DATA.season).players;
  const prior = useAllPlayersByYear(DATA.season - 1).players;
  // The hook hands back a fresh array each render; the rosters themselves never change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const identity = useMemo(() => buildIdentityIndex(roster, prior), [roster.length, prior.length]);
  // A player's face by person_id (2026 roster, then 2025), then name + team.
  const srcsFor = (p) => resolveImages(identity, { player_key: p.player_id, name: p.player_name ?? p.name, image_url: p.image_url }, p.team_id);

  const pick = (next) => {
    setHover(null);
    setId(next);
  };

  return (
    <Box>
      <Flex gap={2} wrap="wrap" mb={5}>
        {CHARTS.map((c) => {
          const on = c.id === item.id;
          return (
            <Flex
              key={c.id}
              as="button"
              type="button"
              onClick={() => pick(c.id)}
              px={3.5}
              h="2.2rem"
              align="center"
              borderRadius="md"
              border="1px solid"
              borderColor={on ? "brand.500" : "whiteAlpha.200"}
              bg={on ? "whiteAlpha.100" : "transparent"}
              _hover={{ bg: "whiteAlpha.100" }}
            >
              <Text fontSize="sm" fontWeight={on ? "900" : "700"} color={on ? "text.primary" : "text.secondary"} whiteSpace="nowrap">{c.chip}</Text>
            </Flex>
          );
        })}
      </Flex>

      <Flex align="flex-end" justify="space-between" gap={3} mb={4} wrap="wrap">
        <Text fontSize="clamp(1.6rem, 3.2vw, 2.6rem)" fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase" letterSpacing="-0.03em" lineHeight={0.95}>
          {item.title}
        </Text>
        <ExportCardButton target={posterRef} filename={() => `swac-rushing-${item.id}-${DATA.season}-w${DATA.through_week}.png`.replace(/_/g, "-")} />
      </Flex>

      <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={3}>
        <Chart item={item} hover={hover} setHover={setHover} srcsFor={srcsFor} poster={false} />
      </Box>

      {/* Export source: off screen, fixed size. */}
      <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
        <RushingPoster item={item} posterRef={posterRef} />
      </Box>
    </Box>
  );
};

export default PlayerAnalyticsRushing;
