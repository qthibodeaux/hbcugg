import { Flex, Box, Text, Spinner } from "@chakra-ui/react";
import { useColorScheme } from "../../../theme/colorScheme";
import { paletteOf } from "../../molecules/export/posterPalette";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { useStatBoard } from "../../../hooks/useThreeAndOuts";
import { useState, useRef } from "react";
import { SCOPES, STATS } from "./statBoard/boardPresentation";
import WORTH from "../../../data/threeAndOutWorth2026W7.json";
import { ExportCardButton } from "../stats/ExportCardButton";
import { FinishingScatter } from "./ThreeAndOutWorth";
import { Scatter } from "./statBoard/RateScatter";
import { Board } from "./statBoard/RankedBoard";
import { Poster } from "./statBoard/StatBoardPoster";

// ── Mode ─────────────────────────────────────────────────────────────────────

const Toggle = ({ options, value, onChange, m }) => (
  <Flex gap="1px">
    {options.map((o, i) => (
      <Box key={o.id} as="button" type="button" onClick={() => onChange(o.id)} flex={m ? 1 : undefined}
        px={m ? 0 : 4} py={m ? "0.6rem" : 1.5}
        borderRadius={m ? 0 : i === 0 ? "md 0 0 md" : i === options.length - 1 ? "0 md md 0" : 0}
        bg={value === o.id ? "brand.500" : "line"} _hover={value === o.id ? undefined : { bg: "line.strong" }}>
        <Text fontSize={m ? "0.75rem" : "11px"} fontWeight="900" color={value === o.id ? "white" : "text.secondary"} textTransform="uppercase" letterSpacing="0.1em">{o.label}</Text>
      </Box>
    ))}
  </Flex>
);

const StatBoardMode = ({ stat, season }) => {
  const [scheme] = useColorScheme();
  const pal = paletteOf(scheme);
  const { isMobile: m } = useLayoutDensity();
  const { file, isLoading, isError } = useStatBoard(stat.slug, season);
  const [view, setView] = useState("board");
  const [sideId, setSideId] = useState("offense");
  const [scope, setScope] = useState("all");
  const posterRef = useRef(null);

  if (isLoading) return <Flex justify="center" py={16}><Spinner color="brand.500" /></Flex>;
  if (isError || !file) return <Text color="text.muted" py={10} textAlign="center">No {stat.name} numbers for {season}.</Text>;

  const meta = stat.sides.find((s) => s.id === sideId);
  const side = { ...meta, ...file[sideId] };
  const rows = (side.rows ?? []).filter((r) => scope === "all" || r.conference === scope);
  const noGames = (file.no_games ?? []).filter((id) => scope === "all" || id.startsWith(scope));
  const filename = () => `${stat.slug}-${view === "board" ? sideId : view}-${file.season}-${file.games_through ? `w${file.games_through.week}` : "final"}-${scope}-${scheme}.png`;

  return (
    <Box>
      <Flex direction={m ? "column" : "row"} align={m ? "stretch" : "center"} justify="space-between" gap={m ? "1px" : 3} mb={m ? 0 : 4} wrap="wrap">
        <Flex gap={m ? "1px" : 3} direction={m ? "column" : "row"} wrap="wrap">
          <Toggle m={m} value={view} onChange={setView} options={[{ id: "board", label: "Board" }, { id: "scatter", label: "Scatter" }, ...(stat.finishing ? [{ id: "worth", label: "Finishing" }] : [])]} />
          {view === "board" && <Toggle m={m} value={sideId} onChange={setSideId} options={stat.sides} />}
          {view !== "worth" && <Toggle m={m} value={scope} onChange={setScope} options={SCOPES} />}
        </Flex>
        <Flex align="center" justify={m ? "space-between" : "flex-end"} gap={3} px={m ? "0.75rem" : 0} py={m ? "0.5rem" : 0} bg={m ? "bg.secondary" : "transparent"}>
          <Text fontSize={m ? "0.75rem" : "11px"} fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
            {view === "worth" ? `${WORTH.season} · Week ${WORTH.through_week}` : file.games_through?.label ?? `${file.season} final`}
          </Text>
          <ExportCardButton target={posterRef} filename={filename} />
        </Flex>
      </Flex>

      <Box fontSize={m ? "15px" : "17px"} color={pal.ink} bg={m ? pal.bg : "transparent"} p={m ? "0.5rem" : 0}>
        <Text mb="0.6em" fontSize={m ? "1.3em" : "1.6em"} fontWeight="950" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.03em" lineHeight={0.95}>
          {view === "worth" ? "Once the drive survives" : view === "scatter" ? "Offense vs defense" : side.title}
        </Text>
        {view === "worth"
          ? <FinishingScatter pal={pal} compact={m} />
          : view === "scatter"
            ? <Scatter pal={pal} stat={stat} file={file} rows={rows} compact={m} />
            : <Board pal={pal} stat={stat} side={side} rows={rows} cols={m ? 1 : 2} noGames={noGames} />}
      </Box>

      {/* Export source: off screen, full size. */}
      <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
        <Poster pal={pal} stat={stat} file={file} view={view} side={side} rows={rows} noGames={noGames} innerRef={posterRef} />
      </Box>
    </Box>
  );
};

// Keyed per stat so switching modes starts each board fresh.
export const ThreeAndOuts = ({ season }) => <StatBoardMode key="three-and-outs" stat={STATS.threeAndOuts} season={season} />;
export const ThirdAndLong = ({ season }) => <StatBoardMode key="third-and-long" stat={STATS.thirdAndLong} season={season} />;
