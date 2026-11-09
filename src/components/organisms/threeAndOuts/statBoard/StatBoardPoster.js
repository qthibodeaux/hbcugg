import WORTH from "../../../../data/threeAndOutWorth2026W7.json";
import { Flex, Text, Box } from "@chakra-ui/react";
import { POSTER_W, caps } from "./boardPresentation";
import { ExportWordmark } from "../../../molecules/export/ExportWordmark";
import { FinishingScatter } from "../ThreeAndOutWorth";
import { Scatter } from "./RateScatter";
import { Board } from "./RankedBoard";

// Full-size stat-board export composition, independent of screen controls.

export const Poster = ({ pal, stat, file, view, side, rows, noGames, innerRef }) => {
  const badge = file.games_through ? `Through ${file.games_through.label}` : "Final";
  const title = view === "worth" ? ["Once the drive", "survives"] : view === "scatter" ? stat.scatterHeadline : side.headline;
  const line = view === "worth" ? `${WORTH.season} · Through Week ${WORTH.through_week} · ${WORTH.scope}` : `${file.season} · ${badge} · SWAC + MEAC`;
  return (
    <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={pal.bg} color={pal.ink} px="56px" pt="36px" pb="44px" gap="22px" fontSize="22px">
      <Flex align="center" justify="space-between">
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
        <Text fontSize="18px" color={pal.orange} {...caps}>{line}</Text>
      </Flex>
      <Text fontSize="78px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.88} letterSpacing="-0.04em" whiteSpace="nowrap">
        {title[0]} <Box as="span" color={pal.brand}>{title[1]}</Box>
      </Text>
      <Box h="1px" bg={`rgba(${pal.fg}, 0.12)`} />
      {view === "worth"
        ? <FinishingScatter pal={pal} />
        : view === "scatter"
          ? <Scatter pal={pal} stat={stat} file={file} rows={rows} />
          : <Board pal={pal} stat={stat} side={side} rows={rows} cols={2} noGames={noGames} />}
    </Flex>
  );
};
