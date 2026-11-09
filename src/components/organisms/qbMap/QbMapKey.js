import { Flex, Box, Text, Image } from "@chakra-ui/react";
import { dotColors, inkFor, signed, pct1 } from "./qbMapPresentation";

// Numbered player key shared by the interactive page and headshot-free export poster.

export const KeyHead = ({ big = false }) => (
  <Flex align="center" gap={2} px={2} pb={1.5} borderBottom="1px solid" borderColor="line">
    <Box flex={1} />
    <Text w={big ? "84px" : "3.4rem"} textAlign="right" fontSize={big ? "14px" : "9px"} fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">EPA/DB</Text>
    <Text w={big ? "84px" : "3rem"} textAlign="right" fontSize={big ? "14px" : "9px"} fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">Succ</Text>
  </Flex>
);

export const KeyRow = ({ p, team, active, onHover, photo = true, big = false }) => {
  const { fill, ring } = dotColors(team);
  const chip = big ? "40px" : "22px";
  return (
    <Flex
      align="center"
      gap={big ? "14px" : 2}
      px={2}
      py={big ? "12px" : "5px"}
      bg={active ? "line.strong" : "transparent"}
      borderBottom="1px solid"
      borderColor="line"
      onMouseEnter={onHover ? () => onHover(p.rank) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      cursor="default"
    >
      <Flex w={chip} h={chip} flexShrink={0} align="center" justify="center" borderRadius="full" bg={fill} border={big ? "3px solid" : "2px solid"} borderColor={ring}>
        <Text fontSize={big ? "18px" : "10px"} fontWeight="900" color={inkFor(fill)} lineHeight={1}>{p.rank}</Text>
      </Flex>
      {photo && (p.image_url ? (
        <Image src={p.image_url} alt="" boxSize="26px" borderRadius="6px" objectFit="cover" objectPosition="top" flexShrink={0} />
      ) : (
        <Box boxSize="26px" borderRadius="6px" bg="line" flexShrink={0} />
      ))}
      {team?.logo && <Image src={team.logo} alt="" boxSize={big ? "44px" : "18px"} objectFit="contain" flexShrink={0} />}
      <Box flex={1} minW={0}>
        <Text fontSize={big ? "24px" : "13px"} fontWeight="900" color="text.primary" lineHeight={1.1} lineClamp={1}>{p.name}</Text>
        <Text fontSize={big ? "15px" : "10px"} fontWeight="800" color="text.muted" mt={big ? "4px" : 0} lineClamp={1}>
          {team?.shortName ?? p.team_id}{p.class_year ? ` · ${p.class_year}` : ""} · {p.dropbacks} DB
        </Text>
      </Box>
      <Text w={big ? "84px" : "3.4rem"} textAlign="right" fontSize={big ? "26px" : "13px"} fontWeight="900" color={p.epa_per_dropback >= 0 ? "#68D391" : "#FC8181"} fontVariantNumeric="tabular-nums">
        {signed(p.epa_per_dropback)}
      </Text>
      <Text w={big ? "84px" : "3rem"} textAlign="right" fontSize={big ? "24px" : "13px"} fontWeight="900" color="var(--gg-ink)" fontVariantNumeric="tabular-nums">{pct1(p.success_rate)}</Text>
    </Flex>
  );
};
