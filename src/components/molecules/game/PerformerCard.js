import { useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMER CARD — the one Notable Performers card. The Game page and Week
// Central both draw it; what differs is the medium and the job, so each gets a
// variant. The core (portrait, name fitting, meta and score line, stats grid, the
// rotation and the tabs) is shared, so a fix lands everywhere at once.
//
//   story   Game page. The card is the story of the game: a big portrait, the
//           surname set large above a small first name, three headline stats.
//   scan    Week Central, desktop. A dense read: same name treatment, smaller;
//           six stats (3 x 2) in the order the caller sends them.
//   mobile  Phones. A short card and a small screen: surname only (the suffix as
//           a tag), team / position / score on one line, three stats, no extras.
//
// The name always fits: the copy column is a size container and the surname is set
// in that column's width (cqw), so a long name shrinks instead of being cut off.
// Tabs show the surname without the suffix; the pause button sits in the header so
// the tabs get the whole strip. Auto-advance is a CSS animation, no timers.
//
// `performers`: [{ key, first, last, teamId, position, total, chips, images }]
//   chips: [{ label, value }] in the order to show; a "—" value is skipped.
// ─────────────────────────────────────────────────────────────────────────────

const AUTO_ROTATE_MS = 4500;

const VARIANTS = {
  story: { portrait: "60%", copy: "58%", nameMax: 17, firstSize: "0.85rem", stats: 3, cols: 3, statSize: "1.45rem", labelSize: "0.62rem", meta: "0.66rem", score: "0.82rem", tab: "0.72rem", tabH: "1.7rem", pad: "0.85rem", statGap: "0.35rem 0.6rem" },
  scan: { portrait: "50%", copy: "64%", nameMax: 13, firstSize: "0.7rem", stats: 6, cols: 3, statSize: "1rem", labelSize: "0.58rem", meta: "0.62rem", score: "0.74rem", tab: "0.66rem", tabH: "1.55rem", pad: "0.7rem", statGap: "0.25rem 0.5rem" },
  mobile: { portrait: "40%", copy: "60%", nameMax: 12, firstSize: null, stats: 3, cols: 3, statSize: "0.95rem", labelSize: "0.55rem", meta: "0.6rem", score: "0.66rem", tab: "0.62rem", tabH: "1.5rem", pad: "0.55rem", statGap: "0.2rem 0.4rem" },
};

const SUFFIX = /^(.*?)\s+(jr\.?|sr\.?|ii|iii|iv|v)$/i;
/** "Chandler IV" -> { surname: "Chandler", suffix: "IV" }. */
export const splitSuffix = (last) => {
  const m = String(last ?? "").trim().match(SUFFIX);
  return m ? { surname: m[1], suffix: m[2].toUpperCase() } : { surname: String(last ?? "").trim(), suffix: "" };
};

// The surname's size as a share of its column's width: as large as the variant
// allows, shrinking by length so it always fits on one line.
const fitCq = (chars, max) => Math.max(6, Math.min(max, 94 / (chars * 0.64)));

const Portrait = ({ performer, mask }) => {
  const [miss, setMiss] = useState(0);
  const src = performer.images?.[miss] ?? null;
  return (
    <Box position="absolute" left={0} top={0} bottom={0} w={mask.width} zIndex={0} overflow="hidden" style={{ WebkitMaskImage: mask.image, maskImage: mask.image }}>
      {src ? (
        <Image key={src} src={src} alt={`${performer.first ?? ""} ${performer.last ?? ""}`.trim()} w="full" h="full" objectFit="cover" objectPosition="top center" onError={() => setMiss((m) => m + 1)} />
      ) : (
        <Flex h="full" align="center" justify="center">
          <Image src={mask.logo} alt="" h="70%" maxW="80%" objectFit="contain" opacity={0.18} />
        </Flex>
      )}
      <Box position="absolute" inset={0} bg="linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.55) 100%)" pointerEvents="none" />
    </Box>
  );
};

export const PerformerCard = ({ variant = "story", performers, header, colorFor, teamLabel, logoFor }) => {
  const v = VARIANTS[variant] ?? VARIANTS.story;
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  // Bumped on every advance and every click: keying the ticker and the sweep on it
  // restarts both, so a hand-picked performer gets a fresh interval.
  const [cycle, setCycle] = useState(0);
  const advanceTo = (next) => {
    setIndex(next);
    setCycle((c) => c + 1);
  };

  if (!performers?.length) return null;
  const active = performers[Math.min(index, performers.length - 1)];
  const color = colorFor(active.teamId);
  const { surname, suffix } = splitSuffix(active.last);
  const nameSize = fitCq(surname.length + suffix.length * 0.5, v.nameMax);
  const chips = (active.chips ?? []).filter((c) => c.value !== "—" && c.value != null).slice(0, v.stats);
  const portraitMask = {
    width: v.portrait,
    image: "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 34%, rgba(0,0,0,0.3) 62%, rgba(0,0,0,0) 86%)",
    logo: logoFor(active.teamId),
  };

  return (
    <Box position="relative" overflow="hidden" h="full" w="full" display="flex" flexDirection="column">
      <style>{`
        @keyframes pcTick { 0%, 100% { opacity: 1; } }
        @keyframes pcSweep { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .pc-sweep { transform-origin: left center; transform: scaleX(0); }
        @media (prefers-reduced-motion: reduce) { .pc-sweep { animation: none !important; opacity: 0; } }
      `}</style>

      <Portrait key={active.key} performer={active} mask={portraitMask} />
      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={color} zIndex={3} />

      {performers.length > 1 && (
        <Box w={0} h={0} overflow="hidden" key={cycle} style={{ animation: `pcTick ${AUTO_ROTATE_MS}ms linear infinite`, animationPlayState: isPlaying ? "running" : "paused" }} onAnimationIteration={() => advanceTo((index + 1) % performers.length)} />
      )}

      <Box position="relative" zIndex={2} flex="1" minH={0} p={v.pad} pb="0.4rem" display="flex" flexDirection="column">
        <Flex align="center" justify="space-between" gap="0.5rem" flexShrink={0}>
          <Box minW={0}>{header}</Box>
          {performers.length > 1 && (
            <Box as="button" type="button" onClick={() => setIsPlaying((p) => !p)} aria-label={isPlaying ? "Pause" : "Play"} w="1.35rem" h="1.35rem" borderRadius="sm" bg="rgba(255,255,255,0.12)" display="flex" alignItems="center" justifyContent="center" color="white" fontSize="0.5rem" cursor="pointer" flexShrink={0} _hover={{ bg: "rgba(255,255,255,0.2)" }}>
              {isPlaying ? "❚❚" : "▶"}
            </Box>
          )}
        </Flex>

        {/* The copy column: bottom-anchored in the right of the card so the face stays
            visible. A size container, so the surname is set in this column's width. */}
        <Box flex="1" minH={0} display="flex" flexDirection="column" justifyContent="flex-end" w={v.copy} ml="auto" minW={0} pt="0.4rem" style={{ containerType: "inline-size" }}>
          {v.firstSize && active.first ? (
            <Text fontSize={v.firstSize} fontWeight="900" color="rgba(255,255,255,0.7)" textTransform="uppercase" letterSpacing="0.14em" lineHeight={1.1} lineClamp={1}>{active.first}</Text>
          ) : null}
          <Text fontSize={`${nameSize}cqw`} fontWeight="950" color="white" lineHeight={1.06} textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {surname}
            {suffix ? <Text as="span" fontSize="0.42em" fontWeight="900" color="rgba(255,255,255,0.65)" ml="0.25em" verticalAlign="baseline">{suffix}</Text> : null}
          </Text>
          <Flex align="baseline" gap="0.6rem" mt="0.3rem" wrap="wrap">
            <Text fontSize={v.meta} fontWeight="900" color="rgba(255,255,255,0.65)" textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.2} whiteSpace="nowrap">
              {teamLabel(active.teamId)} <Box as="span" color={color} mx="0.2rem">|</Box> {active.position || "—"}
            </Text>
            <Text fontSize={v.score} fontWeight="950" color="white" lineHeight={1.2} whiteSpace="nowrap">
              {Number(active.total).toFixed(1)}
              <Text as="span" fontWeight="900" color="rgba(255,255,255,0.6)" textTransform="uppercase" letterSpacing="0.08em" fontSize="0.82em"> PAR</Text>
            </Text>
          </Flex>

          {chips.length > 0 && (
            <Grid mt="0.5rem" templateColumns={`repeat(${v.cols}, minmax(0, 1fr))`} gap={v.statGap} flexShrink={0}>
              {chips.map((chip) => (
                <Box key={chip.label} minW={0}>
                  <Text fontSize={v.statSize} fontWeight="950" color="white" lineHeight={1.08} whiteSpace="nowrap">{chip.value}</Text>
                  <Text fontSize={v.labelSize} fontWeight="900" color="rgba(255,255,255,0.62)" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.2} whiteSpace="nowrap">{String(chip.label).replace("/ ", "/")}</Text>
                </Box>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* The tabs: one per performer, the surname without its suffix; the active one
          carries the time-to-next sweep, locked to the ticker by duration and play state. */}
      <Flex flexShrink={0} w="full" position="relative" zIndex={3} bg="rgba(10,10,12,0.78)" borderTop="1px solid" borderColor="whiteAlpha.200" px="0.4rem" py="0.3rem" gap="0.3rem" align="center">
        {performers.map((p, i) => {
          const on = i === index;
          return (
            <Box
              key={p.key ?? i}
              as="button"
              type="button"
              onClick={() => advanceTo(i)}
              position="relative"
              overflow="hidden"
              flex="1"
              minW={0}
              h={v.tabH}
              px="0.4rem"
              borderRadius="sm"
              bg={on ? colorFor(p.teamId) : "rgba(255,255,255,0.1)"}
              color="white"
              fontSize={v.tab}
              fontWeight="800"
              cursor="pointer"
              whiteSpace="nowrap"
              transition="background 0.2s"
              _hover={{ bg: on ? colorFor(p.teamId) : "rgba(255,255,255,0.18)" }}
            >
              {on && performers.length > 1 && (
                <Box key={cycle} className="pc-sweep" position="absolute" inset={0} zIndex={0} bg="rgba(0,0,0,0.28)" pointerEvents="none" style={{ animation: `pcSweep ${AUTO_ROTATE_MS}ms linear forwards`, animationPlayState: isPlaying ? "running" : "paused" }} />
              )}
              <Box as="span" position="relative" zIndex={1} display="block" overflow="hidden" textOverflow="ellipsis">{splitSuffix(p.last).surname || p.first}</Box>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default PerformerCard;
