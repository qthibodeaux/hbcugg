import { Fragment, useRef, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Download, X } from "lucide-react";
import { teamAccent, teamLogo, teamMascot, teamName, teamShort, withAlpha } from "../export/exportData";
import PreviewCountdown from "./PreviewCountdown";
import { longDate } from "../../../utils/gamePreview";
import { downloadDataUrl } from "../export/exportImage";
import teamsData from "../../../data/teams.json";

// ─────────────────────────────────────────────────────────────────────────────
// GAME PREVIEW — SCOUT. The preview's big section, after the
// matchup-scout reference, in our language: team colour where it identifies a
// side, near-black panels everywhere else, ranks of 18 as chips.
//
//   1  banner        the preview banner's look: school, mascot, conference
//                    record, coaches; countdown, date, week, kickoff, venue
//   3  strip         off EPA · def EPA · points · allowed · turnover margin
//   4  sheets        counting | efficiency, each value with its rank of 18
//      advantage     each offense against the other defense, the edge marked
//      quarterback   the line, and the air-yards curve against the league
//   5  leaders       top 8 by season production
//
// Model: utils/gamePreviewScout.js (buildScoutModel) via hooks/useGamePreviewScout.
// Lab copy: organisms/test/GamePreviewScoutA.js (#1713).
// ─────────────────────────────────────────────────────────────────────────────

const PANEL = "#141416";
const LINE = "rgba(255,255,255,0.08)";
const DIM = "rgba(255,255,255,0.5)";
const GOLD = "#EAB308";

const BRAND = "#A855F7";
const META = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));
const rgb = (hex) => { const h = String(hex ?? "").replace("#", ""); return h.length === 6 ? [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) : null; };
const lum = (hex) => { const c = rgb(hex); return c ? 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] : 0; };
const chroma = (hex) => { const c = rgb(hex); return c ? Math.max(...c) - Math.min(...c) : 0; };
const lift = (hex, t) => { const c = rgb(hex); return c ? `#${c.map((v) => Math.round(v + (255 - v) * t).toString(16).padStart(2, "0")).join("")}` : hex; };
// The school's colour that reads on near-black: the primary when it is bright
// enough, else a coloured secondary / accent (never plain white or black),
// else the primary lifted. JSU → its blue, GSU → its gold.
export const brandOf = (id) => {
  const c = META[id]?.colors ?? {};
  if (c.primary && lum(c.primary) >= 70 && chroma(c.primary) > 40) return c.primary;
  const hue = [c.secondary, c.accent].find((x) => x && lum(x) >= 70 && chroma(x) > 40);
  if (hue) return hue;
  return c.primary ? lift(c.primary, 0.45) : BRAND;
};
export const inkOn = (hex) => (lum(hex) > 150 ? "#0B0B0D" : "#FFFFFF");

const Kicker = ({ children, color = DIM, ...rest }) => (
  <Text fontSize="0.62rem" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.14em" lineHeight={1.2} {...rest}>{children}</Text>
);

const RankChip = ({ rank, color, total = 18 }) => (
  <Flex align="center" justify="center" minW="2.1rem" h="1.45rem" px="0.3rem" borderRadius="0.3rem" bg={rank ? color : "whiteAlpha.100"} flexShrink={0}
    title={rank ? `#${rank} of ${total}` : "No rank"}>
    <Text fontSize="0.72rem" fontWeight="900" color={rank ? inkOn(color) : "white"} fontVariantNumeric="tabular-nums" lineHeight={1}>{rank ? `#${rank}` : "—"}</Text>
  </Flex>
);

// Panel with the house eyebrow; `color` tints the dot and the top rule.
const Panel = ({ title, right, color = "#A855F7", bodyProps, children, ...rest }) => (
  <Box bg={PANEL} borderTop="3px solid" borderTopColor={color} overflow="hidden" {...rest}>
    <Flex align="center" justify="space-between" gap={3} px={4} py={2.5} borderBottom="1px solid" borderColor={LINE}>
      <Flex align="center" gap={2} minW={0}>
        <Box w="0.4rem" h="0.4rem" borderRadius="full" bg={color} flexShrink={0} />
        <Text fontSize="0.7rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>{title}</Text>
      </Flex>
      {right}
    </Flex>
    <Box px={4} py={3} {...bodyProps}>{children}</Box>
  </Box>
);

// ── 1 · Banner — the current preview banner's look, plus the coaches ────────
const TeamSide = ({ side, align }) => {
  const right = align === "right";
  const coaches = [["Head coach", side.coaches.head_coach], ["Off. coord.", side.coaches.offensive_coordinator], ["Def. coord.", side.coaches.defensive_coordinator]];
  return (
    <Flex direction="column" justify="center" gap={3} minW={0} px={{ base: 2, lg: 6 }} py={4}>
      <Flex align="center" gap="clamp(0.75rem, 2vw, 1.5rem)" direction={right ? "row-reverse" : "row"} minW={0}>
        <Image src={teamLogo(side.team_id)} alt="" h="clamp(56px, 8vw, 100px)" objectFit="contain" flexShrink={0} />
        <Box minW={0} textAlign={right ? "right" : "left"}>
          <Text fontSize="clamp(1.05rem, 2vw, 1.8rem)" fontWeight="900" color="text.primary" textTransform="uppercase" letterSpacing="0.03em" lineHeight={1} lineClamp={2} overflowWrap="anywhere">
            {teamName(side.team_id)}
          </Text>
          <Text fontSize="clamp(0.85rem, 1.5vw, 1.3rem)" fontWeight="900" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.05em" lineHeight={1.05} mt="4px" lineClamp={2}>
            {teamMascot(side.team_id)}
          </Text>
          <Flex align="baseline" gap={1.5} mt="6px" justify={right ? "flex-end" : "flex-start"} wrap="wrap">
            <Text fontSize="clamp(0.8rem, 1.2vw, 0.95rem)" fontWeight="950" color="white">{side.conference_record} {String(side.conference ?? "").toUpperCase()}</Text>
            <Text fontSize="clamp(0.8rem, 1.2vw, 0.95rem)" fontWeight="500" color="whiteAlpha.600">({side.record ?? "—"})</Text>
          </Flex>
        </Box>
      </Flex>
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap={3} pt={2.5} borderTop="1px solid" borderColor="whiteAlpha.200" textAlign={right ? "right" : "left"}>
        {(right ? [...coaches].reverse() : coaches).map(([role, name]) => (
          <Box key={role} minW={0}>
            <Kicker color="whiteAlpha.500" fontSize="0.52rem">{role}</Kicker>
            <Text fontSize="0.78rem" fontWeight="800" color="white" lineHeight={1.15} lineClamp={2}>{name ?? "—"}</Text>
          </Box>
        ))}
      </Grid>
    </Flex>
  );
};

const Banner = ({ m }) => {
  const awayColor = teamAccent(m.away.team_id);
  const homeColor = teamAccent(m.home.team_id);
  return (
    <Box position="relative" overflow="hidden" bg="#08080A">
      <ExportScout m={m} />
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${withAlpha(awayColor, 0.27)} 0%, #08080A 34%, #08080A 66%, ${withAlpha(homeColor, 0.27)} 100%)`} />
      <Image src={teamLogo(m.away.team_id)} alt="" position="absolute" left="-5%" top="50%" transform="translateY(-50%)" h="clamp(200px, 24vw, 300px)" opacity={0.16} pointerEvents="none" objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      <Image src={teamLogo(m.home.team_id)} alt="" position="absolute" right="-5%" top="50%" transform="translateY(-50%)" h="clamp(200px, 24vw, 300px)" opacity={0.16} pointerEvents="none" objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      <Grid position="relative" zIndex={1} templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="stretch">
        <TeamSide side={m.away} align="left" />
        <Flex direction="column" align="center" justify="center" px={{ base: 2, lg: 6 }} gap={2} position="relative">
          <Box position="absolute" left={0} h="40%" w="1px" bg="whiteAlpha.100" />
          <Box position="absolute" right={0} h="40%" w="1px" bg="whiteAlpha.100" />
          <Box px={4} py={1} bg="brand.500" transform="skewX(-10deg)">
            <Text textStyle="pill" color="white" fontSize="10px" transform="skewX(10deg)" letterSpacing="0.04em">PREVIEW</Text>
          </Box>
          <PreviewCountdown kickoffAt={m.kickoff_at ?? null} date={m.date} />
          <Text textStyle="cardTitle" color="white" fontSize="sm" whiteSpace="nowrap" textTransform="uppercase">{longDate(m.date)}</Text>
          <Text textStyle="editorial" color="whiteAlpha.600" fontSize="10px" fontWeight="700" textAlign="center">
            {[m.week_label, m.kickoff_label ?? "Kickoff TBA"].filter(Boolean).join(" · ")}
          </Text>
          <Text textStyle="editorial" color="whiteAlpha.500" fontSize="9px" fontWeight="900" textAlign="center" maxW="clamp(10rem, 16vw, 14rem)" lineHeight={1.3} lineClamp={2}>
            {m.venue}
          </Text>
        </Flex>
        <TeamSide side={m.home} align="right" />
      </Grid>
    </Box>
  );
};

// ── 3 · Strip ────────────────────────────────────────────────────────────────
export const STRIP = [["off_epa", "Off EPA / play"], ["def_epa", "Def EPA / play"], ["ppg", "Points / game"], ["allowed", "Allowed / game"], ["to_margin", "Turnover margin"]];
const Strip = ({ side }) => {
  const color = brandOf(side.team_id);
  return (
    <Grid templateColumns="repeat(5, minmax(0,1fr))" bg={PANEL} borderTop="3px solid" borderTopColor={color} overflow="hidden">
      {STRIP.map(([k, label], i) => {
        const s = side.strip[k];
        return (
          <Flex key={k} direction="column" justify="space-between" gap={2} px={3} py={3} borderLeft={i ? "1px solid" : "none"} borderColor={withAlpha(color, 0.35)} minW={0}>
            <Text fontSize="0.6rem" fontWeight="900" color="rgba(255,255,255,0.65)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.2} lineClamp={2}>{label}</Text>
            <Text fontSize="clamp(1.15rem, 1.9vw, 1.5rem)" fontWeight="900" color="white" fontFamily="mono" lineHeight={1} whiteSpace="nowrap">{s.display}</Text>
            <RankChip rank={s.rank} color={color} />
          </Flex>
        );
      })}
    </Grid>
  );
};

// ── 4a · Sheets — counting | efficiency, rank of 18 ─────────────────────────
export const COUNTING = [["ypg", "Yds / game"], ["pass_ypg", "Pass yds / game"], ["rush_ypg", "Rush yds / game"], ["turnovers", "Turnovers"], ["pen_ypg", "Pen yds / game"]];
export const EFFICIENCY = [["net_epa", "Net EPA / play"], ["o_success", "Off success rate"], ["d_success", "Def success rate"], ["net_epa_drive", "Net EPA / drive"], ["net_fp", "Net field position"]];
const SheetCol = ({ title, rows, data, color, total }) => (
  <Box minW={0}>
    <Kicker mb={2}>{title}</Kicker>
    <Flex direction="column" gap={2}>
      {rows.map(([k, label]) => {
        const s = data[k];
        const fill = s.rank ? ((total - s.rank) / (total - 1)) * 100 : 0;
        return (
          <Box key={k}>
            <Flex align="center" justify="space-between" gap={2}>
              <Text fontSize="0.74rem" fontWeight="700" color="rgba(255,255,255,0.75)" lineClamp={1}>{label}</Text>
              <Flex align="center" gap={2} flexShrink={0}>
                <Text fontSize="0.9rem" fontWeight="900" color="white" fontFamily="mono">{s.display}</Text>
                <RankChip rank={s.rank} color={color} total={total} />
              </Flex>
            </Flex>
            <Box h="3px" mt={1} bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
              <Box h="full" bg={color} opacity={0.85} style={{ width: `${Math.max(2, fill)}%` }} />
            </Box>
          </Box>
        );
      })}
    </Flex>
  </Box>
);
const Sheets = ({ side, total }) => {
  const color = brandOf(side.team_id);
  return (
    <Panel title={`${teamShort(side.team_id)} · season`} color={color} right={<Kicker>{side.games} games</Kicker>}>
      <Grid templateColumns="repeat(2, minmax(0,1fr))" gap={5}>
        <SheetCol title="Counting" rows={COUNTING} data={side.counting} color={color} total={total} />
        <SheetCol title="Efficiency" rows={EFFICIENCY} data={side.efficiency} color={color} total={total} />
      </Grid>
    </Panel>
  );
};

// ── 4b · Quarterback — the line and the air-yards curve ─────────────────────
// Share of a QB's attempts at each air-yard distance (how far past the line
// the ball travelled in the air), against every League attempt.
export const AirYards = ({ ay, color }) => {
  const W = 300, H = 150, PADL = 26, PADB = 18, PADT = 8;
  const all = [...ay.bins, ...ay.league_bins].map((b) => b.share);
  const max = Math.max(...all, 0.01);
  const x = (yd) => PADL + ((yd + 5) / 35) * (W - PADL - 4);
  const y = (v) => H - PADB - (v / max) * (H - PADB - PADT);
  const path = (bins) => bins.map((b, i) => `${i ? "L" : "M"}${x(b.yards).toFixed(1)},${y(b.share).toFixed(1)}`).join(" ");
  const area = `${path(ay.bins)} L${x(30)},${y(0)} L${x(-5)},${y(0)} Z`;
  const yTicks = [0, max / 2, max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PADL} x2={W - 4} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.06)" />
          <text x={PADL - 4} y={y(v) + 2.5} fontSize="7" fill="rgba(255,255,255,0.45)" textAnchor="end">{Math.round(v * 100)}%</text>
        </g>
      ))}
      {[-5, 0, 5, 10, 15, 20, 25, 30].map((t) => (
        <text key={t} x={x(t)} y={H - 6} fontSize="7" fill="rgba(255,255,255,0.45)" textAnchor="middle">{t === 30 ? "30+" : t}</text>
      ))}
      <line x1={x(0)} x2={x(0)} y1={PADT} y2={H - PADB} stroke="rgba(255,255,255,0.3)" />
      <path d={area} fill={color} fillOpacity="0.25" />
      <path d={path(ay.bins)} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      <path d={path(ay.league_bins)} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
      <line x1={x(ay.adot)} x2={x(ay.adot)} y1={PADT} y2={H - PADB} stroke={color} strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />
      <text x={x(ay.adot) + 3} y={PADT + 7} fontSize="7" fontWeight="900" fill={color}>avg {ay.adot.toFixed(1)}</text>
    </svg>
  );
};
// The QB's season passing, depth x direction — the same 3x3 the export
// poster carries: completions / attempts and yards per zone, shaded by
// completion rate. Page sizes in rem.
const GRID_DEPTHS = [["deep", "Deep", ">12"], ["medium", "Med", "4-12"], ["short", "Short", "<4"]];
const GRID_DIRS = [["L", "Left"], ["M", "Middle"], ["R", "Right"]];
export const PassGrid = ({ cells, color }) => {
  const at = (depth, dir) => cells.find((x) => x.depth === depth && x.direction === dir);
  return (
    <Grid templateColumns="3rem repeat(3, minmax(0,1fr))" gap="0.3rem" alignItems="stretch">
      <Box />
      {GRID_DIRS.map(([k, label]) => <Kicker key={k} textAlign="center">{label}</Kicker>)}
      {GRID_DEPTHS.map(([dk, label, range]) => (
        <Fragment key={dk}>
          <Flex direction="column" justify="center">
            <Kicker color="white">{label}</Kicker>
            <Kicker fontSize="0.55rem">{range}</Kicker>
          </Flex>
          {GRID_DIRS.map(([k]) => {
            const x = at(dk, k);
            const att = x?.attempts ?? 0;
            const rate = att ? x.completions / att : 0;
            return (
              <Flex key={k} direction="column" align="center" justify="center" h="3.2rem" borderRadius="0.35rem"
                bg={att ? withAlpha(color, 0.15 + rate * 0.65) : "rgba(255,255,255,0.04)"}
                border={att ? `1px solid ${withAlpha(color, 0.5)}` : "1px solid rgba(255,255,255,0.06)"}>
                <Text fontSize="1rem" fontWeight="900" fontFamily="mono" lineHeight={1} color={att ? "white" : "rgba(255,255,255,0.35)"}>{att ? `${x.completions}/${att}` : "—"}</Text>
                {att ? <Text fontSize="0.7rem" fontWeight="700" fontFamily="mono" lineHeight={1} mt="0.25rem" color="rgba(255,255,255,0.75)">{x.yards}y</Text> : null}
              </Flex>
            );
          })}
        </Fragment>
      ))}
    </Grid>
  );
};

const Quarterback = ({ side }) => {
  const qb = side.qb;
  const color = brandOf(side.team_id);
  if (!qb) return null;
  const l = qb.line ?? {};
  const cells = [["C/A", l.att != null ? `${l.cmp}/${l.att}` : "—"], ["Yds", l.yds ?? "—"], ["TD", l.td ?? "—"], ["INT", l.int ?? "—"], ["Sacks", l.sacks ?? "—"]];
  const ay = qb.air_yards;
  return (
    <Panel title={`${teamShort(side.team_id)} · quarterback`} color={color} flex={1} display="flex" flexDirection="column"
      bodyProps={{ flex: 1, display: "flex", flexDirection: "column" }}
      right={ay?.mock ? <Text fontSize="0.6rem" fontWeight="900" color={GOLD} letterSpacing="0.12em">MOCK</Text> : null}>
      <Flex align="center" gap={3}>
        <Box w="3.4rem" h="3.4rem" borderRadius="md" overflow="hidden" bg="whiteAlpha.100" border="2px solid" borderColor={color} flexShrink={0}>
          {qb.image_url ? <Image src={qb.image_url} alt="" w="full" h="full" objectFit="cover" objectPosition="top center" /> : null}
        </Box>
        <Text fontSize="1.05rem" fontWeight="900" color="white" lineClamp={2} minW={0}>{qb.name}</Text>
      </Flex>
      <Grid templateColumns="repeat(5, minmax(0,1fr))" gap={1.5} mt={3}>
        {cells.map(([k, v]) => (
          <Box key={k} bg="whiteAlpha.50" borderRadius="md" px={1} py={1.5} textAlign="center" minW={0}>
            <Kicker fontSize="0.52rem">{k}</Kicker>
            <Text fontSize="clamp(0.78rem, 1.1vw, 0.95rem)" fontWeight="900" color="white" fontFamily="mono" whiteSpace="nowrap">{v}</Text>
          </Box>
        ))}
      </Grid>
      {qb.pass_map?.cells && (
        <Box mt={4} flex={1}>
          <PassGrid cells={qb.pass_map.cells} color={color} />
        </Box>
      )}
    </Panel>
  );
};

// ── 4c · Advantage — each offense against the other defense ─────────────────
const UnitBlock = ({ offId, defId, rows, total }) => {
  const oc = brandOf(offId), dc = brandOf(defId);
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Flex align="center" gap={1.5}><Image src={teamLogo(offId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" /><Kicker color="white">{teamShort(offId)} offense</Kicker></Flex>
        <Kicker>vs</Kicker>
        <Flex align="center" gap={1.5}><Kicker color="white">{teamShort(defId)} defense</Kicker><Image src={teamLogo(defId)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" /></Flex>
      </Flex>
      <Flex direction="column" gap={2.5}>
        {rows.map((r) => {
          const gap = r.off.rank && r.def.rank ? r.def.rank - r.off.rank : 0;
          const edge = gap > 0 ? offId : gap < 0 ? defId : null;
          const pos = 50 - (gap / (total - 1)) * 44;
          return (
            <Box key={r.label}>
              <Kicker fontSize="0.55rem" textAlign="center" mb={1}>{r.label}</Kicker>
              <Grid templateColumns="auto minmax(0,1fr) auto" alignItems="center" gap={2}>
                <Flex align="center" gap={1.5}>
                  <Text fontSize="0.85rem" fontWeight="900" color="white" fontFamily="mono" w="3.4rem">{r.off.display}</Text>
                  <RankChip rank={r.off.rank} color={oc} total={total} />
                </Flex>
                <Box position="relative" h="1.5rem">
                  <Box position="absolute" left={0} right={0} top="50%" h="4px" mt="-2px" bg="whiteAlpha.100" borderRadius="full" />
                  <Box position="absolute" left="50%" top="20%" bottom="20%" w="1px" bg="whiteAlpha.300" />
                  <Box position="absolute" top="50%" h="4px" mt="-2px" borderRadius="full" bg={edge === offId ? oc : edge === defId ? dc : "transparent"}
                    style={{ left: `${Math.min(pos, 50)}%`, width: `${Math.abs(50 - pos)}%` }} />
                  <Flex position="absolute" top="50%" align="center" justify="center" w="1.5rem" h="1.5rem" borderRadius="full" bg="#0B0B0D" border="1px solid" borderColor="whiteAlpha.300"
                    transform="translate(-50%,-50%)" style={{ left: `${pos}%` }}>
                    {edge ? <Image src={teamLogo(edge)} alt="" w="1.05rem" h="1.05rem" objectFit="contain" /> : <Text fontSize="0.7rem" fontWeight="900" color={DIM}>=</Text>}
                  </Flex>
                </Box>
                <Flex align="center" gap={1.5}>
                  <RankChip rank={r.def.rank} color={dc} total={total} />
                  <Text fontSize="0.85rem" fontWeight="900" color="white" fontFamily="mono" w="3.4rem" textAlign="right">{r.def.display}</Text>
                </Flex>
              </Grid>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};
const Advantage = ({ m }) => (
  <Panel title="Unit matchups" color="#A855F7" h="full">
    <Flex direction="column" gap={5}>
      <UnitBlock offId={m.away.team_id} defId={m.home.team_id} rows={m.units.away_offense} total={m.ranked_teams} />
      <Box h="1px" bg={LINE} />
      <UnitBlock offId={m.home.team_id} defId={m.away.team_id} rows={m.units.home_offense} total={m.ranked_teams} />
    </Flex>
  </Panel>
);

// ── 5 · Leaders — top 8 by season production ────────────────────────────────
const Leaders = ({ side, max }) => {
  const color = brandOf(side.team_id);
  return (
    <Panel title={`${teamShort(side.team_id)} · production leaders`} color={color} right={<Kicker>Season</Kicker>}>
      <Flex direction="column">
        {side.leaders.map((p, i) => (
          <Grid key={p.person_id} templateColumns="1.2rem 2.8rem minmax(0,1fr)" alignItems="center" gap={3} py={2} borderTop={i ? "1px solid" : "none"} borderColor={LINE}>
            <Text fontSize="0.85rem" fontWeight="900" fontStyle="italic" color={i === 0 ? color : DIM}>{i + 1}</Text>
            <Box w="2.8rem" h="2.8rem" borderRadius="md" overflow="hidden" bg="whiteAlpha.100">
              {p.image_url ? <Image src={p.image_url} alt="" w="full" h="full" objectFit="cover" objectPosition="top center" /> : null}
            </Box>
            <Box minW={0}>
              <Flex align="center" gap={2.5}>
                <Text fontSize="0.9rem" fontWeight="900" color="white" lineClamp={1} minW="5.5rem">{p.last_name}</Text>
                <Kicker w="2rem" flexShrink={0}>{p.position}</Kicker>
                <Box flex={1} h="7px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" minW="3rem">
                  <Box h="full" bg={color} borderRadius="full" style={{ width: `${(p.production / max) * 100}%` }} />
                </Box>
                <Text fontSize="0.9rem" fontWeight="900" color="white" fontFamily="mono" textAlign="right" w="3rem" flexShrink={0}>{p.production.toFixed(1)}</Text>
                <Text fontSize="0.68rem" fontWeight="800" color={DIM} fontFamily="mono" textAlign="right" w="2.8rem" flexShrink={0}>{p.per_game.toFixed(1)}/g</Text>
              </Flex>
              <Flex gap={4} mt={1}>
                {(p.stats ?? []).map((st) => (
                  <Flex key={st.label} align="baseline" gap={1}>
                    <Text fontSize="0.82rem" fontWeight="900" color="white" fontFamily="mono">{st.value}</Text>
                    <Kicker fontSize="0.52rem">{st.label}</Kicker>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </Grid>
        ))}
      </Flex>
    </Panel>
  );
};


// ═════════════════════════════════════════════════════════════════════════════
// EXPORT — the social poster. Landscape 1400 wide, laid out like the matchup-
// scout reference so the whole read lands at a glance: team bars and the game
// line, both strips, then away | unit matchups | home, then the leaders. No
// photos. Fixed px throughout so the PNG is the same everywhere.
// ═════════════════════════════════════════════════════════════════════════════

const POSTER_W = 1240;
const P_BG = "#0B0B0D";
const P_PANEL = "#141416";
const P_SEAM = "rgba(168,85,247,0.35)";

const PKick = ({ children, color = "rgba(255,255,255,0.55)", size = 11, ...rest }) => (
  <Text fontSize={`${size}px`} fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.15} {...rest}>{children}</Text>
);
const PChip = ({ rank, color, w = "34px" }) => (
  <Flex align="center" justify="center" minW={w} h="20px" px="4px" borderRadius="4px" bg={rank ? color : "rgba(255,255,255,0.08)"} flexShrink={0}>
    <Text fontSize="12px" fontWeight="900" color={rank ? inkOn(color) : "white"} lineHeight={1}>{rank ? `#${rank}` : "—"}</Text>
  </Flex>
);
// A panel: team- or brand-coloured title bar, body tight under it.
const PBox = ({ title, color = BRAND, right, children, ...rest }) => (
  <Flex direction="column" bg={P_PANEL} minW={0} {...rest}>
    <Flex align="center" justify="space-between" px="12px" h="26px" bg={withAlpha(color, 0.22)} borderTop={`3px solid ${color}`} flexShrink={0}>
      <PKick color="white" size={11}>{title}</PKick>
      {right}
    </Flex>
    <Box px="12px" py="8px" flex={1} minH={0}>{children}</Box>
  </Flex>
);

// ── Banner — the page banner at fixed px: logo, school over mascot, record, coaches; centre block ──
const daysTo = (date) => {
  const d = new Date(`${date}T00:00:00`);
  const n = Math.round((d.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
  return n <= 0 ? "Game day" : `${n} ${n === 1 ? "day" : "days"}`;
};
const PBannerSide = ({ sd, right }) => {
  const coaches = [["Head coach", sd.coaches.head_coach], ["Off. coord.", sd.coaches.offensive_coordinator], ["Def. coord.", sd.coaches.defensive_coordinator]];
  return (
    <Flex direction="column" justify="center" gap="14px" minW={0} px="28px" py="18px">
      <Flex align="center" gap="22px" direction={right ? "row-reverse" : "row"} minW={0}>
        <Image src={teamLogo(sd.team_id)} alt="" h="100px" objectFit="contain" flexShrink={0} />
        <Box minW={0} textAlign={right ? "right" : "left"}>
          <Text fontSize="29px" fontWeight="900" textTransform="uppercase" letterSpacing="0.03em" lineHeight={1}>{teamName(sd.team_id)}</Text>
          <Text fontSize="21px" fontWeight="900" color="rgba(255,255,255,0.8)" textTransform="uppercase" letterSpacing="0.05em" lineHeight={1.05} mt="4px">{teamMascot(sd.team_id)}</Text>
          <Flex align="baseline" gap="6px" mt="6px" justify={right ? "flex-end" : "flex-start"}>
            <Text fontSize="15px" fontWeight="900">{sd.conference_record} {String(sd.conference ?? "").toUpperCase()}</Text>
            <Text fontSize="15px" fontWeight="500" color="rgba(255,255,255,0.6)">({sd.record ?? "—"})</Text>
          </Flex>
        </Box>
      </Flex>
      <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="12px" pt="10px" borderTop="1px solid rgba(255,255,255,0.12)" textAlign={right ? "right" : "left"}>
        {(right ? [...coaches].reverse() : coaches).map(([role, name]) => (
          <Box key={role} minW={0}>
            <PKick size={8} color="rgba(255,255,255,0.5)">{role}</PKick>
            <Text fontSize="12.5px" fontWeight="800" lineHeight={1.15} mt="2px">{name ?? "—"}</Text>
          </Box>
        ))}
      </Grid>
    </Flex>
  );
};
const PBanner = ({ m }) => {
  const awayColor = teamAccent(m.away.team_id);
  const homeColor = teamAccent(m.home.team_id);
  return (
    <Box position="relative" overflow="hidden" bg="#08080A">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${withAlpha(awayColor, 0.27)} 0%, #08080A 34%, #08080A 66%, ${withAlpha(homeColor, 0.27)} 100%)`} />
      <Image src={teamLogo(m.away.team_id)} alt="" position="absolute" left="-5%" top="50%" transform="translateY(-50%)" h="300px" opacity={0.16} objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      <Image src={teamLogo(m.home.team_id)} alt="" position="absolute" right="-5%" top="50%" transform="translateY(-50%)" h="300px" opacity={0.16} objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      <Grid position="relative" templateColumns="minmax(0,1fr) 250px minmax(0,1fr)" alignItems="stretch">
        <PBannerSide sd={m.away} />
        <Flex direction="column" align="center" justify="center" gap="8px" px="12px">
          <Box px="16px" py="4px" bg={BRAND} transform="skewX(-10deg)">
            <Text fontSize="10px" fontWeight="900" color="white" letterSpacing="0.1em" transform="skewX(10deg)">PREVIEW</Text>
          </Box>
          <Text fontSize="15px" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="0.06em">{daysTo(m.date)}</Text>
          <Text fontSize="14px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">{longDate(m.date)}</Text>
          <Text fontSize="10px" fontWeight="700" color="rgba(255,255,255,0.6)" textAlign="center" textTransform="uppercase" letterSpacing="0.08em">
            {[m.week_label, m.kickoff_label ?? "Kickoff TBA"].filter(Boolean).join(" · ")}
          </Text>
          <Text fontSize="9px" fontWeight="900" color="rgba(255,255,255,0.5)" textAlign="center" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1.3} maxW="220px">{m.venue}</Text>
        </Flex>
        <PBannerSide sd={m.home} right />
      </Grid>
    </Box>
  );
};

// ── Strip: five stats with ranks ─────────────────────────────────────────────
const PStrip = ({ sd }) => {
  const c = brandOf(sd.team_id);
  return (
    <Grid templateColumns="repeat(5, minmax(0,1fr))" bg={P_PANEL} borderTop={`3px solid ${c}`}>
      {STRIP.map(([k, label], i) => {
        const v = sd.strip[k];
        return (
          <Box key={k} px="12px" py="7px" borderLeft={i ? `1px solid ${withAlpha(c, 0.3)}` : "none"}>
            <PKick size={10}>{label}</PKick>
            <Flex align="center" gap="8px" mt="3px">
              <Text fontSize="22px" fontWeight="900" fontFamily="mono" lineHeight={1}>{v.display}</Text>
              <PChip rank={v.rank} color={c} />
            </Flex>
          </Box>
        );
      })}
    </Grid>
  );
};

// The QB's season passing, depth x direction: completions / attempts and yards
// per zone, shaded by completion rate.
const PASS_DEPTHS = [["deep", "Deep", ">12"], ["medium", "Med", "4-12"], ["short", "Short", "<4"]];
const PASS_DIRS = [["L", "Left"], ["M", "Middle"], ["R", "Right"]];
const PPassGrid = ({ cells, color }) => {
  const at = (depth, dir) => cells.find((x) => x.depth === depth && x.direction === dir);
  return (
    <Grid templateColumns="44px repeat(3, minmax(0,1fr))" columnGap="4px" rowGap="4px" alignItems="stretch">
      <Box />
      {PASS_DIRS.map(([k, label]) => <PKick key={k} size={9} textAlign="center">{label}</PKick>)}
      {PASS_DEPTHS.map(([dk, label, range]) => (
        <Fragment key={dk}>
          <Flex direction="column" justify="center">
            <PKick size={10} color="white">{label}</PKick>
            <PKick size={8}>{range}</PKick>
          </Flex>
          {PASS_DIRS.map(([k]) => {
            const x = at(dk, k);
            const att = x?.attempts ?? 0;
            const rate = att ? x.completions / att : 0;
            return (
              <Flex key={k} direction="column" align="center" justify="center" h="40px" borderRadius="5px"
                bg={att ? withAlpha(color, 0.15 + rate * 0.65) : "rgba(255,255,255,0.04)"}
                border={att ? `1px solid ${withAlpha(color, 0.5)}` : "1px solid rgba(255,255,255,0.06)"}>
                <Text fontSize="14px" fontWeight="900" fontFamily="mono" lineHeight={1} color={att ? "white" : "rgba(255,255,255,0.35)"}>{att ? `${x.completions}/${att}` : "—"}</Text>
                {att ? <Text fontSize="10px" fontWeight="700" fontFamily="mono" lineHeight={1} mt="3px" color="rgba(255,255,255,0.7)">{x.yards}y</Text> : null}
              </Flex>
            );
          })}
        </Fragment>
      ))}
    </Grid>
  );
};

// ── Side: counting | efficiency, then the QB's season passing grid ───
const PSide = ({ sd, total }) => {
  const c = brandOf(sd.team_id);
  const col = (rows, data) => (
    <Box minW={0}>
      {rows.map(([k, label]) => {
        const v = data[k];
        return (
          <Flex key={k} align="center" justify="space-between" gap="6px" h="24px">
            <Text fontSize="12px" fontWeight="700" color="rgba(255,255,255,0.72)" whiteSpace="nowrap">{label}</Text>
            <Flex align="center" gap="6px">
              <Text fontSize="14px" fontWeight="900" fontFamily="mono">{v.display}</Text>
              <PChip rank={v.rank} color={c} w="32px" />
            </Flex>
          </Flex>
        );
      })}
    </Box>
  );
  const qb = sd.qb;
  const l = qb?.line ?? {};
  const ay = qb?.air_yards;
  return (
    <Flex direction="column" gap="1px" bg={P_SEAM} minW={0}>
      <PBox title={`${teamShort(sd.team_id)} · season`} color={c} right={<PKick size={10} color="rgba(255,255,255,0.75)">{sd.games} G · rank of {total}</PKick>}>
        {/* Counting only on the poster — the efficiency read lives in the strip and the matchups. */}
        {col(COUNTING, sd.counting)}
      </PBox>
      {qb && (
        <PBox title={`${teamShort(sd.team_id)} · ${qb.name}`} color={c} flex={1}
          right={qb.air_yards?.mock ? <PKick size={10} color={GOLD}>Mock</PKick> : null}>
          <Flex gap="14px" mb="8px">
            {[["C/A", l.att != null ? `${l.cmp}/${l.att}` : "—"], ["Yds", l.yds ?? "—"], ["TD", l.td ?? "—"], ["INT", l.int ?? "—"], ["Sk", l.sacks ?? "—"], ["aDOT", ay?.adot != null ? ay.adot.toFixed(1) : "—"]].map(([k, v]) => (
              <Flex key={k} align="baseline" gap="4px">
                <Text fontSize="16px" fontWeight="900" fontFamily="mono">{v}</Text>
                <PKick size={9}>{k}</PKick>
              </Flex>
            ))}
          </Flex>
          {qb.pass_map?.cells && <PPassGrid cells={qb.pass_map.cells} color={c} />}
        </PBox>
      )}
    </Flex>
  );
};

// ── Unit matchups, both directions stacked ───────────────────────────────────
const PUnitRows = ({ offId, defId, rows, total }) => {
  const oc = brandOf(offId), dc = brandOf(defId);
  return (
    <Box>
      <Flex justify="space-between" align="center" mb="4px">
        <Flex align="center" gap="6px"><Image src={teamLogo(offId)} alt="" w="18px" h="18px" objectFit="contain" /><PKick color="white" size={11}>{teamShort(offId)} offense</PKick></Flex>
        <PKick size={10}>vs</PKick>
        <Flex align="center" gap="6px"><PKick color="white" size={11}>{teamShort(defId)} defense</PKick><Image src={teamLogo(defId)} alt="" w="18px" h="18px" objectFit="contain" /></Flex>
      </Flex>
      {rows.map((r) => {
        const gap = r.off.rank && r.def.rank ? r.def.rank - r.off.rank : 0;
        const edge = gap > 0 ? offId : gap < 0 ? defId : null;
        const pos = 50 - (gap / (total - 1)) * 44;
        return (
          <Grid key={r.label} templateColumns="56px 34px 1fr 34px 56px" alignItems="center" columnGap="6px" h="30px">
            <Text fontSize="14px" fontWeight="900" fontFamily="mono">{r.off.display}</Text>
            <PChip rank={r.off.rank} color={oc} />
            <Box position="relative" h="30px">
              <PKick size={9} position="absolute" top="0" left="0" right="0" textAlign="center">{r.label}</PKick>
              <Box position="absolute" left={0} right={0} top="19px" h="4px" bg="rgba(255,255,255,0.1)" borderRadius="full" />
              <Box position="absolute" top="19px" h="4px" borderRadius="full" bg={edge === offId ? oc : edge === defId ? dc : "transparent"}
                style={{ left: `${Math.min(pos, 50)}%`, width: `${Math.abs(50 - pos)}%` }} />
              <Flex position="absolute" top="12px" w="18px" h="18px" ml="-9px" borderRadius="full" bg={P_BG} border="1px solid rgba(255,255,255,0.3)" align="center" justify="center" style={{ left: `${pos}%` }}>
                {edge ? <Image src={teamLogo(edge)} alt="" w="13px" h="13px" objectFit="contain" /> : <Text fontSize="10px" fontWeight="900" color="rgba(255,255,255,0.5)">=</Text>}
              </Flex>
            </Box>
            <PChip rank={r.def.rank} color={dc} />
            <Text fontSize="14px" fontWeight="900" fontFamily="mono" textAlign="right">{r.def.display}</Text>
          </Grid>
        );
      })}
    </Box>
  );
};

// ── Leaders: top five, one line each ────────────────────────────────────────
const PLeaders = ({ sd, max }) => {
  const c = brandOf(sd.team_id);
  return (
    <PBox title={`${teamShort(sd.team_id)} · production leaders`} color={c} right={<PKick size={10} color="rgba(255,255,255,0.75)">Season</PKick>}>
      {sd.leaders.slice(0, 5).map((p, i) => (
        <Grid key={p.person_id} templateColumns="16px 100px 34px 1fr 50px minmax(0,1.4fr)" alignItems="center" columnGap="10px" h="25px">
          <Text fontSize="13px" fontWeight="900" fontStyle="italic" color={i === 0 ? c : "rgba(255,255,255,0.45)"}>{i + 1}</Text>
          <Text fontSize="14px" fontWeight="900" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{p.last_name}</Text>
          <PKick size={10}>{p.position}</PKick>
          <Box h="6px" bg="rgba(255,255,255,0.1)" borderRadius="full" overflow="hidden">
            <Box h="full" bg={c} borderRadius="full" style={{ width: `${(p.production / max) * 100}%` }} />
          </Box>
          <Text fontSize="14px" fontWeight="900" fontFamily="mono" textAlign="right">{p.production.toFixed(1)}</Text>
          <Text fontSize="12px" fontWeight="700" color="rgba(255,255,255,0.62)" fontFamily="mono" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {(p.stats ?? []).map((st) => `${st.value} ${st.label}`).join(" · ")}
          </Text>
        </Grid>
      ))}
    </PBox>
  );
};

export const GamePreviewScoutPoster = ({ m, innerRef }) => {
  const max = Math.max(...[...m.away.leaders, ...m.home.leaders].slice(0).map((p) => p.production), 1);
  return (
    <Box ref={innerRef} w={`${POSTER_W}px`} bg={P_BG} color="white" p="14px">
      <Flex direction="column" gap="1px" bg={P_SEAM} border={`1px solid ${P_SEAM}`} borderRadius="12px" overflow="hidden">
        <PBanner m={m} />
        <Flex align="center" justify="flex-end" bg={P_PANEL} h="28px">
          <Text px="14px" fontSize="14px" fontWeight="900" fontStyle="italic" letterSpacing="-0.02em">HBCU <Text as="span" color={BRAND}>GRIDIRON GLORY</Text></Text>
        </Flex>
        <Grid templateColumns="1fr 1fr" gap="1px" bg={P_SEAM}>
          <PStrip sd={m.away} />
          <PStrip sd={m.home} />
        </Grid>
        <Grid templateColumns="minmax(0,0.78fr) minmax(0,1.22fr) minmax(0,0.78fr)" gap="1px" bg={P_SEAM} alignItems="stretch">
          <PSide sd={m.away} total={m.ranked_teams} />
          <PBox title="Unit matchups" right={<PKick size={10} color="rgba(255,255,255,0.75)">Through week {m.through_week}</PKick>}>
            <Flex direction="column" gap="10px">
              <PUnitRows offId={m.away.team_id} defId={m.home.team_id} rows={m.units.away_offense} total={m.ranked_teams} />
              <Box h="1px" bg="rgba(255,255,255,0.1)" />
              <PUnitRows offId={m.home.team_id} defId={m.away.team_id} rows={m.units.home_offense} total={m.ranked_teams} />
            </Flex>
          </PBox>
          <PSide sd={m.home} total={m.ranked_teams} />
        </Grid>
        <Grid templateColumns="1fr 1fr" gap="1px" bg={P_SEAM}>
          <PLeaders sd={m.away} max={max} />
          <PLeaders sd={m.home} max={max} />
        </Grid>
      </Flex>
    </Box>
  );
};

// The Export button: opens the poster in a preview, Save writes the PNG.
const ExportScout = ({ m }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const posterRef = useRef(null);
  const save = async () => {
    if (!posterRef.current || busy) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(posterRef.current, { pixelRatio: 2, backgroundColor: P_BG, cacheBust: true, width: POSTER_W, style: { transform: "none" } });
      downloadDataUrl(url, `preview-${m.week_label.toLowerCase().replace(/\s+/g, "")}-${teamShort(m.away.team_id).toLowerCase()}-at-${teamShort(m.home.team_id).toLowerCase()}.png`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Flex as="button" type="button" onClick={() => setOpen(true)} position="absolute" top="0.75rem" right="0.75rem" zIndex={5}
        align="center" gap={1.5} px={3} py={1.5} borderRadius="md" bg="whiteAlpha.200" _hover={{ bg: "whiteAlpha.300" }}>
        <Download size={13} />
        <Text fontSize="10px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.16em">Export</Text>
      </Flex>
      {open && (
        <Box position="fixed" inset={0} zIndex={2000} bg="rgba(0,0,0,0.85)" overflowY="auto" onClick={() => setOpen(false)}>
          <Flex direction="column" align="center" py={6} gap={4} onClick={(e) => e.stopPropagation()}>
            <Flex gap={2}>
              <Flex as="button" type="button" onClick={save} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg="brand.500" opacity={busy ? 0.6 : 1}>
                <Download size={15} /><Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">{busy ? "Saving" : "Save PNG"}</Text>
              </Flex>
              <Flex as="button" type="button" onClick={() => setOpen(false)} align="center" gap={2} px={4} h="2.4rem" borderRadius="md" bg="whiteAlpha.200">
                <X size={15} /><Text fontSize="12px" fontWeight="900" textTransform="uppercase" letterSpacing="0.12em">Close</Text>
              </Flex>
            </Flex>
            {/* Shown shrunk to the window; the PNG comes off a hidden full-size
                copy, so zoom never touches the capture. */}
            <Box boxShadow="0 1rem 3rem rgba(0,0,0,0.6)" style={{ zoom: Math.min(1, (window.innerWidth - 48) / POSTER_W) }}>
              <GamePreviewScoutPoster m={m} />
            </Box>
            <Box position="fixed" left="-20000px" top={0} aria-hidden="true">
              <GamePreviewScoutPoster m={m} innerRef={posterRef} />
            </Box>
          </Flex>
        </Box>
      )}
    </>
  );
};

// Panels butt together: each grid has a 1px gap over the hairline colour, so
// the seams are lines rather than gutters, inside one rounded frame.
const SEAM = { gap: "1px", bg: "rgba(168,85,247,0.35)" };

export const GamePreviewScout = ({ m }) => {
  const max = Math.max(...[...m.away.leaders, ...m.home.leaders].map((p) => p.production), 1);
  return (
    <Flex direction="column" w="full" borderRadius="2xl" overflow="hidden" border="1px solid" borderColor="rgba(168,85,247,0.35)" {...SEAM}>
      <Banner m={m} />
      <Grid templateColumns="repeat(2, minmax(0,1fr))" {...SEAM}>
        <Strip side={m.away} />
        <Strip side={m.home} />
      </Grid>
      <Grid templateColumns="minmax(0,1fr) minmax(0,1.1fr) minmax(0,1fr)" alignItems="stretch" {...SEAM}>
        <Flex direction="column" {...SEAM}><Sheets side={m.away} total={m.ranked_teams} /><Quarterback side={m.away} /></Flex>
        <Advantage m={m} />
        <Flex direction="column" {...SEAM}><Sheets side={m.home} total={m.ranked_teams} /><Quarterback side={m.home} /></Flex>
      </Grid>
      <Grid templateColumns="repeat(2, minmax(0,1fr))" {...SEAM}>
        <Leaders side={m.away} max={max} />
        <Leaders side={m.home} max={max} />
      </Grid>
    </Flex>
  );
};

export default GamePreviewScout;
