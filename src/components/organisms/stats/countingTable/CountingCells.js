import teamsData from "../../../../data/teams.json";
import { Flex, Image, Text } from "@chakra-ui/react";

const TEAM_BY_V5 = Object.fromEntries(teamsData.teams.map((t) => [t.exportId.replace(/25$/, ""), t]));

const clock = (seconds) => {
  if (!Number.isFinite(seconds)) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const formatCell = (value, col) => {
  if (value == null) return "—";
  if (col.split) return String(value);
  if (col.clock) return clock(value);
  if (col.pct) return (value * 100).toFixed(1);
  if (typeof value === "number") return col.dec != null ? value.toFixed(col.dec) : String(value);
  return String(value);
};

export const TeamCell = ({ teamId, navigate }) => {
  const team = TEAM_BY_V5[teamId];
  return (
    <Flex
      as="button"
      type="button"
      align="center"
      gap={2}
      minW={0}
      textAlign="left"
      color="text.primary"
      onClick={() => team && navigate(`/teams/${team.id}`)}
      _hover={{ color: "brand.400" }}
    >
      {team?.logo && <Image src={team.logo} alt="" w="18px" h="18px" objectFit="contain" flexShrink={0} />}
      <Text fontSize="11px" fontWeight="800" color="inherit" textTransform="uppercase" letterSpacing="0.02em" lineClamp={1}>
        {team?.name ?? teamId}
      </Text>
    </Flex>
  );
};

export const PlayerCell = ({ row, navigate }) => {
  const team = TEAM_BY_V5[row.team_id];
  return (
    <Flex
      as="button"
      type="button"
      align="center"
      gap={2}
      minW={0}
      textAlign="left"
      color="text.primary"
      onClick={() => navigate(`/player/${row.person_id}`)}
      _hover={{ color: "brand.400" }}
    >
      {team?.logo && <Image src={team.logo} alt="" w="16px" h="16px" objectFit="contain" flexShrink={0} />}
      <Text fontSize="11px" fontWeight="800" color="inherit" lineClamp={1}>
        {row.name}
        <Text as="span" fontWeight="600" color="text.muted"> ({team?.shortName ?? row.team_id})</Text>
      </Text>
    </Flex>
  );
};
