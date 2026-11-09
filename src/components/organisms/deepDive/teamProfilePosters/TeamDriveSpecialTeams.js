import { fgOf, T, caps, tab, toneOf } from "./posterPresentation";
import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { fix, rankText } from "../teamProfileModel";
import { Card, Rank } from "./PosterPrimitives";

const ENDINGS = [
  ["touchdown", "TD"], ["field_goal", "FG"], ["punt", "Punt"], ["turnover", "Turnover"],
  ["downs", "Downs"], ["missed_fg", "Missed FG"], ["end_of_half", "Half"],
];

const ZONES = [["own_territory", "Own territory"], ["midfield_to_20", "Midfield to 20"], ["red_zone", "Red zone"]];

const DriveBar = ({ pal, side }) => {
  const fg = fgOf(pal);
  const d = T[side].drives;
  const ink = { touchdown: pal.up, field_goal: pal.teal, punt: fg(0.35), turnover: pal.down, downs: pal.orange, missed_fg: fg(0.55), end_of_half: fg(0.18) };
  return (
    <Box>
      <Flex align="baseline" justify="space-between" mb="8px">
        <Text fontSize="18px" fontWeight="950" {...caps}>{side === "offense" ? "Offense" : "Defense"} · {d.drives} drives</Text>
        <Text fontSize="16px" fontWeight="900" {...tab}>{fix(d.points_per_drive, 2)} points / drive <Text as="span" color={toneOf(pal, d.ranks?.points_per_drive)}>{rankText(d.ranks?.points_per_drive)}</Text></Text>
      </Flex>
      <Flex h="38px" gap="2px">
        {ENDINGS.filter(([k]) => d.endings[k]?.count).map(([k, label]) => (
          <Flex key={k} flex={d.endings[k].count} bg={ink[k]} align="center" justify="center" minW={0} overflow="hidden">
            <Text fontSize="14px" fontWeight="950" color={k === "punt" || k === "end_of_half" || k === "missed_fg" ? pal.ink : "white"} whiteSpace="nowrap" {...tab}>{d.endings[k].count >= 4 ? `${label} ${d.endings[k].count}` : d.endings[k].count}</Text>
          </Flex>
        ))}
      </Flex>
      <Grid mt="12px" templateColumns="repeat(3, minmax(0,1fr))" gap="10px">
        {ZONES.map(([k, label]) => (
          <Box key={k}>
            <Text fontSize="12px" color={fg(0.55)} {...caps}>Empty · {label}</Text>
            <Text fontSize="28px" fontWeight="950" fontStyle="italic" lineHeight={1.05} {...tab}>{d.empty_drives_by_zone[k]?.count ?? 0}</Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export const Drives = ({ pal }) => (
  <Card pal={pal} kicker="Every drive">
    <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" columnGap="48px">
      <DriveBar pal={pal} side="offense" />
      <DriveBar pal={pal} side="defense" />
    </Grid>
  </Card>
);

const unitOf = (id) => T.special_teams.units.find((u) => u.unit === id) ?? null;

const ST_TILES = [
  { unit: "field_goal_unit", value: (s) => `${s.made}/${s.attempts}`, rank: "pct", sub: (s) => `Long ${s.long} · Clutch ${s.clutch_made}/${s.clutch_attempts}` },
  { unit: "fg_defense", value: (s) => `${s.made_against}/${s.attempts_against}`, rank: "pct_against", sub: (s) => `Made against · ${s.blocks} blocked` },
  { unit: "kickoff_team", value: (s) => fix(s.avg_return_yards_allowed), rank: "avg_return_yards_allowed", sub: (s) => `Return yards allowed · own ${Math.round(s.avg_start_allowed)}` },
  { unit: "kickoff_return", value: (s) => fix(s.avg_return_yards), rank: "avg_return_yards", sub: (s) => `Per return · ${s.touchdowns} TD` },
  { unit: "punt_team", value: (s) => fix(s.net_punt_avg), rank: "net_punt_avg", sub: (s) => `Net · ${s.inside_20_count} inside the 20` },
  { unit: "punt_return", value: (s) => fix(s.avg_return_yards), rank: "avg_return_yards", sub: (s) => `Per return · ${s.attempts} returns` },
  { unit: "pat_offense", value: (s) => `${s.made}/${s.attempts}`, rank: "pct", sub: () => "Extra points" },
  { unit: "pat_defense", value: (s) => `${s.made_against}/${s.attempts_against}`, rank: "pct_against", sub: (s) => `Made against · ${s.blocks} blocked` },
];

export const SpecialTeams = ({ pal, attributes = false }) => {
  const fg = fgOf(pal);
  const st = T.special_teams;
  return (
    <Card pal={pal} kicker="Special teams"
      right={attributes && (
        <Flex gap="6px">
          {st.attributes.map((a) => <Text key={a.id} px="10px" py="3px" fontSize="13px" bg={pal.brand} color="white" {...caps}>{a.display}</Text>)}
          {st.provisional && <Text px="10px" py="3px" fontSize="13px" color={fg(0.5)} {...caps}>Provisional</Text>}
        </Flex>
      )}>
      <Grid templateColumns="repeat(4, minmax(0,1fr))" gap="2px" bg={fg(0.06)}>
        {ST_TILES.map((t) => {
          const u = unitOf(t.unit);
          if (!u) return <Box key={t.unit} bg={pal.panel} />;
          const r = u.ranked?.[t.rank];
          return (
            <Box key={t.unit} bg={pal.panel} px="16px" py="14px">
              <Text fontSize="13px" color={fg(0.55)} {...caps}>{u.label}</Text>
              <Flex align="baseline" justify="space-between" gap="8px">
                <Text fontSize="40px" fontWeight="950" fontStyle="italic" lineHeight={1.05} {...tab}>{t.value(u.stats)}</Text>
                <Rank pal={pal} r={r} size="18px" />
              </Flex>
              <Text fontSize="14px" fontWeight="800" color={fg(0.6)}>{t.sub(u.stats)}</Text>
            </Box>
          );
        })}
      </Grid>
    </Card>
  );
};
