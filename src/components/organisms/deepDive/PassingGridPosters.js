import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ExportWordmark } from "../../molecules/export/ExportWordmark";
import PG from "../../../data/swacPassingGrid2026W8.json";
import { teamAccent, teamLogo, teamMeta } from "../../game/export/exportData";
import { shortOf } from "./deepDiveModel";
import { POSTER_W, Stat, standardRanks, caps, epa, fgOf, int, leagueOf, one, pct, person, rankInk, successInk, tab, tdInk } from "./gridPosterKit";

// ─────────────────────────────────────────────────────────────────────────────
// Passing grid deep dive — two versions of one poster, 12 equal team cards (4 rows
// x 3 columns). Simple: a header line (logo, abbreviation, yards, comp/att, TD) and a
// yards-only grid, no key, no passers. Deluxe, below:
// the team with the most passing yards first. Any conference's file works: the
// title says nothing about the league, and the top-right line names it from the
// teams in the file. Each card:
//
//   header   logo and team abbreviation; passing yards big, with the rank of 12
//   strip    TD · INT · success rate · EPA per dropback (each with its rank) and
//            aDOT, air yards per attempt (a style, so not ranked)
//   grid     the 3x3 of where the team threw, labelled: columns left / middle /
//            right, rows deep 13+ / medium 4-12 / short <4 air yards. A cell is two
//            rows: yards and success rate large, then completions/attempts and TD;
//            a key under the grid names them. Shaded by completion percentage, in the team's colour
//            A thin bar along a cell's bottom splits its yards: air yards (team
//            colour) | yards after the catch (light). A catch behind the line makes
//            air yards negative; the bar then shows the YAC alone.
//   passers  one line each ("A. Parker 63/114 940 yds 8 TD 7 INT"): the top two when
//            a second passer threw 20 or more (a starter hurt, a changed primary
//            passer); otherwise the one
//
// Everything printed is the backend's (src/data/swacPassingGrid2026W8.json, from
// 999-frontendfeedback/10 27). Nothing is computed except display arithmetic:
// completion percentage from a cell's shipped counts, for the shading.
//
// What the grid can't place (the file's logging notes): every interception is
// uncharted, so cells never print INT (the team's INT total is complete); and some
// crews don't spot incompletions, so a team with 15%+ of its throws uncharted is
// marked "charted N%" and its rates (shading, success rate) are drawn muted. Counts
// (yards, completions, TD) stay at full strength. `pal` is the recap palette, so the
// poster follows Light / Night.
// ─────────────────────────────────────────────────────────────────────────────

export const PG_META = PG.meta;
const DEPTHS = [["deep", "Deep", "13+ yds"], ["medium", "Med", "4–12 yds"], ["short", "Short", "<4 yds"]];
const DIRS = [["left", "Left"], ["middle", "Middle"], ["right", "Right"]];
const BIASED_AT = 0.15; // uncharted share at which a team's rates are muted
const MIN_CELL = 5; // fewer attempts than this: no shading
const SECOND_PASSER_AT = 20;

const RANKS = standardRanks(PG.teams);
const TEAMS = [...PG.teams].sort((a, b) => b.totals.yards - a.totals.yards);
const cellOf = (team, depth, dir) => team.grid.find((c) => c.depth === depth && c.direction === dir);
const cmpOf = (c) => (c && c.attempts >= MIN_CELL ? c.completions / c.attempts : null);

// The completion-percentage range across every cell with a sample, so one scale serves all 12 grids.
const CMPS = TEAMS.flatMap((t) => t.grid.map(cmpOf)).filter((v) => v != null);
const CMP_MIN = Math.min(...CMPS);
const CMP_MAX = Math.max(...CMPS);

// The colour a team's grid is shaded in: its primary, unless that is pure black (ASU,
// UAPB), which would not show; then its secondary. The card's top border uses teamAccent,
// which also skips dark navy and maroon (JSU, AAMU) for white; the grid keeps those.
const shadeRgb = (id) => {
  const m = teamMeta(id)?.colors ?? {};
  const dark = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).reduce((a, b) => a + b, 0) / 3 < 16;
  const hex = !m.primary ? "#E53E3E" : dark(m.primary) && m.secondary ? m.secondary : m.primary;
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
};

const LEAGUE = leagueOf(PG.teams);

// One cell of the 3x3, in two rows: yards and success rate (both large), then
// completions/attempts and TD. What each number is lives in the key under the grid.
const GridCell = ({ pal, c, biased, rgb }) => {
  const fg = fgOf(pal);
  const cmp = cmpOf(c);
  const t = cmp == null ? 0 : (cmp - CMP_MIN) / (CMP_MAX - CMP_MIN || 1);
  // Shaded by completion percentage in the team's colour; a team whose throws are unspotted gets a fainter shade.
  const alpha = cmp == null ? 0 : (0.12 + 0.5 * t) * (biased ? 0.45 : 1);
  const none = !c || c.attempts === 0;
  return (
    <Flex position="relative" direction="column" justify="center" gap="5px" minW={0} h="70px" px="10px" pb="4px" borderRadius="8px" overflow="hidden" bg={none ? fg(0.04) : `rgba(${rgb}, ${alpha || 0.04})`}>
      {none ? (
        <Text fontSize="16px" color={fg(0.3)} fontWeight="900">—</Text>
      ) : (
        <>
          <Flex align="baseline" justify="space-between" gap="6px">
            <Text fontSize="23px" fontWeight="950" lineHeight={1} {...tab}>{int(c.yards)}</Text>
            <Text fontSize="19px" fontWeight="950" lineHeight={1} color={successInk(pal)} opacity={biased ? 0.55 : 1} {...tab}>{pct(c.success_rate)}</Text>
          </Flex>
          <Text fontSize="12px" fontWeight="800" color={fg(0.72)} lineHeight={1} whiteSpace="nowrap" {...tab}>
            {c.completions}/{c.attempts}
            {c.touchdowns ? <Box as="span" color={tdInk(pal)} fontWeight="900">{` · ${c.touchdowns} TD`}</Box> : null}
          </Text>
          <AirYacBar pal={pal} c={c} rgb={rgb} />
        </>
      )}
    </Flex>
  );
};

// The cell's yards split along its bottom edge: air yards in the team colour, yards
// after the catch in the light ink. Negative air yards (catches behind the line) draw as 0.
const AirYacBar = ({ pal, c, rgb }) => {
  const air = Math.max(0, Number(c.air_yards) || 0);
  const yac = Math.max(0, Number(c.yac) || 0);
  if (!air && !yac) return null;
  return (
    <Flex position="absolute" left={0} right={0} bottom={0} h="5px">
      <Box flex={air} bg={`rgba(${rgb}, 1)`} />
      <Box flex={yac} bg={fgOf(pal)(0.55)} />
    </Flex>
  );
};

const TeamCard = ({ pal, t }) => {
  const fg = fgOf(pal);
  const biased = t.logging.uncharted_share >= BIASED_AT;
  const r = RANKS[t.team_id];
  const passers = t.passers.filter((p, i) => i === 0 || p.attempts >= SECOND_PASSER_AT).slice(0, 2);
  const label = { fontSize: "10px", color: fg(0.55), textAlign: "center", ...caps };
  return (
    <Flex direction="column" bg={pal.panel} px="14px" pt="12px" pb="12px" minW={0} gap="10px" style={{ borderTop: `4px solid ${teamAccent(t.team_id)}` }}>
      <Flex align="center" justify="space-between" gap="10px">
        <Flex align="center" gap="9px" minW={0}>
          <Image src={teamLogo(t.team_id)} alt="" w="30px" h="30px" objectFit="contain" flexShrink={0} />
          <Text fontSize="24px" fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} whiteSpace="nowrap">{shortOf(t.team_id)}</Text>
        </Flex>
        <Flex align="baseline" gap="7px" flexShrink={0}>
          <Text fontSize="32px" fontWeight="950" fontStyle="italic" color={pal.orange} lineHeight={0.95} letterSpacing="-0.03em" {...tab}>{int(t.totals.yards)}</Text>
          <Text fontSize="13px" fontWeight="900" color={rankInk(r.yards, pal)}>#{r.yards}</Text>
        </Flex>
      </Flex>

      <Grid templateColumns="repeat(5, minmax(0, 1fr))" gap="6px">
        <Stat pal={pal} size={18} label="TD" value={t.totals.touchdowns} rank={r.touchdowns} ink={tdInk(pal)} />
        <Stat pal={pal} size={18} label="INT" value={t.totals.interceptions} rank={r.interceptions} />
        <Stat pal={pal} size={18} label="Success" value={pct(t.totals.success_rate)} rank={r.success_rate} ink={successInk(pal)} />
        <Stat pal={pal} size={18} label="EPA / db" value={epa(t.totals.epa_per_dropback)} rank={r.epa_per_dropback} />
        <Stat pal={pal} size={18} label="aDOT" value={one(t.air_and_yac?.air_yards_per_attempt?.value)} />
      </Grid>

      <Box>
        <Grid templateColumns="54px repeat(3, minmax(0, 1fr))" gap="4px" mb="4px" alignItems="end">
          <Text fontSize="9px" color={fg(0.45)} {...caps}>Air yds</Text>
          {DIRS.map(([k, name]) => <Text key={k} {...label}>{name}</Text>)}
        </Grid>
        <Grid templateColumns="54px repeat(3, minmax(0, 1fr))" gap="4px" alignItems="center">
          {DEPTHS.flatMap(([depth, dname, range]) => [
            <Box key={`${depth}-l`}>
              <Text fontSize="11px" color={fg(0.8)} lineHeight={1.1} {...caps}>{dname}</Text>
              <Text fontSize="9px" color={fg(0.5)} lineHeight={1.2} fontWeight="800" whiteSpace="nowrap">{range}</Text>
            </Box>,
            ...DIRS.map(([dir]) => <GridCell key={`${depth}-${dir}`} pal={pal} c={cellOf(t, depth, dir)} biased={biased} rgb={shadeRgb(t.team_id)} />),
          ])}
        </Grid>
        <Flex mt="6px" align="center" justify="space-between" gap="8px">
          <Text fontSize="9px" color={fg(0.5)} {...caps}>
            Yards · <Box as="span" color={successInk(pal)}>success rate</Box> · comp/att · <Box as="span" color={tdInk(pal)}>TD</Box>
            {" · "}<Box as="span" color={`rgba(${shadeRgb(t.team_id)}, 1)`}>air</Box> | <Box as="span" color={fg(0.75)}>after catch</Box>
          </Text>
          {biased && <Text fontSize="9px" color={pal.orange} {...caps}>Charted {Math.round((1 - t.logging.uncharted_share) * 100)}%</Text>}
        </Flex>
      </Box>

      <Box borderTop={`1px solid ${fg(0.1)}`} pt="2px">
        {passers.map((p, i) => (
          <Grid
            key={`${p.player_id}-${p.name}`}
            templateColumns="minmax(0, 1.7fr) repeat(4, auto)"
            columnGap="12px"
            alignItems="baseline"
            py="6px"
            borderTop={i ? `1px solid ${fg(0.08)}` : "none"}
          >
            <Text fontSize="15px" fontWeight="950" lineHeight={1.2} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{person(p.name)}</Text>
            {[
              [`${p.completions}/${p.attempts}`, "", undefined],
              [int(p.yards), "yds", undefined],
              [p.touchdowns, "TD", tdInk(pal)],
              [p.interceptions, "INT", undefined],
            ].map(([value, unit, ink], k) => (
              <Text key={k} fontSize="15px" fontWeight="950" lineHeight={1.2} color={ink} textAlign="right" whiteSpace="nowrap" {...tab}>
                {value}{unit && <Box as="span" ml="3px" fontSize="9px" color={fg(0.5)} {...caps}>{unit}</Box>}
              </Text>
            ))}
          </Grid>
        ))}
      </Box>
    </Flex>
  );
};

// ── Simple version: header line and a yards-only grid, no key, no passers ─────

// A yards-only cell, shaded by completion percentage like the deluxe grid.
const SimpleCell = ({ pal, c, biased, rgb }) => {
  const fg = fgOf(pal);
  const cmp = cmpOf(c);
  const t = cmp == null ? 0 : (cmp - CMP_MIN) / (CMP_MAX - CMP_MIN || 1);
  const alpha = cmp == null ? 0 : (0.12 + 0.5 * t) * (biased ? 0.45 : 1);
  const none = !c || c.attempts === 0;
  return (
    <Flex align="center" justify="center" minW={0} h="52px" borderRadius="8px" bg={none ? fg(0.04) : `rgba(${rgb}, ${alpha || 0.04})`}>
      <Text fontSize={none ? "16px" : "24px"} fontWeight="950" color={none ? fg(0.3) : pal.ink} lineHeight={1} {...tab}>{none ? "—" : int(c.yards)}</Text>
    </Flex>
  );
};

const SimpleCard = ({ pal, t }) => {
  const fg = fgOf(pal);
  const biased = t.logging.uncharted_share >= BIASED_AT;
  const label = { fontSize: "10px", color: fg(0.55), textAlign: "center", ...caps };
  const small = (value, unit, ink) => (
    <Text fontSize="17px" fontWeight="950" lineHeight={1} color={ink} whiteSpace="nowrap" {...tab}>
      {value}<Box as="span" ml="3px" fontSize="9px" color={fg(0.5)} {...caps}>{unit}</Box>
    </Text>
  );
  return (
    <Flex direction="column" bg={pal.panel} px="14px" pt="12px" pb="14px" minW={0} gap="10px" style={{ borderTop: `4px solid ${teamAccent(t.team_id)}` }}>
      <Flex align="center" justify="space-between" gap="10px">
        <Flex align="center" gap="9px" minW={0}>
          <Image src={teamLogo(t.team_id)} alt="" w="30px" h="30px" objectFit="contain" flexShrink={0} />
          <Text fontSize="24px" fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} whiteSpace="nowrap">{shortOf(t.team_id)}</Text>
        </Flex>
        <Flex align="baseline" gap="12px" flexShrink={0}>
          <Text fontSize="30px" fontWeight="950" fontStyle="italic" color={pal.orange} lineHeight={0.95} letterSpacing="-0.03em" {...tab}>
            {int(t.totals.yards)}<Box as="span" ml="3px" fontSize="10px" fontStyle="normal" color={fg(0.5)} {...caps}>yds</Box>
          </Text>
          <Text fontSize="13px" fontWeight="900" color={rankInk(RANKS[t.team_id].yards, pal)} ml="-6px">#{RANKS[t.team_id].yards}</Text>
          {small(`${t.totals.completions}/${t.totals.attempts}`, "c/a")}
          {small(t.totals.touchdowns, "TD", tdInk(pal))}
        </Flex>
      </Flex>
      <Box>
        <Grid templateColumns="48px repeat(3, minmax(0, 1fr))" gap="4px" mb="4px" alignItems="end">
          <Box />
          {DIRS.map(([k, name]) => <Text key={k} {...label}>{name}</Text>)}
        </Grid>
        <Grid templateColumns="48px repeat(3, minmax(0, 1fr))" gap="4px" alignItems="center">
          {DEPTHS.flatMap(([depth, dname, range]) => [
            <Box key={`${depth}-l`}>
              <Text fontSize="11px" color={fg(0.8)} lineHeight={1.1} {...caps}>{dname}</Text>
              <Text fontSize="9px" color={fg(0.5)} lineHeight={1.2} fontWeight="800" whiteSpace="nowrap">{range}</Text>
            </Box>,
            ...DIRS.map(([dir]) => <SimpleCell key={`${depth}-${dir}`} pal={pal} c={cellOf(t, depth, dir)} biased={biased} rgb={shadeRgb(t.team_id)} />),
          ])}
        </Grid>
      </Box>
    </Flex>
  );
};

// The poster frame; `Card` picks the version (SimpleCard or TeamCard, the deluxe one).
const PassingGridPoster = ({ pal, innerRef, Card = TeamCard }) => {
  const fg = fgOf(pal);
  return (
    <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={pal.bg} color={pal.ink} px="56px" pt="36px" pb="44px" gap="18px" overflow="hidden">
      <Flex align="center" justify="space-between">
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
        <Text fontSize="18px" color={pal.orange} {...caps}>{PG_META.season} · {LEAGUE} games · Through Week {PG_META.through_week}</Text>
      </Flex>
      <Text fontSize="78px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.88} letterSpacing="-0.04em" whiteSpace="nowrap">
        The <Box as="span" color={pal.brand}>passing grid</Box>
      </Text>
      <Box h="1px" bg={fg(0.12)} />
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="14px">
        {TEAMS.map((t) => <Card key={t.team_id} pal={pal} t={t} />)}
      </Grid>
    </Flex>
  );
};

const SimplePoster = (props) => <PassingGridPoster {...props} Card={SimpleCard} />;
const DeluxePoster = (props) => <PassingGridPoster {...props} Card={TeamCard} />;

export const PASSING_POSTERS = [
  { id: "simple", chip: "Simple", Poster: SimplePoster },
  { id: "grid", chip: "Deluxe", Poster: DeluxePoster },
];
