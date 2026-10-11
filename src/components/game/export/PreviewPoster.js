import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { buildMatchupSheet } from "../../../utils/gamePreview";
import { HAIRLINE, Poster } from "./PosterChrome";
import { teamAccent, teamLogo, teamName, teamShort, withAlpha } from "./exportData";

// The shareable image for a game preview. Same frame as the game-export posters
// (fixed 1100px tree, banner with watermark logos) — the score is replaced by
// the date, kickoff and venue, and the body is the unit table plus the last
// meetings. Nothing here is responsive; it is captured as a PNG.

// The poster's matchup sheet — same model as the page (buildMatchupSheet), in
// fixed pixels because the poster is captured as a PNG, not laid out responsively.
const TONE = {
  good: { bg: "rgba(34,139,84,0.9)", color: "#F4F4F5" },
  bad: { bg: "rgba(200,60,60,0.9)", color: "#F4F4F5" },
  mid: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" },
  none: { bg: "transparent", color: "rgba(255,255,255,0.4)" },
};

const Chip = ({ rank, tone }) => {
  const t = TONE[tone] ?? TONE.none;
  return (
    <Box bg={t.bg} borderRadius="3px" w="32px" py="2px" textAlign="center" flexShrink={0}>
      <Text fontSize="10px" fontWeight="900" color={t.color} lineHeight="14px">{rank ?? "—"}</Text>
    </Box>
  );
};

const Value = ({ children, dim }) => (
  <Text fontSize="15px" fontWeight="900" color={dim ? "rgba(255,255,255,0.7)" : "white"} lineHeight={1} w="52px" textAlign="right" whiteSpace="nowrap">{children}</Text>
);

const Row = ({ children, child }) => (
  <Flex align="center" gap="8px" py={child ? "6px" : "9px"} borderBottom="1px solid" borderColor={HAIRLINE}>{children}</Flex>
);

const TeamSeason = ({ side, mirrored }) => (
  <Box minW={0}>
    <Flex align="center" gap="10px" pb="10px" borderBottom="2px solid" borderColor={withAlpha(teamAccent(side.teamId), 0.75)} direction={mirrored ? "row-reverse" : "row"}>
      <Image src={teamLogo(side.teamId)} alt="" w="34px" h="34px" objectFit="contain" flexShrink={0} />
      <Box textAlign={mirrored ? "right" : "left"} minW={0}>
        <Text fontSize="15px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={1.05} whiteSpace="nowrap">{teamName(side.teamId)}</Text>
      </Box>
    </Flex>
    {side.rows.map((r) => (
      <Row key={r.key} child={r.child}>
        {mirrored ? <><Chip rank={r.rank} tone={r.tone} /><Value dim={r.child}>{r.value}</Value></> : null}
        <Text flex={1} minW={0} textAlign={mirrored ? "right" : "left"} pl={!mirrored && r.child ? "14px" : 0} pr={mirrored && r.child ? "14px" : 0}
          fontSize={r.child ? "9px" : "10.5px"} fontWeight="900" color={r.child ? "rgba(255,255,255,0.5)" : "white"} textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap">
          {r.label}
        </Text>
        {!mirrored ? <><Value dim={r.child}>{r.value}</Value><Chip rank={r.rank} tone={r.tone} /></> : null}
      </Row>
    ))}
  </Box>
);

const H2H = ({ table }) => (
  <Box minW={0}>
    <Flex align="center" justify="center" gap="8px" py="9px" bg="rgba(255,255,255,0.05)" borderTop="2px solid" borderColor="rgba(255,255,255,0.2)">
      <Image src={teamLogo(table.leftId)} alt="" w="20px" h="20px" objectFit="contain" />
      <Text fontSize="11px" fontWeight="950" textTransform="uppercase" letterSpacing="0.1em" whiteSpace="nowrap">
        {teamShort(table.leftId)} {table.leftSide} <Box as="span" color="rgba(255,255,255,0.4)">vs</Box> {teamShort(table.rightId)} {table.rightSide}
      </Text>
      <Image src={teamLogo(table.rightId)} alt="" w="20px" h="20px" objectFit="contain" />
    </Flex>
    {table.rows.map((r) => (
      <Row key={r.label}>
        <Value>{r.left.value}</Value>
        <Chip rank={r.left.rank} tone={r.left.tone} />
        <Text flex={1} textAlign="center" fontSize="10px" fontWeight="900" color="rgba(255,255,255,0.7)" textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap">{r.label}</Text>
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
      <Box display="grid" gridTemplateColumns="1fr 1.35fr 1fr" gap="22px" alignItems="start">
        <TeamSeason side={sheet.left} />
        <Flex direction="column" gap="16px">
          {sheet.tables.map((t) => <H2H key={t.key} table={t} />)}
        </Flex>
        <TeamSeason side={sheet.right} mirrored />
      </Box>
    </Poster>
  );
};

export default PreviewPoster;
