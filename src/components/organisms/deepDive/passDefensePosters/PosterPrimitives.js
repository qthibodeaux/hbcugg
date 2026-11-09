import { fgOf, POSTER_W, caps, PD_META, pct1 } from "./posterModel";
import { Flex, Text, Box, Image } from "@chakra-ui/react";
import { ExportWordmark } from "../../../molecules/export/ExportWordmark";
import { logoOf } from "../deepDiveModel";
import { teamShortName } from "../../../game/export/exportData";

// House-style pass-defense poster frame, cards, team rows and loading/average presentation.

export const Poster = ({ pal, innerRef, children }) => {
  const fg = fgOf(pal);
  return (
    <Flex ref={innerRef} direction="column" w={`${POSTER_W}px`} bg={pal.bg} color={pal.ink} px="56px" pt="36px" pb="44px" gap="18px" overflow="hidden">
      <Flex align="center" justify="space-between" pb="16px" borderBottom={`1px solid ${fg(0.12)}`}>
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="34px" />
        <Text fontSize="18px" color={pal.orange} {...caps}>{PD_META.season} · Pass defense · The 18</Text>
      </Flex>
      {children}
    </Flex>
  );
};

export const Card = ({ pal, kicker, right, children }) => {
  const fg = fgOf(pal);
  const parts = String(kicker).split(" × ");
  return (
    <Flex direction="column" bg={pal.panel} px="28px" pt="24px" pb="22px" minW={0}>
      <Text fontSize="50px" fontWeight="950" fontStyle="italic" textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.03em">
        {parts.map((p, i) => (
          <Box as="span" key={i} display="block">{p}{i < parts.length - 1 && <Box as="span" color={pal.brand}> ×</Box>}</Box>
        ))}
      </Text>
      <Flex mt="12px" mb="16px" pb="12px" justify="flex-end" borderBottom={`1px solid ${fg(0.1)}`} minH="1px">{right}</Flex>
      {children}
    </Flex>
  );
};

export const KickerRight = ({ pal, children }) => <Text fontSize="16px" color={fgOf(pal)(0.55)} {...caps}>{children}</Text>;

export const Waiting = ({ pal, error, empty }) => (
  <Text fontSize="22px" fontWeight="900" color={fgOf(pal)(0.5)} py="40px" textAlign="center">
    {error ? "The pass-defense files didn't load." : empty ? "No published values for this chart in the loaded files. Reload the page." : "Loading pass defense…"}
  </Text>
);

export const TeamCell = ({ id, size = 34, font = "21px" }) => (
  <Flex align="center" gap="10px" minW={0}>
    {logoOf(id) && <Image src={logoOf(id)} alt="" w={`${size}px`} h={`${size}px`} objectFit="contain" flexShrink={0} />}
    <Text fontSize={font} fontWeight="900" textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{teamShortName(id)}</Text>
  </Flex>
);

export const AvgNote = ({ pal, avg, fmt = pct1 }) => (Number.isFinite(avg) ? <KickerRight pal={pal}>Dashed = The 18 avg {fmt(avg)}</KickerRight> : null);
