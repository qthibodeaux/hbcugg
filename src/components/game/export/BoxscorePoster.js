import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Poster, PosterBanner, PosterSection, FitBody, CARD_BG, HAIRLINE, WIDE_W, WIDE_H, Head, Shaded, shadeVsLeague } from "./PosterChrome";
import {
  buildHeader, buildBoxscore, leagueEntry, teamAccent, teamColor, teamLogo, teamShort, teamName,
  shortName, num, rate1, signed1, signed2, pct0, asNum, DASH, ZONE_DEPTHS, CALL_ZONE_DEPTHS, ZONE_LANES, zoneCell,
} from "./exportData";
import { PASS_ZONE_YPA_SCALE, heatAccent, heatFill } from "../../../utils/productionPresentation";
import { getTeamColor, getTeamSecondary } from "../../../utils/gameBoxScore/teamIdentity";
import { PRODUCTION_NEGATIVE, PRODUCTION_UNITS, productionFill, productionScale } from "../../../utils/productionBars";

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGES 3 & 4 — BOXSCORE, one per team
// ═══════════════════════════════════════════════════════════════════════════════
// Passing (stat tiles beside the lead passer's zone grid), rushing, receiving.
// Every cell is a field on the player row; production is the unit's own
// component. SR and EPA cells tint against the league's team-level line.

const Card = ({ children, ...props }) => (
  <Box bg={CARD_BG} boxShadow="var(--gg-poster-shadow)" borderRadius="1rem" border="0.0625rem solid" borderColor={HAIRLINE} px="1.5rem" py="0.75rem" {...props}>
    {children}
  </Box>
);

const BoxscoreTitle = ({ kicker, featuredName, opponentName, connector, featuredColor }) => (
  <Box mb="1rem">
    {kicker && (
      <Text fontSize="0.75rem" fontWeight="900" color="rgba(var(--gg-fg), calc(0.45 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.28em" mb="0.375rem">
        {kicker}
      </Text>
    )}
    <Flex align="baseline" gap="0.625rem" fontStyle="italic" textTransform="uppercase" lineHeight={1}>
      <Box display="inline-flex" flexDirection="column" alignItems="flex-start">
        <Text fontSize="2.875rem" fontWeight="950" letterSpacing="-0.02em" color={featuredColor}>
          {featuredName}
        </Text>
        <Box mt="0.625rem" h="0.1875rem" w="full" bg={featuredColor} borderRadius="full" />
      </Box>
      <Text fontSize="2.5rem" fontWeight="950" letterSpacing="-0.02em" color="rgba(var(--gg-fg), calc(0.55 + var(--gg-faint-boost, 0)))">
        {connector}
      </Text>
      <Text fontSize="2.5rem" fontWeight="950" letterSpacing="-0.02em" color="var(--gg-ink)">
        {opponentName}
      </Text>
    </Flex>
  </Box>
);

// `big`: the 16:9 slide's type, read on a TV.
const Name = ({ children, total, big = false }) => (
  <Text fontSize={big ? (total ? "1.1875rem" : "1.25rem") : total ? "1rem" : "1.0625rem"} fontWeight={total ? "980" : "950"} textTransform="uppercase" letterSpacing={total ? "0.02em" : "-0.01em"} color={total ? "var(--gg-ink)" : "var(--gg-ink)"} lineClamp={1}>
    {children}
  </Text>
);

const Cell = ({ children, align = "right", dim, big = false }) => (
  <Text textAlign={align} fontSize={big ? "1.1875rem" : "1rem"} fontWeight="900" fontFamily="mono" whiteSpace="nowrap" color={dim ? "rgba(var(--gg-fg), calc(0.5 + var(--gg-faint-boost, 0)))" : "var(--gg-ink)"}>
    {children}
  </Text>
);

const TOTAL_EMPHASIS_KEYS = new Set(["name", "ay", "ypc", "sr", "epa", "epaatt", "try", "ypr", "epatgt", "prod"]);

/**
 * Production score with its bar, at print size. In this poster we show offensive
 * rows only (pass/rush/receive), so the scale is this team's offensive production
 * domain, not the whole game's all-units domain. Negatives grow left from the
 * zero mark in red; the mark is drawn only when the shown offense has a negative.
 */
const Production = ({ value, scale, accent, big = false }) => {
  const fill = productionFill(value, scale);
  if (!fill) return <Cell dim big={big}>{DASH}</Cell>;
  return (
    <Flex align="center" gap="0.5rem" minW={0}>
      <Text w={big ? "3.5rem" : "2.875rem"} textAlign="right" fontSize={big ? "1.1875rem" : "1rem"} fontWeight="950" fontFamily="mono" color={fill.negative ? PRODUCTION_NEGATIVE : "var(--gg-ink)"} flexShrink={0}>
        {value.toFixed(1)}
      </Text>
      <Box position="relative" flex="1" h="var(--gg-bar-h, 0.5rem)">
        <Box position="absolute" inset={0} bg="var(--gg-bar-track)" borderRadius="full" overflow="hidden">
          <Box position="absolute" top={0} bottom={0} borderRadius="full" bg={fill.negative ? PRODUCTION_NEGATIVE : accent} style={{ left: `${fill.leftPct}%`, width: `${fill.widthPct}%` }} />
        </Box>
        {scale.hasNegative && (
          <Box position="absolute" top="-0.3125rem" bottom="-0.3125rem" w="0.125rem" bg="rgba(var(--gg-fg), calc(0.7 + var(--gg-faint-boost, 0)))" borderRadius="full" style={{ left: `calc(${scale.zeroPct}% - 0.0625rem)` }} />
        )}
      </Box>
    </Flex>
  );
};

// `big`: slide type, and the rows share the card's height (each line grows to fill).
const Table = ({ columns, rows, total, accent, rowKey, gap = "0.875rem", big = false }) => {
  const template = columns.map((c) => c.w).join(" ");
  const line = (r, isTotal) => (
    <Grid
      key={isTotal ? "total" : rowKey(r)}
      templateColumns={template}
      columnGap={gap}
      alignItems="center"
      flex={big ? "1" : undefined}
      py={big ? "0.25rem" : "0.5rem"}
      borderBottom="0.0625rem solid"
      borderTop={isTotal ? "0.0625rem solid" : "none"}
      borderColor={isTotal ? "rgba(var(--gg-fg), calc(0.14 + var(--gg-line-boost, 0)))" : "rgba(var(--gg-fg), calc(0.05 + var(--gg-line-boost, 0)))"}
      bg={isTotal ? "rgba(var(--gg-fg), calc(0.08 + var(--gg-line-boost, 0)))" : "transparent"}
      borderLeft={isTotal ? "0.25rem solid" : "none"}
      borderLeftColor={isTotal ? accent : "transparent"}
      px="0.5rem"
      pl={isTotal ? "0.75rem" : "0.5rem"}
      mx="-0.5rem"
      borderRadius={isTotal ? "0.375rem" : 0}
    >
      {columns.map((c) => (
        <Box
          key={c.key}
          minW={0}
          sx={
            isTotal && TOTAL_EMPHASIS_KEYS.has(c.key)
              ? { "& p": { fontWeight: "980 !important", color: "var(--gg-ink)" } }
              : undefined
          }
        >
          {c.render(r, isTotal)}
        </Box>
      ))}
    </Grid>
  );
  return (
    <Box display={big ? "flex" : undefined} flexDirection="column" flex={big ? "1" : undefined}>
      <Grid templateColumns={template} columnGap={gap} alignItems="end" pb="0.375rem" borderBottom="0.0625rem solid" borderColor="rgba(var(--gg-fg), calc(0.1 + var(--gg-line-boost, 0)))">
        {columns.map((c) => (
          <Head key={c.key} align={c.align ?? "right"} sub={c.sub} big={big}>{c.label}</Head>
        ))}
      </Grid>
      {rows.length === 0 && (
        <Text py="0.75rem" fontSize="0.75rem" fontWeight="800" color="rgba(var(--gg-fg), calc(0.3 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.14em">No rows</Text>
      )}
      {rows.map((r) => line(r, false))}
      {total && line(total, true)}
    </Box>
  );
};

/**
 * The lead passer's zone grid — depth rows, lane columns, C/A + yards per cell.
 * Heat is the page's: same team heat colour, same fixed yds/att scale, same
 * neutral cell under two attempts (heatFill in ProductionPrimitives).
 */
// `big`: the slide's grid, which grows to fill the rest of the QB card, with bigger numbers.
const ZoneGrid = ({ grid, heat, byCall = false, big = false }) => {
  const depths = byCall ? CALL_ZONE_DEPTHS : ZONE_DEPTHS;
  return (
    <Box display={big ? "flex" : undefined} flexDirection="column" flex={big ? "1" : undefined} minH={0}>
      <Grid templateColumns={big ? "5rem repeat(3, minmax(0, 1fr))" : "4rem repeat(3, minmax(0, 1fr))"} gap="0.5rem" alignItems={big ? "stretch" : "center"}
        flex={big ? "1" : undefined} templateRows={big ? `auto repeat(${depths.length}, minmax(3.75rem, 1fr))` : undefined}>
        <Box />
        {ZONE_LANES.map((l) => (
          <Text key={l.key} textAlign="center" fontSize={big ? "0.9375rem" : "0.75rem"} fontWeight="900" color="rgba(var(--gg-fg), calc(0.45 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.14em">{l.label}</Text>
        ))}
        {depths.map((d) => (
          <Box key={d.key} display="contents">
            <Flex direction="column" justify="center">
              <Text fontSize={big ? "1rem" : "0.75rem"} fontWeight="900" color="rgba(var(--gg-fg), calc(0.6 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.1}>{d.label}</Text>
              {d.range && <Text fontSize={big ? "0.8125rem" : "0.625rem"} fontWeight="700" color="rgba(var(--gg-fg), calc(0.3 + var(--gg-faint-boost, 0)))">{d.range}</Text>}
            </Flex>
            {ZONE_LANES.map((l) => {
              const c = zoneCell(grid, d.key, l.key);
              const empty = !c || c.attempts === 0;
              // Too few throws to shade: the same plain box as an empty zone, so every zone has one.
              const plain = empty || c.attempts < 2;
              const fill = heatFill(c?.attempts ? c.yards / c.attempts : 0, c?.attempts ?? 0, PASS_ZONE_YPA_SCALE, heat);
              return (
                <Flex key={l.key} direction="column" align="center" justify="center" h={big ? "auto" : "4.5rem"} borderRadius="0.5rem" bg={plain ? "rgba(var(--gg-fg), calc(0.03 + var(--gg-line-boost, 0)))" : fill.bg} border="0.0625rem solid" borderColor={plain ? "rgba(var(--gg-fg), calc(0.06 + var(--gg-line-boost, 0)))" : fill.border}>
                  {!empty && (
                    <>
                      <Text fontSize={big ? "2.25rem" : "1.375rem"} fontWeight="950" lineHeight={1.1}>{c.completions}/{c.attempts}</Text>
                      <Text fontSize={big ? "1.0625rem" : "0.75rem"} fontWeight="700" color="rgba(var(--gg-fg), calc(0.6 + var(--gg-faint-boost, 0)))" lineHeight={1.2} mt="0.125rem">{c.yards}y</Text>
                    </>
                  )}
                </Flex>
              );
            })}
          </Box>
        ))}
      </Grid>
      {/* Throws the crew left unplaceable — counted, never spread into cells. */}
      {(grid?.uncharted?.attempts ?? 0) > 0 && (
        <Text mt="0.625rem" fontSize={big ? "0.9375rem" : "0.75rem"} fontWeight="900" color="rgba(var(--gg-fg), calc(0.5 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.1em">
          {grid.uncharted.attempts} not charted
        </Text>
      )}
    </Box>
  );
};

// ── The 16:9 slide's QB card: the starter "glorified" — his name big in the team color with the
// mark behind it, the box line in big numbers, the efficiency tiles, and the zone grid filling
// the rest. A backup who threw gets one short line at the bottom.
// "made/attempts" for a breakdown block ({ completions, attempts }), a dash when it's missing.
const madeOf = (b) => (b && b.attempts != null ? `${b.completions ?? DASH}/${b.attempts}` : DASH);
const signedPct1 = (v) => (v == null ? DASH : `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`);

// A small stat: the number over its label.
const MiniStat = ({ value, label, sub }) => (
  <Box minW={0}>
    <Text fontSize="1.5rem" fontWeight="950" fontFamily="mono" lineHeight={1} whiteSpace="nowrap">{value}</Text>
    <Text fontSize="0.75rem" fontWeight="900" mt="0.3125rem" color="rgba(var(--gg-fg), calc(0.5 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.1em" whiteSpace="nowrap">
      {label}{sub ? <Text as="span" color="rgba(var(--gg-fg), calc(0.4 + var(--gg-faint-boost, 0)))"> · {sub}</Text> : null}
    </Text>
  </Box>
);

const QbHero = ({ lead, others, teamId, accent, tiles, prodScale, downs, passSR, passEPA }) => {
  const [initial, ...rest] = String(shortName(lead?.name)).split(".");
  const last = rest.length ? rest.join(".") : initial;
  const box = tiles.filter((t) => ["ca", "yds", "td", "int"].includes(t.key));
  const eff = tiles.filter((t) => !["ca", "yds", "td", "int"].includes(t.key));
  return (
    <Card position="relative" overflow="hidden" display="flex" flexDirection="column" minH={0} py="1rem">
      <Image src={teamLogo(teamId)} alt="" position="absolute" right="-3rem" top="-2.5rem" w="20rem" h="20rem" objectFit="contain" opacity={0.08} pointerEvents="none" />
      <Box position="relative" zIndex={1} display="flex" flexDirection="column" flex="1" minH={0}>
        <PosterSection title="Passing" accent={accent} subtle mb="0">{null}</PosterSection>
        {!lead ? (
          <Text py="0.75rem" fontSize="1rem" fontWeight="800" color="rgba(var(--gg-fg), calc(0.3 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.14em">No passing on file</Text>
        ) : (
          <>
            <Flex align="baseline" gap="0.5rem" mt="0.25rem" lineHeight={1}>
              {rest.length > 0 && (
                <Text fontSize="2rem" fontWeight="950" fontStyle="italic" textTransform="uppercase" color="rgba(var(--gg-fg), calc(0.55 + var(--gg-faint-boost, 0)))">{initial}.</Text>
              )}
              <Text fontSize="3.5rem" fontWeight="950" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" color={accent} lineClamp={1}>{last}</Text>
            </Flex>

            <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap="0.75rem" mt="0.875rem" pb="0.875rem" borderBottom="0.0625rem solid" borderColor="rgba(var(--gg-fg), calc(0.1 + var(--gg-line-boost, 0)))">
              {box.map((t) => (
                <Box key={t.key} minW={0}>
                  <Text fontSize="2.75rem" fontWeight="950" fontFamily="mono" lineHeight={1} whiteSpace="nowrap">{t.value}</Text>
                  <Text fontSize="0.875rem" fontWeight="900" mt="0.375rem" color="rgba(var(--gg-fg), calc(0.5 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.14em">{t.label}</Text>
                </Box>
              ))}
            </Grid>

            <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap="0.5rem" mt="0.875rem">
              {eff.map((t) => (
                <Box key={t.key} bg={t.shade ?? "rgba(var(--gg-fg), calc(0.04 + var(--gg-line-boost, 0)))"} borderRadius="0.5rem" px="0.75rem" py="0.625rem" minW={0}>
                  <Text fontSize="0.8125rem" fontWeight="900" color="rgba(var(--gg-fg), calc(0.55 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.1} whiteSpace="nowrap">{t.label}</Text>
                  {t.production ? (
                    <Box mt="0.5rem"><Production value={lead.production} scale={prodScale} accent={accent} big /></Box>
                  ) : (
                    <Text fontSize="1.75rem" fontWeight="950" fontFamily="mono" lineHeight={1.1} mt="0.25rem" whiteSpace="nowrap">{t.value}</Text>
                  )}
                </Box>
              ))}
            </Grid>

            {/* Rates, then situations: two rows of five small stats. */}
            <Grid templateColumns="repeat(5, minmax(0, 1fr))" columnGap="0.75rem" rowGap="0.875rem" mt="1rem" pt="0.875rem" borderTop="0.0625rem solid" borderColor="rgba(var(--gg-fg), calc(0.1 + var(--gg-line-boost, 0)))">
              <MiniStat value={pct0(lead.compPct)} label="Comp" />
              <MiniStat value={rate1(lead.ypa)} label="Yds/Att" />
              <MiniStat value={rate1(lead.adot)} label="aDOT" />
              <MiniStat value={num(lead.sacks)} label="Sacks" sub={lead.sackYards ? `${lead.sackYards} yds` : null} />
              <MiniStat value={signedPct1(lead.wpa)} label="Win prob" />
              <MiniStat value={madeOf(lead.third)} label="3rd down" />
              <MiniStat value={madeOf(lead.redZone)} label="Red zone" sub={lead.redZone?.touchdowns != null ? `${lead.redZone.touchdowns} TD` : null} />
              <MiniStat value={madeOf(lead.deep)} label="Deep" />
              <MiniStat value={madeOf(lead.pressure)} label="Pressured" sub={lead.pressure?.yards != null ? `${lead.pressure.yards} yds` : null} />
              <MiniStat value={num(lead.hurries)} label="Hurries" />
            </Grid>

            {/* The team's dropbacks split by down type: standard downs vs passing downs. */}
            {downs && (downs.standard || downs.passing) && (
              <Box mt="1rem" pt="0.75rem" borderTop="0.0625rem solid" borderColor="rgba(var(--gg-fg), calc(0.1 + var(--gg-line-boost, 0)))">
                <Grid templateColumns="minmax(0, 1.4fr) repeat(4, minmax(0, 1fr))" columnGap="0.75rem" alignItems="end" pb="0.375rem">
                  <Box />
                  {["Comp", "Yds/Att", "SR%", "EPA/DB"].map((h) => <Head key={h} big>{h}</Head>)}
                </Grid>
                {[["Standard downs", downs.standard], ["Passing downs", downs.passing]].map(([label, d]) => (
                  <Grid key={label} templateColumns="minmax(0, 1.4fr) repeat(4, minmax(0, 1fr))" columnGap="0.75rem" alignItems="center" py="0.3125rem"
                    borderTop="0.0625rem solid" borderColor="rgba(var(--gg-fg), calc(0.06 + var(--gg-line-boost, 0)))">
                    <Text fontSize="1rem" fontWeight="950" textTransform="uppercase" letterSpacing="0.02em" whiteSpace="nowrap">{label}</Text>
                    <Cell big>{madeOf(d)}</Cell>
                    <Cell big>{rate1(asNum(d?.yards_per_attempt))}</Cell>
                    <Shaded value={pct0(asNum(d?.success_rate))} shade={shadeVsLeague(asNum(d?.success_rate), passSR)} size="1.1875rem" />
                    <Shaded value={signed2(asNum(d?.epa_per_play))} shade={shadeVsLeague(asNum(d?.epa_per_play), passEPA)} size="1.1875rem" />
                  </Grid>
                ))}
              </Box>
            )}

            <Box mt="1rem" flex="1" minH={0} display="flex" flexDirection="column">
              <ZoneGrid grid={lead.grid ?? null} byCall={!!lead.gridByCall} heat={heatAccent(getTeamColor(teamId), getTeamSecondary(teamId))} big />
            </Box>

            {others.length > 0 && (
              <Text mt="0.75rem" fontSize="1rem" fontWeight="900" color="rgba(var(--gg-fg), calc(0.55 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
                Also: {others.map((p) => `${shortName(p.name)} ${p.completions ?? DASH}/${p.attempts ?? DASH}, ${num(p.yards)} yds`).join("  ·  ")}
              </Text>
            )}
          </>
        )}
      </Box>
    </Card>
  );
};

// `wide`: the 16:9 slide. The QB card (QbHero) fills a left column; rushing and receiving fill the
// right, their rows sharing the height.
export const BoxscorePoster = ({ game, leagueAvg, teamId, innerRef, wide = false }) => {
  const header = buildHeader(game);
  const isHome = teamId === header.homeId;
  const oppId = isHome ? header.awayId : header.homeId;
  const accent = teamAccent(teamId);
  const featuredPrimary = teamColor(teamId);
  const box = buildBoxscore(game, teamId);

  const passSR = leagueEntry(leagueAvg, "passing_splits.total.success_rate");
  const passEPA = leagueEntry(leagueAvg, "passing_splits.total.epa_per_play");
  const rushSR = leagueEntry(leagueAvg, "rushing_splits.total.success_rate");
  const rushEPA = leagueEntry(leagueAvg, "rushing_splits.total.epa_per_play");
  const recvSR = leagueEntry(leagueAvg, "individual_stats.receiving.success_rate");
  const recvEPA = leagueEntry(leagueAvg, "individual_stats.receiving.epa_per_target");

  // Offensive-only scale for this team poster: pass/rush/receive player production
  // rows only (the rows we render in this image). The domain stays asymmetric:
  // min is the biggest negative shown, max is the biggest positive shown.
  const offensiveProdValues = [
    ...box.passers.map((r) => r.production),
    ...box.rushers.map((r) => r.production),
    ...box.receivers.map((r) => r.production),
  ].filter((v) => typeof v === "number" && Number.isFinite(v));
  const offenseMin = offensiveProdValues.length ? Math.min(0, ...offensiveProdValues) : 0;
  const offenseMax = offensiveProdValues.length ? Math.max(0, ...offensiveProdValues) : 0;
  const prodScale = productionScale({ min: offenseMin, max: offenseMax });
  // The Passing card shows one quarterback: the top performer by passing production
  // (ties and missing ratings fall back to the order the file gives). The zone
  // grid beside the tiles is that same passer's.
  // The QB who played the game: most attempts, production only to break a tie.
  // (By production alone a 0/1 backup at 0.1 beat a 28-attempt starter at -5.8.)
  const lead = [...box.passers].sort((a, b) => (b.attempts ?? 0) - (a.attempts ?? 0) || (b.production ?? -Infinity) - (a.production ?? -Infinity))[0] ?? null;

  // Passing stats sit in tiles, four to a row, so the zone grid gets 2/5 of the card.
  const passTiles = (r) => [
    { key: "ca", label: "C/A", value: `${r.completions ?? DASH}/${r.attempts ?? DASH}` },
    { key: "yds", label: "Yds", value: num(r.yards) },
    { key: "td", label: "TD", value: num(r.touchdowns) },
    { key: "int", label: "INT", value: num(r.interceptions) },
    { key: "sr", label: "SR%", value: pct0(r.sr), shade: shadeVsLeague(r.sr, passSR) },
    { key: "epa", label: "EPA", value: signed1(r.epa) },
    { key: "epadb", label: "EPA/DB", value: signed2(r.epaPer), shade: shadeVsLeague(r.epaPer, passEPA) },
    { key: "prod", label: PRODUCTION_UNITS.passing.label, production: true },
  ];

  // Column widths: the vertical poster's, or the slide's (wider, for the bigger type).
  const W = (tall, slide) => (wide ? slide : tall);
  const B = wide;
  const shadedSize = wide ? "1.1875rem" : undefined;

  const rushCols = [
    { key: "name", label: "Rushing", align: "left", w: "minmax(0, 1.3fr)", render: (r, t) => <Name total={t} big={B}>{t ? "Team Total" : shortName(r.name)}</Name> },
    { key: "ay", label: "Att-Yds", w: W("4.875rem", "6rem"), render: (r) => <Cell big={B}>{r.attempts ?? DASH}-{r.yards ?? DASH}</Cell> },
    { key: "ypc", label: "YPC", w: W("3.25rem", "4rem"), render: (r) => <Cell big={B}>{rate1(r.ypc)}</Cell> },
    { key: "sr", label: "SR%", w: W("4.625rem", "5.5rem"), render: (r) => <Shaded value={pct0(r.sr)} shade={shadeVsLeague(r.sr, rushSR)} size={shadedSize} /> },
    { key: "epa", label: "EPA", w: W("3.875rem", "4.75rem"), render: (r) => <Cell big={B}>{signed1(r.epa)}</Cell> },
    { key: "epaatt", label: "EPA/Att", w: W("5.125rem", "6rem"), render: (r) => <Shaded value={signed2(r.epaPer)} shade={shadeVsLeague(r.epaPer, rushEPA)} size={shadedSize} /> },
    { key: "ly", label: "LY/C", w: W("3.875rem", "4.5rem"), render: (r) => <Cell big={B}>{rate1(r.lineYards)}</Cell> },
    { key: "hl", label: "Hlt/Opp", w: W("4.375rem", "5rem"), render: (r) => <Cell big={B}>{rate1(r.highlight)}</Cell> },
    { key: "expl", label: "Expl", w: W("2.875rem", "3.5rem"), render: (r) => <Cell big={B}>{num(r.explosive)}</Cell> },
    { key: "prod", label: PRODUCTION_UNITS.rushing.label, align: "left", w: W("8.75rem", "10rem"), render: (r, t) => (t ? null : <Production value={r.production} scale={prodScale} accent={accent} big={B} />) },
  ];

  const recvCols = [
    { key: "name", label: "Receiving", align: "left", w: "minmax(0, 1fr)", render: (r, t) => <Name total={t} big={B}>{t ? "Team Total" : shortName(r.name)}</Name> },
    { key: "try", label: "Tgt/Rec/Yds", w: W("8.125rem", "8.75rem"), render: (r) => <Cell big={B}>{r.targets ?? DASH}/{r.receptions ?? DASH}/{r.yards ?? DASH}</Cell> },
    { key: "ypr", label: "Yds/Rec", w: W("5.625rem", "5.75rem"), render: (r) => <Cell big={B}>{rate1(r.ypr)}</Cell> },
    { key: "expl", label: "Expl", w: W("4rem", "3.75rem"), render: (r) => <Cell big={B}>{num(r.explosive)}</Cell> },
    { key: "sr", label: "SR%", w: W("5.625rem", "5.75rem"), render: (r) => <Shaded value={pct0(r.sr)} shade={shadeVsLeague(r.sr, recvSR)} size={shadedSize} /> },
    { key: "epa", label: "EPA", w: W("5rem", "4.75rem"), render: (r) => <Cell big={B}>{signed1(r.epa)}</Cell> },
    { key: "epatgt", label: "EPA/Tgt", w: W("6rem", "6.25rem"), render: (r) => <Shaded value={signed2(r.epaPer)} shade={shadeVsLeague(r.epaPer, recvEPA)} size={shadedSize} /> },
    { key: "prod", label: PRODUCTION_UNITS.receiving.label, align: "left", w: W("10.625rem", "11rem"), render: (r, t) => (t ? null : <Production value={r.production} scale={prodScale} accent={accent} big={B} />) },
  ];

  if (wide) {
    return (
      <Poster innerRef={innerRef} w={WIDE_W} h={WIDE_H} display="flex" flexDirection="column">
        <PosterBanner header={header} label={`${teamShort(teamId)} Boxscore`} />
        <FitBody>
          <Grid templateColumns="minmax(0, 0.4fr) minmax(0, 0.6fr)" gap="0.75rem" alignItems="stretch" flex="1">
            <QbHero lead={lead} others={box.passers.filter((p) => p !== lead && (p.attempts ?? 0) > 0)} teamId={teamId} accent={accent}
              tiles={lead ? passTiles(lead) : []} prodScale={prodScale} downs={box.passDowns} passSR={passSR} passEPA={passEPA} />
            <Flex direction="column" gap="0.625rem" minW={0}>
              {[["Rushing", rushCols, box.rushers, box.rushTeam], ["Receiving", recvCols, box.receivers, box.recvTeam]].map(([title, cols, rows, total]) => (
                // Each card's share of the height follows its row count, so both fill the column.
                <Card key={title} display="flex" flexDirection="column" flex={`${rows.length + 3} 1 0`} minH={0}>
                  <PosterSection title={title} accent={accent} subtle mb="0">{null}</PosterSection>
                  <Table columns={cols} rows={rows} total={total} accent={accent} rowKey={(r) => r.key} big />
                </Card>
              ))}
            </Flex>
          </Grid>
        </FitBody>
      </Poster>
    );
  }

  return (
    <Poster innerRef={innerRef}>
      <BoxscoreTitle
        kicker={[header.weekLabel, "Boxscore"].filter(Boolean).join(" · ")}
        featuredName={teamName(teamId)}
        opponentName={teamShort(oppId)}
        connector={isHome ? "vs" : "@"}
        featuredColor={featuredPrimary}
      />
      <PosterBanner header={header} />

      <Flex direction="column" gap="0.625rem">
        <Card>
          <PosterSection
            title="Passing"
            accent={accent}
            subtle
            mb="0"
            right={
              <Flex align="center" gap="0.375rem">
                <Image src={teamLogo(teamId)} alt="" w="1.125rem" h="1.125rem" objectFit="contain" />
                <Text fontSize="0.75rem" fontWeight="900" letterSpacing="0.12em" color="rgba(var(--gg-fg), calc(0.6 + var(--gg-faint-boost, 0)))">{teamShort(teamId)}</Text>
              </Flex>
            }
          >
            <Grid templateColumns="minmax(0, 3fr) minmax(0, 2fr)" columnGap="1.75rem" alignItems="start">
              <Flex direction="column" gap="0.625rem">
                {box.passers.length === 0 && (
                  <Text py="0.75rem" fontSize="0.75rem" fontWeight="800" color="rgba(var(--gg-fg), calc(0.3 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.14em">No rows</Text>
                )}
                {(lead ? [lead] : []).map((r) => (
                  <Box key={r.key}>
                    <Name>{shortName(r.name)}</Name>
                    <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap="0.5rem" mt="0.375rem">
                      {passTiles(r).map((t) => (
                        <Box key={t.key} bg={t.shade ?? "rgba(var(--gg-fg), calc(0.04 + var(--gg-line-boost, 0)))"} borderRadius="0.5rem" px="0.75rem" py="0.5rem" minW={0}>
                          <Text fontSize="0.6875rem" fontWeight="900" color="rgba(var(--gg-fg), calc(0.5 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.1}>{t.label}</Text>
                          {t.production ? (
                            <Box mt="0.25rem"><Production value={r.production} scale={prodScale} accent={accent} /></Box>
                          ) : (
                            <Text fontSize="1.375rem" fontWeight="950" fontFamily="mono" lineHeight={1.2} mt="0.0625rem" whiteSpace="nowrap">{t.value}</Text>
                          )}
                        </Box>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Flex>
              <ZoneGrid grid={lead?.grid ?? null} byCall={!!lead?.gridByCall} heat={heatAccent(getTeamColor(teamId), getTeamSecondary(teamId))} />
            </Grid>
          </PosterSection>
        </Card>

        <Card>
          <PosterSection title="Rushing" accent={accent} subtle mb="0">
            <Table columns={rushCols} rows={box.rushers} total={box.rushTeam} accent={accent} rowKey={(r) => r.key} />
          </PosterSection>
        </Card>

        <Card>
          <PosterSection title="Receiving" accent={accent} subtle mb="0">
            <Table columns={recvCols} rows={box.receivers} total={box.recvTeam} accent={accent} rowKey={(r) => r.key} />
          </PosterSection>
        </Card>
      </Flex>

    </Poster>
  );
};
