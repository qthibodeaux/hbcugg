import { Box, Text, Flex, Image } from "@chakra-ui/react";
import { Kicker, Section } from "./AnalyticsPrimitives";
import { useMemo, useState } from "react";
import { labLevers, decodeModel, presetWeights, presetFor as labPresetFor, rankLeague, backtest, backtestSeasons, standingsRanks, encodeModel, LAB_PRESETS, contributions } from "../../../../pages/analytics/ratingLab";
import { useSearchParams } from "react-router-dom";

// Existing implementation extracted along responsibility boundaries.

const LAB_POS = "#48BB78";

const LAB_NEG = "#FC8181";

const ScoreCard = ({ label, value, sub, tone = "text.primary", lead }) => (
  <Box flex="1" minW={0} bg={lead ? "rgba(168,85,247,0.12)" : "line.subtle"} borderRadius="md" p={3}
    border="1px solid" borderColor={lead ? "brand.500" : "transparent"}>
    <Kicker color="text.muted">{label}</Kicker>
    <Text
      fontSize="clamp(1.3rem, 3vw, 2.4rem)" fontWeight="900" fontStyle="italic" color={tone}
      lineHeight={0.9} letterSpacing="-0.04em" mt={1.5} fontVariantNumeric="tabular-nums"
    >
      {value}
    </Text>
    {sub && <Kicker color="text.muted" mt={1.5}>{sub}</Kicker>}
  </Box>
);

const LeverSlider = ({ lever, value, onChange }) => {
  const seed = Math.round(lever.abs * 100);
  const tickPct = ((seed + 100) / 200) * 100;
  const tone = value > 0 ? LAB_POS : value < 0 ? LAB_NEG : "text.muted";
  return (
    <Box>
      <Flex align="baseline" justify="space-between" gap={2} mb={1}>
        <Kicker color="text.secondary">{lever.label}</Kicker>
        <Flex gap={2} align="baseline" flexShrink={0}>
          <Kicker color="text.muted">r {lever.r > 0 ? "+" : ""}{lever.r}</Kicker>
          <Text fontSize="10px" fontWeight="900" color={tone} w="30px" textAlign="right" fontVariantNumeric="tabular-nums">
            {value > 0 ? "+" : ""}{value}
          </Text>
        </Flex>
      </Flex>
      {/* Correlation drawn behind the track: strong levers look strong. */}
      <Box position="relative" h="14px">
        <Box position="absolute" left={0} right={0} top="5px" h="4px" borderRadius="full" bg="line" />
        <Box position="absolute" left="50%" top="2px" w="1px" h="10px" bg="line.strong" />
        <Box position="absolute" left={`${tickPct}%`} top="1px" w="2px" h="12px" borderRadius="full" bg="brand.500" opacity={0.8} />
        <Box
          as="input" type="range" min={-100} max={100} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          position="absolute" inset={0} w="100%" h="14px" accentColor="#A855F7" cursor="pointer" bg="transparent"
        />
      </Box>
    </Box>
  );
};

const MoveChip = ({ move }) => {
  if (!Number.isFinite(move)) return <Box w="2.6rem" flexShrink={0} />;
  const tone = move > 0 ? LAB_POS : move < 0 ? LAB_NEG : "text.muted";
  return (
    <Flex w="2.6rem" flexShrink={0} align="center" justify="flex-end" gap={0.5}>
      <Text fontSize="9px" fontWeight="900" color={tone}>{move > 0 ? "\u25B2" : move < 0 ? "\u25BC" : "\u2013"}</Text>
      {move !== 0 && (
        <Text fontSize="10px" fontWeight="900" color={tone} fontVariantNumeric="tabular-nums">{Math.abs(move)}</Text>
      )}
    </Flex>
  );
};

const Waterfall = ({ items, score }) => {
  const max = Math.max(...items.map((c) => Math.abs(c.value)), 0.01);
  return (
    <Box pl={7} pr={2} pb={3} pt={1}>
      {items.slice(0, 8).map((c) => (
        <Flex key={c.field} align="center" gap={2} py={1}>
          <Text flex="1" minW={0} fontSize="10px" fontWeight="800" color="text.secondary" lineClamp={1}>{c.label}</Text>
          <Kicker w="2.4rem" flexShrink={0} textAlign="right" color="text.muted">{c.percentile}%</Kicker>
          <Flex w="40%" minW="5rem" flexShrink={0} align="center" gap="2px" h="7px">
            <Flex flex="1" justify="flex-end">
              {c.value < 0 && <Box h="100%" borderRadius="sm" bg={LAB_NEG} style={{ width: `${(Math.abs(c.value) / max) * 100}%` }} />}
            </Flex>
            <Box w="1px" h="9px" bg="line.strong" flexShrink={0} />
            <Flex flex="1">
              {c.value > 0 && <Box h="100%" borderRadius="sm" bg={LAB_POS} style={{ width: `${(c.value / max) * 100}%` }} />}
            </Flex>
          </Flex>
          <Text w="2.8rem" flexShrink={0} textAlign="right" fontSize="10px" fontWeight="900" fontVariantNumeric="tabular-nums"
            color={c.value >= 0 ? LAB_POS : LAB_NEG}>
            {c.value > 0 ? "+" : ""}{c.value.toFixed(1)}
          </Text>
        </Flex>
      ))}
      <Flex align="center" gap={2} pt={2} mt={1} borderTop="1px solid" borderColor="line">
        <Kicker flex="1" color="text.muted">Total</Kicker>
        <Text fontSize="11px" fontWeight="900" color="text.primary" fontVariantNumeric="tabular-nums">
          {score > 0 ? "+" : ""}{score.toFixed(1)}
        </Text>
      </Flex>
    </Box>
  );
};

export const RatingLabTab = ({ hub, season, games = [] }) => {
  const levers = useMemo(() => labLevers(hub), [hub]);
  const [params, setParams] = useSearchParams();
  // A model in the URL wins over the default, so a shared link opens on the
  // model it was shared with.
  const [weights, setWeights] = useState(() => {
    const seeded = labLevers(hub);
    return decodeModel(params.get("model"), seeded) ?? presetWeights("wins", seeded);
  });
  const [openTeam, setOpenTeam] = useState(null);
  const [copied, setCopied] = useState(null);

  const active = labPresetFor(weights, levers);
  const rows = useMemo(() => rankLeague(hub, season, levers, weights), [hub, season, levers, weights]);
  const mine = useMemo(() => backtest(hub, season, games, levers, weights), [hub, season, games, levers, weights]);
  const wins = useMemo(
    () => backtest(hub, season, games, levers, presetWeights("wins", levers)),
    [hub, season, games, levers],
  );

  const pooled = useMemo(
    () => backtestSeasons(hub, hub.seasons ?? [], games, levers, weights),
    [hub, games, levers, weights],
  );
  const standings = useMemo(() => standingsRanks(hub, season), [hub, season]);
  const encoded = encodeModel(levers, weights);

  const share = () => {
    const next = new URLSearchParams(params);
    next.set("model", encoded);
    setParams(next, { replace: true });
    const url = `${window.location.origin}${window.location.pathname}?${next.toString()}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(encoded);
  };

  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.score)), 1);
  const offense = levers.filter((l) => l.field.startsWith("o_"));
  const defense = levers.filter((l) => l.field.startsWith("d_"));
  const beating = Number.isFinite(mine.rate) && Number.isFinite(wins.rate) && mine.rate > wins.rate;
  const asPct = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : "—");

  const PresetButton = ({ preset }) => (
    <Box as="button" onClick={() => setWeights(presetWeights(preset.id, levers))}
      px={3} py={2} borderRadius="md" whiteSpace="nowrap"
      fontSize="10px" fontWeight="900" textTransform="uppercase" letterSpacing="0.08em"
      bg={active === preset.id ? "brand.500" : "line"} color={active === preset.id ? "white" : "text.secondary"}
      _hover={{ bg: active === preset.id ? "brand.500" : "line.strong" }}>
      {preset.label}
    </Box>
  );

  return (
    <Flex direction="column" gap={4}>
      <Section
        title="How the model holds up"
        right={<Kicker color="text.muted">{season} · {mine.games} games</Kicker>}
      >
        <Flex gap={3} direction={{ base: "column", md: "row" }} align="stretch">
          <ScoreCard
            label="Your model" value={asPct(mine.rate)} lead={beating}
            tone={beating ? LAB_POS : "text.primary"}
            sub={`${mine.hits} of ${mine.games} winners`}
          />
          <ScoreCard label="What actually wins" value={asPct(wins.rate)} sub="The seeded weights" />
          <ScoreCard label="Home team" value={asPct(mine.homeRate)} sub="The floor" />
          <ScoreCard
            label="Margin correlation" value={Number.isFinite(mine.marginR) ? mine.marginR.toFixed(3) : "—"}
            sub="Model gap vs final margin"
            tone={mine.marginR >= 0.4 ? LAB_POS : "text.primary"}
          />
          <ScoreCard
            label="Every season" value={asPct(pooled.rate)}
            sub={`${pooled.hits} of ${pooled.games} · same weights`}
          />
        </Flex>
        <Kicker color="line.strong" mt={3}>
          Descriptive — season metrics include these games
        </Kicker>
      </Section>

      <Section
        title="Build a rating"
        right={
          <Flex gap={2}>
            <Box as="button" onClick={share} px={2.5} py={1} borderRadius="md"
              bg={copied === encoded ? "brand.500" : "line"}
              fontSize="9px" fontWeight="900" color={copied === encoded ? "white" : "text.secondary"}
              textTransform="uppercase" _hover={{ bg: copied === encoded ? "brand.500" : "line.strong" }}>
              {copied === encoded ? "Link copied" : "Copy link"}
            </Box>
            <Box as="button" onClick={() => setWeights(presetWeights("wins", levers))} px={2.5} py={1} borderRadius="md" bg="line"
              fontSize="9px" fontWeight="900" color="text.secondary" textTransform="uppercase" _hover={{ bg: "line.strong" }}>
              Reset
            </Box>
          </Flex>
        }
      >
        <Flex gap={2} wrap="wrap">
          {LAB_PRESETS.map((p) => <PresetButton key={p.id} preset={p} />)}
        </Flex>

        <Flex gap={6} mt={5} direction={{ base: "column", lg: "row" }} align="flex-start">
          {[["Offense", offense, "#ECC94B"], ["Defense", defense, "#4299E1"]].map(([label, list, tone]) => (
            <Box key={label} flex="1" minW={0} w="100%">
              <Flex align="center" gap={2} mb={3}>
                <Box w="8px" h="8px" borderRadius="sm" bg={tone} flexShrink={0} />
                <Kicker color="text.secondary">{label}</Kicker>
                <Box flex="1" h="1px" bg="line" />
              </Flex>
              <Flex direction="column" gap={3}>
                {list.map((l) => (
                  <LeverSlider key={l.field} lever={l} value={weights[l.field] ?? 0}
                    onChange={(v) => setWeights((w) => ({ ...w, [l.field]: v }))} />
                ))}
              </Flex>
            </Box>
          ))}
        </Flex>
      </Section>

      <Section title={`Your ranking · ${season}`} right={<Kicker color="text.muted">Move = places above the standings</Kicker>}>
        <Flex align="center" gap={2} pb={1.5} mb={1} borderBottom="1px solid" borderColor="line">
          <Box w="20px" flexShrink={0} />
          <Kicker flex="1" color="text.muted">Team</Kicker>
          <Kicker w="40px" flexShrink={0} textAlign="right" color="text.muted">Score</Kicker>
          <Kicker w="34px" flexShrink={0} textAlign="right" color="text.muted">Rec</Kicker>
          <Kicker w="2.6rem" flexShrink={0} textAlign="right" color="text.muted">Move</Kicker>
        </Flex>
        <Flex direction="column">
          {rows.map((r, i) => {
            const open = openTeam === r.identity.id;
            const real = standings[r.identity.id];
            return (
              <Box key={r.identity.id} borderBottom="1px solid" borderColor="line.subtle">
                <Flex as="button" w="100%" textAlign="left" onClick={() => setOpenTeam(open ? null : r.identity.id)}
                  align="center" gap={2} py={1.5} _hover={{ bg: "line.subtle" }}>
                  <Text fontSize="10px" fontWeight="900" color="text.muted" w="20px" flexShrink={0} fontVariantNumeric="tabular-nums">{i + 1}</Text>
                  {r.identity.logo && <Image src={r.identity.logo} alt="" w="16px" h="16px" objectFit="contain" flexShrink={0} />}
                  <Text fontSize="11px" fontWeight="900" color="text.primary" w="70px" flexShrink={0} lineClamp={1}>{r.identity.short}</Text>
                  <Box flex="1" h="8px" borderRadius="full" bg="line" overflow="hidden" minW={0}>
                    <Box h="100%" borderRadius="full" bg={r.score >= 0 ? (r.identity.primary ?? "#A855F7") : "line.strong"}
                      style={{ width: `${(Math.abs(r.score) / maxAbs) * 100}%` }} />
                  </Box>
                  <Text fontSize="10px" fontWeight="900" color="text.muted" w="40px" flexShrink={0} textAlign="right" fontVariantNumeric="tabular-nums">
                    {r.score > 0 ? "+" : ""}{r.score.toFixed(1)}
                  </Text>
                  <Kicker color="text.muted" w="34px" flexShrink={0} textAlign="right">{r.record?.record}</Kicker>
                  <MoveChip move={Number.isFinite(real) ? real - (i + 1) : undefined} />
                </Flex>
                {open && (
                  <Waterfall
                    items={contributions(hub.teams[r.identity.id]?.seasons?.[season], levers, weights)}
                    score={r.score}
                  />
                )}
              </Box>
            );
          })}
        </Flex>
      </Section>
    </Flex>
  );
};
