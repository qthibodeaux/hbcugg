import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { familyColorFor, matchupLabel } from "./EventPrimitives";

export const COLS = "6rem minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.3fr) minmax(0, 1fr)";

export const SeasonCalendarRow = ({ occ, isLast }) => {
  const color = familyColorFor(occ);
  return (
    <Grid
      templateColumns={COLS}
      gap={3}
      px={5}
      py={2.5}
      alignItems="center"
      borderBottom={isLast ? "none" : "1px solid"}
      borderColor="whiteAlpha.50"
      borderLeft="3px solid"
      borderLeftColor={color}
      bg={`linear-gradient(90deg, ${occ.accent}14 0%, transparent 40%)`}
    >
      <Text fontSize="xs" fontWeight="black" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.06em">{occ.dateLabel}</Text>
      <Box minW={0}>
        <Text fontSize="sm" fontWeight="black" color="white" lineClamp={1}>{occ.label}</Text>
        {occ.note && <Text fontSize="xs" color="whiteAlpha.500" lineClamp={1}>{occ.note}</Text>}
      </Box>
      <Flex align="center" gap={2} minW={0}>
        {occ.sides.map((s) => s.team?.logo && <Image key={s.teamId} src={s.team.logo} alt="" w="1.25rem" h="1.25rem" objectFit="contain" flexShrink={0} />)}
        <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.02em" lineClamp={1}>{matchupLabel(occ)}</Text>
      </Flex>
      <Text fontSize="sm" color="whiteAlpha.700" lineClamp={1}>{occ.venue?.name ?? occ.stadiumName ?? "—"}</Text>
      <Text fontSize="xs" color="whiteAlpha.600" lineClamp={1}>
        {[occ.color ? `${occ.color} out` : null, ...occ.tags.map((t) => t.label)].filter(Boolean).join(" · ") || "—"}
      </Text>
    </Grid>
  );
};
