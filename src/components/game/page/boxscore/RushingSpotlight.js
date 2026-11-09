import { Box, Grid, Text } from "@chakra-ui/react";
import { rate, pct } from "../../../../utils/productionPresentation";
import { SpotlightCard } from "./ProductionSpotlight";

// Extracted from the live production panel; existing semantics are preserved.

// ═══════════════════════════════════════════════════════════════════════════════
// GAP CHART
// ═══════════════════════════════════════════════════════════════════════════════
// Three bars, one per direction, each stacked into the three things a carry can be
// made of. Height is raw yardage: bar length is what he produced running that way,
// and the split is who earned it — line credit against the axis, then the yards he
// added past it riding on top, in the order the yards were actually gained. Losses
// hang below the axis, so a direction he was stopped in dips rather than just being
// short. One domain across the three bars, so they are comparable to each other and
// the axis sits at the same height in every lane.
const STUFF_COLOR = "#C0453A";

const LANE_GAP = "0.5rem";

const LaneChart = ({ lanes, heat }) => {
  if (!lanes) return null;
  const posMax = Math.max(0.001, ...lanes.map((l) => Math.max(0, l.yards)));
  const negMax = Math.max(0, ...lanes.map((l) => Math.abs(Math.min(0, l.yards))));
  const domain = posMax + negMax;
  const zeroTop = (posMax / domain) * 100;
  const h = (v) => (Math.abs(v) / domain) * 100;

  return (
    <Box>
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={LANE_GAP}>
        {lanes.map((l) => (
          <Text key={`v-${l.key}`} textAlign="center" fontFamily="mono" fontWeight="950" color="white" lineHeight={1} fontSize="clamp(0.75rem, 1.05vw, 0.95rem)">
            {l.att > 0 ? `${l.yards}y` : "—"}
          </Text>
        ))}
      </Grid>

      <Box position="relative" h="clamp(3rem, 4.5vw, 4rem)" mt={1}>
        <Box position="absolute" left={0} right={0} h="0.0625rem" bg="rgba(255,255,255,0.3)" zIndex={2} style={{ top: `${zeroTop}%` }} />
        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={LANE_GAP} h="full">
          {lanes.map((l) => {
            const up = l.yards >= 0;
            const barH = h(l.yards);
            // The backend's split, when it ships: line yards (lighter) under
            // highlight yards (solid), stacked to the lane's total.
            const split = up && l.line != null && l.highlight != null && l.yards > 0;
            if (split) {
              const lineH = h(Math.max(0, l.line));
              const hlH = Math.max(0, barH - lineH);
              return (
                <Box key={l.key} position="relative" h="full">
                  <Box position="absolute" left="16%" right="16%" bg={heat} opacity={0.42} style={{ top: `${zeroTop - lineH}%`, height: `${lineH}%` }} />
                  <Box position="absolute" left="16%" right="16%" bg={heat} borderRadius="0.125rem 0.125rem 0 0" style={{ top: `${zeroTop - lineH - hlH}%`, height: `${hlH}%` }} />
                </Box>
              );
            }
            return (
              <Box key={l.key} position="relative" h="full">
                {barH > 0 && (
                  <Box
                    position="absolute"
                    left="16%"
                    right="16%"
                    bg={up ? heat : STUFF_COLOR}
                    borderRadius={up ? "0.125rem 0.125rem 0 0" : "0 0 0.125rem 0.125rem"}
                    style={up ? { top: `${zeroTop - barH}%`, height: `${barH}%` } : { top: `${zeroTop}%`, height: `${barH}%` }}
                  />
                )}
              </Box>
            );
          })}
        </Grid>
      </Box>

      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={LANE_GAP} mt={1.5}>
        {lanes.map((l) => (
          <Box key={`l-${l.key}`} textAlign="center" minW={0}>
            <Text fontSize="clamp(0.45rem, 0.62vw, 0.58rem)" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
              {l.label}
            </Text>
            <Text fontSize="clamp(0.4rem, 0.55vw, 0.52rem)" fontWeight="800" color="rgba(255,255,255,0.32)" mt="0.125rem">
              {l.att} car{l.att > 0 && l.successRate != null ? ` · ${Math.round(l.successRate * 100)}% succ` : ""}{l.stuffed ? ` · ${l.stuffed} stuffed` : ""}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export const RusherSpotlight = ({ player, accent, heat, teamId, identity, productionRows }) => {
  if (!player) return null;

  const chips = [
    ["Rush-Yds", `${player.attempts}-${player.yards}`],
    ["Yd/ Car", rate(player.ypc)],
    ["Succ Rt", pct(player.successRate)],
    ["TD", player.touchdowns],
    ["LY/ Car", rate(player.lineYards)],
    ["Opp Rt", pct(player.oppRate)],
    ["Hlt/ Opp", rate(player.highlight)],
    ["Stuff Rt", pct(player.stuffRate)],
    // Third row — pending backend fields, all dashing out today. Stop rate is a
    // wider net than stuff rate: 0-2 yards rather than 0 or less.
    ["Power Rt", pct(player.powerAttempts > 0 ? player.powerSuccesses / player.powerAttempts : null)],
    ["Exp 10/ 20", player.explosive10 == null ? "—" : `${player.explosive10}/${player.explosive20 ?? "—"}`],
    ["EPA/ Car", player.epaPerCarry == null ? "—" : player.epaPerCarry.toFixed(2)],
    ["Stop Rt", pct(player.stoppedCarries != null && player.attempts > 0 ? player.stoppedCarries / player.attempts : null)],
  ];

  return (
    <SpotlightCard
      name={player.name}
      playerKey={player.key}
      accent={accent}
      teamId={teamId}
      identity={identity}
      productionRows={productionRows}
      productionComponent="rushing_production"
      roleFallback="RB"
      chips={chips}
    >
      <LaneChart lanes={player.lanes} heat={heat} />
    </SpotlightCard>
  );
};
