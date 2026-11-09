import { Flex, Text, Box } from "@chakra-ui/react";

// Extracted from GameSummaryTabV2. Existing data and presentation behavior is preserved.

const FIELD_TURF = "#1F4F2B";

const FIELD_LINE = "rgba(255,255,255,0.16)";

// An end zone label in dark type on a light team color, white on a dark one.
const labelInk = (hex) => {
  const raw = String(hex ?? "").replace("#", "");
  if (raw.length !== 6) return "white";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#0B0B0D" : "white";
};

export const DriveFieldStrip = ({
  startYard,
  endYard,
  plays,
  team,
  awayColor,
  homeColor,
  awayLabel,
  homeLabel,
  height = "2.75rem",
  showLabels = true,
}) => {
  const from = Math.max(0, Math.min(100, startYard));
  const to = Math.max(0, Math.min(100, endYard));
  const left = Math.min(from, to);
  const width = Math.abs(to - from);
  const goingRight = to > from;
  const teamColor = team === "home" ? homeColor : awayColor;

  // One notch per play, so a twelve-play march and a one-play strike are told apart at a
  // glance. The last segment — the play that ended the drive — is picked out in white.
  const playCount = Math.max(1, Number(plays) || 1);
  const step = (to - from) / playCount;
  const notches = Array.from({ length: playCount - 1 }, (_, i) => from + step * (i + 1));
  const lastFrom = from + step * (playCount - 1);
  const lastLeft = Math.min(lastFrom, to);
  const lastWidth = Math.abs(to - lastFrom);
  const barH = showLabels ? "0.4375rem" : "0.3125rem";

  const endZone = (color, label) => (
    <Flex w="11%" flexShrink={0} align="center" justify="center" bg={color} minW={0}>
      {showLabels && (
        <Text fontSize="clamp(0.4rem, 0.5vw, 0.52rem)" fontWeight="900" color={labelInk(color)} letterSpacing="0.12em" textShadow={labelInk(color) === "white" ? "0 0.0625rem 0.125rem rgba(0,0,0,0.7)" : "none"} lineClamp={1}>
          {label}
        </Text>
      )}
    </Flex>
  );

  return (
    <Flex w="full" h={height} borderRadius="sm" overflow="hidden" border="0.0625rem solid" borderColor="rgba(255,255,255,0.12)">
      {endZone(awayColor, awayLabel)}

      <Box flex="1" position="relative" bg={FIELD_TURF} minW={0}>
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((yd) => (
          <Box key={yd} position="absolute" top={0} bottom={0} left={`${yd}%`} w="0.0625rem" bg={yd === 50 ? "rgba(255,255,255,0.3)" : FIELD_LINE} />
        ))}

        <Box position="absolute" top="50%" left={`${left}%`} w={`${width}%`} h={barH} bg={teamColor} borderRadius="full" transform="translateY(-50%)" boxShadow="0 0.0625rem 0.25rem rgba(0,0,0,0.55)" />
        <Box position="absolute" top="50%" left={`${lastLeft}%`} w={`${lastWidth}%`} h={barH} bg="rgba(255,255,255,0.92)" borderRadius="full" transform="translateY(-50%)" />

        {notches.map((pos, i) => (
          <Box key={i} position="absolute" top="50%" left={`${pos}%`} w="0.09375rem" h={showLabels ? "0.8125rem" : "0.5625rem"} bg="rgba(0,0,0,0.55)" transform="translate(-50%, -50%)" />
        ))}

        <Box position="absolute" top="50%" left={`${from}%`} w={showLabels ? "0.625rem" : "0.4375rem"} h={showLabels ? "0.625rem" : "0.4375rem"} borderRadius="full" bg="white" border="0.125rem solid" borderColor={teamColor} transform="translate(-50%, -50%)" />

        {showLabels && (
          <Box position="absolute" top="50%" left={`${to}%`} w="1.125rem" h="1.125rem" borderRadius="full" bg="rgba(255,255,255,0.16)" transform="translate(-50%, -50%)" />
        )}
        <Box
          position="absolute"
          top="50%"
          left={`${to}%`}
          w={0}
          h={0}
          transform="translate(-50%, -50%)"
          borderTop={showLabels ? "0.4375rem solid transparent" : "0.3125rem solid transparent"}
          borderBottom={showLabels ? "0.4375rem solid transparent" : "0.3125rem solid transparent"}
          borderLeft={goingRight ? (showLabels ? "0.5625rem solid white" : "0.375rem solid white") : undefined}
          borderRight={goingRight ? undefined : (showLabels ? "0.5625rem solid white" : "0.375rem solid white")}
        />
      </Box>

      {endZone(homeColor, homeLabel)}
    </Flex>
  );
};
