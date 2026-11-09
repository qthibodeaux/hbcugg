import { fgOf, byTeam, rowsOf, tab, signed, caps, STAFF_TAG, sameStaff, sentences, listWords, ROLE_WORD, TEAL } from "./posterModel";
import { Card, Head, Team, Change, NumberTile } from "./PosterPrimitives";
import { Grid, Flex, Text, Box } from "@chakra-ui/react";
import { n2, pct0, PEOPLE, shortOf } from "../deepDiveModel";

export const TeamTable = ({ pal }) => {
  const fg = fgOf(pal);
  const run = byTeam(rowsOf("run_d_swing"));
  const pass = byTeam(rowsOf("pass_rush_swing"));
  const rows = [...rowsOf("continuity")].sort((a, b) => b.change - a.change);
  const cols = "170px minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr) 110px 150px";
  const right = ["left", "left", "left", "left", "right", "right"];
  return (
    <Card pal={pal} kicker="Team by team" head="Line plays = sacks, tackles for loss, forced fumbles and pass breakups by defensive linemen.">
      <Head pal={pal} cols={cols} align={right} labels={["", "Line plays / game · '25 → '26", "Run success allowed", "Sack rate", "Line plays back", "New in 2026"]} />
      {rows.map((r) => (
        <Grid key={r.team_id} templateColumns={cols} columnGap="16px" alignItems="center" h="46px" borderBottom={`1px solid ${fg(0.06)}`}>
          <Team pal={pal} id={r.team_id} />
          <Flex align="center" gap="12px">
            <Change pal={pal} from={r.dl_prod_2025} to={r.dl_prod_2026} fmt={n2} size="21px" />
            <Text fontSize="15px" fontWeight="900" color={r.change > 0 ? pal.up : pal.down} {...tab}>{signed(r.change)}</Text>
          </Flex>
          {run[r.team_id] ? <Change pal={pal} from={run[r.team_id].before_pct} to={run[r.team_id].after_pct} fmt={pct0} better="lower" /> : <Text>—</Text>}
          {pass[r.team_id] ? <Change pal={pal} from={pass[r.team_id].before_pct} to={pass[r.team_id].after_pct} fmt={(v) => `${Number(v).toFixed(1)}%`} /> : <Text>—</Text>}
          <Text fontSize="19px" fontWeight="900" textAlign="right" {...tab}>{pct0(r.returning_share_pct)}</Text>
          <Flex justify="flex-end" gap="5px">
            {r.staff_changes.length ? r.staff_changes.map((s) => (
              <Text key={s} px="7px" py="2px" fontSize="13px" bg={fg(0.1)} borderRadius="3px" {...caps}>{STAFF_TAG[s] ?? s}</Text>
            )) : <Text fontSize="15px" color={fg(0.35)} {...caps}>Same</Text>}
          </Flex>
        </Grid>
      ))}
    </Card>
  );
};

export const TeamStories = ({ pal }) => {
  const rows = rowsOf("continuity");
  if (!rows.length) return null;
  const jump = rows.reduce((a, b) => (b.change > a.change ? b : a));
  const most = rows.reduce((a, b) => (b.dl_prod_2026 > a.dl_prod_2026 ? b : a));
  const drop = rows.reduce((a, b) => (b.change < a.change ? b : a));
  const gone = PEOPLE.departures?.[most.team_id];
  const grad = gone?.total ? Math.round((gone.graduated / gone.total) * 100) : null;
  const kept = sameStaff(jump.team_id);
  return (
    <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="2px">
      <NumberTile pal={pal} value={n2(jump.dl_prod_2026)} ink={pal.up} title={`${shortOf(jump.team_id)}: the biggest jump`}
        text={sentences(`Line plays a game, up from ${n2(jump.dl_prod_2025)} in 2025`, `${pct0(jump.returning_share_pct)} of them came back${kept ? `, with ${kept}` : ""}`)} />
      <NumberTile pal={pal} value={n2(most.dl_prod_2026)} ink={pal.orange} title={`${shortOf(most.team_id)}: most in the SWAC`}
        text={sentences(`Line plays a game, up from ${n2(most.dl_prod_2025)} in 2025`, grad != null && `Linemen who graduated made ${grad}% of its 2025 line plays`)} />
      <NumberTile pal={pal} value={signed(drop.change)} ink={pal.down} title={`${shortOf(drop.team_id)}: the biggest drop`}
        text={sentences(`Line plays a game, ${n2(drop.dl_prod_2025)} in 2025 to ${n2(drop.dl_prod_2026)}`, drop.staff_changes.length && `New ${listWords(drop.staff_changes.map((k) => ROLE_WORD[k] ?? k))}`)} />
    </Grid>
  );
};

const LeagueLine = ({ pal, kicker, head, rows, field, ink, step = 2 }) => {
  const fg = fgOf(pal);
  const W = 620, H = 150, L = 46, R = 18, T = 26, B = 28;
  const vals = rows.map((r) => r[field]).filter((v) => v != null);
  const lo = Math.floor((Math.min(...vals) - step / 2) / step) * step;
  const hi = Math.ceil((Math.max(...vals) + step / 2) / step) * step;
  const years = rows.map((r) => r.season);
  const x0 = Math.min(...years), x1 = Math.max(...years);
  const x = (yr) => L + ((yr - x0) / (x1 - x0 || 1)) * (W - L - R);
  const y = (v) => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
  const ticks = [];
  for (let v = lo; v <= hi + 1e-9; v += step) ticks.push(v);
  return (
    <Card pal={pal} kicker={kicker} head={head}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={fg(0.1)} strokeWidth="1" />
            <text x={L - 8} y={y(v) + 5} textAnchor="end" fontSize="14" fontWeight="800" fill={fg(0.5)}>{`${v}%`}</text>
          </g>
        ))}
        <polyline points={rows.map((r) => `${x(r.season)},${y(r[field])}`).join(" ")} fill="none" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
        {rows.map((r) => {
          const hot = r.season === 2025;
          return (
            <g key={r.season}>
              <circle cx={x(r.season)} cy={y(r[field])} r={hot ? 10 : 6} fill={hot ? pal.orange : ink} stroke={pal.panel} strokeWidth="2" />
              <text x={x(r.season)} y={y(r[field]) - (hot ? 17 : 13)} textAnchor="middle" fontSize={hot ? 19 : 15} fontWeight="900" fill={hot ? pal.orange : pal.ink}>{`${Number(r[field]).toFixed(1)}%`}</text>
              <text x={x(r.season)} y={H - 8} textAnchor="middle" fontSize="15" fontWeight="800" fill={hot ? pal.orange : fg(0.55)}>{r.season}</text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
};

export const LeagueLines = ({ pal }) => {
  const trend = rowsOf("season_trend").filter((r) => r.season >= 2021);
  return (
    <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="2px">
      <LeagueLine pal={pal} kicker="SWAC · Run success allowed" head="Runs started working in 2025, and still are." rows={trend} field="opp_rush_success_pct" ink={pal.down} />
      <LeagueLine pal={pal} kicker="SWAC · Sack rate" head="Sacks fell off in 2025 and came back." rows={trend} field="sack_rate_pct" ink={pal.brand} step={2} />
    </Grid>
  );
};

export const StaffSplit = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = rowsOf("continuity");
  const groups = [
    { label: "Same HC, DC and line coach", rows: rows.filter((r) => !r.staff_changes.length) },
    { label: "At least one new", rows: rows.filter((r) => r.staff_changes.length) },
  ].map((g) => ({ ...g, avg: g.rows.reduce((s, r) => s + r.change, 0) / (g.rows.length || 1), rows: [...g.rows].sort((a, b) => b.change - a.change) }));
  const max = Math.max(...rows.map((r) => Math.abs(r.change)), 0.1);
  return (
    <Card pal={pal} kicker="Staff · 2025 → 2026" head="Teams that kept their head coach, DC and line coach added more line plays a game.">
      <Grid templateColumns="minmax(0,1fr) minmax(0,1fr)" gap="22px">
        {groups.map((g) => (
          <Box key={g.label} minW={0}>
            <Text fontSize="54px" fontWeight="950" fontStyle="italic" color={g.avg > 0.5 ? pal.up : pal.ink} lineHeight={0.9} letterSpacing="-0.04em" {...tab}>{signed(g.avg, 1)}</Text>
            <Text mt="6px" mb="12px" fontSize="15px" color={fg(0.7)} {...caps}>{g.label} · per game</Text>
            {g.rows.map((r) => (
              <Grid key={r.team_id} templateColumns="92px minmax(0,1fr) 54px" columnGap="8px" alignItems="center" h="32px">
                <Team pal={pal} id={r.team_id} size={24} font="15px" />
                <Box position="relative" h="12px">
                  <Box position="absolute" left="50%" top="-4px" bottom="-4px" w="1px" bg={fg(0.2)} />
                  <Box position="absolute" top={0} bottom={0} bg={r.change > 0 ? pal.up : pal.down} borderRadius="2px"
                    style={r.change > 0 ? { left: "50%", width: `${(r.change / max) * 50}%` } : { right: "50%", width: `${(-r.change / max) * 50}%` }} />
                </Box>
                <Text fontSize="15px" fontWeight="900" textAlign="right" {...tab}>{signed(r.change)}</Text>
              </Grid>
            ))}
          </Box>
        ))}
      </Grid>
    </Card>
  );
};

export const ProductionWent = ({ pal }) => {
  const fg = fgOf(pal);
  const dep = PEOPLE.departures ?? {};
  const rows = Object.entries(dep).map(([id, v]) => ({ id, ...v })).filter((r) => r.total > 0)
    .sort((a, b) => b.graduated / b.total - a.graduated / a.total);
  const top = rows[0];
  const seg = [
    { key: "back", label: "Back in 2026", ink: pal.brand },
    { key: "graduated", label: "Graduated", ink: TEAL },
    { key: "left", label: "Left the program", ink: pal.orange },
    { key: "moved_within_18", label: "Moved to another SWAC/MEAC school", ink: fg(0.55) },
  ].filter((s) => rows.some((r) => r[s.key] > 0));
  return (
    <Card pal={pal} kicker="Where 2025's line plays went"
      head={top ? `${shortOf(top.id)}'s 2025 linemen who graduated made ${Math.round((top.graduated / top.total) * 100)}% of its line plays.` : ""}>
      <Flex gap="8px 16px" mb="10px" wrap="wrap">
        {seg.map((s) => (
          <Flex key={s.key} align="center" gap="6px">
            <Box w="14px" h="14px" bg={s.ink} borderRadius="2px" />
            <Text fontSize="13px" color={fg(0.75)} {...caps}>{s.label}</Text>
          </Flex>
        ))}
      </Flex>
      {rows.map((r) => (
        <Grid key={r.id} templateColumns="92px minmax(0,1fr) 44px" columnGap="10px" alignItems="center" h="32px">
          <Team pal={pal} id={r.id} size={24} font="15px" />
          <Flex h="18px" borderRadius="2px" overflow="hidden">
            {seg.map((s) => r[s.key] > 0 && <Box key={s.key} bg={s.ink} style={{ width: `${(r[s.key] / r.total) * 100}%` }} />)}
          </Flex>
          <Text fontSize="15px" fontWeight="900" textAlign="right" color={pal.brand} {...tab}>{Math.round((r.back / r.total) * 100)}%</Text>
        </Grid>
      ))}
    </Card>
  );
};
