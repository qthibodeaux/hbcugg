import { teamAccent, withAlpha, teamLogo, teamName, teamShort } from "../../export/exportData";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { RowShell, Chip, Value, Eyebrow } from "./PreviewTablePrimitives";
import { buildMatchupSheet } from "../../../../utils/gamePreview";

// Retained four-unit season/matchup comparison sheet.

const TeamSeason = ({ side, mirrored }) => {
  const accent = teamAccent(side.teamId);
  return (
    <Box minW={0}>
      <Flex align="center" gap={3} pb={3} borderBottom="2px solid" borderColor={withAlpha(accent, 0.75)} direction={mirrored ? "row-reverse" : "row"}>
        <Image src={teamLogo(side.teamId)} alt="" w="clamp(2rem, 3.2vw, 2.8rem)" h="clamp(2rem, 3.2vw, 2.8rem)" objectFit="contain" flexShrink={0} />
        <Box minW={0} textAlign={mirrored ? "right" : "left"}>
          <Text fontSize="clamp(0.9rem, 1.4vw, 1.2rem)" fontWeight="900" fontStyle="italic" textTransform="uppercase" lineHeight={1.05} lineClamp={1}>{teamName(side.teamId)}</Text>
        </Box>
      </Flex>
      {side.rows.map((r) => (
        <RowShell key={r.key} child={r.child}>
          {mirrored ? <><Chip rank={r.rank} tone={r.tone} /><Value dim={r.child}>{r.value}</Value></> : null}
          <Text
            flex={1}
            minW={0}
            pl={!mirrored && r.child ? "1.2em" : 0}
            pr={mirrored && r.child ? "1.2em" : 0}
            textAlign={mirrored ? "right" : "left"}
            fontSize={r.child ? "clamp(0.58rem, 0.75vw, 0.7rem)" : "clamp(0.66rem, 0.88vw, 0.8rem)"}
            fontWeight="900"
            color={r.child ? "whiteAlpha.500" : "white"}
            textTransform="uppercase"
            letterSpacing="0.06em"
            lineClamp={1}
          >
            {r.label}
          </Text>
          {!mirrored ? <><Value dim={r.child}>{r.value}</Value><Chip rank={r.rank} tone={r.tone} /></> : null}
        </RowShell>
      ))}
    </Box>
  );
};

const H2HTable = ({ table }) => (
  <Box minW={0}>
    <Flex align="center" justify="center" gap={2} py={2.5} bg="whiteAlpha.50" borderTop="2px solid" borderColor="whiteAlpha.200">
      <Image src={teamLogo(table.leftId)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" />
      <Text fontSize="clamp(0.62rem, 0.85vw, 0.78rem)" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">
        {teamShort(table.leftId)} {table.leftSide} <Box as="span" color="whiteAlpha.400">vs</Box> {teamShort(table.rightId)} {table.rightSide}
      </Text>
      <Image src={teamLogo(table.rightId)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" />
    </Flex>
    {table.rows.map((r) => (
      <RowShell key={r.label}>
        <Value>{r.left.value}</Value>
        <Chip rank={r.left.rank} tone={r.left.tone} />
        <Text flex={1} minW={0} textAlign="center" fontSize="clamp(0.58rem, 0.78vw, 0.72rem)" fontWeight="900" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>{r.label}</Text>
        <Chip rank={r.right.rank} tone={r.right.tone} />
        <Value>{r.right.value}</Value>
      </RowShell>
    ))}
  </Box>
);

export const MatchupSheet = ({ model }) => {
  const sheet = buildMatchupSheet(model);
  return (
    <Box color="white">
      <Eyebrow>Unit matchups</Eyebrow>
      <Box display="grid" gap="clamp(1.2rem, 2.4vw, 2.4rem)" alignItems="start" gridTemplateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1.35fr) minmax(0, 1fr)" }}>
        <TeamSeason side={sheet.left} />
        <Flex direction="column" gap="clamp(1rem, 2vw, 1.8rem)" minW={0}>
          {sheet.tables.map((t) => <H2HTable key={t.key} table={t} />)}
        </Flex>
        <TeamSeason side={sheet.right} mirrored />
      </Box>
    </Box>
  );
};
