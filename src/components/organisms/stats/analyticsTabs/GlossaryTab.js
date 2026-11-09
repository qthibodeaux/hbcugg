import { Box, Text, Flex, Image, Grid } from "@chakra-ui/react";
import { fmt, RankChip, Kicker, buildRanks, Section } from "./AnalyticsPrimitives";
import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { GLOSSARY, GLOSSARY_FAMILIES } from "../../../../pages/analytics/metricGlossary";
import { TeamTile } from "../MatchupPicker";

// Existing implementation extracted along responsibility boundaries.

const GLOSS_POS = "#48BB78";

const GLOSS_NEG = "#F6AD55";

const SourceBadge = ({ source }) =>
  source === "gop" ? (
    <Box px={1.5} py={0.5} borderRadius="sm" bg="rgba(99,179,237,0.16)" flexShrink={0}>
      <Text fontSize="8px" fontWeight="900" color="#63B3ED" textTransform="uppercase" letterSpacing="0.1em">GameOnPaper</Text>
    </Box>
  ) : null;

const StatusBadge = ({ status }) =>
  status === "mock" ? (
    <Box px={1.5} py={0.5} borderRadius="sm" bg="rgba(246,173,85,0.16)" flexShrink={0}>
      <Text fontSize="8px" fontWeight="900" color={GLOSS_NEG} textTransform="uppercase" letterSpacing="0.1em">Not yet on file</Text>
    </Box>
  ) : null;

const PullRow = ({ label, r, max, team }) => {
  const width = (Math.abs(r) / max) * 50;
  const tone = Math.abs(r) < 0.2 ? "line.strong" : r > 0 ? GLOSS_POS : GLOSS_NEG;
  const pct = team && Number.isFinite(team.pct) ? team.pct : null;
  const earned = pct == null ? width : width * (pct / 100);
  return (
    <Flex align="center" gap={2} py={0.5}>
      <Text w={team ? "34%" : "46%"} minW={0} fontSize="10px" fontWeight="800" color="text.secondary" lineClamp={1} textAlign="right">{label}</Text>
      <Flex flex="1" minW={0} align="center" h="9px" position="relative">
        <Box position="absolute" left="50%" top={0} bottom={0} w="1px" bg="line.strong" />
        {/* The pull itself — solid with no team picked, the track once there is one. */}
        <Box
          position="absolute" left={r >= 0 ? "50%" : `${50 - width}%`} h="100%" borderRadius="sm"
          bg={tone} opacity={team ? 0.22 : 1} style={{ width: `${width}%` }}
        />
        {team && (
          <Box
            position="absolute" left={r >= 0 ? "50%" : `${50 - earned}%`} h="100%" borderRadius="sm"
            bg={tone} style={{ width: `${earned}%` }}
          />
        )}
      </Flex>
      <Text w="2.6rem" flexShrink={0} textAlign="right" fontSize="10px" fontWeight="900" color={tone} opacity={team ? 0.6 : 1} fontVariantNumeric="tabular-nums">
        {r > 0 ? "+" : ""}{r}
      </Text>
      {team && (
        <>
          <Text w="3rem" flexShrink={0} textAlign="right" fontSize="10px" fontWeight="900" color="text.primary" fontVariantNumeric="tabular-nums">
            {fmt(team.value, team.unit)}
          </Text>
          <Box w="2.2rem" flexShrink={0} display="flex" justifyContent="flex-end">
            <RankChip rank={team.rank} total={team.total} />
          </Box>
        </>
      )}
    </Flex>
  );
};

const MetricFacts = ({ hub, season, metricKey }) => {
  const rows = ["o", "d"].map((sideKey) => {
    const field = `${sideKey}_${metricKey}`;
    const unit = hub.metrics?.[metricKey]?.unit ?? "num";
    const leader = Object.values(hub.teams ?? {})
      .map((t) => ({ t, p: t.seasons?.[season]?.percentiles?.[field], v: t.seasons?.[season]?.metrics?.[field] }))
      .filter((x) => Number.isFinite(x.p))
      .sort((a, b) => b.p - a.p)[0];
    return { sideKey, field, unit, leader, league: hub.league?.[season]?.metrics?.[field] };
  });
  return (
    <Flex direction="column" gap={1.5} mt={3} pt={3} borderTop="1px solid" borderColor="line">
      {rows.map(({ sideKey, unit, leader, league }) => (
        <Flex key={sideKey} align="center" gap={2} minW={0}>
          <Kicker w="3.6rem" flexShrink={0} color={sideKey === "d" ? "#4299E1" : "#ECC94B"}>
            {sideKey === "d" ? "Defense" : "Offense"}
          </Kicker>
          {leader?.t?.identity?.logo && <Image src={leader.t.identity.logo} alt="" w="14px" h="14px" objectFit="contain" flexShrink={0} />}
          <Text fontSize="10px" fontWeight="900" color="text.primary" lineClamp={1} minW={0} flex="1">
            {leader?.t?.identity?.short ?? "—"}
          </Text>
          <Text fontSize="11px" fontWeight="900" color="text.primary" flexShrink={0} fontVariantNumeric="tabular-nums">
            {fmt(leader?.v, unit)}
          </Text>
          <Kicker w="4.4rem" flexShrink={0} textAlign="right" color="text.muted">
            Lg {fmt(league, unit)}
          </Kicker>
        </Flex>
      ))}
    </Flex>
  );
};

export const GlossaryTab = ({ hub, season }) => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const focus = params.get("term");

  // Every metric-side the hub carries a correlation for, hardest pull first.
  const ladder = useMemo(() => {
    const rows = (hub.glossary ?? []).flatMap((g) =>
      (g.wins_correlation ?? []).map((c) => ({
        key: `${g.key}-${c.side}`,
        field: `${c.side}_${g.key}`,
        unit: g.unit ?? "num",
        label: `${c.side === "d" ? "Defense" : "Offense"} ${g.label}`,
        r: c.r,
      })),
    );
    return rows.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  }, [hub.glossary]);
  const maxPull = Math.max(...ladder.map((l) => Math.abs(l.r)), 0.1);

  // ── Read the ladder against one team ──────────────────────────────────────
  // The ladder alone says what wins in this league. Picking a team says how
  // much of that a team actually does, on the season the banner is set to.
  const [pick, setPick] = useState(null);
  const pickerTeams = useMemo(
    () => Object.values(hub.teams ?? {}).map((t) => t.identity).sort((x, y) => x.name.localeCompare(y.name)),
    [hub.teams],
  );
  const ladderRanks = useMemo(
    () => buildRanks(hub, season, ladder.map((l) => l.field)),
    [hub, season, ladder],
  );
  const picked = pick ? hub.teams?.[pick] : null;
  const pickedRow = picked?.seasons?.[season] ?? null;
  const teamTotal = Object.keys(hub.teams ?? {}).length;
  const readingFor = (l) =>
    pickedRow
      ? {
          pct: pickedRow.percentiles?.[l.field],
          value: pickedRow.metrics?.[l.field],
          rank: ladderRanks[l.field]?.[pick],
          total: teamTotal,
          unit: l.unit,
        }
      : null;

  const byKey = useMemo(() => Object.fromEntries((hub.glossary ?? []).map((g) => [g.key, g])), [hub.glossary]);

  const terms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((e) => {
      if (family !== "all" && e.family !== family) return false;
      if (!q) return true;
      return e.term.toLowerCase().includes(q) || e.def.toLowerCase().includes(q) || e.aliases.some((a) => a.includes(q));
    });
  }, [query, family]);

  const core = terms.filter((e) => e.tier === "core");
  const box = terms.filter((e) => e.tier !== "core");
  const gopCount = GLOSSARY.filter((e) => e.source === "gop").length;

  const openTerm = (term) => {
    const next = new URLSearchParams(params);
    if (focus === term) next.delete("term");
    else next.set("term", term);
    setParams(next, { replace: true });
  };

  const FamilyChip = ({ id, children }) => (
    <Box as="button" onClick={() => setFamily(id)} px={2.5} py={1.5} borderRadius="md" whiteSpace="nowrap"
      fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
      bg={family === id ? "brand.500" : "line"} color={family === id ? "white" : "text.muted"}
      _hover={{ bg: family === id ? "brand.500" : "line.strong" }}>
      {children}
    </Box>
  );

  return (
    <Flex direction="column" gap={4}>
      {/* ── The argument ─────────────────────────────────────────────── */}
      <Section
        title="What actually pulls on winning"
      >
        <Flex gap={4} direction={{ base: "column", lg: "row" }} align="flex-start">
          {/* 3 x 6 of the league, in the matchup picker's tile language. */}
          <Box w={{ base: "100%", lg: "10.5rem" }} flexShrink={0}>
            <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="1px" bg="line" borderRadius="md" overflow="hidden">
              {pickerTeams.map((t) => (
                <TeamTile
                  key={t.id}
                  team={t}
                  active={t.id === pick}
                  onClick={() => setPick((cur) => (cur === t.id ? null : t.id))}
                />
              ))}
            </Grid>
            <Box
              as="button" type="button" w="100%" mt="1px" py={2.5} borderRadius="md"
              bg={pick ? "line" : "brand.500"}
              _hover={{ bg: pick ? "line.strong" : "brand.500" }}
              onClick={() => setPick(null)} transition="background 0.15s"
            >
              <Text fontSize="0.56rem" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" whiteSpace="nowrap" color={pick ? "text.muted" : "white"}>
                {pick ? "Clear · league" : `League · ${season}`}
              </Text>
            </Box>
            {picked && (
              <Flex align="center" gap={2} mt={3} minW={0}>
                {picked.identity.logo && <Image src={picked.identity.logo} alt="" w="16px" h="16px" objectFit="contain" flexShrink={0} />}
                <Box minW={0}>
                  <Text fontSize="10px" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.03em" lineClamp={1}>
                    {picked.identity.short}
                  </Text>
                  <Kicker color="text.muted">{season}{pickedRow?.record?.record ? ` · ${pickedRow.record.record}` : ""}</Kicker>
                </Box>
              </Flex>
            )}
          </Box>

          <Flex direction="column" flex="1" minW={0}>
            {picked && (
              <Flex align="center" gap={2} pb={1.5} mb={1} borderBottom="1px solid" borderColor="line">
                <Box w="34%" flexShrink={0} />
                <Box flex="1" minW={0} />
                <Kicker w="2.6rem" flexShrink={0} textAlign="right" color="text.muted">r</Kicker>
                <Kicker w="3rem" flexShrink={0} textAlign="right" color="text.muted">Them</Kicker>
                <Kicker w="2.2rem" flexShrink={0} textAlign="right" color="text.muted">Rk</Kicker>
              </Flex>
            )}
            {ladder.map((l) => (
              <PullRow key={l.key} label={l.label} r={l.r} max={maxPull} team={readingFor(l)} />
            ))}
          </Flex>
        </Flex>
      </Section>

      {/* The TFL finding and polarity audit cards were removed 2026-10-04: the
          backend traced the TFL result to swapped columns in team_season_avg,
          and on its recount all 20 metric-sides agree with their polarity. */}

      {/* ── The reference ────────────────────────────────────────────── */}
      <Section
        title="Definitions"
        right={<Kicker color="text.muted">{GLOSSARY.length} terms · {gopCount} from GameOnPaper</Kicker>}
      >
        <Flex gap={3} wrap="wrap" align="center">
          <Box
            as="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search terms"
            bg="line" color="text.primary" fontSize="11px" fontWeight="700" borderRadius="md" px={3} py={2}
            border="1px solid" borderColor="line.strong" minW="12rem" flex="1"
          />
          <Flex gap={2} wrap="wrap">
            <FamilyChip id="all">All</FamilyChip>
            {GLOSSARY_FAMILIES.map((fam) => <FamilyChip key={fam} id={fam}>{fam}</FamilyChip>)}
          </Flex>
        </Flex>
      </Section>

      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, minmax(0,1fr))" }} gap={4}>
        {core.map((entry) => {
          const g = entry.metric ? byKey[entry.metric] : null;
          const open = focus === entry.term;
          return (
            <Section
              key={entry.term}
              title={entry.term}
              right={
                <Flex gap={1.5} align="center">
                  <SourceBadge source={entry.source} />
                  <StatusBadge status={entry.status} />
                </Flex>
              }
              borderColor={open ? "brand.500" : "line"}
            >
              <Box as="button" onClick={() => openTerm(entry.term)} textAlign="left" w="100%">
                <Text fontSize="11px" color="text.primary" lineHeight={1.6}>{entry.def}</Text>
              </Box>
              {g && (
                <Flex direction="column" gap={1} mt={3}>
                  {(g.wins_correlation ?? []).map((c) => (
                    <PullRow key={c.side} label={c.side === "d" ? "Defense" : "Offense"} r={c.r} max={maxPull} />
                  ))}
                </Flex>
              )}
              {entry.metric && hub.metrics?.[entry.metric] && <MetricFacts hub={hub} season={season} metricKey={entry.metric} />}
            </Section>
          );
        })}
      </Box>

      {box.length > 0 && (
        <Section title="Box-score vocabulary" right={<Kicker color="text.muted">{box.length} terms</Kicker>}>
          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, minmax(0,1fr))" }} gapX={6}>
            {box.map((entry) => (
              <Flex key={entry.term} align="baseline" gap={2} py={1.5} borderBottom="1px solid" borderColor="line.subtle">
                <Text w="8.5rem" flexShrink={0} fontSize="10px" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>
                  {entry.term}
                </Text>
                <Text flex="1" minW={0} fontSize="10px" color="text.muted" lineHeight={1.5}>{entry.def}</Text>
              </Flex>
            ))}
          </Box>
        </Section>
      )}

      {terms.length === 0 && (
        <Section title="Nothing matches">
          <Text fontSize="sm" color="text.muted">No term matches “{query}”.</Text>
        </Section>
      )}
    </Flex>
  );
};
