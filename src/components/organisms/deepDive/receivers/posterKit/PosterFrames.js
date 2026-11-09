import { fgOf, POSTER_W, caps, tab } from "../../gridPosterKit";
import { Flex, Text, Box, Grid } from "@chakra-ui/react";
import { ExportWordmark } from "../../../../molecules/export/ExportWordmark";
import DATA from "../../../../../data/receiverDeepDive2026W9.json";

export const RPoster = ({ pal, innerRef, title, headline, children }) => {
  const fg = fgOf(pal);
  const parts = String(title).split(" × ");
  const [plain, accent] = String(headline ?? "").split("|").map((t) => t.trim());
  return (
    <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={pal.bg} color={pal.ink} px="56px" pt="36px" pb="44px" gap="18px" overflow="hidden">
      <Flex align="center" justify="space-between" pb="16px" borderBottom={`1px solid ${fg(0.12)}`}>
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
        <Text fontSize="18px" color={pal.orange} {...caps}>{DATA.season} · Through Week {DATA.through_week}</Text>
      </Flex>
      {plain && (
        <Text fontSize="78px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.92} letterSpacing="-0.04em">
          {plain}{accent && <Box as="span" color={pal.brand}> {accent}</Box>}
        </Text>
      )}
      <Flex direction="column" bg={pal.panel} px="28px" pt="24px" pb="24px" minW={0}>
        {title && (
        <Text fontSize={plain ? "34px" : "50px"} fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.03em" mb="20px">
          {parts.map((p, i) => (
            <Box as="span" key={i} display="block">{p}{i < parts.length - 1 && <Box as="span" color={pal.brand}> ×</Box>}</Box>
          ))}
        </Text>
        )}
        {children}
      </Flex>
    </Flex>
  );
};

export const InfoPoster = ({ pal, innerRef, title, accent, children }) => {
  const fg = fgOf(pal);
  return (
    <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={pal.bg} color={pal.ink} px="56px" pt="36px" pb="44px" gap="18px" overflow="hidden">
      <Flex align="center" justify="space-between">
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
        <Text fontSize="18px" color={pal.orange} {...caps}>{DATA.season} · Through Week {DATA.through_week} · Receivers</Text>
      </Flex>
      <Text fontSize="78px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.92} letterSpacing="-0.04em">
        {title} <Box as="span" color={pal.brand}>{accent}</Box>
      </Text>
      <Box h="1px" bg={fg(0.12)} />
      <Flex direction="column" gap="18px">{children}</Flex>
    </Flex>
  );
};

export const Panels = ({ cols = 2, gap = "36px", children }) => <Grid templateColumns={`repeat(${cols}, minmax(0,1fr))`} gap={gap}>{children}</Grid>;

export const BigStat = ({ pal, value, label, ink, size = 96 }) => (
  <Box>
    <Text fontSize={`${size}px`} fontWeight="950" fontStyle="italic" lineHeight={0.95} letterSpacing="-0.03em" color={ink ?? pal.brand} {...tab}>{value}</Text>
    <Text fontSize="19px" mt="6px" lineHeight={1.15} color={fgOf(pal)(0.65)} {...caps}>{label}</Text>
  </Box>
);

export const Card = ({ pal, children, ...rest }) => <Flex direction="column" bg={pal.bg} p="18px" minW={0} {...rest}>{children}</Flex>;
