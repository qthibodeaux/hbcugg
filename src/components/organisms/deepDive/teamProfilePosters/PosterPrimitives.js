import { Flex, Text, Box, Image, Grid } from "@chakra-ui/react";
import { POSTER_W, caps, fgOf, T, tab, toneOf } from "./posterPresentation";
import { ExportWordmark } from "../../../molecules/export/ExportWordmark";
import { PROFILE, fix, TEAM, rankText, firstInitial } from "../teamProfileModel";
import { ordinal, logoOf, shortOf } from "../deepDiveModel";

export const Frame = ({ pal, innerRef, page, children }) => (
  <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={pal.bg} color={pal.ink} px="48px" pt="32px" pb="40px" gap="2px" overflow="hidden">
    <Flex align="center" justify="space-between" mb="16px">
      <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
      <Text fontSize="18px" color={pal.orange} {...caps}>{PROFILE.season} · Through Week {PROFILE.through_week} · Team Profile · {page}</Text>
    </Flex>
    {children}
  </Flex>
);

export const Banner = ({ pal, title }) => {
  const fg = fgOf(pal);
  const s = T.standing;
  const stats = [
    ["Record", s.record],
    ["Conference", s.conference_record],
    [s.group, `${ordinal(s.rank)} of ${s.of}`],
    ["Title paths", `${fix(T.race.title_odds_pct)}%`],
  ];
  return (
    <Box position="relative" overflow="hidden" bg={pal.panel} minH="190px">
      <Box position="absolute" inset={0} bg={`linear-gradient(100deg, ${TEAM.colors.primary} 0%, ${TEAM.colors.primary} 38%, ${TEAM.colors.primary}00 78%)`} />
      <Image src={TEAM.logo} alt="" position="absolute" right="-38px" top="50%" transform="translateY(-50%)" w="300px" h="300px" objectFit="contain" opacity={0.18} />
      <Flex position="relative" align="center" justify="space-between" px="36px" py="30px" gap="24px" minH="190px">
        <Box minW={0}>
          <Text fontSize="16px" color={TEAM.colors.secondary} {...caps}>{title}</Text>
          <Text mt="6px" fontSize="72px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.9} letterSpacing="-0.04em" color="white" whiteSpace="nowrap">{TEAM.name}</Text>
          <Text mt="6px" fontSize="26px" fontWeight="900" textTransform="uppercase" letterSpacing="0.04em" color={TEAM.colors.secondary}>{TEAM.mascot}</Text>
        </Box>
        <Flex gap="34px" mr="150px">
          {stats.map(([k, v]) => (
            <Box key={k} textAlign="right">
              <Text fontSize="13px" color={fg(0.55)} {...caps}>{k}</Text>
              <Text mt="4px" fontSize="38px" fontWeight="950" fontStyle="italic" lineHeight={1} whiteSpace="nowrap" {...tab}>{v}</Text>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

export const Card = ({ pal, kicker, right, children, ...rest }) => {
  const fg = fgOf(pal);
  return (
    <Flex direction="column" bg={pal.panel} px="24px" pt="18px" pb="22px" minW={0} {...rest}>
      {kicker && (
        <Flex align="center" justify="space-between" gap="12px" mb="14px">
          <Flex align="center" gap="8px">
            <Box w="7px" h="7px" borderRadius="full" bg={pal.brand} />
            <Text fontSize="15px" color={fg(0.65)} {...caps}>{kicker}</Text>
          </Flex>
          {right}
        </Flex>
      )}
      <Box flex={1} minW={0}>{children}</Box>
    </Flex>
  );
};

export const HeadRow = ({ pal, cols, labels, align = [] }) => {
  const fg = fgOf(pal);
  return (
    <Grid templateColumns={cols} columnGap="14px" pb="7px" borderBottom={`2px solid ${fg(0.14)}`}>
      {labels.map((l, i) => <Text key={i} fontSize="12px" color={fg(0.55)} textAlign={align[i] ?? "right"} {...caps}>{l}</Text>)}
    </Grid>
  );
};

export const Rank = ({ pal, r, size = "17px" }) => (
  <Text fontSize={size} fontWeight="900" color={toneOf(pal, r)} textAlign="right" whiteSpace="nowrap" {...tab}>{rankText(r)}</Text>
);

export const TeamTag = ({ id, name, size = 34, font = "16px" }) => (
  <Flex align="center" gap="8px" minW={0}>
    {logoOf(id) && <Image src={logoOf(id)} alt="" w={`${size}px`} h={`${size}px`} objectFit="contain" flexShrink={0} />}
    <Text fontSize={font} fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">{id ? shortOf(id) : name}</Text>
  </Flex>
);

export const Stat = ({ pal, label, value, r, big = false }) => {
  const fg = fgOf(pal);
  return (
    <Box minW={0}>
      <Text fontSize="12px" color={fg(0.55)} whiteSpace="nowrap" {...caps}>{label}</Text>
      <Flex align="baseline" gap="6px">
        <Text fontSize={big ? "38px" : "24px"} fontWeight="950" fontStyle={big ? "italic" : undefined} lineHeight={1.1} whiteSpace="nowrap" {...tab}>{value}</Text>
        {r && <Text fontSize="14px" fontWeight="900" color={toneOf(pal, r)} whiteSpace="nowrap" {...tab}>{ordinal(r.rank)}{r.of ? ` / ${r.of}` : ""}</Text>}
      </Flex>
    </Box>
  );
};

export const SimilarLine = ({ pal, list }) => {
  const fg = fgOf(pal);
  const rows = (list ?? []).filter((p) => p.team_id !== PROFILE.team_id).slice(0, 2);
  if (!rows.length) return null;
  return (
    <Text fontSize="14px" fontWeight="800" color={fg(0.6)}>
      Plays like {rows.map((p) => `${firstInitial(p.name)} (${shortOf(p.team_id)})`).join(", ")}
    </Text>
  );
};
