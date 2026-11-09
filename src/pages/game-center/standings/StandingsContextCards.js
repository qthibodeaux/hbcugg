import { Box, Text, Flex, Image, Grid } from "@chakra-ui/react";
import { TEAM_BY_ID, logo, recordText, teamLabel, POWER_METRIC } from "./standingsData";
import { TeamLogo } from "./StandingsPrimitives";

// Standings rotating context, division leader and power-ranking cards.

const ROTATION_HOLD_SECONDS = 6;

export const ContextRotationCard = ({ items = [], accent = "brand.400" }) => {
  const count = items.length;
  const cycle = Math.max(1, count) * ROTATION_HOLD_SECONDS;
  const visible = count > 0 ? 100 / count : 100;
  const delayFor = (index) => `-${((count - index) % count) * ROTATION_HOLD_SECONDS}s`;

  if (count === 0) {
    return (
      <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="xl" p={4} overflow="hidden">
        <Text fontSize="10px" color={accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
          Race Context
        </Text>
        <Flex h="calc(100% - 20px)" align="center">
          <Text fontSize="xs" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
            No games played yet
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      className="ctx-rotation"
      position="relative"
      h="100%"
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="line"
      borderRadius="xl"
      overflow="hidden"
    >
      <style>{`
        @keyframes ctxRotateItem {
          0% { opacity: 0; }
          3% { opacity: 1; }
          ${Math.max(4, visible - 3)}% { opacity: 1; }
          ${visible}% { opacity: 0; }
          100% { opacity: 0; }
        }
        .ctx-rotation .ctx-item,
        .ctx-rotation .ctx-dot {
          animation: ctxRotateItem ${cycle}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ctx-rotation .ctx-item,
          .ctx-rotation .ctx-dot { animation: none; opacity: 0; }
          .ctx-rotation .ctx-item:first-of-type,
          .ctx-rotation .ctx-dot:first-of-type { opacity: 1; }
        }
      `}</style>

      {items.map((item, index) => (
        <Flex
          key={item.label}
          className="ctx-item"
          position="absolute"
          inset={0}
          px={4}
          pt={4}
          pb={7}
          direction="column"
          justify="center"
          gap={1}
          style={{ animationDelay: delayFor(index) }}
        >
          <Text fontSize="10px" color={item.accent || accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>
            {item.label}
          </Text>
          <Text
            fontSize="clamp(2rem, 3.4vw, 3rem)"
            fontFamily="mono"
            color="var(--gg-ink)"
            fontWeight="950"
            lineHeight={0.9}
            letterSpacing="-0.04em"
            lineClamp={1}
          >
            {item.value}
          </Text>
          <Text fontSize="xs" color="text.secondary" fontWeight="bold" lineClamp={2}>
            {item.sub}
          </Text>
        </Flex>
      ))}

      <Flex position="absolute" bottom={3} left={4} gap="6px">
        {items.map((item, index) => (
          <Box key={`track-${item.label}`} position="relative" w="16px" h="2px" borderRadius="full" bg="line.strong">
            <Box
              className="ctx-dot"
              position="absolute"
              inset={0}
              borderRadius="full"
              bg={accent}
              style={{ animationDelay: delayFor(index) }}
            />
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export const DivisionLeaderCard = ({ group }) => {
  const leader = group?.rows?.[0];
  const team = leader ? TEAM_BY_ID[leader.id] : null;
  const accent = group?.accent ?? "brand.400";
  const primary = team?.colors?.primary ?? "#1A1A1D";

  return (
    <Box
      position="relative"
      h="100%"
      w="full"
      bg={team ? `linear-gradient(145deg, ${primary}59 0%, rgba(var(--gg-fg), 0.02) 68%)` : "bg.secondary"}
      border="1px solid"
      borderColor="line"
      borderRadius="xl"
      p={4}
      overflow="hidden"
    >
      {team && (
        <Image
          src={logo(team)}
          alt=""
          position="absolute"
          right="-26px"
          bottom="-26px"
          w="118px"
          h="118px"
          objectFit="contain"
          opacity={0.14}
          pointerEvents="none"
          style={{ filter: "grayscale(1) contrast(1.15)" }}
        />
      )}

      <Flex position="relative" zIndex={1} h="100%" direction="column" justify="center" gap={1}>
        <Text fontSize="10px" color={accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>
          {group?.label ?? "Division"}
        </Text>

        {team ? (
          <>
            <Text
              fontSize="clamp(2rem, 3.4vw, 3rem)"
              fontFamily="mono"
              color="var(--gg-ink)"
              fontWeight="950"
              lineHeight={0.9}
              letterSpacing="-0.04em"
            >
              {recordText(leader.cw, leader.cl)}
            </Text>
            <Flex align="center" gap={1.5} mt={0.5}>
              <TeamLogo team={team} size="1.1rem" />
              <Text fontSize="xs" color="var(--gg-ink)" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                {teamLabel(team)}
              </Text>
            </Flex>
            <Text fontSize="10px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
              {recordText(leader.w, leader.l)} overall
            </Text>
          </>
        ) : (
          <Text fontSize="xs" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
            No games played yet
          </Text>
        )}
      </Flex>
    </Box>
  );
};

export const PowerRankingsCard = ({ rows }) => (
  <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="line" borderRadius="xl" overflow="hidden" p={4}>
    <Flex align="end" justify="space-between" mb={4}>
      <Box>
        <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
          Top 6
        </Text>
        <Text fontSize="xl" color="var(--gg-ink)" fontWeight="black" textTransform="uppercase" lineHeight={1}>
          Power Rankings
        </Text>
      </Box>
      <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
        {POWER_METRIC.label}
      </Text>
    </Flex>

    {rows.length === 0 ? (
      <Flex h="calc(100% - 50px)" align="center" justify="center" px={4}>
        <Text fontSize="xs" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" textAlign="center">
          No games played yet
        </Text>
      </Flex>
    ) : (
    <Flex direction="column" h="calc(100% - 50px)" justify="space-evenly">
      {rows.slice(0, 6).map((row, index) => {
        const team = TEAM_BY_ID[row.id];
        return (
          <Grid key={row.id} templateColumns="28px 32px 1fr 56px" gap={2} alignItems="center">
            <Text fontSize="xs" color={index === 0 ? "brand.400" : "text.muted"} fontWeight="black">
              {index + 1}
            </Text>
            <TeamLogo team={team} size="1.625rem" />
            <Box minW={0}>
              <Text fontSize="sm" color="var(--gg-ink)" fontWeight="black" lineClamp={1}>
                {teamLabel(team)}
              </Text>
              <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                {recordText(row.cw, row.cl)} conf
              </Text>
            </Box>
            <Text fontSize="lg" color="var(--gg-ink)" fontWeight="black" textAlign="right">
              {POWER_METRIC.format(row[POWER_METRIC.key] ?? 0)}
            </Text>
          </Grid>
        );
      })}
    </Flex>
    )}
  </Box>
);
