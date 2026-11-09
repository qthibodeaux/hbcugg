import { useNavigate } from "react-router-dom";
import { hrefFor, fmt } from "./cardPresentation";
import { Panel, CardHead, Kicker, PersonRow } from "./CardPrimitives";
import { TrendingUp, ArrowLeftRight } from "lucide-react";
import { Flex, Box, Text } from "@chakra-ui/react";

export const BreakoutCard = ({ entries = [] }) => {
  const navigate = useNavigate();
  if (!entries.length) return null;
  const accent = "#48BB78";
  const open = (p) => navigate(hrefFor(p));

  return (
    <Panel>
      <CardHead icon={TrendingUp} label="Breakout Radar" accent={accent} right={<Kicker>2024 → 2025</Kicker>} />

      <Flex direction="column" gap={2} flex={1} minH={0} overflow="hidden">
        {entries.slice(0, 4).map((entry) => {
          const prior = Number(entry.prior_metrics?.production_score);
          const now = Number(entry.current_metrics?.production_score);
          const max = Math.max(prior || 0, now || 0, 1);
          return (
            <Box key={entry.player.player_id}>
              <PersonRow player={entry.player} rank={entry.rank} accent={accent} onOpen={open} size="26px" />
              {/* The two-bar delta — a rank number can't show a jump, this can. */}
              {Number.isFinite(prior) && Number.isFinite(now) && (
                <Flex direction="column" gap="3px" pl={5} pr={1.5} mt={0.5}>
                  <Flex align="center" gap={1.5}>
                    <Box h="3px" borderRadius="full" bg="whiteAlpha.300" style={{ width: `${(prior / max) * 68}%` }} />
                    <Text fontSize="7px" fontWeight="900" color="whiteAlpha.500" fontVariantNumeric="tabular-nums">
                      {fmt(prior, 0)}
                    </Text>
                  </Flex>
                  <Flex align="center" gap={1.5}>
                    <Box h="5px" borderRadius="full" bg={accent} style={{ width: `${(now / max) * 68}%` }} />
                    <Text fontSize="8px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
                      {fmt(now, 0)}
                    </Text>
                  </Flex>
                </Flex>
              )}
            </Box>
          );
        })}
      </Flex>
    </Panel>
  );
};

export const TransferImpactCard = ({ entries = [], transfersCount }) => {
  const navigate = useNavigate();
  if (!entries.length) return null;
  const accent = "#ECC94B";
  const open = (p) => navigate(hrefFor(p));

  return (
    <Panel>
      <CardHead
        icon={ArrowLeftRight}
        label="Transfer Impact"
        accent={accent}
        right={Number.isFinite(transfersCount) ? <Kicker>{transfersCount} in portal</Kicker> : null}
      />

      <Flex direction="column" gap={1} flex={1} minH={0} overflow="hidden" justify="flex-start">
        {entries.slice(0, 6).map((entry) => (
          <PersonRow
            key={entry.player.player_id}
            player={entry.player}
            rank={entry.rank}
            accent={accent}
            metric={fmt(entry.impact_score ?? entry.transfer_impact_score, 0)}
            onOpen={open}
            size="26px"
          />
        ))}
      </Flex>
    </Panel>
  );
};
