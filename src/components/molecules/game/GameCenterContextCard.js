import { Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import {
  RecordSplitContextCard,
  ScheduleHeadlineContextCard,
  TeamFormContextCard,
  UpcomingStretchContextCard,
} from "./GameCenterContextCards";
import { CONTEXT_CARDS } from "./GameCenterContextCardsV2";

// Game Center Hub Design Doc §4 — one component per `card_type`. The backend
// picked the card, the title, and the copy; this only routes. A type we don't
// have a component for returns null and its slot collapses — no substitute
// content.
//
// The 15 types (look_ahead … upset_watch) render from GameCenterContextCardsV2;
// the four retired `*Card` names still render for seasons published before
// 2026-10-04.
const LEGACY_BY_TYPE = {
  ScheduleHeadlineCard: ScheduleHeadlineContextCard,
  UpcomingStretchCard: UpcomingStretchContextCard,
  TeamFormCard: TeamFormContextCard,
  RecordSplitCard: RecordSplitContextCard,
};

export const renderContextCard = (card) => {
  if (!card?.type) return null;
  const Card = CONTEXT_CARDS[card.type];
  if (Card) {
    const c = { card_type: card.type, title: card.title, why_reasons: card.whyReasons, payload: card.payload ?? {} };
    const route = card.payload?.route ?? null;
    const node = <Card c={c} />;
    return route ? (
      <Box as={Link} to={route} display="block" w="full" h="full" _hover={{ textDecoration: "none", "& > div": { borderColor: "whiteAlpha.400" } }}>
        {node}
      </Box>
    ) : node;
  }
  const Legacy = LEGACY_BY_TYPE[card.type];
  return Legacy ? <Legacy card={card} /> : null;
};
