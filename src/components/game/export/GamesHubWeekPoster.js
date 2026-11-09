import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ExportWordmark } from "../../molecules/export/ExportWordmark";
import { teamLogo, teamMeta } from "./exportData";
export { pickWeeks } from "../../../utils/gamesHubModel";

// ─────────────────────────────────────────────────────────────────────────────
// Games Hub week poster — a quick export: last week's results above the coming
// week's games, each as a grid of wide game cards (the poster is not bound to a
// web page, so the cards run landscape). 87.5rem wide, as tall as its rows.
//
//   result card   date · away and home, abbreviation and score (the winner at full
//                 strength, the loser muted) · the stadium and city
//   coming card   date and kickoff time · away and home · the stadium and city
//
// Abbreviations are teams.json's `shortName`; an opponent outside the 18 carries the
// backend's own short name and no logo. Everything printed is the Games Hub file's:
// the weeks come from its games (`pickWeeks`), nothing is invented. `pal` is the
// recap palette, so the poster follows Light / Night.
// ─────────────────────────────────────────────────────────────────────────────

export const POSTER_W = 1400;
const caps = { textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900" };
const tab = { fontVariantNumeric: "tabular-nums" };

/** Columns for n cards: 4 across when it fills the rows evenly, else the 3 or 5 that does. */
const colsFor = (n) => [4, 3, 5].find((c) => n % c === 0) ?? 4;

const dayLabel = (game) => {
  const d = game.date ? new Date(`${game.date}T12:00:00`) : null;
  if (!d || Number.isNaN(d.getTime())) return game.dateLabel ?? "TBD";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "");
};

const placeOf = (game) => [game.venue, game.city].filter((v) => v && v !== "TBA").join(", ") || "TBA";

const abbrOf = (team) => (team?.teamId && teamMeta(team.teamId)?.shortName) || team?.shortName || team?.name || "TBD";

const TeamRow = ({ pal, team, score, win, played }) => {
  const league = Boolean(team?.teamId && teamMeta(team.teamId));
  const dim = played && !win;
  return (
    <Flex align="center" gap="0.75rem" minW={0} opacity={dim ? 0.55 : 1}>
      <Box w="2.125rem" h="2.125rem" flexShrink={0} display="flex" alignItems="center" justifyContent="center">
        {league ? <Image src={teamLogo(team.teamId)} alt="" w="full" h="full" objectFit="contain" /> : <Box w="0.5rem" h="0.5rem" borderRadius="full" bg={`rgba(${pal.fg}, 0.3)`} />}
      </Box>
      <Text flex="1" minW={0} fontSize="1.75rem" fontWeight="950" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{abbrOf(team)}</Text>
      {played && <Text fontSize="2.25rem" fontWeight="950" lineHeight={1} {...tab}>{score ?? "—"}</Text>}
    </Flex>
  );
};

const GameCard = ({ pal, game }) => {
  const played = Boolean(game.isFinal);
  const awayWin = played && game.awayScore != null && game.homeScore != null && game.awayScore > game.homeScore;
  const homeWin = played && game.awayScore != null && game.homeScore != null && game.homeScore > game.awayScore;
  const kickoff = game.kickoffTime && game.kickoffTime !== "TBA" ? game.kickoffTime : "TBA";
  return (
    <Flex direction="column" bg={pal.panel} px="1rem" pt="0.75rem" pb="0.75rem" gap="0.5625rem" minW={0}>
      <Flex align="baseline" justify="space-between" gap="0.5rem">
        <Text fontSize="0.875rem" color={`rgba(${pal.fg}, 0.65)`} {...caps}>{dayLabel(game)}</Text>
        {!played && <Text fontSize="1rem" color={pal.orange} {...caps} {...tab}>{kickoff}</Text>}
      </Flex>
      <TeamRow pal={pal} team={game.awayTeam} score={game.awayScore} win={awayWin} played={played} />
      <TeamRow pal={pal} team={game.homeTeam} score={game.homeScore} win={homeWin} played={played} />
      <Box h="0.0625rem" bg={`rgba(${pal.fg}, 0.1)`} />
      <Text h="1.875rem" fontSize="0.75rem" color={`rgba(${pal.fg}, 0.6)`} lineHeight="0.9375rem" overflow="hidden" {...caps}>{placeOf(game)}</Text>
    </Flex>
  );
};

const Section = ({ pal, week, games, label, accent }) => (
  <Box>
    <Flex align="baseline" gap="0.875rem" mb="0.75rem">
      <Text fontSize="3.375rem" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.9} letterSpacing="-0.04em" whiteSpace="nowrap">
        Week {week} <Box as="span" color={accent}>{label}</Box>
      </Text>
    </Flex>
    <Grid templateColumns={`repeat(${colsFor(games.length)}, minmax(0, 1fr))`} gap="0.75rem">
      {games.map((g) => <GameCard key={g.id} pal={pal} game={g} />)}
    </Grid>
  </Box>
);

export const GamesHubWeekPoster = ({ pal, innerRef, season, last, next }) => (
  <Flex ref={innerRef} direction="column" w={`${(POSTER_W) / 16}rem`} bg={pal.bg} color={pal.ink} px="3.5rem" pt="2.25rem" pb="2.75rem" gap="1.625rem" overflow="hidden">
    <Flex align="center" justify="space-between">
      <ExportWordmark ink={pal.ink} accent={pal.brand} size="2.125rem" />
      <Text fontSize="1.125rem" color={pal.orange} {...caps}>{season} season</Text>
    </Flex>
    {last && <Section pal={pal} week={last.week} games={last.games} label="results" accent={pal.brand} />}
    {next && <Section pal={pal} week={next.week} games={next.games} label="up next" accent={pal.orange} />}
  </Flex>
);

export default GamesHubWeekPoster;
