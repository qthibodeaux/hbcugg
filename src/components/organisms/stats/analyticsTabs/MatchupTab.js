import { LEAGUE_ID, MatchupPicker } from "../MatchupPicker";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { fmt, RankChip, Kicker, Section, POSITIVE, NEGATIVE, buildRanks, Radar } from "./AnalyticsPrimitives";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MATCHUP_FIELDS, fmtMatchup, TAPE_GROUPS, matchupTable, HEAD_TO_HEAD_ROWS } from "../../../../pages/analytics/matchupMetrics";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";

// Existing implementation extracted along responsibility boundaries.

const LEAGUE_IDENTITY = {
  id: LEAGUE_ID,
  name: "League Average",
  short: "LG AVG",
  logo: null,
  primary: "#A855F7",
  secondary: "#E9D5FF",
  conference: null,
  division: null,
};

const leagueSeasonRow = (hub, season) => {
  const rows = Object.values(hub.teams ?? {}).map((t) => t.seasons?.[season]).filter(Boolean);
  if (!rows.length) return null;
  const mean = (get) => {
    const vals = rows.map(get).filter(Number.isFinite);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : undefined;
  };
  const fields = new Set(rows.flatMap((r) => Object.keys(r.metrics ?? {})));
  const metrics = {}, percentiles = {};
  fields.forEach((f) => {
    metrics[f] = mean((r) => r.metrics?.[f]);
    percentiles[f] = 50;
  });
  return { metrics, percentiles, rating: mean((r) => r.rating), rating_rank: null, record: null };
};

const sideOf = (base, side) => `${side === "defense" ? "d" : "o"}_${base}`;

const MatchupRow = ({ metric, a, b, ranks, total }) => {
  const aWins = (a.pct ?? 0) >= (b.pct ?? 0);
  return (
    <Box>
      <Flex align="center" justify="space-between" gap={2} mb={1}>
        <Flex align="center" gap={1.5} w="30%" minW={0}>
          <Text fontSize="11px" fontWeight="900" color={aWins ? "text.primary" : "text.muted"} fontVariantNumeric="tabular-nums">
            {fmt(a.value, metric.unit)}
          </Text>
          <RankChip rank={ranks?.[a.field]?.[a.id]} total={total} />
        </Flex>
        <Kicker color="text.muted" flex="1" textAlign="center">{metric.label}</Kicker>
        <Flex align="center" gap={1.5} w="30%" minW={0} justify="flex-end">
          <RankChip rank={ranks?.[b.field]?.[b.id]} total={total} />
          <Text fontSize="11px" fontWeight="900" color={!aWins ? "text.primary" : "text.muted"} fontVariantNumeric="tabular-nums">
            {fmt(b.value, metric.unit)}
          </Text>
        </Flex>
      </Flex>
      <Flex gap="2px" h="7px">
        <Flex flex="1" justify="flex-end">
          <Box h="100%" borderRadius="sm" bg={aWins ? a.color : "line.strong"} style={{ width: `${a.pct ?? 0}%` }} />
        </Flex>
        <Flex flex="1">
          <Box h="100%" borderRadius="sm" bg={!aWins ? b.color : "line.strong"} style={{ width: `${b.pct ?? 0}%` }} />
        </Flex>
      </Flex>
    </Box>
  );
};

const PreviousMeetings = ({ games, idA, idB }) => {
  const meetings = useMemo(() => {
    if (!idA || !idB || idA.id === LEAGUE_ID || idB.id === LEAGUE_ID) return [];
    const pair = new Set([idA.id, idB.id]);
    return games
      .filter((g) => pair.has(g.home_team_id) && pair.has(g.away_team_id) && g.home_team_id !== g.away_team_id)
      .filter((g) => Number.isFinite(g.home_score) && Number.isFinite(g.away_score))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [games, idA, idB]);

  if (!idA || !idB) return null;
  const record = meetings.reduce(
    (acc, g) => {
      const homeWon = g.home_score > g.away_score;
      const winner = homeWon ? g.home_team_id : g.away_team_id;
      if (g.home_score === g.away_score) acc.t += 1;
      else if (winner === idA.id) acc.a += 1;
      else acc.b += 1;
      return acc;
    },
    { a: 0, b: 0, t: 0 },
  );

  return (
    <Section
      title="Previous meetings"
      right={
        <Kicker color="text.secondary">
          {meetings.length ? `${idA.short} ${record.a}–${record.b}${record.t ? `–${record.t}` : ""} ${idB.short}` : "None on file"}
        </Kicker>
      }
    >
      {meetings.length === 0 ? (
        <Text fontSize="sm" color="text.muted" fontStyle="italic">
          {idA.id === LEAGUE_ID || idB.id === LEAGUE_ID
            ? "Pick two teams to see their head-to-head."
            : "These two have not met in a parsed season (2019–2026)."}
        </Text>
      ) : (
        <Flex direction="column">
          {meetings.map((g) => {
            const aHome = g.home_team_id === idA.id;
            const aScore = aHome ? g.home_score : g.away_score;
            const bScore = aHome ? g.away_score : g.home_score;
            const aWon = aScore > bScore;
            return (
              <Flex key={g.game_stem} as={Link} to={`/game/${g.game_stem}`} align="center" gap={3}
                py={2.5} borderBottom="1px solid" borderColor="line.subtle"
                color="text.primary" _hover={{ bg: "line.subtle" }}>
                <Box w="4.5rem" flexShrink={0}>
                  <Text fontSize="11px" fontWeight="900" color="text.muted" fontVariantNumeric="tabular-nums">{g.date}</Text>
                </Box>
                <Flex flex="1" minW={0} align="center" gap={2}>
                  <Text fontSize="11px" fontWeight="800" color="text.secondary" lineClamp={1}>
                    {aHome ? `${idB.short} at ${idA.short}` : `${idA.short} at ${idB.short}`}
                  </Text>
                </Flex>
                <Flex align="center" gap={2} flexShrink={0}>
                  <Text fontSize="12px" fontWeight="900" color={aWon ? "text.primary" : "text.muted"} fontVariantNumeric="tabular-nums">{aScore}</Text>
                  <Text fontSize="10px" color="text.muted">–</Text>
                  <Text fontSize="12px" fontWeight="900" color={!aWon ? "text.primary" : "text.muted"} fontVariantNumeric="tabular-nums">{bScore}</Text>
                </Flex>
                <Box w="3rem" flexShrink={0} textAlign="right">
                  <Kicker color={aWon ? (idA.primary ?? POSITIVE) : (idB.primary ?? NEGATIVE)}>{aWon ? idA.short : idB.short}</Kicker>
                </Box>
              </Flex>
            );
          })}
        </Flex>
      )}
    </Section>
  );
};

const TapeLine = ({ label, value, rank, total, head }) => (
  <Flex align="center" gap={2} py={head ? 1 : 0.5} pl={head ? 0 : 3}>
    <Text
      flex="1" minW={0} lineClamp={1}
      fontSize={head ? "10px" : "9px"} fontWeight={head ? "900" : "800"}
      color={head ? "text.primary" : "text.muted"}
      textTransform={head ? "uppercase" : "none"} letterSpacing={head ? "0.05em" : "0"}
    >
      {label}
    </Text>
    <Text
      fontSize={head ? "11px" : "10px"} fontWeight="900" fontVariantNumeric="tabular-nums"
      color={head ? "text.primary" : "text.secondary"} flexShrink={0}
    >
      {value}
    </Text>
    <Box w="2.2rem" flexShrink={0} display="flex" justifyContent="flex-end">
      <RankChip rank={rank} total={total} />
    </Box>
  </Flex>
);

const TapeGroup = ({ group, vals, ranks, id, color, total }) => {
  const unitOf = (key) => MATCHUP_FIELDS[key]?.unit ?? "num2";
  return (
    <Box mb={2.5} borderLeft="2px solid" borderColor={color} pl={2}>
      <TapeLine
        head
        label={group.label}
        value={fmtMatchup(vals?.[group.key], unitOf(group.key), group.signed)}
        rank={ranks?.[group.key]?.[id]}
        total={total}
      />
      {group.children.map((c) => (
        <TapeLine
          key={c.key}
          label={c.label}
          value={fmtMatchup(vals?.[c.key], unitOf(c.key), false)}
          rank={ranks?.[c.key]?.[id]}
          total={total}
        />
      ))}
    </Box>
  );
};

const TeamTapeColumn = ({ T, vals, ranks, color, total, season }) => (
  <Section
    title={T.identity.short}
    right={<Kicker color={color}>{T.row.record?.record ?? season}</Kicker>}
    flex="1" minW={0}
  >
    <Flex align="center" gap={2.5} mb={3} pb={3} borderBottom="1px solid" borderColor="line">
      {T.identity.logo ? (
        <Image src={T.identity.logo} alt="" w="clamp(2rem, 4vw, 3rem)" h="clamp(2rem, 4vw, 3rem)" objectFit="contain" flexShrink={0} />
      ) : (
        <Box w="clamp(2rem, 4vw, 3rem)" h="clamp(2rem, 4vw, 3rem)" borderRadius="md" bg={color} flexShrink={0} />
      )}
      <Box minW={0} flex="1">
        <Text
          fontSize="clamp(0.85rem, 1.5vw, 1.15rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase"
          letterSpacing="-0.03em" lineHeight={0.95} color="text.primary" lineClamp={2}
        >
          {T.identity.name}
        </Text>
        <Kicker color="text.muted" mt={1}>
          {T.row.record?.conference_record ? `${T.row.record.conference_record} conf` : T.identity.conference ?? ""}
        </Kicker>
      </Box>
      <Flex direction="column" align="flex-end" flexShrink={0}>
        <Text fontSize="clamp(1.1rem, 2.2vw, 1.9rem)" fontWeight="900" lineHeight={0.9} letterSpacing="-0.04em" color="text.primary" fontVariantNumeric="tabular-nums">
          {fmt(T.row.rating, "num")}
        </Text>
        <Flex align="center" gap={1} mt={1}>
          <Kicker color="text.muted">Glory</Kicker>
          <RankChip rank={T.row.rating_rank} total={total} />
        </Flex>
      </Flex>
    </Flex>
    {TAPE_GROUPS.map((g) => (
      <TapeGroup key={g.key} group={g} vals={vals} ranks={ranks} id={T.identity.id} color={color} total={total} />
    ))}
  </Section>
);

const CompareRow = ({ row, leftKey, rightKey, left, right, leftColor, rightColor, ranks, total }) => {
  const lr = ranks?.[leftKey]?.[left.id];
  const rr = ranks?.[rightKey]?.[right.id];
  const leftWins = Number.isFinite(lr) && Number.isFinite(rr) ? lr <= rr : false;
  const rightWins = Number.isFinite(lr) && Number.isFinite(rr) ? rr < lr : false;
  const Cell = ({ v, unit, color, win, side }) => (
    <Flex flex="1" minW={0} justify={side === "left" ? "flex-end" : "flex-start"} px={2} py={1} borderRadius="sm" bg={win ? color : "transparent"}>
      <Text fontSize="11px" fontWeight="900" color={win ? "text.primary" : "text.muted"} fontVariantNumeric="tabular-nums">
        {fmtMatchup(v, unit, false)}
      </Text>
    </Flex>
  );
  return (
    <Flex align="center" gap={1.5} py={1}>
      <Box w="2.4rem" flexShrink={0}><RankChip rank={lr} total={total} /></Box>
      <Cell v={left.vals?.[leftKey]} unit={MATCHUP_FIELDS[leftKey]?.unit} color={leftColor} win={leftWins} side="left" />
      <Text
        w="42%" minW="5rem" flexShrink={0} textAlign="center" lineClamp={2}
        fontSize="9px" fontWeight="900" color="text.secondary" textTransform="uppercase" letterSpacing="0.07em"
      >
        {row.label}
      </Text>
      <Cell v={right.vals?.[rightKey]} unit={MATCHUP_FIELDS[rightKey]?.unit} color={rightColor} win={rightWins} side="right" />
      <Flex w="2.4rem" flexShrink={0} justify="flex-end"><RankChip rank={rr} total={total} /></Flex>
    </Flex>
  );
};

const MatchupHeading = ({ left, right, leftSide, leftColor, rightColor }) => (
  <Flex align="center" justify="center" gap={2} mb={2} wrap="wrap">
    {left.identity.logo && <Image src={left.identity.logo} alt="" w="18px" h="18px" objectFit="contain" />}
    <Text fontSize="clamp(0.8rem, 1.4vw, 1.05rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" color={leftColor}>
      {left.identity.short} {leftSide === "off" ? "Offense" : "Defense"}
    </Text>
    <Text fontSize="10px" fontWeight="900" color="text.muted" textTransform="uppercase">vs</Text>
    {right.identity.logo && <Image src={right.identity.logo} alt="" w="18px" h="18px" objectFit="contain" />}
    <Text fontSize="clamp(0.8rem, 1.4vw, 1.05rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" color={rightColor}>
      {right.identity.short} {leftSide === "off" ? "Defense" : "Offense"}
    </Text>
  </Flex>
);

export const MatchupTab = ({ hub, season, teamA, setTeamA, teamB, setTeamB, games = [] }) => {
  const { isMobile: mu } = useLayoutDensity();
  const [view, setView] = useState("bars");

  const league = useMemo(() => leagueSeasonRow(hub, season), [hub, season]);
  const pickerTeams = useMemo(
    () => Object.values(hub.teams ?? {}).map((t) => t.identity).sort((x, y) => x.name.localeCompare(y.name)),
    [hub.teams],
  );
  // MOCK: the tale-of-the-tape and head-to-head fields are stand-ins until the
  // backend ships them. See src/pages/analytics/matchupMetrics.js.
  const tape = useMemo(() => matchupTable(hub, season), [hub, season]);

  const resolve = (id) =>
    id === LEAGUE_ID
      ? { identity: LEAGUE_IDENTITY, row: league, vals: tape.league }
      : {
          identity: hub.teams[id]?.identity ?? null,
          row: hub.teams[id]?.seasons?.[season] ?? null,
          vals: tape.values[id],
        };
  const A = resolve(teamA);
  const B = resolve(teamB);

  // The bars / radar section runs on the real unit metrics from the hub.
  const offBases = useMemo(
    () => (hub.units ?? []).filter((u) => u.available && u.side === "offense").flatMap((u) => u.metrics),
    [hub.units],
  );
  const defBases = useMemo(
    () => (hub.units ?? []).filter((u) => u.available && u.side === "defense").flatMap((u) => u.metrics),
    [hub.units],
  );
  const bases = useMemo(
    () => [...new Set(offBases)].filter((m) => defBases.includes(m)),
    [offBases, defBases],
  );
  const ranks = useMemo(
    () => buildRanks(hub, season, bases.flatMap((m) => [sideOf(m, "offense"), sideOf(m, "defense")])),
    [hub, season, bases],
  );
  const total = Object.keys(hub.teams ?? {}).length;

  if (!A.row || !B.row || !A.identity || !B.identity) {
    return (
      <Flex direction="column" gap={4}>
        {mu ? (
          <MatchupPicker teams={pickerTeams} teamA={teamA} teamB={teamB} setTeamA={setTeamA} setTeamB={setTeamB} mobile={mu} colorA={A.identity?.primary} colorB={B.identity?.primary} />
        ) : (
        <Section title="Pick the matchup">
          <MatchupPicker teams={pickerTeams} teamA={teamA} teamB={teamB} setTeamA={setTeamA} setTeamB={setTeamB} mobile={mu}
            colorA={A.identity?.primary} colorB={B.identity?.primary} />
        </Section>
        )}
        <Section title="Matchup"><Text fontSize="sm" color="text.muted">Pick two teams with {season} data.</Text></Section>
      </Flex>
    );
  }

  const colorA = A.identity.primary ?? "#A855F7";
  const colorB = B.identity.primary ?? "#4299E1";

  // One block = A's unit against the B unit it faces. leftSide "off" is A's
  // offense against B's defense; "def" is the reverse.
  const unitBlock = (leftSide) => {
    const lPrefix = leftSide === "off" ? "offense" : "defense";
    const rPrefix = leftSide === "off" ? "defense" : "offense";
    const metrics = bases.map((m) => ({
      base: m,
      label: hub.metrics[m]?.short ?? m,
      unit: hub.metrics[m]?.unit ?? "num",
    }));
    const side = (T, color, prefix) =>
      metrics.map((m) => {
        const field = sideOf(m.base, prefix);
        return {
          id: T.identity.id, color, field,
          value: T.row.metrics?.[field],
          pct: T.row.percentiles?.[field],
        };
      });
    return {
      leftSide,
      metrics,
      left: side(A, colorA, lPrefix),
      right: side(B, colorB, rPrefix),
    };
  };
  const blocks = [unitBlock("off"), unitBlock("def")];

  const ViewButton = ({ id, children }) => (
    <Box as="button" onClick={() => setView(id)} px={3} py={1.5} borderRadius="md"
      fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em"
      bg={view === id ? "brand.500" : "line"} color={view === id ? "white" : "text.muted"}
      _hover={{ bg: view === id ? "brand.500" : "line.strong" }}>
      {children}
    </Box>
  );

  return (
    <Flex direction="column" gap={mu ? 0 : 4}>
      {mu ? (
        <MatchupPicker teams={pickerTeams} teamA={teamA} teamB={teamB} setTeamA={setTeamA} setTeamB={setTeamB} mobile={mu} colorA={colorA} colorB={colorB} />
      ) : (
      <Section title="Pick the matchup">
        <MatchupPicker teams={pickerTeams} teamA={teamA} teamB={teamB} setTeamA={setTeamA} setTeamB={setTeamB} mobile={mu}
          colorA={colorA} colorB={colorB} />
      </Section>
      )}

      <Section
        title="Unit matchups"
        right={<Flex gap={2}><ViewButton id="bars">Bars</ViewButton><ViewButton id="spider">Spider</ViewButton></Flex>}
      >
        <Flex gap={6} direction={{ base: "column", lg: "row" }} align="stretch">
          {blocks.map((blk) => (
            <Box key={blk.leftSide} flex="1" minW={0}>
              <MatchupHeading left={A} right={B} leftSide={blk.leftSide} leftColor={colorA} rightColor={colorB} />
              {view === "bars" ? (
                <Flex direction="column" gap={2.5}>
                  {blk.metrics.map((m, i) => (
                    <MatchupRow key={m.base} metric={m} a={blk.left[i]} b={blk.right[i]} ranks={ranks} total={total} />
                  ))}
                </Flex>
              ) : (
                <Radar
                  axes={blk.metrics.map((m) => ({ key: m.base, label: m.label }))}
                  series={[
                    { label: A.identity.short, color: colorA, values: blk.left.map((v) => v.pct) },
                    { label: B.identity.short, color: colorB, values: blk.right.map((v) => v.pct) },
                  ]}
                  size={300}
                />
              )}
            </Box>
          ))}
        </Flex>
      </Section>

      {/* Tale of the tape: team A, the head to head, team B. */}
      <Flex gap={4} direction={{ base: "column", xl: "row" }} align="stretch">
        <TeamTapeColumn T={A} vals={A.vals} ranks={tape.ranks} color={colorA} total={tape.total} season={season} />

        <Box flex="1.6" minW={0}>
          <Section title="Head to head" right={<Kicker color="text.muted">Rank of {tape.total}</Kicker>}>
            {["off", "def"].map((leftSide, bi) => (
              <Box key={leftSide} mt={bi ? 5 : 0}>
                <MatchupHeading left={A} right={B} leftSide={leftSide} leftColor={colorA} rightColor={colorB} />
                {HEAD_TO_HEAD_ROWS.map((row) => (
                  <CompareRow
                    key={`${leftSide}-${row.label}`}
                    row={row}
                    leftKey={leftSide === "off" ? row.off : row.def}
                    rightKey={leftSide === "off" ? row.def : row.off}
                    left={{ id: A.identity.id, vals: A.vals }}
                    right={{ id: B.identity.id, vals: B.vals }}
                    leftColor={colorA}
                    rightColor={colorB}
                    ranks={tape.ranks}
                    total={tape.total}
                  />
                ))}
              </Box>
            ))}
          </Section>
        </Box>

        <TeamTapeColumn T={B} vals={B.vals} ranks={tape.ranks} color={colorB} total={tape.total} season={season} />
      </Flex>

      <PreviousMeetings games={games} idA={A.identity} idB={B.identity} />
    </Flex>
  );
};
