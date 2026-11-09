import { teamMeta, teamName, teamMascot, teamShort, teamLogo, teamAccent, withAlpha } from "../../export/exportData";
import { Flex, Image, Text, Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Eyebrow } from "./PreviewTablePrimitives";
import { shortDate } from "../../../../utils/gamePreview";

// Previous-meeting lanes, series strip and preview history sheet.

const sideInfo = (s) => {
  const meta = s?.id ? teamMeta(s.id) : null;
  return {
    id: s?.id ?? null,
    name: meta ? teamName(s.id) : s?.name ?? "—",
    mascot: meta ? teamMascot(s.id) : "",
    short: meta ? teamShort(s.id) : null,
    logo: meta ? teamLogo(s.id) : null,
    accent: s?.id && meta ? teamAccent(s.id) : "#52525b",
  };
};

const TeamBlock = ({ side, won, decided, right }) => (
  <Flex align="center" gap="clamp(0.6rem, 1.2vw, 1rem)" direction={right ? "row-reverse" : "row"} minW={0}>
    {side.logo ? (
      <Image src={side.logo} alt="" w="clamp(2.4rem, 4vw, 3.6rem)" h="clamp(2.4rem, 4vw, 3.6rem)" objectFit="contain" flexShrink={0} opacity={decided && !won ? 0.6 : 1} />
    ) : (
      <Flex w="clamp(2.4rem, 4vw, 3.6rem)" h="clamp(2.4rem, 4vw, 3.6rem)" align="center" justify="center" borderRadius="md" bg="whiteAlpha.100" flexShrink={0}>
        <Text fontSize="0.9rem" fontWeight="900" color="whiteAlpha.600">{side.name.slice(0, 2).toUpperCase()}</Text>
      </Flex>
    )}
    <Box minW={0} textAlign={right ? "right" : "left"}>
      <Text fontSize="clamp(0.95rem, 1.6vw, 1.4rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1.05} color={decided && !won ? "whiteAlpha.600" : "white"} lineClamp={2}>
        {side.name}
      </Text>
      {side.mascot ? (
        <Text fontSize="clamp(0.6rem, 0.8vw, 0.74rem)" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.14em" mt="2px" lineClamp={1}>{side.mascot}</Text>
      ) : null}
    </Box>
  </Flex>
);

const MeetingLane = ({ date, venue, tag, away: awayRaw, home: homeRaw, awayScore, homeScore, stem, noResultNote }) => {
  const away = sideInfo(awayRaw);
  const home = sideInfo(homeRaw);
  const decided = awayScore != null && homeScore != null;
  const awayWon = decided && awayScore > homeScore;
  const homeWon = decided && homeScore > awayScore;
  const margin = decided ? Math.abs(awayScore - homeScore) : null;
  const winner = awayWon ? away : homeWon ? home : null;
  const total = decided ? Math.max(1, awayScore + homeScore) : 1;

  const lane = (
    <Box position="relative" borderBottom="1px solid" borderColor="whiteAlpha.100" overflow="hidden" _hover={stem ? { "& .lane-wash": { opacity: 1 } } : undefined}>
      <Box
        className="lane-wash"
        position="absolute"
        inset={0}
        opacity={0.75}
        transition="opacity 0.2s"
        pointerEvents="none"
        bg={`linear-gradient(90deg, ${withAlpha(away.accent, 0.16)} 0%, transparent 38%, transparent 62%, ${withAlpha(home.accent, 0.16)} 100%)`}
      />
      <Box
        position="relative"
        display="grid"
        alignItems="center"
        columnGap="clamp(0.75rem, 2vw, 2rem)"
        rowGap={2}
        gridTemplateColumns={{ base: "minmax(0, 1fr)", md: "minmax(7.5rem, 10rem) minmax(0, 1fr) auto minmax(0, 1fr)" }}
        px="clamp(0.5rem, 1.2vw, 1rem)"
        py="clamp(0.8rem, 1.6vw, 1.3rem)"
      >
        <Box minW={0}>
          <Text fontSize="clamp(0.7rem, 0.9vw, 0.82rem)" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.08em">{date}</Text>
          {tag ? <Text fontSize="clamp(0.55rem, 0.7vw, 0.66rem)" fontWeight="900" color="brand.300" textTransform="uppercase" letterSpacing="0.1em" mt="2px" lineClamp={1}>{tag}</Text> : null}
          {venue ? <Text fontSize="clamp(0.58rem, 0.75vw, 0.7rem)" fontWeight="700" color="whiteAlpha.500" mt="2px" lineClamp={2}>{venue}</Text> : null}
        </Box>
        <TeamBlock side={away} won={awayWon} decided={decided} />
        <Flex direction="column" align="center" gap="3px" minW="clamp(7rem, 12vw, 11rem)">
          {decided ? (
            <Flex align="baseline" justify="center" gap="clamp(0.4rem, 1vw, 0.9rem)">
              <Text fontSize="clamp(1.7rem, 3.2vw, 2.9rem)" fontWeight="900" fontStyle="italic" lineHeight={1} fontVariantNumeric="tabular-nums" color={awayWon ? "white" : "whiteAlpha.500"}>{awayScore}</Text>
              <Text fontSize="clamp(1rem, 1.6vw, 1.5rem)" fontWeight="900" color="whiteAlpha.300">–</Text>
              <Text fontSize="clamp(1.7rem, 3.2vw, 2.9rem)" fontWeight="900" fontStyle="italic" lineHeight={1} fontVariantNumeric="tabular-nums" color={homeWon ? "white" : "whiteAlpha.500"}>{homeScore}</Text>
            </Flex>
          ) : (
            <Text fontSize="clamp(1.4rem, 2.4vw, 2rem)" fontWeight="900" color="whiteAlpha.300" lineHeight={1}>—</Text>
          )}
          <Text fontSize="clamp(0.55rem, 0.72vw, 0.66rem)" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.14em" textAlign="center">
            {decided ? (winner ? `${winner.short ?? winner.name} by ${margin}` : "Tied") : noResultNote ?? "No result on file"}
          </Text>
        </Flex>
        <TeamBlock side={home} won={homeWon} decided={decided} right />
      </Box>
      {decided ? (
        <Flex position="relative" h="3px" aria-hidden="true">
          <Box w={`${(awayScore / total) * 100}%`} bg={away.accent} opacity={awayWon ? 0.95 : 0.35} />
          <Box w={`${(homeScore / total) * 100}%`} bg={home.accent} opacity={homeWon ? 0.95 : 0.35} />
        </Flex>
      ) : null}
    </Box>
  );
  return stem ? <Box as={Link} to={`/game/${stem}`} display="block" _hover={{ textDecoration: "none" }}>{lane}</Box> : lane;
};

const SeriesStrip = ({ model }) => {
  const series = model.series;
  if (!series || !series.games) return null;
  const a = sideInfo({ id: model.away.id });
  const h = sideInfo({ id: model.home.id });
  const aWins = series.wins?.[model.away.id] ?? 0;
  const hWins = series.wins?.[model.home.id] ?? 0;
  const streak = series.current_streak;
  const streakSide = streak ? sideInfo({ id: streak.team_id }) : null;
  return (
    <Flex align="center" justify="center" gap="clamp(0.8rem, 2.4vw, 2.4rem)" py="clamp(0.9rem, 1.8vw, 1.5rem)" borderBottom="1px solid" borderColor="whiteAlpha.100" wrap="wrap">
      <Flex align="center" gap={3}>
        <Image src={a.logo} alt="" w="clamp(2rem, 3.2vw, 3rem)" h="clamp(2rem, 3.2vw, 3rem)" objectFit="contain" />
        <Text fontSize="clamp(2rem, 4.6vw, 4rem)" fontWeight="900" fontStyle="italic" lineHeight={1} color={aWins >= hWins ? "white" : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">{aWins}</Text>
      </Flex>
      <Box textAlign="center">
        <Text fontSize="clamp(0.6rem, 0.8vw, 0.74rem)" fontWeight="900" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.2em">
          Series{model.seriesFrom ? ` since ${model.seriesFrom}` : ""}
        </Text>
        <Text fontSize="clamp(0.7rem, 0.95vw, 0.85rem)" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em" mt="2px">
          {series.games} meetings{streakSide ? ` · ${streakSide.short ?? streakSide.name} ${streak.games > 1 ? `won the last ${streak.games}` : "won the last one"}` : ""}
        </Text>
      </Box>
      <Flex align="center" gap={3}>
        <Text fontSize="clamp(2rem, 4.6vw, 4rem)" fontWeight="900" fontStyle="italic" lineHeight={1} color={hWins >= aWins ? "white" : "whiteAlpha.500"} fontVariantNumeric="tabular-nums">{hWins}</Text>
        <Image src={h.logo} alt="" w="clamp(2rem, 3.2vw, 3rem)" h="clamp(2rem, 3.2vw, 3rem)" objectFit="contain" />
      </Flex>
    </Flex>
  );
};

export const HistorySheet = ({ model }) => {
  const meetings = model.meetings.slice(0, 6);
  const history = model.eventHistory;
  const editions = history?.items.slice(0, 6) ?? [];
  if (!meetings.length && !editions.length) return null;

  return (
    <Flex direction="column" gap="clamp(1.5rem, 3vw, 2.5rem)" color="white">
      {meetings.length ? (
        <Box>
          <Eyebrow>Previous meetings</Eyebrow>
          <SeriesStrip model={model} />
          {meetings.map((g) => (
            <MeetingLane
              key={g.key}
              date={shortDate(g.date)}
              venue={g.site}
              away={{ id: g.awayId }}
              home={{ id: g.homeId }}
              awayScore={g.awayScore}
              homeScore={g.homeScore}
              stem={g.stem}
            />
          ))}
        </Box>
      ) : null}
      {editions.length ? (
        <Box>
          <Eyebrow>{history.title}</Eyebrow>
          {editions.map((e) => (
            <MeetingLane
              key={e.key}
              date={shortDate(e.date)}
              venue={e.site}
              tag={e.name}
              away={e.away}
              home={e.home}
              awayScore={e.awayScore}
              homeScore={e.homeScore}
              stem={e.stem}
              noResultNote={e.resultStatus === "cancelled" ? "Cancelled" : null}
            />
          ))}
        </Box>
      ) : null}
    </Flex>
  );
};
