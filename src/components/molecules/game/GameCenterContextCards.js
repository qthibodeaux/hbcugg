import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { toLocalTeam } from "../../../utils/gameCenterPayloads";

// Production context cards for the Game Center Hub — Hub Design Doc §4.
// One shell, four bodies. Every card names a team, so every card gets that
// team's watermark logo in the corner — no color tint. Copy comes from the
// payload: title, detail, and the first `why_reasons` entry as the supporting
// line. Nothing here invents a number.
//
// Sizing: the shell fills its PageShell slot (h/w 100%) and is a size
// container; every dimension inside is in cqmin — a fraction of the slot's
// short side. That is the row unit whether the card is 1x1 or 2x1, so type
// and logos stay at the same scale across both and nothing has a px floor.

const getLogo = (team) => team?.logo ?? (team?.teamId ? `/assets/${team.teamId}.svg` : null);

const ContextCardShell = ({ title, team, teamLabel, note, children }) => {
  const logo = getLogo(team);

  return (
    <Box
      h="100%"
      w="100%"
      containerType="size"
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      bg="#111114"
    >
      {logo && (
        <Image
          src={logo}
          alt=""
          position="absolute"
          right="-18cqmin"
          top="-12cqmin"
          w="60cqmin"
          h="60cqmin"
          objectFit="contain"
          opacity={0.12}
        />
      )}

      <Flex h="100%" direction="column" position="relative" px="6cqmin" pt="6cqmin" pb="5cqmin" gap="3cqmin">
        <Text flexShrink={0} fontSize="7cqmin" color="text.primary" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" lineHeight={1.2} lineClamp={1}>
          {title}
        </Text>

        {teamLabel && (
          <Flex align="center" gap="2.5cqmin" flexShrink={0}>
            {logo && <Image src={logo} alt="" w="10cqmin" h="10cqmin" objectFit="contain" />}
            <Text fontSize="6cqmin" color="white" fontWeight="bold" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.2}>
              {teamLabel}
            </Text>
          </Flex>
        )}

        <Box flex={1} minH={0} overflow="hidden">
          {children}
        </Box>

        {note && (
          <Text mt="auto" pt="2cqmin" fontSize="5.5cqmin" color="text.secondary" lineHeight={1.35} lineClamp={2} flexShrink={0}>
            {note}
          </Text>
        )}
      </Flex>
    </Box>
  );
};

// ─── TeamFormCard ────────────────────────────────────────────────────────────
// results[] oldest → newest. The bar is margin-driven and scaled against the
// largest margin in the set, so a 31-point loss reads as bigger than a 3-point
// one. Opponent / score / date columns render only when the revised §4 payload
// carries them (`opponent_id`, `opponent_short`, `home_away`, `score`,
// `date_label`); until then the column is the bar and the letter, nothing more.

const HOME_AWAY_MARK = { home: "vs", away: "@", neutral: "vs" };

const formatScore = (score) => {
  if (!score || typeof score !== "object") return null;
  const team = Number(score.team);
  const opp = Number(score.opponent);
  if (!Number.isFinite(team) || !Number.isFinite(opp)) return null;
  return `${team}–${opp}`;
};

const TeamFormBody = ({ results }) => {
  const rows = results.slice(0, 5);
  const maxMargin = Math.max(1, ...rows.map((r) => Math.abs(Number(r.margin) || 0)));

  return (
    <Flex h="100%" gap="2.5cqmin" align="stretch">
      {rows.map((r, index) => {
        const isWin = r.result === "W";
        const margin = Math.abs(Number(r.margin) || 0);
        const heightPct = 30 + Math.round((margin / maxMargin) * 70);
        const opponent = r.opponent_id ? toLocalTeam(r.opponent_id, r.opponent_short) : null;
        const opponentLabel = opponent?.bannerShort ?? opponent?.shortName ?? r.opponent_short ?? null;
        const mark = HOME_AWAY_MARK[r.home_away] ?? null;
        const score = formatScore(r.score);
        const hasDetail = Boolean(opponentLabel || score || r.date_label);

        return (
          <Flex key={`form-${index}`} flex={1} minW={0} direction="column" justify="flex-end" gap="1cqmin">
            {hasDetail && (
              <Box flexShrink={0}>
                {score && (
                  <Text fontSize="6cqmin" color="white" fontWeight="black" lineHeight={1.1} lineClamp={1}>
                    {r.result} {score}
                  </Text>
                )}
                {opponentLabel && (
                  <Text fontSize="5cqmin" color="text.secondary" fontWeight="bold" textTransform="uppercase" lineHeight={1.2} lineClamp={1}>
                    {mark ? `${mark} ` : ""}{opponentLabel}{r.opponent_record ? ` (${r.opponent_record})` : ""}
                  </Text>
                )}
                {r.date_label && (
                  <Text fontSize="4.5cqmin" color="text.muted" lineHeight={1.2} lineClamp={1}>
                    {r.date_label}
                  </Text>
                )}
              </Box>
            )}
            <Flex flex={1} minH={0} align="flex-end">
              <Box
                w="100%"
                h={`${heightPct}%`}
                bg={isWin ? "green.400" : "red.400"}
                borderRadius="sm"
                opacity={0.9}
              />
            </Flex>
            <Text fontSize="5cqmin" color={isWin ? "green.300" : "red.300"} fontWeight="black" textAlign="center" lineHeight={1} flexShrink={0}>
              {r.result}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

export const TeamFormContextCard = ({ card }) => (
  <ContextCardShell title={card.title} team={card.team} teamLabel={card.teamLabel} note={card.whyReasons[0] ?? null}>
    <TeamFormBody results={Array.isArray(card.payload.results) ? card.payload.results : []} />
  </ContextCardShell>
);

// ─── RecordSplitCard ─────────────────────────────────────────────────────────

export const RecordSplitContextCard = ({ card }) => (
  <ContextCardShell title={card.title} team={card.team} teamLabel={card.teamLabel} note={card.whyReasons[0] ?? null}>
    <Text fontSize="16cqmin" color="brand.300" fontWeight="black" lineHeight={1} lineClamp={1}>
      {card.payload.record ?? "--"}
    </Text>
    {card.payload.detail && (
      <Text mt="2cqmin" fontSize="5.5cqmin" color="text.secondary" lineHeight={1.35} lineClamp={2}>
        {card.payload.detail}
      </Text>
    )}
  </ContextCardShell>
);

// ─── ScheduleHeadlineCard ────────────────────────────────────────────────────

export const ScheduleHeadlineContextCard = ({ card }) => (
  <ContextCardShell title={card.title} team={card.team} teamLabel={null} note={card.whyReasons[0] ?? null}>
    <Text fontSize="5cqmin" color="text.secondary" textTransform="uppercase" lineHeight={1.2} lineClamp={1}>
      {card.payload.stage_label}
    </Text>
    <Text mt="2cqmin" fontSize="9cqmin" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1.1} lineClamp={2}>
      {card.payload.away_short} vs {card.payload.home_short}
    </Text>
    <Text mt="2cqmin" fontSize="5cqmin" color="text.secondary" lineHeight={1.2} lineClamp={1}>
      {card.payload.date_label}
    </Text>
    {card.payload.footer && (
      <Text mt="3cqmin" fontSize="5cqmin" color="brand.300" fontWeight="bold" lineHeight={1.2} lineClamp={1}>
        {card.payload.footer}
      </Text>
    )}
  </ContextCardShell>
);

// ─── UpcomingStretchCard ─────────────────────────────────────────────────────
// `games` is `string[3]` on the current contract; the revised §4 asks for
// objects. Render either: a string as-is, an object as "@ OPP · date".

const stretchLine = (item) => {
  if (typeof item === "string") return item;
  const opponent = item?.opponent_id ? toLocalTeam(item.opponent_id, item.opponent_short) : null;
  const label = opponent?.bannerShort ?? opponent?.shortName ?? item?.opponent_short ?? "TBD";
  const mark = HOME_AWAY_MARK[item?.home_away] ?? "vs";
  const record = item?.opponent_record ? ` (${item.opponent_record})` : "";
  return `${mark} ${label}${record}${item?.date_label ? ` · ${item.date_label}` : ""}`;
};

export const UpcomingStretchContextCard = ({ card }) => (
  <ContextCardShell title={card.title} team={card.team} teamLabel={card.teamLabel} note={card.whyReasons[0] ?? null}>
    <Flex direction="column" gap="1.5cqmin">
      {(Array.isArray(card.payload.games) ? card.payload.games : []).slice(0, 3).map((item, index) => (
        <Text key={`stretch-${index}`} fontSize="5.5cqmin" color="text.secondary" lineHeight={1.3} lineClamp={1}>
          {index + 1}. {stretchLine(item)}
        </Text>
      ))}
    </Flex>
    {card.payload.summary && (
      <Text mt="3cqmin" fontSize="5.5cqmin" color="brand.300" fontWeight="bold" lineHeight={1.3} lineClamp={2}>
        {card.payload.summary}
      </Text>
    )}
  </ContextCardShell>
);
