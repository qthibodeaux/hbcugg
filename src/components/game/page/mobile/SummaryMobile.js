import { useMemo } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { teamLogo, teamShort } from "../../export/exportData";
import { buildIdentityIndex } from "../../../../utils/headshots";
import { ChainsMovedCard, SeriesResultsCard } from "../summary/SeriesCards";
import {
  ANIMATION_STYLES,
  GameInfoCard,
  GameLeadersCard,
  NotablePerformersCard,
  ScoringPlaysCard,
  WinProbabilityCard,
  buildTeamStatRows,
  getTeamAccent,
  metricFmt,
  metricInk,
  metricShade,
  statBarPct,
  statBarSegment,
  useMetricBlocks,
} from "../summary/GameSummaryTabV2";

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY — MOBILE. One full-width part after another, flush, no gaps, each
// registered with the page's jump header. Team Stats and Metrics have their
// phone versions; the other parts still render their desktop cards at a fixed
// height until they get theirs (component by component).
// ─────────────────────────────────────────────────────────────────────────────

export const SUMMARY_PARTS = [
  { id: "scoring", label: "Scoring Summary" },
  { id: "team-stats", label: "Team Stats" },
  { id: "metrics", label: "Metrics" },
  { id: "flow", label: "Game Flow" },
  { id: "info", label: "Game Info" },
  { id: "performers", label: "Notable Performers" },
  { id: "leaders", label: "Game Leaders" },
  { id: "plays", label: "Scoring Plays" },
  { id: "chains", label: "Moving the Chains" },
  { id: "series", label: "Series Results" },
];

// Parts alternate between two grounds so the move from one to the next is plain.
// Cards read the ground through --part-bg (desktop never sets it: #141416).
const TONES = ["#141416", "#1F1F25"];

// Clears the app header + the sticky section header when a part is jumped to.
export const JUMP_MARGIN = "calc(var(--app-header-height) + 2.8rem)";

export const Part = ({ id, refs, tone = 0, children, ...rest }) => (
  <Box ref={refs?.[id]} data-jump={id} bg={TONES[tone % 2]} style={{ scrollMarginTop: JUMP_MARGIN, "--part-bg": TONES[tone % 2] }} borderBottom="1px solid" borderColor="whiteAlpha.100" {...rest}>
    {children}
  </Box>
);

const Eyebrow = ({ children, accent, right }) => (
  <Flex align="center" justify="space-between" gap="0.5rem" pb="0.55rem" mb="0.35rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Flex align="center" gap="0.5rem">
      <Box w="0.4rem" h="0.4rem" bg={accent} borderRadius="full" flexShrink={0} />
      <Text fontSize="0.78rem" fontWeight="black" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.14em">{children}</Text>
    </Flex>
    {right}
  </Flex>
);

const TeamKey = ({ awayId, homeId }) => (
  <Flex align="center" gap="0.6rem">
    <Flex align="center" gap="0.3rem">
      <Image src={teamLogo(awayId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" />
      <Text fontSize="0.72rem" fontWeight="black" color="whiteAlpha.700">{teamShort(awayId)}</Text>
    </Flex>
    <Box w="1px" h="0.7rem" bg="whiteAlpha.300" />
    <Flex align="center" gap="0.3rem">
      <Text fontSize="0.72rem" fontWeight="black" color="whiteAlpha.700">{teamShort(homeId)}</Text>
      <Image src={teamLogo(homeId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" />
    </Flex>
  </Flex>
);

// ── Scoring Summary — a line score: away on top, home under, periods across ──
// Every overtime period folds into one OT column.
const ScoringSummaryMobile = ({ scoreByQuarter, awayScore, homeScore, awayId, homeId }) => {
  const labels = Array.isArray(scoreByQuarter?.labels) ? scoreByQuarter.labels : [];
  const at = (side, i) => scoreByQuarter?.[side]?.[i] ?? null;
  const sum = (side, idx) => (idx.length ? idx.reduce((t, i) => t + (Number(at(side, i)) || 0), 0) : null);
  const reg = labels.map((l, i) => ({ l, i })).filter(({ l }) => !/^OT/i.test(l));
  const ot = labels.map((l, i) => ({ l, i })).filter(({ l }) => /^OT/i.test(l)).map(({ i }) => i);
  const cols = [
    ...reg.map(({ l, i }) => ({ key: l, label: l.toUpperCase(), away: at("away", i), home: at("home", i) })),
    ...(ot.length ? [{ key: "OT", label: "OT", away: sum("away", ot), home: sum("home", ot) }] : []),
  ];
  const finals = { away: awayScore ?? null, home: homeScore ?? null };
  const won = (side) => finals.away != null && finals.home != null && finals[side] > finals[side === "away" ? "home" : "away"];
  const show = (v) => (v == null ? "—" : v);
  const COLS = `minmax(0, 1.6fr) repeat(${cols.length}, minmax(0, 1fr)) minmax(0, 1.1fr)`;

  const Row = ({ side, id }) => (
    <Grid templateColumns={COLS} alignItems="center" py="0.55rem" borderTop="1px solid" borderColor="whiteAlpha.100">
      <Flex align="center" gap="0.45rem" minW={0}>
        <Image src={teamLogo(id)} alt="" w="1.5rem" h="1.5rem" objectFit="contain" flexShrink={0} />
        <Text fontSize="0.95rem" fontWeight="black" color="white" lineClamp={1}>{teamShort(id)}</Text>
      </Flex>
      {cols.map((c) => {
        const mine = c[side];
        const theirs = c[side === "away" ? "home" : "away"];
        return (
          <Text key={c.key} textAlign="center" fontSize="1rem" fontWeight="900" fontFamily="mono" color={mine != null && theirs != null && mine > theirs ? "white" : "whiteAlpha.500"}>
            {show(mine)}
          </Text>
        );
      })}
      <Text textAlign="right" fontSize="1.6rem" fontWeight="950" fontStyle="italic" lineHeight={1} color={won(side) ? getTeamAccent(id) : "whiteAlpha.500"}>
        {show(finals[side])}
      </Text>
    </Grid>
  );

  return (
    <Box bg="var(--part-bg, #141416)" px="0.75rem" pt="0.9rem" pb="0.4rem">
      <Eyebrow accent={getTeamAccent(awayId)}>Scoring Summary</Eyebrow>
      <Grid templateColumns={COLS} pt="0.2rem" pb="0.35rem">
        <Box />
        {cols.map((c) => (
          <Text key={c.key} textAlign="center" fontSize="0.62rem" fontWeight="900" color="whiteAlpha.500" letterSpacing="0.08em">{c.label}</Text>
        ))}
        <Text textAlign="right" fontSize="0.62rem" fontWeight="900" color="whiteAlpha.500" letterSpacing="0.08em">T</Text>
      </Grid>
      <Row side="away" id={awayId} />
      <Row side="home" id={homeId} />
    </Box>
  );
};

// ── Team Stats — away | stat | home, a mirrored bar under each ──────────────
const ROW_COLS = "minmax(0, 1fr) 7.4rem minmax(0, 1fr)";

const TeamStatsMobile = ({ awayId, homeId, teamStats, advancedTeam, game, leagueAvg }) => {
  const rows = buildTeamStatRows({ awayId, homeId, teamStats, advancedTeam, game, leagueAvg });
  const color = { away: getTeamAccent(awayId), home: getTeamAccent(homeId) };

  const wins = (stat, side) => {
    const v = stat[side];
    const o = stat[side === "away" ? "home" : "away"];
    return v !== o && (stat.lowerIsBetter ? v < o : v > o);
  };

  const Bar = ({ stat, side }) => {
    const isAway = side === "away";
    const value = stat[side];
    const seg = statBarSegment(value, stat);
    const at = (pct) => (isAway ? { right: `${pct}%` } : { left: `${pct}%` });
    const avg = stat.league?.avg == null ? null : statBarPct(stat.league.avg, stat);
    return (
      <Box position="relative" h="0.25rem">
        <Box position="absolute" inset={0} bg="rgba(255,255,255,0.07)" />
        <Box position="absolute" top={0} bottom={0} bg={value < 0 ? "#EF4444" : color[side]} opacity={wins(stat, side) ? 0.95 : 0.6} style={{ width: `${seg.width}%`, ...at(seg.from) }} />
        {seg.zero != null && <Box position="absolute" top="-0.2rem" bottom="-0.2rem" w="1px" bg="rgba(255,255,255,0.35)" style={at(seg.zero)} />}
        {avg != null && <Box position="absolute" top="-0.15rem" bottom="-0.15rem" w="1px" bg="rgba(255,255,255,0.6)" style={isAway ? { right: `${avg}%` } : { left: `${avg}%` }} />}
      </Box>
    );
  };

  return (
    <Box bg="var(--part-bg, #141416)" px="0.75rem" pt="0.9rem" pb="0.6rem">
      <Eyebrow accent={color.away} right={<TeamKey awayId={awayId} homeId={homeId} />}>Team Stats</Eyebrow>
      {rows.map((stat) => (
        <Box key={stat.label} py="0.55rem" borderBottom="1px solid" borderColor="whiteAlpha.50" _last={{ borderBottom: "none" }}>
          <Grid templateColumns={ROW_COLS} alignItems="center" columnGap="0.5rem">
            <Text textAlign="right" fontSize="1.2rem" fontWeight="950" fontStyle="italic" lineHeight={1} color={wins(stat, "away") ? color.away : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">
              {stat.format(stat.away)}
            </Text>
            <Text textAlign="center" fontSize="0.62rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
              {stat.label}
            </Text>
            <Text textAlign="left" fontSize="1.2rem" fontWeight="950" fontStyle="italic" lineHeight={1} color={wins(stat, "home") ? color.home : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">
              {stat.format(stat.home)}
            </Text>
          </Grid>
          <Grid templateColumns={ROW_COLS} alignItems="center" columnGap="0.5rem" mt="0.4rem">
            <Bar stat={stat} side="away" />
            <Box />
            <Bar stat={stat} side="home" />
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

// ── Metrics — the five tables, full width, bigger ──────────────────────────
const METRIC_COLS = "minmax(0, 1.35fr) repeat(5, minmax(0, 1fr))";

const MetricsMobile = ({ awayId, homeId, drives, plays, teamStats, advancedBasics, leagueAvg }) => {
  const blocks = useMetricBlocks({ awayId, homeId, drives, plays, teamStats, advancedBasics, leagueAvg });
  const teams = [
    { id: awayId, side: "away" },
    { id: homeId, side: "home" },
  ];
  return (
    <Box bg="var(--part-bg, #141416)" px="0.75rem" pt="0.9rem" pb="0.9rem">
      <Eyebrow accent={getTeamAccent(awayId)}>Metrics</Eyebrow>
      <Flex direction="column" gap="1.1rem" mt="0.5rem">
        {blocks.map((block) => (
          <Box key={block.label}>
            <Grid templateColumns={METRIC_COLS} columnGap="0.3rem" alignItems="end" pb="0.35rem" borderBottom="1px solid" borderColor="whiteAlpha.200">
              <Text fontSize="0.72rem" fontWeight="950" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.15}>{block.label}</Text>
              {block.metrics.map((m) => (
                <Text key={m.key} textAlign="center" fontSize="0.58rem" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" lineHeight={1.15} wordBreak="keep-all">
                  {m.label}
                </Text>
              ))}
            </Grid>
            {teams.map((t) => (
              <Grid key={t.id} templateColumns={METRIC_COLS} columnGap="0.3rem" alignItems="center" pt="0.35rem">
                <Flex align="center" gap="0.35rem" minW={0}>
                  <Image src={teamLogo(t.id)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" flexShrink={0} />
                  <Text fontSize="0.72rem" fontWeight="900" color="whiteAlpha.800" lineClamp={1}>{teamShort(t.id)}</Text>
                </Flex>
                {block.metrics.map((m) => {
                  const value = m[t.side];
                  const other = m[t.side === "away" ? "home" : "away"];
                  const shade = metricShade(m.key, value, m.league);
                  return (
                    <Box key={m.key} bg={shade ?? "transparent"} py="0.3rem" minW={0}>
                      <Text textAlign="center" fontFamily="mono" fontSize="0.82rem" fontWeight="900" lineHeight={1.1} color={shade ? "white" : metricInk(m.key, value, other)}>
                        {metricFmt(m.key)(value)}
                      </Text>
                    </Box>
                  );
                })}
              </Grid>
            ))}
            <Grid templateColumns={METRIC_COLS} columnGap="0.3rem" alignItems="center" pt="0.35rem">
              <Text fontSize="0.6rem" fontWeight="700" fontStyle="italic" color="whiteAlpha.400">Lg Avg</Text>
              {block.metrics.map((m) => (
                <Text key={m.key} textAlign="center" fontFamily="mono" fontSize="0.68rem" fontWeight="700" fontStyle="italic" color="whiteAlpha.400">
                  {metricFmt(m.key)(m.league?.avg ?? null)}
                </Text>
              ))}
            </Grid>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

// Desktop card at a fixed height until its phone version is built.
const Legacy = ({ h, children }) => <Box h={h} w="full">{children}</Box>;

export const SummaryMobile = ({
  game,
  awayId,
  homeId,
  meta,
  teamStats,
  advancedTeam,
  teamEntries,
  playerSeasons,
  priorPlayerSeasons = [],
  productionScores,
  drives,
  plays,
  leagueAvg = null,
  refs,
}) => {
  const identity = useMemo(() => buildIdentityIndex(playerSeasons, priorPlayerSeasons), [playerSeasons, priorPlayerSeasons]);
  const accent = getTeamAccent(awayId);

  return (
    <Box>
      <style>{ANIMATION_STYLES}</style>
      <Part id="scoring" refs={refs} tone={0}>
        <ScoringSummaryMobile scoreByQuarter={game?.score_by_quarter} awayScore={game?.away_team?.score} homeScore={game?.home_team?.score} awayId={awayId} homeId={homeId} />
      </Part>
      <Part id="team-stats" refs={refs} tone={1}>
        <TeamStatsMobile awayId={awayId} homeId={homeId} teamStats={teamStats} advancedTeam={advancedTeam} game={game} leagueAvg={leagueAvg} />
      </Part>
      <Part id="metrics" refs={refs} tone={0}>
        <MetricsMobile awayId={awayId} homeId={homeId} drives={drives} plays={plays} teamStats={teamStats} advancedBasics={game?.advanced_basics} leagueAvg={leagueAvg} />
      </Part>
      <Part id="flow" refs={refs} tone={1}>
        <Legacy h="22rem">
          <WinProbabilityCard winProbability={game?.win_probability} epaTimeline={game?.epa_timeline} awayId={awayId} homeId={homeId} />
        </Legacy>
      </Part>
      <Part id="info" refs={refs} tone={0}>
        <Legacy h="11.25rem">
          <GameInfoCard meta={meta} awayId={awayId} homeId={homeId} />
        </Legacy>
      </Part>
      <Part id="performers" refs={refs} tone={1}>
        <Legacy h="11.5rem">
          <NotablePerformersCard mobile awayId={awayId} homeId={homeId} productionScores={productionScores} teamEntries={teamEntries} identity={identity} />
        </Legacy>
      </Part>
      <Part id="leaders" refs={refs} tone={0}>
        <Legacy h="36rem">
          <GameLeadersCard awayId={awayId} homeId={homeId} teamEntries={teamEntries} identity={identity} />
        </Legacy>
      </Part>
      <Part id="plays" refs={refs} tone={1}>
        <ScoringPlaysCard mobile scoringPlays={game?.scoring_plays} driveSummary={game?.drive_summary} identity={identity} awayId={awayId} homeId={homeId} />
      </Part>
      <Part id="chains" refs={refs} tone={0}>
        <Legacy h="15rem">
          <ChainsMovedCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={accent} />
        </Legacy>
      </Part>
      <Part id="series" refs={refs} tone={1}>
        <Legacy h="15rem">
          <SeriesResultsCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={accent} />
        </Legacy>
      </Part>
    </Box>
  );
};

export default SummaryMobile;
