import { Text, Box, Image, Grid, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { n1 } from "../spotlightModel";

// Shared Spotlight label and player/staff face cards with image fallback.

export const Label = ({ t, children, ...rest }) => (
  <Text fontSize="0.62rem" fontWeight="900" color={t.muted} textTransform="uppercase" letterSpacing="0.12em" {...rest}>{children}</Text>
);

const Face = ({ src, logo, t }) => {
  const [bad, setBad] = useState(false);
  return (
    <Box w="3rem" h="3rem" borderRadius="0.5rem" overflow="hidden" bg={t.track} flexShrink={0} display="flex" alignItems="center" justifyContent="center">
      {src && !bad ? <Image src={src} alt="" w="100%" h="100%" objectFit="cover" objectPosition="top" onError={() => setBad(true)} />
        : logo ? <Image src={logo} alt="" w="70%" h="70%" objectFit="contain" /> : null}
    </Box>
  );
};

export const People = ({ v, t, logo }) => (
  <Grid templateColumns="repeat(auto-fill, minmax(12rem, 1fr))" gap="0.6rem">
    {(v.data ?? []).map((p) => (
      <Flex key={p.name} gap="0.6rem" align="center" p="0.5rem" border={`1px solid ${t.line}`} borderRadius="6px" minW={0}>
        <Face src={p.image_url} logo={logo} t={t} />
        <Box minW={0}>
          <Text fontSize="0.9rem" fontWeight="900" color={t.text} lineClamp={1}>{p.name}</Text>
          <Label t={t} fontSize="0.58rem" lineClamp={1}>{p.position ?? p.role}{p.from ? ` · via ${p.from}` : ""}</Label>
          <Text fontSize="0.85rem" fontWeight="950" color={t.accent}>{p.position_rank ?? p.metric?.display ?? (p.par != null ? `${n1(p.par)} PAR` : "")}</Text>
        </Box>
      </Flex>
    ))}
  </Grid>
);
