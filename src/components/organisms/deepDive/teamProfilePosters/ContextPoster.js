import { T, P, fgOf, tab, caps } from "./posterPresentation";
import { ordinal } from "../deepDiveModel";
import { advOf, fmtKey, pct, PROFILE, signed, fix } from "../teamProfileModel";
import { Flex, Grid, Text, Box } from "@chakra-ui/react";
import { Card, TeamTag, Frame, Banner } from "./PosterPrimitives";

const QUESTIONS_SHOWN = ["stalls_before_midfield", "record_vs_quality", "what_decides", "turnovers", "red_zone_defense", "late_fade", "changed_from_last_year", "qb_play", "staff", "stakes"];

const gameVs = (teamId) => (T.results ?? []).find((g) => g.opponent_team_id === teamId);

const BIG_NUMBER = {
  stalls_before_midfield: () => `${T.offense.drives.empty_own_territory?.drives ?? "—"}/${T.offense.drives.empty_drives}`,
  record_vs_quality: () => ordinal(advOf("offense", "adj_epa_per_play")?.rank ?? 0),
  turnovers: () => fmtKey("turnover_margin_per_game", T.vs_league.find((r) => r.key === "turnover_margin_per_game")?.value),
  red_zone_defense: () => pct(advOf("defense", "red_zone_td_rate")?.value),
  late_fade: () => { const g = gameVs("swacmvsu"); return g ? `${g.score}-${g.opp_score}` : null; },
  changed_from_last_year: () => { const s = T.seasons.find((x) => x.season === PROFILE.season - 1); return s ? `${s.record} → ${T.standing.record}` : null; },
  qb_play: () => signed(P.quarterbacks[0]?.advanced?.epa_per_dropback, 2),
  stakes: () => `${fix(T.race.title_odds_pct)}%`,
};

const QuestionCard = ({ pal, q, ink }) => {
  const fg = fgOf(pal);
  const big = BIG_NUMBER[q.id]?.();
  return (
    <Flex direction="column" bg={pal.panel} px="24px" pt="20px" pb="22px" borderLeft={`4px solid ${ink}`} minW={0}>
      <Grid templateColumns={big ? "minmax(0,1fr) auto" : "minmax(0,1fr)"} columnGap="18px" alignItems="start">
        <Text fontSize="23px" fontWeight="950" lineHeight={1.2}>{q.question}</Text>
        {big && <Text fontSize="52px" fontWeight="950" fontStyle="italic" color={ink} lineHeight={0.9} letterSpacing="-0.04em" whiteSpace="nowrap" {...tab}>{big}</Text>}
      </Grid>
      <Text mt="10px" fontSize="17px" fontWeight="700" color={fg(0.8)} lineHeight={1.4}>{q.answer}</Text>
      <Flex mt="12px" direction="column" gap="6px">
        {(q.claims ?? []).map((c, i) => (
          <Flex key={i} gap="10px" align="baseline">
            <Box w="6px" h="6px" mt="7px" flexShrink={0} bg={ink} />
            <Text fontSize="15px" fontWeight="700" color={fg(0.68)} lineHeight={1.35}>{c.text}</Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

const LeftToPlay = ({ pal }) => {
  const fg = fgOf(pal);
  const games = PROFILE.context.remaining_schedule ?? [];
  return (
    <Card pal={pal} kicker="Left to play">
      <Grid templateColumns={`repeat(${games.length}, minmax(0,1fr))`} gap="2px" bg={fg(0.06)}>
        {games.map((g) => (
          <Flex key={g.week} bg={pal.panel} align="center" justify="space-between" px="18px" py="12px">
            <Box>
              <Text fontSize="13px" color={fg(0.55)} {...caps}>Week {g.week} · {g.home_away === "home" ? "vs" : "at"}</Text>
              <TeamTag id={g.opponent_team_id} name={g.opponent} size={44} font="22px" />
            </Box>
            {g.event && <Text fontSize="13px" color={pal.orange} {...caps}>{g.event}</Text>}
          </Flex>
        ))}
      </Grid>
    </Card>
  );
};

export const ContextPoster = ({ pal, innerRef }) => {
  const qs = QUESTIONS_SHOWN.map((id) => PROFILE.context.questions.find((q) => q.id === id)).filter(Boolean);
  const inks = [pal.brand, pal.orange, pal.teal];
  return (
    <Frame pal={pal} innerRef={innerRef} page="3 / 3">
      <Banner pal={pal} title="The context" />
      <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="2px">
        {qs.map((q, i) => <QuestionCard key={q.id} pal={pal} q={q} ink={inks[i % inks.length]} />)}
      </Grid>
      <LeftToPlay pal={pal} />
    </Frame>
  );
};
