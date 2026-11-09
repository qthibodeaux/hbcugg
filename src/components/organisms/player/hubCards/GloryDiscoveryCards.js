import { useNavigate } from "react-router-dom";
import { Panel, CardHead, Kicker, Portrait, PersonRow, Num } from "./CardPrimitives";
import { Award, Gem, Ruler } from "lucide-react";
import { Flex, Text, Image, Box } from "@chakra-ui/react";
import { teamOf, hrefFor, fmt } from "./cardPresentation";

export const GloryLeadersCard = ({ entries = [] }) => {
  const navigate = useNavigate();
  if (!entries.length) return null;
  const accent = "#E53E3E";
  const top = entries.slice(0, 5);
  const max = Math.max(...top.map((e) => Number(e.glory ?? e.score ?? 0)), 1);

  return (
    <Panel>
      <CardHead icon={Award} label="Glory Leaders" accent={accent} right={<Kicker>League-wide</Kicker>} />

      <Flex gap={3} flex={1} minH={0}>
        {top.map((entry) => {
          const value = Number(entry.glory ?? entry.score ?? 0);
          const team = teamOf(entry.player?.school_id);
          return (
            <Flex
              key={entry.player.player_id}
              direction="column"
              align="center"
              flex={1}
              minW={0}
              gap={1.5}
              cursor="pointer"
              onClick={() => navigate(hrefFor(entry.player))}
              borderRadius="md"
              p={1}
              _hover={{ bg: "whiteAlpha.100" }}
              style={{ transition: "background 0.15s" }}
            >
              <Portrait src={entry.player?.image_url} size="clamp(34px, 4vw, 46px)" ring={`${accent}66`} alt={entry.player?.full_name} />
              <Text fontSize="10px" fontWeight="900" color="white" textAlign="center" lineClamp={1} maxW="100%">
                {entry.player?.last_name ?? entry.player?.full_name}
              </Text>
              <Flex align="center" gap={1}>
                {team?.logo && <Image src={team.logo} alt="" w="9px" h="9px" objectFit="contain" />}
                <Kicker fontSize="7px">{team?.shortName}</Kicker>
              </Flex>
              {/* Vertical bar — shares width far better than a stacked row. */}
              <Box flex={1} minH="14px" w="100%" display="flex" alignItems="flex-end" justifyContent="center">
                <Box w="60%" borderRadius="sm" bg={accent} style={{ height: `${Math.max((value / max) * 100, 8)}%` }} />
              </Box>
              <Text fontSize="10px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
                {fmt(value, 0)}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Panel>
  );
};

export const HiddenGemsCard = ({ entries = [] }) => {
  const navigate = useNavigate();
  const lead = entries[0];
  if (!lead) return null;
  const accent = "#9F7AEA";
  const impact = Number(lead.impact_score ?? 0);
  const visibility = Number(lead.visibility_score ?? 0);

  return (
    <Panel>
      <CardHead icon={Gem} label="Hidden Gems" accent={accent} right={<Kicker>{entries.length} found</Kicker>} />

      <PersonRow player={lead.player} accent={accent} onOpen={(p) => navigate(hrefFor(p))} size="38px" />

      {lead.gem_type && <Kicker color="whiteAlpha.700">{lead.gem_type}</Kicker>}

      {/* Two opposed rules: high impact, low visibility. The gap IS the point. */}
      <Box mt="auto">
        {[
          { label: "Impact", value: impact, color: accent },
          { label: "Visibility", value: visibility, color: "whiteAlpha.400" },
        ].map((row) => (
          <Box key={row.label} mb={2}>
            <Flex align="baseline" justify="space-between" mb={1}>
              <Kicker>{row.label}</Kicker>
              <Text fontSize="11px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
                {fmt(row.value, 0)}
              </Text>
            </Flex>
            <Box h="5px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
              <Box h="100%" borderRadius="full" bg={row.color} style={{ width: `${Math.max(Math.min(row.value, 100), 2)}%` }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Panel>
  );
};

export const PhysicalOutliersCard = ({ entries = [] }) => {
  const navigate = useNavigate();
  const lead = entries[0];
  if (!lead) return null;
  const accent = "#F56565";

  return (
    <Panel>
      <CardHead icon={Ruler} label="Physical Outliers" accent={accent} right={<Kicker>{entries.length} flagged</Kicker>} />

      <PersonRow player={lead.player} accent={accent} onOpen={(p) => navigate(hrefFor(p))} size="38px" />

      <Flex gap={4} mt={1}>
        <Box>
          <Num size="1.2rem">{lead.height ?? "—"}</Num>
          <Kicker mt={1}>Height</Kicker>
        </Box>
        <Box>
          <Num size="1.2rem">{lead.weight ?? "—"}</Num>
          <Kicker mt={1}>Weight</Kicker>
        </Box>
      </Flex>

      <Box mt="auto">
        {[
          { label: "Weight pct", value: lead.percentiles?.weight_percentile },
          { label: "Height pct", value: lead.percentiles?.height_percentile },
        ].map((row) => (
          <Box key={row.label} mb={1.5}>
            <Flex align="baseline" justify="space-between" mb={1}>
              <Kicker>{row.label}</Kicker>
              <Text fontSize="10px" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">
                {fmt(row.value, 0)}
              </Text>
            </Flex>
            <Box h="4px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
              <Box h="100%" borderRadius="full" bg={accent} style={{ width: `${Math.max(Number(row.value) || 0, 2)}%` }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Panel>
  );
};
