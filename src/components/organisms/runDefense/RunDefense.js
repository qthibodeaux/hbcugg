import { Flex, Box, Text } from "@chakra-ui/react";
import { useColorScheme } from "../../../theme/colorScheme";
import { paletteOf } from "../../molecules/export/posterPalette";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { useState, useRef } from "react";
import { viewOf, SIDE_OPTIONS, SCOPES, PLAYS } from "./panels/runGamePresentation";
import { ExportCardButton } from "../stats/ExportCardButton";
import { Scatter, TopBoth, Poster } from "./panels/RunGameCharts";

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

export const RunGame = () => {
  const [scheme] = useColorScheme();
  const pal = paletteOf(scheme);
  const { isMobile: m } = useLayoutDensity();
  const [sideId, setSideId] = useState("offense");
  const [scope, setScope] = useState("swac");
  const [plays, setPlays] = useState("all");
  const posterRef = useRef(null);
  const view = viewOf(sideId, scope, plays);
  const meta = view.side.file.meta;
  const filename = () => `${view.side.slug}-${meta.season}-w${meta.through_week}-${scope}-${plays === "all" ? "all" : "no-garbage"}-${scheme}.png`;

  return (
    <Box>
      <Flex direction={m ? "column" : "row"} align={m ? "stretch" : "center"} justify="space-between" gap={m ? "1px" : 3} mb={m ? 0 : 4} wrap="wrap">
        <Flex gap={m ? "1px" : 3} direction={m ? "column" : "row"} wrap="wrap">
          <Toggle m={m} value={sideId} onChange={setSideId} options={SIDE_OPTIONS} />
          <Toggle m={m} value={scope} onChange={setScope} options={SCOPES} />
          <Toggle m={m} value={plays} onChange={setPlays} options={PLAYS} />
        </Flex>
        <Flex align="center" justify={m ? "space-between" : "flex-end"} gap={3} px={m ? "0.75rem" : 0} py={m ? "0.5rem" : 0} bg={m ? "bg.secondary" : "transparent"}>
          <Text fontSize={m ? "0.75rem" : "11px"} fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
            Week {meta.through_week}
          </Text>
          <ExportCardButton target={posterRef} filename={filename} />
        </Flex>
      </Flex>

      <Box fontSize={m ? "15px" : "17px"} color={pal.ink} bg={m ? pal.bg : "transparent"} p={m ? "0.5rem" : 0}>
        <Flex align="center" justify="space-between" gap="1em" mb="0.8em" pb="0.6em" borderBottom={`1px solid rgba(${pal.fg}, 0.08)`}>
          <Flex align="center" gap="0.5em" minW={0}>
            <Box w="0.4em" h="0.4em" borderRadius="full" bg={pal.brand} flexShrink={0} />
            <Text fontSize="0.65em" fontWeight="900" color={`rgba(${pal.fg}, 0.7)`} textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>
              {view.side.y} × {view.side.x} · {meta.season}
            </Text>
          </Flex>
          {!m && <Text fontSize="0.6em" fontWeight="900" color={`rgba(${pal.fg}, 0.45)`} textTransform="uppercase" letterSpacing="0.12em" whiteSpace="nowrap">Dashed = 18-team average</Text>}
        </Flex>
        <Scatter pal={pal} {...view} plays={plays} compact={m} />
        <TopBoth pal={pal} top={view.top} compact={m} />
      </Box>

      {/* Export source: off screen, full size. */}
      <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
        <Poster pal={pal} view={view} scope={scope} plays={plays} innerRef={posterRef} />
      </Box>
    </Box>
  );
};
