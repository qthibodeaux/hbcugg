import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * PreviewCountdown
 *
 * PHILOSOPHY:
 *   Purpose: Count down to kickoff on the preview banner.
 *   Ticking: a CSS animation fires onAnimationIteration once a second — no
 *   useEffect, no setInterval (AGENTS.md ban).
 *
 * CONTENT TIERS:
 *   Essential: days / hours / minutes to kickoff.
 *   With a kickoff time on the schedule: also seconds.
 *   No kickoff time yet ("TBA"): days to the game date only.
 *
 * SIZING:
 *   clamp() type, no fixed layout px.
 */

const TICK_KEYFRAMES = "@keyframes previewCountdownTick { from { opacity: 0.999; } to { opacity: 1; } }";

const Unit = ({ value, label }) => (
  <Flex direction="column" align="center" minW="clamp(2.2rem, 3.4vw, 3.2rem)">
    <Text fontSize="clamp(1.25rem, 2.2vw, 1.9rem)" fontWeight="900" fontStyle="italic" lineHeight={1} color="white" fontVariantNumeric="tabular-nums">
      {String(value).padStart(2, "0")}
    </Text>
    <Text fontSize="clamp(0.5rem, 0.65vw, 0.62rem)" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.16em" mt="2px">
      {label}
    </Text>
  </Flex>
);

const PreviewCountdown = ({ kickoffAt, date }) => {
  const [now, setNow] = useState(() => Date.now());

  const hasTime = !!kickoffAt;
  const target = hasTime ? kickoffAt.getTime() : new Date(`${date}T00:00:00`).getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const sameDay = new Date(now).toISOString().slice(0, 10) === date || new Date(now).toDateString() === new Date(`${date}T00:00:00`).toDateString();

  if (!hasTime && (sameDay || diff === 0)) {
    return <Text textStyle="pill" color="white" fontSize="11px">Game day</Text>;
  }

  return (
    <Flex align="flex-start" gap="clamp(0.4rem, 1vw, 0.9rem)" role="timer" aria-label="Time until kickoff">
      <style>{TICK_KEYFRAMES}</style>
      {hasTime ? (
        <Box w={0} h={0} overflow="hidden" style={{ animation: "previewCountdownTick 1s linear infinite" }} onAnimationIteration={() => setNow(Date.now())} />
      ) : null}
      <Unit value={days} label="Days" />
      {hasTime ? (
        <>
          <Unit value={hours} label="Hrs" />
          <Unit value={minutes} label="Min" />
          <Unit value={seconds} label="Sec" />
        </>
      ) : null}
    </Flex>
  );
};

export default PreviewCountdown;
