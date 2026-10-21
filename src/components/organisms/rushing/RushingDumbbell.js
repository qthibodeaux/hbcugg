import { Box, Flex, Text } from "@chakra-ui/react";
import { PlotBox, RushingFace, RushingMarker } from "./RushingMarker";
import { TEAM_BY_V5, ringOf, shortOf, shortOfLabel, tickText, ticksFor } from "./rushingModel";

// Slide 8, Week 6: a dumbbell per SWAC team that played — Weeks 0-5 run success
// in grey, Week 6 in the team colour, the stretch between them the swing — and
// the week's top rushers beside it. Rows run from the best Week 6 down.

const W = 700;
const H = 760;
const PAD = { l: 210, r: 60, t: 62, b: 50 };
const GREY = "#71717A";

export const RushingDumbbell = ({ chart, leaders = [], srcsFor = () => [], faces = true }) => {
  const rows = [...chart.rows_data].sort((a, b) => b.week_success_rate - a.week_success_rate);
  const { x: ax, from, to } = chart;
  const left = PAD.l;
  const right = W - PAD.r;
  const top = PAD.t;
  const bottom = H - PAD.b;
  const rowH = (bottom - top) / rows.length;
  const px = (v) => left + ((v - ax.min) / (ax.max - ax.min)) * (right - left);
  const rowY = (i) => top + rowH * i + rowH / 2;

  return (
    <Flex gap={4} align="flex-start">
      <Box flex="1.75" minW={0} w="full">
        <PlotBox W={W} H={H}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} role="img" aria-label="Run success rate, Week 6 against Weeks 0-5">
            {ticksFor(ax.min, ax.max).map((t) => (
              <g key={t}>
                <line x1={px(t)} x2={px(t)} y1={top} y2={bottom} stroke="rgba(255,255,255,0.06)" />
                <text x={px(t)} y={bottom + 24} textAnchor="middle" fontSize="13" fontWeight="800" fill="#A1A1AA">{tickText(ax)(t)}</text>
              </g>
            ))}
            <circle cx={left + 6} cy={top - 28} r="7" fill={GREY} />
            <text x={left + 20} y={top - 23} fontSize="14" fontWeight="900" fill="#F4F4F5">{from.label}</text>
            <circle cx={left + 128} cy={top - 28} r="7" fill="#F4F4F5" />
            <text x={left + 142} y={top - 23} fontSize="14" fontWeight="900" fill="#F4F4F5">{to.label}</text>

            {rows.map((r, i) => {
              const color = ringOf(TEAM_BY_V5[r.team_id]);
              const y = rowY(i);
              const a = px(r.before_success_rate);
              const b = px(r.week_success_rate);
              const up = b >= a;
              return (
                <g key={r.team_id}>
                  {i % 2 === 0 && <rect x={0} y={y - rowH / 2} width={W} height={rowH} fill="rgba(255,255,255,0.025)" />}
                  <text x={64} y={y - 2} fontSize="17" fontWeight="900" fill="#F4F4F5">{shortOf(r.team_id)}</text>
                  <text x={64} y={y + 15} fontSize="12" fontWeight="800" fill="#A1A1AA">vs {shortOfLabel(r.opponent)}</text>
                  <line x1={a} x2={b} y1={y} y2={y} stroke={color} strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
                  <circle cx={a} cy={y} r="8" fill={GREY} />
                  <circle cx={b} cy={y} r="12" fill={color} stroke="#0B0B0D" strokeWidth="2" />
                  <text x={a + (up ? -14 : 14)} y={y + 5} textAnchor={up ? "end" : "start"} fontSize="13" fontWeight="800" fill="#A1A1AA">{Math.round(r.before_success_rate)}%</text>
                  <text x={b + (up ? 20 : -20)} y={y + 6} textAnchor={up ? "start" : "end"} fontSize="15" fontWeight="900" fill="#F4F4F5">{Math.round(r.week_success_rate)}%</text>
                </g>
              );
            })}
          </svg>
          {rows.map((r, i) => (
            <RushingMarker key={`m${r.team_id}`} x={(34 / W) * 100} y={(rowY(i) / H) * 100} d={(38 / W) * 100} team={TEAM_BY_V5[r.team_id]} />
          ))}
        </PlotBox>
      </Box>

      <Box flex="1" minW={0} w="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" py={3}>
        <Text px={4} pb={2} fontSize="xs" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.14em">Top rushers</Text>
        {leaders.map((l) => {
          const team = TEAM_BY_V5[l.team_id];
          return (
            <Flex key={`${l.team_id}-${l.player_name}`} align="center" gap={3} px={4} py={2.5} borderTop="1px solid" borderColor="whiteAlpha.100">
              <Flex w="2.8rem" h="2.8rem" flexShrink={0} borderRadius="full" bg="#17171A" overflow="hidden" align="center" justify="center" style={{ border: `2px solid ${ringOf(team)}` }}>
                <RushingFace srcs={faces ? srcsFor(l) : []} team={team} />
              </Flex>
              <Box flex={1} minW={0}>
                <Text fontSize="md" fontWeight="900" color="text.primary" lineClamp={1}>{l.player_name}</Text>
                <Text fontSize="xs" fontWeight="800" color="text.muted">{shortOf(l.team_id)}</Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="md" fontWeight="900" color="text.primary" fontVariantNumeric="tabular-nums">{l.carries}-{l.yards}</Text>
                <Text fontSize="xs" fontWeight="800" color="text.muted">{l.td} TD · long {l.long}</Text>
              </Box>
            </Flex>
          );
        })}
      </Box>
    </Flex>
  );
};
