import { Flex, Box, Text } from "@chakra-ui/react";
import { toLocalTeam } from "../../../../utils/gameCenterPayloads";
import { ContextCardShell } from "./LegacyContextCardShell";

export const HOME_AWAY_MARK = { home: "vs", away: "@", neutral: "vs" };

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
