import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageShell from "../../layouts/PageShell";
import { FE_DOCS_BASE, toLocalTeam } from "../../../utils/gameCenterPayloads";
import { withAlpha } from "../../game/export/exportData";

/**
 * GloryTeamOfWeek
 *
 * PHILOSOPHY:
 *   Purpose: The home page's Glory Team of the Week. The backend picks the team,
 *   the highlight term and the copy (Glory Team of the Week Fetch Contract.md);
 *   the page displays what current.json holds and nothing else.
 *   While that loads — and whenever there is no pick — the block is a
 *   dictionary entry. ONE entry shows at a time, chosen at random on each load
 *   from glory, glorify, glorification and glorified.
 *
 * GRID SLOT:
 *   4x1 (a full-width banner, 4:1). At lg and up it IS a PageShell 4x1 slot, so
 *   it is exactly one row tall and every size inside it is in cqw (a fraction of
 *   the shell's width). Below lg a stacked variant reads at phone/tablet width.
 *
 * BEHAVIOR:
 *   The entry holds for a minimum time (a CSS animation, no useEffect), then
 *   crossfades into the team when the data is ready. No team in the file, or no
 *   file yet: the entry simply stays.
 *
 * TYPE:
 *   The entry is set in a serif — the one serif on the page, on purpose, so it
 *   reads as a dictionary.
 */

export const GLORY_TEAM_PATH = `${FE_DOCS_BASE}/game-center/glory-team-of-week/current.json`;
const HOLD_MS = 1500;
const SERIF = "Georgia, 'Times New Roman', serif";

// The dev server answers a missing file with index.html (200), so a non-JSON
// body counts as "no file yet".
const fetchGloryTeam = async () => {
  const res = await fetch(GLORY_TEAM_PATH);
  if (!res.ok) throw new Error("glory team missing");
  if (!(res.headers.get("content-type") ?? "").includes("json")) throw new Error("glory team missing");
  return res.json();
};

const KEYFRAMES = "@keyframes gloryHold { from { opacity: 0.999; } to { opacity: 1; } }";

// The entries. One shows per load. Every entry has the same parts: syllables,
// pronunciation, an inflection line (when the word has one), an origin, and two
// lettered senses, each with an example (the word is italicized in it).
const ENTRIES = [
  {
    word: "glory", pos: "noun", syl: "glo·ry", pron: "ˈglȯr-ē",
    forms: { label: "plural", value: "glories" },
    origin: "Middle English glorie, from Anglo-French, from Latin gloria",
    senses: [
      { def: "high honor won by great achievement", example: { before: "the ", word: "glory", after: " of a title earned on the road" } },
      { def: "a performance remembered long after the final whistle", example: { before: "Her ninety-yard run is still talked about as pure ", word: "glory", after: "." } },
    ],
  },
  {
    word: "glorify", pos: "verb", syl: "glo·ri·fy", pron: "ˈglȯr-ə-ˌfī",
    forms: { label: "glorified; glorifying", value: "glorifies" },
    origin: "Middle English glorifien, from Anglo-French glorifier, from Late Latin glorificare",
    senses: [
      { def: "to make glorious by giving great honor", example: { before: "The documentary ", word: "glorifies", after: " the program’s title years." } },
      { def: "to praise or celebrate loudly", example: { before: "The student section ", word: "glorified", after: " the quarterback after the comeback." } },
    ],
  },
  {
    word: "glorification", pos: "noun", syl: "glo·ri·fi·ca·tion", pron: "ˌglȯr-ə-fə-ˈkā-shən",
    forms: { label: "plural", value: "glorifications" },
    origin: "Middle English glorificacioun, from Anglo-French, from Late Latin glorificatio, from glorificare",
    senses: [
      { def: "the act of lifting something up with high praise", example: { before: "the ", word: "glorification", after: " of a team’s greatest season" } },
      { def: "the state of being honored for achievement", example: { before: "The banners in the rafters are a quiet ", word: "glorification", after: " of every title." } },
    ],
  },
  {
    word: "glorified", pos: "adjective", syl: "glo·ri·fied", pron: "ˈglȯr-ə-ˌfīd",
    forms: null,
    origin: "from the past participle of glorify",
    senses: [
      { def: "raised in honor; celebrated", example: { before: "the ", word: "glorified", after: " champions of the Classic" } },
      { def: "made to seem grander than it really is", example: { before: "a ", word: "glorified", after: " scrimmage" } },
    ],
  },
];

// One set of sizes per variant: `row` (the 4x1 slot, cqw) and `stack` (below lg, clamp rem).
const SIZE = {
  row: { noun: "1.8cqw", syl: "1.15cqw", plural: "0.9cqw", pluralWord: "1.25cqw", origin: "0.9cqw", sense: "1.75cqw", example: "1.35cqw", gap: "1.8cqw", pad: "2.6cqw" },
  stack: { noun: "1.2rem", syl: "0.95rem", plural: "0.78rem", pluralWord: "1rem", origin: "0.8rem", sense: "1.1rem", example: "0.95rem", gap: "1rem", pad: "1.25rem" },
};

// The headword scales with its length so "glorification" fits the column as
// comfortably as "glory" does.
const headSize = (word, row) => {
  const n = word.length;
  return row ? `${Math.min(7, 36 / (n * 0.56))}cqw` : `clamp(2.2rem, ${Math.min(14, 80 / (n * 0.56))}vw, 4.5rem)`;
};

const Headword = ({ entry, z, row }) => (
  <Box minW={0}>
    <Flex align="baseline" gap="0.6em" wrap="wrap">
      <Text fontFamily={SERIF} fontSize={headSize(entry.word, row)} fontWeight="700" color="white" lineHeight={1}>{entry.word}</Text>
      <Text fontFamily={SERIF} fontSize={z.noun} fontWeight="700" color="brand.300">{entry.pos}</Text>
    </Flex>
    <Flex align="center" gap="0.8em" mt="0.5em" wrap="wrap">
      <Text fontFamily={SERIF} fontSize={z.syl} color="whiteAlpha.600">{entry.syl}</Text>
      <Box border="1px solid" borderColor="whiteAlpha.400" borderRadius="full" px="0.8em" py="0.05em">
        <Text fontFamily={SERIF} fontSize={z.syl} color="brand.200">{entry.pron}</Text>
      </Box>
    </Flex>
    {entry.forms ? (
      <Flex align="center" gap="0.6em" mt="0.5em" wrap="wrap">
        <Box bg="whiteAlpha.200" borderRadius="sm" px="0.6em" py="0.1em">
          <Text fontFamily={SERIF} fontSize={z.plural} fontWeight="700" color="whiteAlpha.800">{entry.forms.label}</Text>
        </Box>
        <Text fontFamily={SERIF} fontSize={z.pluralWord} fontWeight="700" color="white">{entry.forms.value}</Text>
      </Flex>
    ) : null}
    <Text fontFamily={SERIF} fontStyle="italic" fontSize={z.origin} color="whiteAlpha.500" mt="0.6em" lineHeight={1.3}>
      Origin: {entry.origin}
    </Text>
  </Box>
);

const Sense = ({ letter, sense, z }) => (
  <Box>
    <Text fontFamily={SERIF} fontSize={z.sense} color="white" lineHeight={1.3}>
      <Box as="span" fontWeight="900" mr={2}>{letter} :</Box>
      {sense.def}
    </Text>
    <Flex mt="0.3em" ml="0.2rem">
      <Box w="2px" bg="whiteAlpha.300" flexShrink={0} />
      <Text pl={3} fontFamily={SERIF} fontSize={z.example} color="whiteAlpha.600" lineHeight={1.3}>
        {sense.example.before}
        <Box as="span" fontStyle="italic">{sense.example.word}</Box>
        {sense.example.after}
      </Text>
    </Flex>
  </Box>
);

const Senses = ({ entry, z }) => (
  <Flex direction="column" gap={z.gap} minW={0}>
    {entry.senses.map((s, i) => <Sense key={s.def} letter={"ab"[i]} sense={s} z={z} />)}
  </Flex>
);

const EntryRow = ({ entry }) => (
  <Box h="100%" p={SIZE.row.pad} display="grid" gridTemplateColumns="minmax(0, 1fr) minmax(0, 1.25fr)" columnGap="4cqw" alignItems="center">
    <Headword entry={entry} z={SIZE.row} row />
    <Senses entry={entry} z={SIZE.row} />
  </Box>
);

const EntryStack = ({ entry }) => (
  <Flex direction="column" gap={SIZE.stack.gap} p={SIZE.stack.pad}>
    <Headword entry={entry} z={SIZE.stack} />
    <Senses entry={entry} z={SIZE.stack} />
  </Flex>
);

// ── Team reveal ──────────────────────────────────────────────────────────────

const TeamNumbers = ({ data, big }) => {
  const glory = data.team?.glory;
  return (
    <Flex gap={big ? "3cqw" : 6} wrap="wrap" align="flex-end">
      {glory ? (
        <Box>
          {/* No team Glory rating exists yet — the backend ranks on its team rating
              and names it in metric_label; print that, never "Glory rating". */}
          <Text textStyle="statLabel" color="text.muted">{glory.metric_label ?? "Team rating"}</Text>
          <Flex align="baseline" gap={2}>
            <Text fontSize={big ? "4cqw" : "2.4rem"} fontWeight="900" fontStyle="italic" lineHeight={1} color="white" fontVariantNumeric="tabular-nums">{glory.display ?? glory.rating}</Text>
            {glory.delta != null ? (
              <Text fontSize={big ? "1.3cqw" : "1rem"} fontWeight="900" color={glory.delta >= 0 ? "#68D391" : "#FC8181"}>{glory.delta_display ?? `${glory.delta > 0 ? "+" : ""}${glory.delta}`}</Text>
            ) : null}
            <Text textStyle="statLabel" color="text.secondary">#{glory.rank} of {glory.ranked_teams}</Text>
          </Flex>
        </Box>
      ) : null}
      {data.highlight ? (
        <Box>
          <Text textStyle="statLabel" color="text.muted">{data.highlight.label}</Text>
          <Text fontSize={big ? "4cqw" : "2.4rem"} fontWeight="900" fontStyle="italic" lineHeight={1} color="brand.300" fontVariantNumeric="tabular-nums">{data.highlight.display}</Text>
          {data.highlight.context ? <Text textStyle="statLabel" color="text.secondary" mt={1}>{data.highlight.context}</Text> : null}
        </Box>
      ) : null}
    </Flex>
  );
};

const TeamReveal = ({ data, team, big }) => {
  const game = data.game;
  const identity = (
    <Flex align="center" gap={big ? "2cqw" : 4} minW={0}>
      {team.logo ? <Image src={team.logo} alt="" h={big ? "9cqw" : "4.5rem"} w={big ? "9cqw" : "4.5rem"} objectFit="contain" flexShrink={0} /> : null}
      <Box minW={0}>
        <Flex align="center" gap={2} mb={2} wrap="wrap">
          <Box bg="brand.500" px={3} py={1}><Text textStyle="pill" color="white">Glory Team of the Week</Text></Box>
          <Text textStyle="kicker" color="text.secondary" fontSize="11px">
            {data.week_label}{data.source === "prior_season_fallback" ? ` · ${data.season - 1} season` : ""}
          </Text>
        </Flex>
        <Text fontSize={big ? "3.6cqw" : "2rem"} fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.03em" lineHeight={0.95} color="white" lineClamp={2}>
          {team.name}
        </Text>
        {data.copy?.headline ? <Text textStyle="editorial" color="text.secondary" fontSize="11px" mt={1.5}>{data.copy.headline}</Text> : null}
      </Box>
    </Flex>
  );
  const summary = (
    <Box minW={0}>
      {data.copy?.summary ? <Text fontSize={big ? "1.15cqw" : "1rem"} color="text.secondary" lineHeight={1.45}>{data.copy.summary}</Text> : null}
      {game ? (
        <Text textStyle="statLabel" color="text.muted" mt={2}>
          {game.event_name ? `${game.event_name} · ` : ""}{team.shortName} {game.team_score}, {game.opponent_name} {game.opponent_score}
        </Text>
      ) : null}
    </Box>
  );
  const body = big ? (
    <Box h="100%" p={SIZE.row.pad} display="grid" gridTemplateColumns="minmax(0, 1.25fr) minmax(0, 0.9fr) minmax(0, 1fr)" columnGap="3cqw" alignItems="center">
      {identity}
      <TeamNumbers data={data} big />
      {summary}
    </Box>
  ) : (
    <Flex direction="column" gap={4} p={SIZE.stack.pad}>
      {identity}
      <TeamNumbers data={data} />
      {summary}
    </Flex>
  );
  return (
    <Box position={big ? "absolute" : "relative"} inset={big ? 0 : undefined} bg={`linear-gradient(115deg, ${withAlpha(team.primary, 0.38)} 0%, rgba(11,11,13,0.96) 62%)`}>
      {big && team.logo ? <Image src={team.logo} alt="" position="absolute" right="-2%" top="50%" transform="translateY(-50%)" h="150%" opacity={0.07} objectFit="contain" pointerEvents="none" filter="grayscale(1) brightness(1.8)" /> : null}
      {game?.game_path_id ? <Box as={Link} to={`/game/${game.game_path_id}`} display="block" h={big ? "100%" : undefined} position="relative" _hover={{ textDecoration: "none" }}>{body}</Box> : body}
    </Box>
  );
};

// ── Block ────────────────────────────────────────────────────────────────────

// One surface, rendered once per variant. Entry and team stack in the same cell
// and crossfade; `big` is the 4x1 slot, otherwise the stacked layout.
const Surface = ({ big, entry, showTeam, data, team }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius={big ? "xl" : { base: "0", md: "xl" }}
    border={big ? "1px solid" : { base: "none", md: "1px solid" }}
    borderBottom="1px solid"
    borderColor="whiteAlpha.200"
    bg="#0F0F11"
    h={big ? "100%" : undefined}
    w="100%"
  >
    <Box h={big ? "100%" : undefined} opacity={showTeam ? 0 : 1} transition="opacity 0.6s ease" pointerEvents={showTeam ? "none" : "auto"} aria-hidden={showTeam}>
      {big ? <EntryRow entry={entry} /> : <EntryStack entry={entry} />}
    </Box>
    {team ? (
      <Box position="absolute" inset={0} opacity={showTeam ? 1 : 0} transition="opacity 0.6s ease" pointerEvents={showTeam ? "auto" : "none"} aria-hidden={!showTeam} overflowY={big ? "hidden" : "auto"}>
        <TeamReveal data={data} team={team} big={big} />
      </Box>
    ) : null}
  </Box>
);

const GloryTeamOfWeek = () => {
  const [holdDone, setHoldDone] = useState(false);
  // A new word on each load: picked once when the block mounts.
  const [entry] = useState(() => ENTRIES[Math.floor(Math.random() * ENTRIES.length)]);
  const { data } = useQuery({
    queryKey: ["glory-team-of-week"],
    queryFn: fetchGloryTeam,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const teamId = data?.team?.team_id ?? null;
  const team = teamId ? toLocalTeam(teamId) : null;
  const showTeam = !!team && holdDone;
  const props = { entry, showTeam, data, team };

  return (
    <Box mb={{ base: 0, md: 6 }}>
      <style>{KEYFRAMES}</style>
      <Box w={0} h={0} overflow="hidden" style={{ animation: `gloryHold ${HOLD_MS}ms linear forwards` }} onAnimationEnd={() => setHoldDone(true)} />

      <Box display={{ base: "none", lg: "block" }}>
        <PageShell embedded>
          <PageShell.Slot cols={4} radius="xl"><Surface big {...props} /></PageShell.Slot>
        </PageShell>
      </Box>
      <Box display={{ base: "block", lg: "none" }}>
        <Surface big={false} {...props} />
      </Box>
    </Box>
  );
};

export default GloryTeamOfWeek;
