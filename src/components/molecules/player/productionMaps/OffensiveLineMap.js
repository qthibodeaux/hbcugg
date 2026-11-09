// OL game context uses team-level protection/run-blocking totals. Individual OL statistics are unavailable; the existing fallback policy is retained.
import { useState } from "react";
import useMountEffect from "../../../../hooks/useMountEffect";
import { clamp, metric } from "./playerMapModel";
import { Box, Flex } from "@chakra-ui/react";
import { PassingGridMap } from "./PassingGridMap";
import { RushingLaneMap } from "./RushingMaps";

const useRotatingIndex = (count, holdMs = 6000, fadeMs = 400) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useMountEffect(() => {
    if (count < 2) return undefined;
    let current = 0;
    let holdTimer;
    let fadeTimer;

    const cycle = () => {
      setVisible(true);
      holdTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          current = (current + 1) % count;
          setIndex(current);
          cycle();
        }, fadeMs);
      }, holdMs);
    };

    cycle();
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  });

  return { index, visible };
};

export const OLCombinedMap = ({ player, primary, secondary, gameOverride }) => {
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 8));

  const dropbacks = Number(gameOverride?.own_dropbacks ?? Math.round(clamp(30 + signal, 20, 45)));
  const sacksAllowed = Number(gameOverride?.sacks_taken ?? Math.max(0, Math.round(3 - signal * 0.08)));
  const hurries = Number(gameOverride?.hurries_faced ?? Math.max(0, Math.round(4 - signal * 0.1)));
  const sackRate = dropbacks > 0 ? sacksAllowed / dropbacks : 0;
  const pressureRate = Number(gameOverride?.pressure_rate_faced ?? (dropbacks > 0 ? (sacksAllowed + hurries) / dropbacks : 0));

  const lineYardsPerRush = Number(gameOverride?.line_yards_per_rush ?? clamp(1.6 + signal * 0.03, 0.8, 3.2));
  const rushOpportunityRate = Number(gameOverride?.rush_opportunity_rate ?? clamp(0.32 + signal * 0.005, 0.2, 0.55));
  const stuffRate = Number(gameOverride?.stuff_rate ?? clamp(0.4 - signal * 0.004, 0.2, 0.5));

  // Team-as-player: OL has no personal passing/rushing production, so these
  // reuse the exact PassingGridMap/RushingLaneMap components (same estimate
  // convention they already use for real skill players) to represent "the
  // offense's production while this lineman was blocking," not his own stats.
  const teamPassPlayer = {
    season_components: {
      passing_production: signal * 1.1,
      receiving_production: signal * 0.9,
      rushing_production: signal * 0.3,
    },
  };
  const teamRunPlayer = { season_components: { rushing_production: signal * 1.2 } };

  const passBottomStats = [
    { label: "DROPBACKS", value: dropbacks },
    { label: "SACKS ALLOWED", value: sacksAllowed },
    { label: "SACK RATE", value: `${metric(sackRate * 100, 1)}%` },
    { label: "PRESSURE RATE", value: `${metric(pressureRate * 100, 1)}%` },
  ];
  const runBottomStats = [
    { label: "LINE YDS/CAR", value: metric(lineYardsPerRush, 2) },
    { label: "OPPORTUNITY RATE", value: `${metric(rushOpportunityRate * 100, 0)}%` },
    { label: "STUFF RATE", value: `${metric(stuffRate * 100, 0)}%` },
  ];

  const modes = [
    { key: "pass", label: "Pass Protection" },
    { key: "run", label: "Run Blocking" },
  ];
  const { index, visible } = useRotatingIndex(modes.length);

  return (
    <Box h="full" w="full" position="relative">
      <Flex position="absolute" top="0.3rem" right="0.5rem" gap="0.3rem" zIndex={2}>
        {modes.map((m, i) => (
          <Box key={m.key} w="0.3rem" h="0.3rem" borderRadius="full" bg={i === index ? primary : "whiteAlpha.300"} />
        ))}
      </Flex>
      <Box h="full" w="full" opacity={visible ? 1 : 0} transition="opacity 0.3s ease">
        {index === 0 ? (
          <PassingGridMap player={teamPassPlayer} primary={primary} secondary={secondary} bottomStats={passBottomStats} />
        ) : (
          <RushingLaneMap player={teamRunPlayer} primary={primary} secondary={secondary} bottomOverride={runBottomStats} />
        )}
      </Box>
    </Box>
  );
};
