import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { ringOf } from "./rushingModel";

/** A face that fills its parent: the first of `srcs` that loads, else the team mark. */
export const RushingFace = ({ srcs = [], team }) => {
  const [miss, setMiss] = useState(0);
  const src = srcs[miss] ?? null;
  if (src) return <Image src={src} alt="" w="full" h="full" objectFit="cover" objectPosition="top" onError={() => setMiss((m) => m + 1)} />;
  return team?.logo ? <Image src={team.logo} alt="" w="72%" h="72%" objectFit="contain" /> : null;
};

// A point on a rushing chart: the bare team logo — no circle, no border (the
// look across every rushing chart). Positioned in percent of the plot and sized
// in cqw — the plot box is an inline-size container, so a marker keeps its
// share of the chart at any width, page or poster. HTML rather than SVG so the
// PNG export embeds the images the same way it does everywhere else.
// `srcs` is accepted and ignored, so callers that pass faces need no change.
export const RushingMarker = ({ x, y, d, team, dim = false, active = false, tag = null, onEnter, onLeave }) => {
  const ring = ringOf(team);
  return (
    <Box
      position="absolute"
      style={{ left: `${x}%`, top: `${y}%`, width: `${d}cqw`, height: `${d}cqw`, transform: "translate(-50%, -50%)", opacity: dim ? 0.4 : 1, zIndex: active ? 6 : 2 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Flex w="full" h="full" align="center" justify="center">
        {team?.logo ? (
          <Image
            src={team.logo}
            alt=""
            w="100%"
            h="100%"
            objectFit="contain"
            style={{ filter: active ? "drop-shadow(0 0 0.6cqw #FFFFFF)" : "drop-shadow(0 0.25cqw 0.6cqw rgba(0,0,0,0.8))" }}
          />
        ) : null}
      </Flex>
      {tag && (
        <Flex position="absolute" align="center" justify="center" bg={ring} borderRadius="full" style={{ right: `${-d * 0.12}cqw`, bottom: `${-d * 0.08}cqw`, height: `${d * 0.4}cqw`, padding: `0 ${d * 0.12}cqw` }}>
          <Text fontWeight="900" color="#0B0B0D" lineHeight={1} style={{ fontSize: `${d * 0.26}cqw` }}>{tag}</Text>
        </Flex>
      )}
    </Box>
  );
};

/** The plot frame every rushing chart draws in: fixed aspect, inline-size container. */
export const PlotBox = ({ W, H, children }) => (
  <Box position="relative" w="100%" style={{ containerType: "inline-size", aspectRatio: `${W} / ${H}` }}>
    {children}
  </Box>
);
