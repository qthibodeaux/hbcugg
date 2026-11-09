import { fgOf, POSTER_W, caps, tab } from "./posterModel";
import { Flex, Text, Box, Grid, Image } from "@chakra-ui/react";
import { ExportWordmark } from "../../../molecules/export/ExportWordmark";
import { DLINE, logoOf, shortOf } from "../deepDiveModel";

export const Poster = ({ pal, title, accent, innerRef, children }) => {
  const fg = fgOf(pal);
  return (
    <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={pal.bg} color={pal.ink} px="56px" pt="36px" pb="44px" gap="18px" overflow="hidden">
      <Flex align="center" justify="space-between">
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
        <Text fontSize="18px" color={pal.orange} {...caps}>{DLINE.season} · Through Week {DLINE.through_week} · SWAC D-line</Text>
      </Flex>
      <Text fontSize="78px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.88} letterSpacing="-0.04em" whiteSpace="nowrap">
        {title} <Box as="span" color={pal.brand}>{accent}</Box>
      </Text>
      <Box h="1px" bg={fg(0.12)} />
      {children}
    </Flex>
  );
};

export const Card = ({ pal, kicker, head, children, ...rest }) => {
  const fg = fgOf(pal);
  return (
    <Flex direction="column" bg={pal.panel} px="24px" pt="20px" pb="22px" minW={0} {...rest}>
      {kicker && (
        <Flex align="center" gap="8px">
          <Box w="7px" h="7px" borderRadius="full" bg={pal.brand} />
          <Text fontSize="15px" color={fg(0.65)} {...caps}>{kicker}</Text>
        </Flex>
      )}
      {head && <Text mt="8px" fontSize="22px" fontWeight="900" lineHeight={1.2}>{head}</Text>}
      <Box mt={head || kicker ? "16px" : 0} flex={1} minW={0}>{children}</Box>
    </Flex>
  );
};

export const NumberTile = ({ pal, value, ink, title, text }) => {
  const fg = fgOf(pal);
  return (
    <Grid templateColumns="190px minmax(0,1fr)" alignItems="center" columnGap="18px" bg={pal.panel} px="22px" py="22px" borderLeft={`4px solid ${ink}`} minW={0}>
      <Text fontSize="58px" fontWeight="950" fontStyle="italic" color={ink} lineHeight={0.9} letterSpacing="-0.04em" textAlign="center" whiteSpace="nowrap" {...tab}>{value}</Text>
      <Box minW={0}>
        <Text fontSize="19px" fontWeight="900" lineHeight={1.2}>{title}</Text>
        <Text mt="5px" fontSize="16px" fontWeight="600" color={fg(0.72)} lineHeight={1.35}>{text}</Text>
      </Box>
    </Grid>
  );
};

export const Team = ({ pal, id, size = 30, font = "19px" }) => (
  <Flex align="center" gap="10px" minW={0}>
    <Image src={logoOf(id)} alt="" w={`${size}px`} h={`${size}px`} objectFit="contain" flexShrink={0} />
    <Text fontSize={font} fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">{shortOf(id)}</Text>
  </Flex>
);

export const Change = ({ pal, from, to, fmt, better = "higher", size = "19px" }) => {
  const fg = fgOf(pal);
  const d = to - from;
  const good = better === "higher" ? d > 0 : d < 0;
  const flat = Math.abs(d) < 1e-9;
  return (
    <Text fontSize={size} fontWeight="900" whiteSpace="nowrap" {...tab}>
      <Text as="span" color={fg(0.45)}>{fmt(from)} → </Text>
      <Text as="span" color={flat ? pal.ink : good ? pal.up : pal.down}>{fmt(to)}</Text>
    </Text>
  );
};

export const Dots = ({ pal, n, filled, ink, size = 16, gap = 6 }) => {
  const fg = fgOf(pal);
  return (
    <Flex gap={`${gap}px`} wrap="wrap">
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} w={`${size}px`} h={`${size}px`} borderRadius="full" bg={i < filled ? ink : "transparent"} border={`3px solid ${i < filled ? ink : fg(0.28)}`} />
      ))}
    </Flex>
  );
};

export const Head = ({ pal, cols, labels, align = [] }) => {
  const fg = fgOf(pal);
  return (
    <Grid templateColumns={cols} columnGap="16px" pb="8px" borderBottom={`2px solid ${fg(0.14)}`}>
      {labels.map((l, i) => <Text key={i} fontSize="13px" color={fg(0.55)} textAlign={align[i] ?? "left"} {...caps}>{l}</Text>)}
    </Grid>
  );
};
