import teamsData from "../../../../data/teams.json";
import { teamFillColors, teamLogo, teamMascot, teamName } from "../../export/exportData";
import { Flex, Text, Grid, Image, Box } from "@chakra-ui/react";
import { brandOf } from "../GamePreviewScout";

const META = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));

export const caps = { textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: "900" };

const ROW_RATING = [
  ["Points / game", (s) => s.strip.ppg],
  ["Allowed / game", (s) => s.strip.allowed],
];

const ROW_DRIVES = [
  ["Points / drive", (s) => s.drives.ppd_off],
  ["Allowed / drive", (s) => s.drives.ppd_def],
  ["Net EPA / play", (s) => s.efficiency.net_epa],
];

const ROW_SCORING = [
  ["Net success rate", (s) => s.efficiency.net_success],
  ["Field position", (s) => s.efficiency.net_fp],
  ["Pass yds / game", (s) => s.counting.pass_ypg],
  ["Rush yds / game", (s) => s.counting.rush_ypg],
];

const mascotSize = (name) => (name.length > 11 ? 36 : name.length > 8 ? 44 : 52);

const rankInk = (rank, n, pal) => {
  if (!rank) return `rgba(${pal.fg}, 0.4)`;
  const third = Math.ceil(n / 3);
  return rank <= third ? pal.up : rank > n - third ? pal.down : pal.orange;
};

const Tile = ({ label, cell, otherCell, rankFirst = false, n, pal, size = 46, teamId }) => {
  const better = cell.rank && otherCell?.rank && cell.rank < otherCell.rank;
  // The better rank's tile is filled in the school's colours, so the fill already says "ahead": its
  // rank prints in the tile's own ink instead of green, which could clash with a green or red school.
  const school = better ? teamFillColors(teamId) : null;
  const bg = school ? school.fill : pal.panel;
  const sub = school ? `rgba(${school.rgb}, 0.85)` : `rgba(${pal.fg}, 0.6)`;
  const big = rankFirst ? (cell.rank ? `#${cell.rank}` : "—") : cell.display;
  return (
    <Flex direction="column" align="center" justify="center" flex={1} minW={0} px="2px" py="6px" style={{ background: bg }} color={school?.ink} textAlign="center" gap="2px">
      <Text fontSize={`${size}px`} fontWeight="950" lineHeight={1} letterSpacing="-0.03em" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">{big}</Text>
      {rankFirst ? (
        <Text fontSize="21px" fontWeight="900" lineHeight={1} color={sub}>{cell.display}</Text>
      ) : (
        <Text fontSize="26px" fontWeight="950" lineHeight={1} color={school ? school.ink : rankInk(cell.rank, n, pal)}>{cell.rank ? `#${cell.rank}` : "—"}</Text>
      )}
      <Text fontSize="16px" lineHeight={1.1} color={sub} {...caps}>{label}</Text>
    </Flex>
  );
};

const Results = ({ results, pal }) => (
  <Grid templateColumns="repeat(6, minmax(0,1fr))" columnGap="1px">
    {results.length === 0 && <Text gridColumn="1 / -1" fontSize="22px" color={`rgba(${pal.fg}, 0.5)`} {...caps}>—</Text>}
    {results.map((g) => {
      const ring = g.result === "W" ? pal.up : pal.down;
      const opp = META[g.opponent_id];
      const side = g.neutral_site ? "N" : g.home_away === "away" ? "@" : "vs";
      return (
        <Flex key={g.game_id} direction="column" align="center" gap="4px" minW={0}>
          <Text fontSize="15px" color={`rgba(${pal.fg}, 0.5)`} lineHeight={1} {...caps}>{side}</Text>
          <Flex w="100%" style={{ aspectRatio: "1 / 1", borderBottom: `5px solid ${ring}` }} align="center" justify="center" bg={`rgba(${pal.fg}, 0.06)`} overflow="hidden">
            {opp ? (
              <Image src={teamLogo(g.opponent_id)} alt="" w="66%" h="66%" objectFit="contain" />
            ) : (
              <Text fontSize="17px" fontWeight="950" lineHeight={1}>{String(g.opponent_short ?? "").slice(0, 4).toUpperCase()}</Text>
            )}
          </Flex>
          <Text fontSize="18px" fontWeight="950" lineHeight={1} color={ring} whiteSpace="nowrap">{g.result} {g.team_score}-{g.opponent_score}</Text>
        </Flex>
      );
    })}
  </Grid>
);

export const LogoTile = ({ id, pal }) => (
  <Flex w="104px" h="104px" flexShrink={0} align="center" justify="center" bg={`rgba(${pal.fg}, 0.06)`}>
    <Image src={teamLogo(id)} alt="" w="76%" h="76%" objectFit="contain" />
  </Flex>
);

export const TeamText = ({ s, pal, right }) => {
  const mascot = teamMascot(s.team_id).toUpperCase();
  return (
    <Flex direction="column" justify="center" align={right ? "flex-end" : "flex-start"} textAlign={right ? "right" : "left"} flex={1} minW={0}>
      <Text fontSize={`${mascotSize(mascot)}px`} fontWeight="950" fontStyle="italic" lineHeight={0.92} letterSpacing="-0.03em" whiteSpace="nowrap" textTransform="uppercase">{mascot}</Text>
      <Text fontSize="19px" color={`rgba(${pal.fg}, 0.6)`} mt="6px" whiteSpace="nowrap" {...caps}>{teamName(s.team_id)}</Text>
      <Text fontSize="24px" fontWeight="900" mt="4px" lineHeight={1} whiteSpace="nowrap">
        {s.record ?? "—"}<Text as="span" color={`rgba(${pal.fg}, 0.55)`}> · {s.conference_record ?? "—"} {String(s.conference ?? "").toUpperCase()}</Text>
      </Text>
    </Flex>
  );
};

export const Panel = ({ s, other, n, pal }) => (
  <Flex direction="column" flex={1} minW={0} gap="2px" bg="#000000" style={{ border: "2px solid #000000", borderTop: `5px solid ${brandOf(s.team_id)}` }}>
    <Flex columnGap="2px" flex={1}>
      {ROW_RATING.map(([label, pick]) => <Tile key={label} label={label} cell={pick(s)} otherCell={pick(other)} n={n} pal={pal} teamId={s.team_id} size={60} />)}
    </Flex>
    <Flex columnGap="2px" flex={1}>
      {ROW_DRIVES.map(([label, pick]) => <Tile key={label} label={label} cell={pick(s)} otherCell={pick(other)} n={n} pal={pal} teamId={s.team_id} size={42} />)}
    </Flex>
    <Grid templateColumns="1fr 1fr" gap="2px" flex={2} templateRows="1fr 1fr">
      {ROW_SCORING.map(([label, pick]) => <Tile key={label} label={label} cell={pick(s)} otherCell={pick(other)} n={n} pal={pal} teamId={s.team_id} size={54} />)}
    </Grid>
    <Box px="10px" pt="10px" pb="12px" bg={pal.panel}>
      <Text fontSize="17px" color={pal.orange} mb="6px" {...caps}>Last six</Text>
      <Results results={s.results} pal={pal} />
    </Box>
  </Flex>
);
