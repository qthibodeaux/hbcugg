import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { buildMatchupSheet, shortDate } from "../../../utils/gamePreview";
import { teamAccent, teamLogo, teamMascot, teamMeta, teamName, teamShort, withAlpha } from "../export/exportData";

/**
 * PreviewTables
 *
 * PHILOSOPHY:
 *   Purpose: The body of a game preview — read like a table, not a stack of
 *   cards. One continuous sheet: four unit columns (away offense, home defense,
 *   home offense, away defense) on shared rows, then the history of the game.
 *
 * CONTENT TIERS:
 *   Essential: the four unit columns with value and league rank.
 *   Nice-to-have: previous meetings, earlier editions of the named classic.
 *   Fluff: team-color rules under the column heads.
 *
 * SIZING:
 *   fr tracks and clamp() type; no fixed layout px.
 *
 * DATA NOTE:
 *   Values come from matchupTable, which is a mock until the stats export ships.
 */

const Eyebrow = ({ children }) => (
  <Flex align="center" gap={2} mb={3}>
    <Box w="6px" h="6px" borderRadius="full" bg="brand.500" />
    <Text textStyle="kicker" color="text.secondary" fontSize="11px" letterSpacing="0.22em">{children}</Text>
  </Flex>
);

// ── Matchup sheet ────────────────────────────────────────────────────────────
// Three zones read left to right: the away team's season, two head-to-head
// tables, the home team's season. Ruled rows, tabular figures, a rank chip on
// every number — green for a top-third rank, red for bottom-third, quiet in the
// middle. No boxes, no bars: the table is the design.

const TONE = {
  good: { bg: "rgba(34,139,84,0.88)", color: "#F4F4F5" },
  bad: { bg: "rgba(200,60,60,0.88)", color: "#F4F4F5" },
  mid: { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)" },
  none: { bg: "transparent", color: "rgba(255,255,255,0.4)" },
};

const Chip = ({ rank, tone }) => {
  const t = TONE[tone] ?? TONE.none;
  return (
    <Box bg={t.bg} borderRadius="sm" minW="2.5em" px="5px" py="2px" textAlign="center" flexShrink={0}>
      <Text fontSize="clamp(0.6rem, 0.78vw, 0.72rem)" fontWeight="900" color={t.color} lineHeight={1.2}>{rank ? rank : "—"}</Text>
    </Box>
  );
};

const Value = ({ children, dim }) => (
  <Text fontSize="clamp(0.9rem, 1.25vw, 1.12rem)" fontWeight="900" fontVariantNumeric="tabular-nums" color={dim ? "whiteAlpha.700" : "white"} lineHeight={1} minW="3.4em" textAlign="right">
    {children}
  </Text>
);

const RowShell = ({ children, child }) => (
  <Flex align="center" gap="clamp(0.4rem, 0.8vw, 0.7rem)" py={child ? "clamp(0.3rem, 0.55vw, 0.48rem)" : "clamp(0.45rem, 0.8vw, 0.7rem)"} borderBottom="1px solid" borderColor="whiteAlpha.100">
    {children}
  </Flex>
);

// A team's season, labels on the outside edge, numbers hugging the middle.
const TeamSeason = ({ side, mirrored }) => {
  const accent = teamAccent(side.teamId);
  return (
    <Box minW={0}>
      <Flex align="center" gap={3} pb={3} borderBottom="2px solid" borderColor={withAlpha(accent, 0.75)} direction={mirrored ? "row-reverse" : "row"}>
        <Image src={teamLogo(side.teamId)} alt="" w="clamp(2rem, 3.2vw, 2.8rem)" h="clamp(2rem, 3.2vw, 2.8rem)" objectFit="contain" flexShrink={0} />
        <Box minW={0} textAlign={mirrored ? "right" : "left"}>
          <Text fontSize="clamp(0.9rem, 1.4vw, 1.2rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase" lineHeight={1.05} lineClamp={1}>{teamName(side.teamId)}</Text>
        </Box>
      </Flex>
      {side.rows.map((r) => (
        <RowShell key={r.key} child={r.child}>
          {mirrored ? <><Chip rank={r.rank} tone={r.tone} /><Value dim={r.child}>{r.value}</Value></> : null}
          <Text
            flex={1}
            minW={0}
            pl={!mirrored && r.child ? "1.2em" : 0}
            pr={mirrored && r.child ? "1.2em" : 0}
            textAlign={mirrored ? "right" : "left"}
            fontSize={r.child ? "clamp(0.58rem, 0.75vw, 0.7rem)" : "clamp(0.66rem, 0.88vw, 0.8rem)"}
            fontWeight="900"
            color={r.child ? "whiteAlpha.500" : "white"}
            textTransform="uppercase"
            letterSpacing="0.06em"
            lineClamp={1}
          >
            {r.label}
          </Text>
          {!mirrored ? <><Value dim={r.child}>{r.value}</Value><Chip rank={r.rank} tone={r.tone} /></> : null}
        </RowShell>
      ))}
    </Box>
  );
};

const H2HTable = ({ table }) => (
  <Box minW={0}>
    <Flex align="center" justify="center" gap={2} py={2.5} bg="whiteAlpha.50" borderTop="2px solid" borderColor="whiteAlpha.200">
      <Image src={teamLogo(table.leftId)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" />
      <Text fontSize="clamp(0.62rem, 0.85vw, 0.78rem)" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">
        {teamShort(table.leftId)} {table.leftSide} <Box as="span" color="whiteAlpha.400">vs</Box> {teamShort(table.rightId)} {table.rightSide}
      </Text>
      <Image src={teamLogo(table.rightId)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" />
    </Flex>
    {table.rows.map((r) => (
      <RowShell key={r.label}>
        <Value>{r.left.value}</Value>
        <Chip rank={r.left.rank} tone={r.left.tone} />
        <Text flex={1} minW={0} textAlign="center" fontSize="clamp(0.58rem, 0.78vw, 0.72rem)" fontWeight="900" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>{r.label}</Text>
        <Chip rank={r.right.rank} tone={r.right.tone} />
        <Value>{r.right.value}</Value>
      </RowShell>
    ))}
  </Box>
);

export const MatchupSheet = ({ model }) => {
  const sheet = buildMatchupSheet(model);
  return (
    <Box color="white">
      <Eyebrow>Unit matchups</Eyebrow>
      <Box display="grid" gap="clamp(1.2rem, 2.4vw, 2.4rem)" alignItems="start" gridTemplateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1.35fr) minmax(0, 1fr)" }}>
        <TeamSeason side={sheet.left} />
        <Flex direction="column" gap="clamp(1rem, 2vw, 1.8rem)" minW={0}>
          {sheet.tables.map((t) => <H2HTable key={t.key} table={t} />)}
        </Flex>
        <TeamSeason side={sheet.right} mirrored />
      </Box>
    </Box>
  );
};

// ── History ──────────────────────────────────────────────────────────────────
// Every row is a lane across the full width: when, where, who (full name and
// mascot), and the score as the headline. A bar under the lane splits the
// points between the two teams in their colors, so the margin reads without
// doing the math. Everything here is read as the backend sent it — the series
// record, the streak, the event title, which editions exist.

const sideInfo = (s) => {
  const meta = s?.id ? teamMeta(s.id) : null;
  return {
    id: s?.id ?? null,
    name: meta ? teamName(s.id) : s?.name ?? "—",
    mascot: meta ? teamMascot(s.id) : "",
    short: meta ? teamShort(s.id) : null,
    logo: meta ? teamLogo(s.id) : null,
    accent: s?.id && meta ? teamAccent(s.id) : "#52525b",
  };
};

const TeamBlock = ({ side, won, decided, right }) => (
  <Flex align="center" gap="clamp(0.6rem, 1.2vw, 1rem)" direction={right ? "row-reverse" : "row"} minW={0}>
    {side.logo ? (
      <Image src={side.logo} alt="" w="clamp(2.4rem, 4vw, 3.6rem)" h="clamp(2.4rem, 4vw, 3.6rem)" objectFit="contain" flexShrink={0} opacity={decided && !won ? 0.6 : 1} />
    ) : (
      <Flex w="clamp(2.4rem, 4vw, 3.6rem)" h="clamp(2.4rem, 4vw, 3.6rem)" align="center" justify="center" borderRadius="md" bg="whiteAlpha.100" flexShrink={0}>
        <Text fontSize="0.9rem" fontWeight="900" color="whiteAlpha.600">{side.name.slice(0, 2).toUpperCase()}</Text>
      </Flex>
    )}
    <Box minW={0} textAlign={right ? "right" : "left"}>
      <Text fontSize="clamp(0.95rem, 1.6vw, 1.4rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1.05} color={decided && !won ? "whiteAlpha.600" : "white"} lineClamp={2}>
        {side.name}
      </Text>
      {side.mascot ? (
        <Text fontSize="clamp(0.6rem, 0.8vw, 0.74rem)" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.14em" mt="2px" lineClamp={1}>{side.mascot}</Text>
      ) : null}
    </Box>
  </Flex>
);

const MeetingLane = ({ date, venue, tag, away: awayRaw, home: homeRaw, awayScore, homeScore, stem, noResultNote }) => {
  const away = sideInfo(awayRaw);
  const home = sideInfo(homeRaw);
  const decided = awayScore != null && homeScore != null;
  const awayWon = decided && awayScore > homeScore;
  const homeWon = decided && homeScore > awayScore;
  const margin = decided ? Math.abs(awayScore - homeScore) : null;
  const winner = awayWon ? away : homeWon ? home : null;
  const total = decided ? Math.max(1, awayScore + homeScore) : 1;

  const lane = (
    <Box position="relative" borderBottom="1px solid" borderColor="whiteAlpha.100" overflow="hidden" _hover={stem ? { "& .lane-wash": { opacity: 1 } } : undefined}>
      <Box
        className="lane-wash"
        position="absolute"
        inset={0}
        opacity={0.75}
        transition="opacity 0.2s"
        pointerEvents="none"
        bg={`linear-gradient(90deg, ${withAlpha(away.accent, 0.16)} 0%, transparent 38%, transparent 62%, ${withAlpha(home.accent, 0.16)} 100%)`}
      />
      <Box
        position="relative"
        display="grid"
        alignItems="center"
        columnGap="clamp(0.75rem, 2vw, 2rem)"
        rowGap={2}
        gridTemplateColumns={{ base: "minmax(0, 1fr)", md: "minmax(7.5rem, 10rem) minmax(0, 1fr) auto minmax(0, 1fr)" }}
        px="clamp(0.5rem, 1.2vw, 1rem)"
        py="clamp(0.8rem, 1.6vw, 1.3rem)"
      >
        <Box minW={0}>
          <Text fontSize="clamp(0.7rem, 0.9vw, 0.82rem)" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.08em">{date}</Text>
          {tag ? <Text fontSize="clamp(0.55rem, 0.7vw, 0.66rem)" fontWeight="900" color="brand.300" textTransform="uppercase" letterSpacing="0.1em" mt="2px" lineClamp={1}>{tag}</Text> : null}
          {venue ? <Text fontSize="clamp(0.58rem, 0.75vw, 0.7rem)" fontWeight="700" color="whiteAlpha.500" mt="2px" lineClamp={2}>{venue}</Text> : null}
        </Box>
        <TeamBlock side={away} won={awayWon} decided={decided} />
        <Flex direction="column" align="center" gap="3px" minW="clamp(7rem, 12vw, 11rem)">
          {decided ? (
            <Flex align="baseline" justify="center" gap="clamp(0.4rem, 1vw, 0.9rem)">
              <Text fontSize="clamp(1.7rem, 3.2vw, 2.9rem)" fontWeight="900" fontStyle="italic" lineHeight={1} fontVariantNumeric="tabular-nums" color={awayWon ? "white" : "whiteAlpha.500"}>{awayScore}</Text>
              <Text fontSize="clamp(1rem, 1.6vw, 1.5rem)" fontWeight="900" color="whiteAlpha.300">–</Text>
              <Text fontSize="clamp(1.7rem, 3.2vw, 2.9rem)" fontWeight="900" fontStyle="italic" lineHeight={1} fontVariantNumeric="tabular-nums" color={homeWon ? "white" : "whiteAlpha.500"}>{homeScore}</Text>
            </Flex>
          ) : (
            <Text fontSize="clamp(1.4rem, 2.4vw, 2rem)" fontWeight="900" color="whiteAlpha.300" lineHeight={1}>—</Text>
          )}
          <Text fontSize="clamp(0.55rem, 0.72vw, 0.66rem)" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.14em" textAlign="center">
            {decided ? (winner ? `${winner.short ?? winner.name} by ${margin}` : "Tied") : noResultNote ?? "No result on file"}
          </Text>
        </Flex>
        <TeamBlock side={home} won={homeWon} decided={decided} right />
      </Box>
      {decided ? (
        <Flex position="relative" h="3px" aria-hidden="true">
          <Box w={`${(awayScore / total) * 100}%`} bg={away.accent} opacity={awayWon ? 0.95 : 0.35} />
          <Box w={`${(homeScore / total) * 100}%`} bg={home.accent} opacity={homeWon ? 0.95 : 0.35} />
        </Flex>
      ) : null}
    </Box>
  );
  return stem ? <Box as={Link} to={`/game/${stem}`} display="block" _hover={{ textDecoration: "none" }}>{lane}</Box> : lane;
};

// The series at a glance — the backend's tally and streak, printed as sent.
const SeriesStrip = ({ model }) => {
  const series = model.series;
  if (!series || !series.games) return null;
  const a = sideInfo({ id: model.away.id });
  const h = sideInfo({ id: model.home.id });
  const aWins = series.wins?.[model.away.id] ?? 0;
  const hWins = series.wins?.[model.home.id] ?? 0;
  const streak = series.current_streak;
  const streakSide = streak ? sideInfo({ id: streak.team_id }) : null;
  return (
    <Flex align="center" justify="center" gap="clamp(0.8rem, 2.4vw, 2.4rem)" py="clamp(0.9rem, 1.8vw, 1.5rem)" borderBottom="1px solid" borderColor="whiteAlpha.100" wrap="wrap">
      <Flex align="center" gap={3}>
        <Image src={a.logo} alt="" w="clamp(2rem, 3.2vw, 3rem)" h="clamp(2rem, 3.2vw, 3rem)" objectFit="contain" />
        <Text fontSize="clamp(2rem, 4.6vw, 4rem)" fontWeight="900" fontStyle="italic" lineHeight={1} color={aWins >= hWins ? "white" : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">{aWins}</Text>
      </Flex>
      <Box textAlign="center">
        <Text fontSize="clamp(0.6rem, 0.8vw, 0.74rem)" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.2em">
          Series{model.seriesFrom ? ` since ${model.seriesFrom}` : ""}
        </Text>
        <Text fontSize="clamp(0.7rem, 0.95vw, 0.85rem)" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em" mt="2px">
          {series.games} meetings{streakSide ? ` · ${streakSide.short ?? streakSide.name} ${streak.games > 1 ? `won the last ${streak.games}` : "won the last one"}` : ""}
        </Text>
      </Box>
      <Flex align="center" gap={3}>
        <Text fontSize="clamp(2rem, 4.6vw, 4rem)" fontWeight="900" fontStyle="italic" lineHeight={1} color={hWins >= aWins ? "white" : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">{hWins}</Text>
        <Image src={h.logo} alt="" w="clamp(2rem, 3.2vw, 3rem)" h="clamp(2rem, 3.2vw, 3rem)" objectFit="contain" />
      </Flex>
    </Flex>
  );
};

export const HistorySheet = ({ model }) => {
  const meetings = model.meetings.slice(0, 6);
  const history = model.eventHistory;
  const editions = history?.items.slice(0, 6) ?? [];
  if (!meetings.length && !editions.length) return null;

  return (
    <Flex direction="column" gap="clamp(1.5rem, 3vw, 2.5rem)" color="white">
      {meetings.length ? (
        <Box>
          <Eyebrow>Previous meetings</Eyebrow>
          <SeriesStrip model={model} />
          {meetings.map((g) => (
            <MeetingLane
              key={g.key}
              date={shortDate(g.date)}
              venue={g.site}
              away={{ id: g.awayId }}
              home={{ id: g.homeId }}
              awayScore={g.awayScore}
              homeScore={g.homeScore}
              stem={g.stem}
            />
          ))}
        </Box>
      ) : null}
      {editions.length ? (
        <Box>
          <Eyebrow>{history.title}</Eyebrow>
          {editions.map((e) => (
            <MeetingLane
              key={e.key}
              date={shortDate(e.date)}
              venue={e.site}
              tag={e.name}
              away={e.away}
              home={e.home}
              awayScore={e.awayScore}
              homeScore={e.homeScore}
              stem={e.stem}
              noResultNote={e.resultStatus === "cancelled" ? "Cancelled" : null}
            />
          ))}
        </Box>
      ) : null}
    </Flex>
  );
};
