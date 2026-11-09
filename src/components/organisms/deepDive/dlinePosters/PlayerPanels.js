import { fgOf, tab, caps, rowsOf, listWords, signed } from "./posterModel";
import { Flex, Text, Grid, Image, Box } from "@chakra-ui/react";
import { num, PEOPLE, logoOf, lastName, shortOf, n2 } from "../deepDiveModel";
import { Card, Change, Head, Team } from "./PosterPrimitives";

const StatLine = ({ pal, items, size = "20px" }) => {
  const fg = fgOf(pal);
  return (
    <Flex gap="16px" wrap="wrap">
      {items.filter(([, v]) => v != null && Number(v) !== 0).map(([k, v]) => (
        <Flex key={k} align="baseline" gap="5px">
          <Text fontSize={size} fontWeight="900" {...tab}>{num(v)}</Text>
          <Text fontSize="13px" color={fg(0.6)} {...caps}>{k}</Text>
        </Flex>
      ))}
    </Flex>
  );
};

export const Leader = ({ pal }) => {
  const fg = fgOf(pal);
  const p = PEOPLE.leaders?.[0];
  if (!p) return null;
  return (
    <Grid templateColumns="150px minmax(0,1fr) auto" columnGap="28px" alignItems="center" bg={pal.panel} px="28px" py="24px" borderLeft={`6px solid ${pal.orange}`}>
      <Image src={logoOf(p.team_id)} alt="" w="130px" h="130px" objectFit="contain" />
      <Box minW={0}>
        <Flex align="center" gap="8px">
          <Box w="7px" h="7px" borderRadius="full" bg={pal.brand} />
          <Text fontSize="15px" color={fg(0.65)} {...caps}>The league leader</Text>
        </Flex>
        <Text mt="6px" fontSize="96px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.86} letterSpacing="-0.045em" whiteSpace="nowrap">{lastName(p.name)}</Text>
        <Text mt="8px" fontSize="18px" color={fg(0.6)} {...caps}>DL · {p.class} · {shortOf(p.team_id)} · {p.team_games} games</Text>
        <Box mt="14px"><StatLine pal={pal} size="26px" items={[["Sacks", p.sacks], ["TFL", p.tfl], ["FF", p.ff], ["Run stops", p.run_stops], ["EPA taken", Math.round(p.epa_taken)]]} /></Box>
      </Box>
      {p.last_season && (
        <Box textAlign="right">
          <Text fontSize="15px" color={fg(0.6)} {...caps}>Line plays / game</Text>
          <Text mt="6px" fontSize="84px" fontWeight="950" fontStyle="italic" color={pal.orange} lineHeight={0.9} letterSpacing="-0.04em" {...tab}>{n2(p.production_per_game)}</Text>
          <Text mt="6px" fontSize="18px" fontWeight="900" color={fg(0.5)} {...caps}>{n2(p.last_season.production_per_game)} in 2025</Text>
        </Box>
      )}
    </Grid>
  );
};

export const PlayersDeveloped = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = (PEOPLE.leaders ?? []).filter((p) => !p.newcomer && p.last_season)
    .map((p) => ({ ...p, from: p.last_season.production_per_game, d: p.production_per_game - p.last_season.production_per_game }))
    .sort((a, b) => b.d - a.d).slice(0, 5);
  const max = Math.max(...rows.map((r) => r.production_per_game), 0.1);
  return (
    <Card pal={pal} kicker="Players developed" head="Returners making the biggest jump, 2025 → 2026.">
      <Text mb="8px" fontSize="13px" color={fg(0.55)} {...caps}>Line plays per game · 2025 · 2026</Text>
      {rows.map((r) => (
        <Grid key={r.person_id} templateColumns="190px minmax(0,1fr) 120px" columnGap="12px" alignItems="center" h="58px" borderBottom={`1px solid ${fg(0.06)}`}>
          <Flex align="center" gap="10px" minW={0}>
            <Image src={logoOf(r.team_id)} alt="" w="32px" h="32px" objectFit="contain" />
            <Box minW={0}>
              <Text fontSize="21px" fontWeight="900" textTransform="uppercase" lineHeight={1} whiteSpace="nowrap">{lastName(r.name)}</Text>
              <Text mt="3px" fontSize="12px" color={fg(0.55)} {...caps}>{shortOf(r.team_id)} · {r.class}</Text>
            </Box>
          </Flex>
          <Flex direction="column" gap="5px">
            <Box h="8px" bg={fg(0.3)} borderRadius="0 2px 2px 0" style={{ width: `${Math.max(1, (r.from / max) * 100)}%` }} />
            <Box h="14px" bg={pal.brand} borderRadius="0 3px 3px 0" style={{ width: `${(r.production_per_game / max) * 100}%` }} />
          </Flex>
          <Change pal={pal} from={r.from} to={r.production_per_game} fmt={n2} size="18px" />
        </Grid>
      ))}
    </Card>
  );
};

export const Falling = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = rowsOf("risers_fallers").slice(-5).reverse();
  const lead = rows[0];
  return (
    <Card pal={pal} kicker="Falling" head={lead ? `${lastName(lead.name)} went from ${num(lead.sacks_2025)} sacks to ${num(lead.sacks_2026)}.` : ""}>
      {lead && (
        <Flex align="center" gap="18px" mb="14px">
          <Image src={logoOf(lead.team_id)} alt="" w="56px" h="56px" objectFit="contain" />
          <Text fontSize="64px" fontWeight="950" fontStyle="italic" lineHeight={0.9} letterSpacing="-0.04em" whiteSpace="nowrap" {...tab}>
            <Text as="span" color={fg(0.45)}>{num(lead.sacks_2025)}</Text>
            <Text as="span" color={fg(0.35)} fontSize="40px"> → </Text>
            <Text as="span" color={pal.down}>{num(lead.sacks_2026)}</Text>
          </Text>
          <Text fontSize="15px" color={fg(0.6)} {...caps}>Sacks</Text>
        </Flex>
      )}
      <Head pal={pal} cols="minmax(0,1fr) 120px 120px" align={["left", "right", "right"]} labels={["", "Line plays / game", "Sacks"]} />
      {rows.slice(1).map((r) => (
        <Grid key={r.person_id ?? r.name} templateColumns="minmax(0,1fr) 120px 120px" columnGap="12px" alignItems="center" h="40px" borderBottom={`1px solid ${fg(0.06)}`}>
          <Flex align="center" gap="10px" minW={0}>
            <Image src={logoOf(r.team_id)} alt="" w="26px" h="26px" objectFit="contain" />
            <Text fontSize="18px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">{lastName(r.name)}</Text>
            <Text fontSize="12px" color={fg(0.55)} {...caps}>{shortOf(r.team_id)}</Text>
          </Flex>
          <Flex justify="flex-end"><Change pal={pal} from={r.production_per_game_2025} to={r.production_per_game_2026} fmt={n2} size="16px" /></Flex>
          <Flex justify="flex-end"><Change pal={pal} from={Number(r.sacks_2025)} to={Number(r.sacks_2026)} fmt={num} size="16px" /></Flex>
        </Grid>
      ))}
    </Card>
  );
};

export const PeopleTable = ({ pal, kicker, head, rows, third }) => {
  const fg = fgOf(pal);
  const cols = "minmax(0,1.3fr) minmax(0,1.2fr) 56px 56px 66px";
  return (
    <Card pal={pal} kicker={kicker} head={head}>
      <Head pal={pal} cols={cols} align={["left", "left", "right", "right", "right"]} labels={["", third.label, "SK", "TFL", "Stops"]} />
      {rows.map((r) => (
        <Grid key={r.person_id ?? r.name} templateColumns={cols} columnGap="10px" alignItems="center" h="44px" borderBottom={`1px solid ${fg(0.06)}`}>
          <Flex align="center" gap="10px" minW={0}>
            <Image src={logoOf(r.team_id)} alt="" w="28px" h="28px" objectFit="contain" />
            <Box minW={0}>
              <Text fontSize="18px" fontWeight="900" textTransform="uppercase" lineHeight={1} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{lastName(r.name)}</Text>
              <Text mt="2px" fontSize="11px" color={fg(0.55)} {...caps}>{shortOf(r.team_id)}</Text>
            </Box>
          </Flex>
          {third.cell(r)}
          {[r.sacks, r.tfl, r.run_stops].map((v, i) => <Text key={i} fontSize="18px" fontWeight="900" textAlign="right" color={Number(v) ? pal.ink : fg(0.3)} {...tab}>{num(v)}</Text>)}
        </Grid>
      ))}
    </Card>
  );
};

export const NotReplaced = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = rowsOf("unreplaced");
  const max = Math.max(...rows.map((r) => Math.abs(r.production?.gap_per_game ?? 0)), 0.1);
  const gaps = rows.filter((r) => r.production?.gap_per_game > 0).map((r) => shortOf(r.team_id));
  return (
    <Card pal={pal} kicker="Replaced or not" head={`${listWords(gaps)} still haven't replaced their 2025 line plays.`}>
      <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" columnGap="16px" mb="8px">
        <Text fontSize="13px" color={pal.up} textAlign="right" {...caps}>← Replaced and then some</Text>
        <Text fontSize="13px" color={pal.down} {...caps}>Not replaced →</Text>
      </Grid>
      {rows.map((r) => {
        const g = r.production?.gap_per_game ?? 0;
        const ink = g > 0 ? pal.down : pal.up;
        const who = (r.departed ?? []).slice(0, 2).map((p) => lastName(p.name)).join(", ");
        return (
          <Grid key={r.team_id} templateColumns="100px minmax(0,1fr) minmax(0,1fr) 260px" columnGap="0" alignItems="center" h="34px">
            <Team pal={pal} id={r.team_id} size={24} font="15px" />
            <Flex justify="flex-end" pr="2px">{g < 0 && <Box h="16px" bg={ink} borderRadius="3px 0 0 3px" style={{ width: `${(-g / max) * 100}%` }} />}</Flex>
            <Flex pl="2px" borderLeft={`2px solid ${fg(0.25)}`} h="100%" align="center">{g > 0 && <Box h="16px" bg={ink} borderRadius="0 3px 3px 0" style={{ width: `${(g / max) * 100}%` }} />}</Flex>
            <Flex pl="14px" gap="10px" align="baseline" minW={0}>
              <Text fontSize="16px" fontWeight="900" color={ink} {...tab}>{signed(g)}</Text>
              {who && <Text fontSize="13px" color={fg(0.55)} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" {...caps}>Lost {who}</Text>}
            </Flex>
          </Grid>
        );
      })}
    </Card>
  );
};
