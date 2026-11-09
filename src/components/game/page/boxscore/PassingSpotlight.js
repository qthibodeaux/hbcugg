import { Fragment, useMemo } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { buildGamePassingZones } from "../../../../utils/gamePassingZones";
import { SpotlightCard } from "./ProductionSpotlight";
import { heatFill, num, pct, rate, PASS_ZONE_YPA_SCALE } from "../../../../utils/productionPresentation";

const DIRS = ["Left", "Middle", "Right"];

const ZoneCell = ({ cell, heat }) => {
  // Heat is yards per attempt, not completion rate: the cell already prints "1/1", so
  // colour has to carry something the numerals don't — and completion rate would paint
  // a checkdown on 3rd-and-10 the same shade as a conversion.
  const { bg, border } = heatFill(cell?.att ? cell.yards / cell.att : 0, cell?.att ?? 0, PASS_ZONE_YPA_SCALE, heat);
  const empty = !cell || cell.att === 0;
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="clamp(1.75rem, 2.6vw, 2.25rem)"
      borderRadius="sm"
      bg={bg}
      border="0.0625rem solid"
      borderColor={border}
      minW={0}
    >
      {/* Empty zones carry no numerals. Six of nine cells are usually empty in a single
          game, and at full weight they drown the three that mean something. */}
      {!empty && (
        <>
          <Text fontSize="clamp(0.6rem, 0.82vw, 0.75rem)" fontWeight="900" color="white" lineHeight={1.1}>
            {cell.comp}/{cell.att}
          </Text>
          <Text fontSize="clamp(0.42rem, 0.58vw, 0.52rem)" fontWeight="700" color="rgba(255,255,255,0.5)" lineHeight={1.2}>
            {cell.yards}y
          </Text>
        </>
      )}
    </Flex>
  );
};

export const PassingSpotlight = ({ game, player, accent, heat, teamId, identity, productionRows }) => {
  const zones = useMemo(() => (player ? buildGamePassingZones(game, teamId, player) : null), [game, teamId, player]);
  if (!player) return null;

  const isPasser = player._type === "passer";
  // The interception cost the backend books inside passing_production — shown
  // beside the INT count, never added to the components.
  const intCost = isPasser ? (productionRows ?? []).find((r) => r.player_key === player.key)?.passing_production_penalty : null;
  const chips = isPasser
    ? [
        ["Cmp/ Att", `${player.completions}/${player.attempts}`],
        ["Yds", player.yards],
        ["Cmp Rt", pct(player.compRate)],
        ["Yd/ Att", rate(player.ydsPerAtt)],
        ["Sacks", player.sacks_taken],
        ["INT", Number.isFinite(intCost) && intCost !== 0 ? `${player.interceptions} (${intCost.toFixed(1)})` : player.interceptions],
        ["TD", player.touchdowns],
        ["aDOT", rate(zones?.adot)],
        // Third row — QB only, all four straight field reads. EPA/play ships on
        // 2026 rows, third-down and deep splits on 2019-2025 rows, and success
        // rate on neither yet, so part of this row dashes out on any given game.
        // Nothing here is derived or invented; it fills in as the fields land.
        ["EPA/ Play", player.epaPerPlay == null ? "—" : player.epaPerPlay.toFixed(2)],
        ["Succ Rt", pct(player.successRate)],
        ["3rd Dn", pct(player.thirdDownRate)],
        ["Deep C-A", player.deepAttempts == null ? "—" : `${player.deepCompletions}-${player.deepAttempts}`],
      ]
    : [
        ["Ct/ Tg", `${player.receptions}/${player.targets}`],
        ["Yds", player.yards],
        ["Succ Rt", pct(player.successRate)],
        ["Yd/ Ch", rate(player.ydsPerCatch)],
        ["Yd/ Tg", rate(player.ydsPerTarget)],
        ["TD", player.touchdowns],
        ["aDOT", rate(zones?.adot)],
        // Third row — receiver only. All five are pending backend fields and dash
        // out today; they fill in on their own as the fields land.
        ["YAC", num(player.yardsAfterCatch)],
        ["YAC/ Rec", rate(player.yacPerReception)],
        ["1st Dn", num(player.firstDownReceptions)],
        ["Expl Ct", num(player.explosiveReceptions)],
        ["3rd Dn Ct", num(player.thirdDownReceptions)],
      ];

  return (
    <SpotlightCard
      name={player.name}
      playerKey={player.key}
      accent={accent}
      teamId={teamId}
      identity={identity}
      productionRows={productionRows}
      productionComponent={isPasser ? "passing_production" : "receiving_production"}
      roleFallback={isPasser ? "QB" : "WR"}
      chips={chips}
    >
      {zones && !zones.hidden && (
        <Grid templateColumns="clamp(2rem, 3vw, 2.5rem) repeat(3, minmax(0, 1fr))" gap={1}>
          <Box />
          {DIRS.map((d) => (
            <Text key={d} fontSize="clamp(0.45rem, 0.62vw, 0.58rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.1em" textAlign="center">
              {d}
            </Text>
          ))}
          {zones.depths.map((depth, row) => (
            <Fragment key={depth.key}>
              <Flex direction="column" justify="center" minW={0}>
                <Text fontSize="clamp(0.45rem, 0.62vw, 0.58rem)" fontWeight="900" color="rgba(255,255,255,0.5)" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1.2}>
                  {depth.label}
                </Text>
                {depth.range && (
                  <Text fontSize="clamp(0.4rem, 0.55vw, 0.5rem)" fontWeight="700" color="rgba(255,255,255,0.28)" lineHeight={1.3}>
                    {depth.range}
                  </Text>
                )}
              </Flex>
              {DIRS.map((_, col) => {
                const i = row * 3 + col;
                return <ZoneCell key={i} cell={zones.cells[i]} heat={heat} />;
              })}
            </Fragment>
          ))}
        </Grid>
      )}
      {/* Throws the crew left unplaceable, counted — never spread into cells. */}
      {zones && zones.uncharted > 0 && (
        <Text mt={1} fontSize="clamp(0.5rem, 0.66vw, 0.62rem)" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.06em">
          {zones.hidden ? `${zones.uncharted} of ${zones.total} not charted` : `${zones.uncharted} not charted`}
          {zones.noLane > 0 && zones.noDepth === 0 ? " (INT)" : ""}
        </Text>
      )}
    </SpotlightCard>
  );
};

