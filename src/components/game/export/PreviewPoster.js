import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { buildMatchupSheet } from "../../../utils/gamePreview";
import { HAIRLINE, Poster } from "./PosterChrome";
import { teamAccent, teamLogo, teamName, teamShort, withAlpha } from "./exportData";

// The shareable image for a game preview. Same frame as the game-export posters
// (fixed 68.75rem tree, banner with watermark logos) — the score is replaced by
// the date, kickoff and venue, and the body is the unit table plus the last
// meetings. Nothing here is responsive; it is captured as a PNG.

// The poster's matchup sheet — same model as the page (buildMatchupSheet), in
// fixed pixels because the poster is captured as a PNG, not laid out responsively.
const TONE = {
  good: { bg: "rgba(34,139,84,0.9)", color: "#F4F4F5" },
  bad: { bg: "rgba(200,60,60,0.9)", color: "#F4F4F5" },
  mid: { bg: "rgba(var(--gg-fg), calc(0.08 + var(--gg-line-boost, 0)))", color: "rgba(var(--gg-fg), calc(0.65 + var(--gg-faint-boost, 0)))" },
  none: { bg: "transparent", color: "rgba(var(--gg-fg), calc(0.4 + var(--gg-faint-boost, 0)))" },
};

const Chip = ({ rank, tone }) => {
  const t = TONE[tone] ?? TONE.none;
  return (
    <Box bg={t.bg} borderRadius="0.1875rem" w="2rem" py="0.125rem" textAlign="center" flexShrink={0}>
      <Text fontSize="0.625rem" fontWeight="900" color={t.color} lineHeight="0.875rem">{rank ?? "—"}</Text>
    </Box>
  );
};

const Value = ({ children, dim }) => (
  <Text fontSize="0.9375rem" fontWeight="900" color={dim ? "rgba(var(--gg-fg), calc(0.7 + var(--gg-faint-boost, 0)))" : "var(--gg-ink)"} lineHeight={1} w="3.25rem" textAlign="right" whiteSpace="nowrap">{children}</Text>
);

const Row = ({ children, child }) => (
  <Flex align="center" gap="0.5rem" py={child ? "0.375rem" : "0.5625rem"} borderBottom="0.0625rem solid" borderColor={HAIRLINE}>{children}</Flex>
);

const TeamSeason = ({ side, mirrored }) => (
  <Box minW={0}>
    <Flex align="center" gap="0.625rem" pb="0.625rem" borderBottom="0.125rem solid" borderColor={withAlpha(teamAccent(side.teamId), 0.75)} direction={mirrored ? "row-reverse" : "row"}>
      <Image src={teamLogo(side.teamId)} alt="" w="2.125rem" h="2.125rem" objectFit="contain" flexShrink={0} />
      <Box textAlign={mirrored ? "right" : "left"} minW={0}>
        <Text fontSize="0.9375rem" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={1.05} whiteSpace="nowrap">{teamName(side.teamId)}</Text>
      </Box>
    </Flex>
    {side.rows.map((r) => (
      <Row key={r.key} child={r.child}>
        {mirrored ? <><Chip rank={r.rank} tone={r.tone} /><Value dim={r.child}>{r.value}</Value></> : null}
        <Text flex={1} minW={0} textAlign={mirrored ? "right" : "left"} pl={!mirrored && r.child ? "0.875rem" : 0} pr={mirrored && r.child ? "0.875rem" : 0}
          fontSize={r.child ? "0.5625rem" : "0.6562rem"} fontWeight="900" color={r.child ? "rgba(var(--gg-fg), calc(0.5 + var(--gg-faint-boost, 0)))" : "var(--gg-ink)"} textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap">
          {r.label}
        </Text>
        {!mirrored ? <><Value dim={r.child}>{r.value}</Value><Chip rank={r.rank} tone={r.tone} /></> : null}
      </Row>
    ))}
  </Box>
);

const H2H = ({ table }) => (
  <Box minW={0}>
    <Flex align="center" justify="center" gap="0.5rem" py="0.5625rem" bg="rgba(var(--gg-fg), calc(0.05 + var(--gg-line-boost, 0)))" borderTop="0.125rem solid" borderColor="rgba(var(--gg-fg), calc(0.2 + var(--gg-faint-boost, 0)))">
      <Image src={teamLogo(table.leftId)} alt="" w="1.25rem" h="1.25rem" objectFit="contain" />
      <Text fontSize="0.6875rem" fontWeight="950" textTransform="uppercase" letterSpacing="0.1em" whiteSpace="nowrap">
        {teamShort(table.leftId)} {table.leftSide} <Box as="span" color="rgba(var(--gg-fg), calc(0.4 + var(--gg-faint-boost, 0)))">vs</Box> {teamShort(table.rightId)} {table.rightSide}
      </Text>
      <Image src={teamLogo(table.rightId)} alt="" w="1.25rem" h="1.25rem" objectFit="contain" />
    </Flex>
    {table.rows.map((r) => (
      <Row key={r.label}>
        <Value>{r.left.value}</Value>
        <Chip rank={r.left.rank} tone={r.left.tone} />
        <Text flex={1} textAlign="center" fontSize="0.625rem" fontWeight="900" color="rgba(var(--gg-fg), calc(0.7 + var(--gg-faint-boost, 0)))" textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap">{r.label}</Text>
        <Chip rank={r.right.rank} tone={r.right.tone} />
        <Value>{r.right.value}</Value>
      </Row>
    ))}
  </Box>
);

export const PreviewPoster = ({ model, innerRef }) => {
  const sheet = buildMatchupSheet(model);
  return (
    <Poster innerRef={innerRef}>
      <Box display="grid" gridTemplateColumns="1fr 1.35fr 1fr" gap="1.375rem" alignItems="start">
        <TeamSeason side={sheet.left} />
        <Flex direction="column" gap="1rem">
          {sheet.tables.map((t) => <H2H key={t.key} table={t} />)}
        </Flex>
        <TeamSeason side={sheet.right} mirrored />
      </Box>
    </Poster>
  );
};

export default PreviewPoster;
