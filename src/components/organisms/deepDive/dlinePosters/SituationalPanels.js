import { rowsOf, sentences, extremeOf, fgOf, TD_COLS, tab, listWords, countOf, caps, DEPTH_COLS } from "./posterModel";
import { pct0, chartOf, DLINE, shortOf, n2 } from "../deepDiveModel";
import { Grid, Box, Text, Flex } from "@chakra-ui/react";
import { NumberTile, Card, Head, Team, Dots } from "./PosterPrimitives";

export const LeagueStrip = ({ pal }) => {
  const sit = rowsOf("situational_trend");
  const trend = rowsOf("season_trend");
  const now = sit[sit.length - 1] ?? {};
  const prev = sit[sit.length - 2] ?? {};
  const t = trend[trend.length - 1] ?? {};
  const tiles = [
    { value: pct0(now.late_close_rush_success_allowed_pct), ink: pal.down, title: "Late and close",
      text: sentences(`Runs worked ${pct0(now.late_close_rush_success_allowed_pct)} of the time in the 4th quarter within one score`, extremeOf(sit, "late_close_rush_success_allowed_pct")) },
    { value: pct0(now.fourth_down_stop_pct), ink: pal.down, title: "4th down",
      text: sentences(`Defenses stopped ${pct0(now.fourth_down_stop_pct)} of 4th-down tries`, extremeOf(sit, "fourth_down_stop_pct")) },
    { value: pct0(t.short_yardage_stop_pct), ink: pal.down, title: "3rd & 4th and short",
      text: `Only about 1 in 3 runs on 3rd or 4th and 2 or less are stopped.` },
    { value: pct0(now.red_zone_td_allowed_pct), ink: pal.orange, title: "Red zone",
      text: `of red-zone trips end in a touchdown, down from ${pct0(prev.red_zone_td_allowed_pct)} in ${prev.season}.` },
  ];
  return (
    <Grid templateColumns="repeat(2, minmax(0,1fr))" gap="2px">
      {tiles.map((x) => <NumberTile key={x.title} pal={pal} {...x} />)}
    </Grid>
  );
};

export const ThirdDown = ({ pal }) => {
  const fg = fgOf(pal);
  const c = chartOf(DLINE, "third_down");
  const rows = c?.data ?? [];
  const ref = c?.reference_pct ?? 0;
  const max = 60;
  const at = (v) => `${Math.min(100, (v / max) * 100)}%`;
  const best = rows[0];
  const worst = rows[rows.length - 1];
  return (
    <Card pal={pal} kicker="3rd down · Whole defense" head={best && worst ? `${shortOf(best.team_id)} allows ${pct0(best.conv_allowed_pct)}. ${shortOf(worst.team_id)} allows ${pct0(worst.conv_allowed_pct)}.` : ""}>
      <Head pal={pal} cols={TD_COLS} align={["left", "left", "right", "right"]} labels={["", `Converted · SWAC ${pct0(ref)}`, "2026", "'25"]} />
      <Box position="relative">
        {rows.map((r) => {
          const good = r.conv_allowed_pct <= ref;
          return (
            <Grid key={r.team_id} templateColumns={TD_COLS} columnGap="10px" alignItems="center" h="34px">
              <Team pal={pal} id={r.team_id} size={24} font="15px" />
              <Box position="relative" h="16px">
                <Box position="absolute" left={0} top={0} bottom={0} bg={good ? pal.up : pal.down} borderRadius="0 3px 3px 0" style={{ width: at(r.conv_allowed_pct) }} />
              </Box>
              <Text fontSize="17px" fontWeight="900" textAlign="right" {...tab}>{pct0(r.conv_allowed_pct)}</Text>
              <Text fontSize="15px" fontWeight="800" color={fg(0.45)} textAlign="right" {...tab}>{pct0(r.conv_allowed_2025_pct)}</Text>
            </Grid>
          );
        })}
        <Grid position="absolute" inset={0} templateColumns={TD_COLS} columnGap="10px" pointerEvents="none">
          <Box />
          <Box position="relative"><Box position="absolute" top={0} bottom={0} borderLeft={`2px dashed ${fg(0.4)}`} style={{ left: at(ref) }} /></Box>
        </Grid>
      </Box>
    </Card>
  );
};

export const ShortYardage = ({ pal }) => {
  const rows = rowsOf("short_yardage");
  const zero = rows.filter((r) => r.stops === 0).map((r) => shortOf(r.team_id));
  return (
    <Card pal={pal} kicker="3rd & 4th and 2 or less · Whole defense" head={`Runs stopped.${zero.length ? ` ${listWords(zero)} ha${zero.length > 1 ? "ve" : "s"}n't stopped one.` : ""}`}>
      {rows.map((r) => {
        const ink = r.stops === 0 ? pal.down : r.stops / r.runs >= 0.5 ? pal.up : pal.ink;
        return (
          <Grid key={r.team_id} templateColumns="92px minmax(0,1fr) 72px" columnGap="10px" alignItems="center" h="34px">
            <Team pal={pal} id={r.team_id} size={24} font="15px" />
            <Dots pal={pal} n={r.runs} filled={r.stops} ink={ink} size={15} gap={5} />
            <Text fontSize="17px" fontWeight="900" textAlign="right" color={ink} whiteSpace="nowrap" {...tab}>{r.stops} of {r.runs}</Text>
          </Grid>
        );
      })}
    </Card>
  );
};

export const RedZone = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = rowsOf("red_zone");
  const best = rows[0];
  const worst = rows[rows.length - 1];
  return (
    <Card pal={pal} kicker="Red zone · Whole defense" head={best && worst ? `Opponents scored a TD on ${countOf(best.rz_td_allowed_pct, best.rz_drives)} of ${best.rz_drives} red-zone trips against ${shortOf(best.team_id)}, and ${countOf(worst.rz_td_allowed_pct, worst.rz_drives)} of ${worst.rz_drives} against ${shortOf(worst.team_id)}.` : ""}>
      {rows.map((r) => {
        const td = countOf(r.rz_td_allowed_pct, r.rz_drives);
        return (
          <Grid key={r.team_id} templateColumns="92px minmax(0,1fr) 72px" columnGap="10px" alignItems="center" h="34px">
            <Team pal={pal} id={r.team_id} size={24} font="15px" />
            <Flex gap="4px">
              {Array.from({ length: r.rz_drives }, (_, i) => (
                <Box key={i} w="16px" h="16px" bg={i < td ? pal.down : "transparent"} border={`3px solid ${i < td ? pal.down : fg(0.35)}`} />
              ))}
            </Flex>
            <Text fontSize="17px" fontWeight="900" textAlign="right" whiteSpace="nowrap" {...tab}>{td} of {r.rz_drives}</Text>
          </Grid>
        );
      })}
    </Card>
  );
};

export const Clutch = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = rowsOf("late_and_close");
  const league = rowsOf("situational_trend").slice(-1)[0]?.late_close_rush_success_allowed_pct ?? 50;
  const cols = "92px 70px minmax(0,1fr) 60px";
  return (
    <Card pal={pal} kicker="Clutch time · Whole defense" head="Successful runs allowed in the 4th quarter or OT, within one score.">
      <Head pal={pal} cols={cols} align={["left", "right", "left", "right"]} labels={["", "Snaps", "Runs that worked", "Sacks"]} />
      {rows.map((r) => {
        const ok = countOf(r.rush_success_allowed_pct, r.rushes);
        const ink = r.rush_success_allowed_pct <= league ? pal.up : pal.down;
        return (
          <Grid key={r.team_id} templateColumns={cols} columnGap="10px" alignItems="center" h="34px" borderBottom={`1px solid ${fg(0.05)}`}>
            <Team pal={pal} id={r.team_id} size={24} font="15px" />
            <Text fontSize="16px" fontWeight="800" color={fg(0.6)} textAlign="right" {...tab}>{r.snaps}</Text>
            <Text fontSize="17px" fontWeight="900" color={ink} {...tab}>{ok} of {r.rushes}</Text>
            <Text fontSize="16px" fontWeight="900" textAlign="right" {...tab}>{r.sacks}</Text>
          </Grid>
        );
      })}
    </Card>
  );
};

export const Finishers = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = rowsOf("fourth_quarter");
  const max = Math.max(...rows.flatMap((r) => [r.before, r.after]), 0.1) * 1.1;
  const at = (v) => `${(v / max) * 100}%`;
  return (
    <Card pal={pal} kicker="4th quarter" head="Lines that finish, and lines that fade.">
      <Text mb="8px" fontSize="13px" color={fg(0.55)} {...caps}>Line production per game · '25 → '26</Text>
      {rows.map((r) => {
        const ink = r.after > r.before ? pal.up : pal.down;
        return (
          <Grid key={r.team_id} templateColumns="92px minmax(0,1fr) 46px" columnGap="10px" alignItems="center" h="32px">
            <Team pal={pal} id={r.team_id} size={24} font="15px" />
            <Box position="relative" h="16px">
              <Box position="absolute" top="50%" h="4px" mt="-2px" bg={ink} opacity={0.4} style={{ left: at(Math.min(r.before, r.after)), width: `calc(${at(Math.max(r.before, r.after))} - ${at(Math.min(r.before, r.after))})` }} />
              <Box position="absolute" top="50%" w="12px" h="12px" borderRadius="full" border={`3px solid ${fg(0.45)}`} bg={pal.panel} style={{ left: at(r.before), transform: "translate(-50%, -50%)" }} />
              <Box position="absolute" top="50%" w="16px" h="16px" borderRadius="full" bg={ink} style={{ left: at(r.after), transform: "translate(-50%, -50%)" }} />
            </Box>
            <Text fontSize="16px" fontWeight="900" textAlign="right" {...tab}>{n2(r.after)}</Text>
          </Grid>
        );
      })}
    </Card>
  );
};

export const Depth = ({ pal }) => {
  const fg = fgOf(pal);
  const rows = [...rowsOf("depth")].sort((a, b) => b.dl_with_production_2026 - a.dl_with_production_2026);
  const top = rows[0];
  return (
    <Card pal={pal} kicker="Depth" head={top ? `${shortOf(top.team_id)} has ${top.dl_with_production_2026} linemen with a line play this year.` : ""}>
      <Head pal={pal} cols={DEPTH_COLS} align={["left", "left", "right", "right"]} labels={["", "One dot per lineman", "2026", "2025"]} />
      {rows.map((r) => {
        const ink = r.dl_with_production_2026 >= r.dl_with_production_2025 ? pal.brand : pal.down;
        return (
          <Grid key={r.team_id} templateColumns={DEPTH_COLS} columnGap="10px" alignItems="center" h="32px">
            <Team pal={pal} id={r.team_id} size={24} font="15px" />
            <Dots pal={pal} n={r.dl_with_production_2026} filled={r.dl_with_production_2026} ink={ink} size={14} gap={4} />
            <Text fontSize="17px" fontWeight="900" color={ink} textAlign="right" {...tab}>{r.dl_with_production_2026}</Text>
            <Text fontSize="15px" fontWeight="800" color={fg(0.45)} textAlign="right" {...tab}>{r.dl_with_production_2025}</Text>
          </Grid>
        );
      })}
    </Card>
  );
};

export const Size = ({ pal }) => {
  const fg = fgOf(pal);
  const size = chartOf(DLINE, "size")?.data ?? {};
  const seasons = size.by_season ?? [];
  const teams = [...(size.teams ?? [])].sort((a, b) => b.weight_2026 - a.weight_2026);
  const ws = seasons.map((s) => s.avg_listed_dl_weight);
  const first = seasons[0];
  const last = seasons[seasons.length - 1];
  const lo = 240, hi = 300;
  const at = (v) => `${((v - lo) / (hi - lo)) * 100}%`;
  return (
    <Card pal={pal} kicker="Size · Listed weight" head={last && first && last.avg_listed_dl_weight > first.avg_listed_dl_weight ? "Lines are heavier." : "Lines aren't heavier."}>
      <Flex align="baseline" gap="12px">
        <Text fontSize="54px" fontWeight="950" fontStyle="italic" lineHeight={0.9} letterSpacing="-0.04em" {...tab}>{Math.round(last?.avg_listed_dl_weight)}</Text>
        <Text fontSize="15px" color={fg(0.7)} {...caps}>lb average lineman in {last?.season}</Text>
      </Flex>
      <Flex mt="14px" align="flex-end" gap="6px" h="86px">
        {seasons.map((x) => (
          <Flex key={x.season} direction="column" align="center" justify="flex-end" flex={1} h="100%" gap="4px">
            <Text fontSize="13px" fontWeight="900" color={x === last ? pal.orange : fg(0.7)} {...tab}>{Math.round(x.avg_listed_dl_weight)}</Text>
            <Box w="100%" bg={x === last ? pal.orange : fg(0.3)} style={{ height: `${Math.max(4, ((x.avg_listed_dl_weight - 255) / (ws.length ? Math.max(...ws) - 255 : 1)) * 44)}px` }} />
            <Text fontSize="12px" fontWeight="800" color={fg(0.5)} {...tab}>'{String(x.season).slice(2)}</Text>
          </Flex>
        ))}
      </Flex>
      <Box mt="14px">
        {teams.map((t) => (
          <Grid key={t.team_id} templateColumns="92px minmax(0,1fr) 40px" columnGap="10px" alignItems="center" h="26px">
            <Team pal={pal} id={t.team_id} size={20} font="14px" />
            <Box position="relative" h="10px" bg={fg(0.06)}>
              <Box position="absolute" left={0} top={0} bottom={0} bg={fg(0.55)} style={{ width: at(t.weight_2026) }} />
            </Box>
            <Text fontSize="14px" fontWeight="900" textAlign="right" {...tab}>{Math.round(t.weight_2026)}</Text>
          </Grid>
        ))}
      </Box>
    </Card>
  );
};
