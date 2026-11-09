import { fgOf, POSTER_W, caps, PEN_META, tab, shortOf } from "./penaltyPosterModel";
import { Flex, Text, Box, Grid, Image } from "@chakra-ui/react";
import { ExportWordmark } from "../../../molecules/export/ExportWordmark";
import { logoOf } from "../deepDiveModel";

// Penalty poster frame, table headings and shared team/callout presentation.

export const Poster = ({ pal, title, accent, innerRef, children }) => {
  const fg = fgOf(pal);
  return (
    <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={pal.bg} color={pal.ink} px="56px" pt="36px" pb="44px" gap="18px" overflow="hidden">
      <Flex align="center" justify="space-between">
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
        <Text fontSize="18px" color={pal.orange} {...caps}>{PEN_META.season} · SWAC games · Through Week {PEN_META.through_week}</Text>
      </Flex>
      <Text fontSize="78px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.88} letterSpacing="-0.04em" whiteSpace="nowrap">
        {title} <Box as="span" color={pal.brand}>{accent}</Box>
      </Text>
      <Box h="1px" bg={fg(0.12)} />
      {children}
    </Flex>
  );
};

export const Card = ({ pal, kicker, right, children, ...rest }) => {
  const fg = fgOf(pal);
  return (
    <Flex direction="column" bg={pal.panel} px="24px" pt="20px" pb="22px" minW={0} {...rest}>
      {kicker && (
        <Flex align="center" justify="space-between" gap="12px" mb="16px">
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

export const Tile = ({ pal, value, ink, title, text, size = "52px" }) => {
  const fg = fgOf(pal);
  return (
    <Flex direction="column" bg={pal.panel} px="22px" py="20px" borderLeft={`4px solid ${ink}`} minW={0}>
      <Text fontSize={size} fontWeight="950" fontStyle="italic" color={ink} lineHeight={0.95} letterSpacing="-0.04em" whiteSpace="nowrap" {...tab}>{value}</Text>
      <Text mt="10px" fontSize="19px" fontWeight="900" lineHeight={1.2}>{title}</Text>
      {text && <Text mt="5px" fontSize="16px" fontWeight="600" color={fg(0.72)} lineHeight={1.35}>{text}</Text>}
    </Flex>
  );
};

export const Tiles = ({ n = 4, children }) => <Grid templateColumns={`repeat(${n}, minmax(0,1fr))`} gap="2px">{children}</Grid>;

export const Team = ({ id, size = 30, font = "19px" }) => (
  <Flex align="center" gap="10px" minW={0}>
    <Image src={logoOf(id)} alt="" w={`${size}px`} h={`${size}px`} objectFit="contain" flexShrink={0} />
    <Text fontSize={font} fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">{shortOf(id)}</Text>
  </Flex>
);

export const Head = ({ pal, cols, labels, align = [], gap = "16px" }) => {
  const fg = fgOf(pal);
  return (
    <Grid templateColumns={cols} columnGap={gap} pb="8px" borderBottom={`2px solid ${fg(0.14)}`}>
      {labels.map((l, i) => <Text key={i} fontSize="13px" color={fg(0.55)} textAlign={align[i] ?? "left"} {...caps}>{l}</Text>)}
    </Grid>
  );
};
