import { Box, Flex, Text } from "@chakra-ui/react";
import { BigNumber, Mark, Micro, useTileVariant } from "../../molecules/home/LiveTile";

/**
 * Games tile plates (home hero).
 *
 * PHILOSOPHY:
 *   Purpose: Each plate is one full face of the Games live tile and says why
 *   it is on screen. The backend ranks and writes the words (why_reasons,
 *   summary); the frontend never composes narrative from scores.
 *   Plates: Collage (the week, no header) · Game of the Week · Spotlight ·
 *   Look Ahead.
 *
 * SIZING:
 *   Everything is cqmin — the tile's shorter side. No fixed px.
 *
 * MOBILE:
 *   The tile passes variant "mobile" (a flush 2×2 on phones). Each plate then
 *   renders its own mobile JSX: abbreviations, the score as the headline, no
 *   reasons copy, cells flush with no gaps.
 */

const tint = (team, alpha = "33") => `${team?.primary ?? "#27272A"}${alpha}`;

const Reasons = ({ lines, size = 3 }) =>
  lines?.length ? (
    <Flex direction="column" gap="0.8cqmin">
      {lines.slice(0, 3).map((line) => (
        <Micro key={line} color="brand.300" size={size} lineClamp={1}>{line}</Micro>
      ))}
    </Flex>
  ) : null;

// ── Collage: the week's games between the 18, nothing but the games ──────────

const CollageCell = ({ game }) => (
  <Flex
    direction="column"
    justify="center"
    gap="1cqmin"
    minW={0}
    minH={0}
    px="2cqmin"
    py="1.4cqmin"
    borderRadius="lg"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg={`linear-gradient(100deg, ${tint(game.away)} 0%, #1A1A1D 48%, ${tint(game.home)} 100%)`}
  >
    {[game.away, game.home].map((side) => {
      const won = game.winnerTeamId && side.teamId === game.winnerTeamId;
      return (
        <Flex key={side.teamId} align="center" justify="space-between" gap="1.2cqmin" minW={0}>
          <Flex align="center" gap="1.4cqmin" minW={0}>
            <Mark logo={side.logo} label={side.label} size={6.4} />
            <Text fontSize="3cqmin" fontWeight="black" textTransform="uppercase" letterSpacing="0.04em" color={won ? "white" : "whiteAlpha.600"} lineClamp={1}>
              {side.label}
            </Text>
          </Flex>
          <Text fontSize="6.4cqmin" fontWeight="black" fontStyle="italic" lineHeight={1} fontVariantNumeric="tabular-nums" color={won ? "white" : "whiteAlpha.500"}>
            {side.score}
          </Text>
        </Flex>
      );
    })}
  </Flex>
);

// When the grid has a leftover cell it becomes the week's own label — which
// week these games are from, and the season when it is not the current one.
const WeekCell = ({ label, fallback }) => (
  <Flex direction="column" justify="center" align="center" minW={0} minH={0} borderRadius="lg" border="1px dashed" borderColor="whiteAlpha.200">
    <Micro size={2.6} color="rgba(255,255,255,0.4)">{fallback ? label.season : "Week"}</Micro>
    <Text fontSize="9cqmin" fontWeight="black" fontStyle="italic" lineHeight={1} color="white" fontVariantNumeric="tabular-nums">
      {fallback ? `Wk ${label.week}` : label.week}
    </Text>
  </Flex>
);

export const CollagePlate = ({ games, label, fallback }) => {
  const mobile = useTileVariant() === "mobile";
  if (mobile) return <CollageMobile games={games} label={label} fallback={fallback} />;
  const cols = games.length <= 1 ? 1 : games.length <= 4 ? 2 : 3;
  const hasSpare = label && games.length % cols !== 0;
  return (
    <Box position="relative" h="100%">
      <Box display="grid" h="100%" gap="1.6cqmin" gridTemplateColumns={`repeat(${cols}, minmax(0, 1fr))`} gridAutoRows="minmax(0, 1fr)">
        {games.map((g) => <CollageCell key={g.id} game={g} />)}
        {hasSpare ? <WeekCell label={label} fallback={fallback} /> : null}
      </Box>
      {/* No spare cell to carry the label, but the games are borrowed: say so. */}
      {label && fallback && !hasSpare ? (
        <Micro position="absolute" right="0" bottom="-1.2cqmin" size={2.2} color="rgba(255,255,255,0.35)">{label.season} · Week {label.week}</Micro>
      ) : null}
    </Box>
  );
};


// ── Mobile plates ────────────────────────────────────────────────────────────
// A phone tile is ~half the screen wide. One idea per plate: two teams, two
// numbers, big. Abbreviations only; no reasons copy.

const abbr = (side) => side?.label ?? side?.shortName ?? side?.name ?? "";
const bleed = "calc(-1 * var(--hl-pad, 5cqmin))";

const MobileTag = ({ children }) => (
  <Text fontSize="6cqmin" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1} lineClamp={1}>{children}</Text>
);

const MobileRow = ({ side, score, won, decided }) => (
  <Flex align="center" gap="3cqmin" minW={0} bg={tint(side, won ? "40" : "1A")} px="4cqmin" flex={1} minH={0}>
    <Mark logo={side.logo} label={side.label} size={20} />
    <Text flex={1} minW={0} fontSize="11cqmin" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={1} color={!decided || won ? "white" : "whiteAlpha.600"} lineClamp={1}>
      {abbr(side)}
    </Text>
    {score != null && score !== "" ? (
      <Text fontSize="19cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" color={!decided || won ? "white" : "whiteAlpha.500"}>
        {score}
      </Text>
    ) : null}
  </Flex>
);

// Two rows filling the tile, a thin tag strip on top.
const MobileMatchup = ({ tag, sub, game }) => {
  const a = Number(game.awayScore);
  const h = Number(game.homeScore);
  const decided = Number.isFinite(a) && Number.isFinite(h) && game.awayScore !== "" && game.homeScore !== "";
  return (
    <Flex direction="column" h={`calc(100% + 2 * var(--hl-pad, 5cqmin))`} m={bleed}>
      <Flex justify="space-between" align="center" px="4cqmin" py="3.4cqmin" gap="2cqmin" bg="rgba(0,0,0,0.35)">
        <MobileTag>{tag}</MobileTag>
        {sub ? <Text fontSize="5cqmin" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" flexShrink={0}>{sub}</Text> : null}
      </Flex>
      <MobileRow side={game.away} score={decided ? game.awayScore : null} won={decided && a > h} decided={decided} />
      <Box h="1px" bg="rgba(0,0,0,0.5)" />
      <MobileRow side={game.home} score={decided ? game.homeScore : null} won={decided && h > a} decided={decided} />
    </Flex>
  );
};

const CollageMobile = ({ games, label, fallback }) => {
  const four = games.slice(0, 4);
  return (
    <Box h={`calc(100% + 2 * var(--hl-pad, 5cqmin))`} m={bleed} display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gridTemplateRows="repeat(2, minmax(0, 1fr))">
      {four.map((g) => (
        <Flex key={g.id} direction="column" minW={0} minH={0} borderRight="1px solid rgba(0,0,0,0.5)" borderBottom="1px solid rgba(0,0,0,0.5)">
          {[g.away, g.home].map((side) => {
            const won = g.winnerTeamId && side.teamId === g.winnerTeamId;
            return (
              <Flex key={side.teamId} flex={1} align="center" justify="space-between" gap="1.5cqmin" px="2.5cqmin" bg={tint(side, won ? "40" : "14")} minH={0}>
                <Mark logo={side.logo} label={side.label} size={11} />
                <Text fontSize="13cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" color={won ? "white" : "whiteAlpha.500"}>
                  {side.score}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      ))}
      {label && four.length < 4 ? (
        <Flex direction="column" align="center" justify="center">
          <Text fontSize="6cqmin" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase">{fallback ? label.season : "Week"}</Text>
          <Text fontSize="22cqmin" fontWeight="black" fontStyle="italic" lineHeight={0.9} color="white">{label.week}</Text>
        </Flex>
      ) : null}
    </Box>
  );
};

const LookAheadMobile = ({ game }) => (
  <Flex direction="column" h={`calc(100% + 2 * var(--hl-pad, 5cqmin))`} m={bleed}>
    <Flex direction="column" justify="center" px="4cqmin" py="3cqmin" bg="rgba(0,0,0,0.35)">
      <MobileTag>Look ahead</MobileTag>
      <Text fontSize="15cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1} mt="1.5cqmin" textTransform="uppercase" lineClamp={1}>{game.dateLabel}</Text>
    </Flex>
    <MobileRow side={game.away} decided={false} />
    <Box h="1px" bg="rgba(0,0,0,0.5)" />
    <MobileRow side={game.home} decided={false} />
  </Flex>
);

// ── Game of the Week ─────────────────────────────────────────────────────────

const WeekSide = ({ side, won, align }) => (
  <Flex direction="column" align={align} gap="2cqmin" minW={0} flex={1}>
    <Mark logo={side.logo} label={side.label} size={22} />
    <Text fontSize="5.4cqmin" fontWeight="black" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" lineHeight={1} color={won ? "white" : "whiteAlpha.700"} lineClamp={1} textAlign={align === "flex-end" ? "right" : "left"}>
      {side.shortName ?? side.name}
    </Text>
    {side.record ? <Micro size={2.6} color="rgba(255,255,255,0.4)">{side.record}</Micro> : null}
  </Flex>
);

export const GameOfWeekPlate = ({ game }) => {
  const mobile = useTileVariant() === "mobile";
  if (mobile) return <MobileMatchup tag="Game of the week" game={game} />;
  const awayWon = Number(game.awayScore) > Number(game.homeScore);
  const homeWon = Number(game.homeScore) > Number(game.awayScore);
  return (
    <Flex direction="column" justify="space-between" h="100%" gap="2cqmin" position="relative">
      <Box position="absolute" inset="-5cqmin" pointerEvents="none" bg={`linear-gradient(100deg, ${tint(game.away, "40")} 0%, transparent 42%, transparent 58%, ${tint(game.home, "40")} 100%)`} />
      <Flex position="relative" justify="space-between" align="baseline" gap="2cqmin">
        <Micro color="white" size={3.4}>Game of the Week</Micro>
        <Micro size={2.8}>{game.stageLabel} · {game.dateLabel}</Micro>
      </Flex>
      <Flex position="relative" align="center" justify="space-between" gap="3cqmin">
        <WeekSide side={game.away} won={awayWon} align="flex-start" />
        <Flex align="center" gap="2cqmin" flexShrink={0}>
          <BigNumber size={22} color={awayWon ? "white" : "whiteAlpha.600"}>{game.awayScore}</BigNumber>
          <Text fontSize="9cqmin" color="whiteAlpha.400" fontWeight="black">–</Text>
          <BigNumber size={22} color={homeWon ? "white" : "whiteAlpha.600"}>{game.homeScore}</BigNumber>
        </Flex>
        <WeekSide side={game.home} won={homeWon} align="flex-end" />
      </Flex>
      <Box position="relative"><Reasons lines={game.whyReasons?.length ? game.whyReasons : [game.supportingLine]} /></Box>
    </Flex>
  );
};

// ── Spotlight: a game that was played, told by its quarters ──────────────────

const QuarterRow = ({ side, byQ, total, won }) => (
  <Flex align="center" gap="2.4cqmin" minW={0}>
    <Mark logo={side.logo} label={side.label} size={11} />
    <Text fontSize="5cqmin" fontWeight="black" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" color={won ? "white" : "whiteAlpha.700"} lineClamp={1} flex={1} minW={0}>
      {side.shortName ?? side.name}
    </Text>
    {(byQ ?? []).map((q, i) => (
      <Text key={i} fontSize="3.6cqmin" fontWeight="bold" color="whiteAlpha.600" w="5cqmin" textAlign="center" fontVariantNumeric="tabular-nums">{q}</Text>
    ))}
    <BigNumber size={11} color={won ? "white" : "whiteAlpha.600"} w="14cqmin" textAlign="right">{total}</BigNumber>
  </Flex>
);

export const SpotlightPlate = ({ game }) => {
  const mobile = useTileVariant() === "mobile";
  if (mobile) return <MobileMatchup tag="Spotlight" sub={game.dateLabel} game={game} />;
  const awayWon = Number(game.awayScore) > Number(game.homeScore);
  const homeWon = Number(game.homeScore) > Number(game.awayScore);
  const qCount = Math.max(game.awayByQ?.length ?? 0, game.homeByQ?.length ?? 0);
  return (
    <Flex direction="column" justify="space-between" h="100%" gap="2cqmin">
      <Flex justify="space-between" align="baseline" gap="2cqmin">
        <Micro color="white" size={3.4}>Spotlight</Micro>
        <Micro size={2.8}>{game.stageLabel}{game.dateLabel ? ` · ${game.dateLabel}` : ""}</Micro>
      </Flex>
      <Flex direction="column" gap="3.2cqmin">
        {qCount ? (
          <Flex justify="flex-end" gap="2.4cqmin" pr="14cqmin">
            {Array.from({ length: qCount }, (_, i) => (
              <Micro key={i} size={2.4} w="5cqmin" textAlign="center" color="rgba(255,255,255,0.3)">{i < 4 ? `Q${i + 1}` : "OT"}</Micro>
            ))}
          </Flex>
        ) : null}
        <QuarterRow side={game.away} byQ={game.awayByQ} total={game.awayScore} won={awayWon} />
        <QuarterRow side={game.home} byQ={game.homeByQ} total={game.homeScore} won={homeWon} />
      </Flex>
      <Micro color="brand.300" size={3} lineClamp={2}>{game.summary}</Micro>
    </Flex>
  );
};

// ── Look Ahead: the next one worth circling ──────────────────────────────────

const AheadSide = ({ side }) => (
  <Flex align="center" gap="3cqmin" minW={0}>
    <Mark logo={side.logo} label={side.label} size={15} />
    <Box minW={0}>
      <Text fontSize="6cqmin" fontWeight="black" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.02em" lineHeight={1} lineClamp={1}>
        {side.shortName ?? side.name}
      </Text>
      {side.record ? <Micro size={2.6} color="rgba(255,255,255,0.4)" mt="1cqmin">{side.record}</Micro> : null}
    </Box>
  </Flex>
);

export const LookAheadPlate = ({ game }) => {
  const mobile = useTileVariant() === "mobile";
  if (mobile) return <LookAheadMobile game={game} />;
  return (
  <Flex direction="column" justify="space-between" h="100%" gap="2cqmin">
    <Flex justify="space-between" align="baseline" gap="2cqmin">
      <Micro color="white" size={3.4}>Look Ahead</Micro>
      <Micro size={2.8}>{game.stageLabel}</Micro>
    </Flex>
    <Flex align="center" gap="5cqmin">
      <Flex direction="column" flexShrink={0}>
        <BigNumber size={20}>{game.dateLabel}</BigNumber>
        {game.kickoffLabel ? <Micro size={2.8} mt="1.4cqmin">{game.kickoffLabel}</Micro> : null}
      </Flex>
      <Flex direction="column" gap="3cqmin" minW={0}>
        <AheadSide side={game.away} />
        <AheadSide side={game.home} />
      </Flex>
    </Flex>
    <Reasons lines={game.whyReasons?.length ? game.whyReasons : [game.supportingLine]} />
  </Flex>
  );
};
