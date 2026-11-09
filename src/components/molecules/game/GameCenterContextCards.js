import { ContextCardShell } from "./contextCards/LegacyContextCardShell";
import { Text, Flex } from "@chakra-ui/react";
import { toLocalTeam } from "../../../utils/gameCenterPayloads";
import { HOME_AWAY_MARK } from "./contextCards/TeamFormContextCard";

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

export { TeamFormContextCard } from "./contextCards/TeamFormContextCard";
