import { useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { FAMILY_COLOR, familyColorFor, matchupLabel } from "./EventPrimitives";

// PageShell list region — every event this season, filterable by family
// and team. Not a slot: a season is however many rows it is.

const COLS = "6rem minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.3fr) minmax(0, 1fr)";

const FAMILIES = [
  { id: "all", label: "All" },
  { id: "classic", label: "Classics", color: FAMILY_COLOR.classic },
  { id: "homecoming", label: "Homecoming", color: FAMILY_COLOR.homecoming },
  { id: "theme", label: "Theme days", color: FAMILY_COLOR.theme },
  { id: "postseason", label: "Postseason", color: FAMILY_COLOR.postseason },
];

const inFamily = (occ, id) => {
  if (id === "all") return true;
  if (id === "homecoming") return occ.isHomecoming;
  if (id === "theme") return occ.family === "theme" && !occ.isHomecoming;
  return occ.family === id;
};

const Pill = ({ active, color, onClick, children }) => (
  <Box
    as="button"
    onClick={onClick}
    px={3}
    py={1}
    borderRadius="full"
    border="1px solid"
    borderColor={active ? color ?? "whiteAlpha.600" : "whiteAlpha.200"}
    bg={active ? `${color ?? "#FFFFFF"}26` : "transparent"}
    _hover={{ bg: "whiteAlpha.100" }}
    transition="all 0.15s"
  >
    <Text fontSize="0.6rem" fontWeight="black" color={active ? "white" : "whiteAlpha.600"} textTransform="uppercase" letterSpacing="0.14em" whiteSpace="nowrap">
      {children}
    </Text>
  </Box>
);

export const SeasonCalendarList = ({ occurrences, season }) => {
  const [family, setFamily] = useState("all");
  const [teamId, setTeamId] = useState("all");

  const teams = [...new Map(occurrences.flatMap((o) => o.sides).map((s) => [s.teamId, s])).values()]
    .sort((a, b) => (a.team?.shortName ?? a.teamId).localeCompare(b.team?.shortName ?? b.teamId));

  const rows = occurrences.filter((o) => inFamily(o, family) && (teamId === "all" || o.sides.some((s) => s.teamId === teamId)));

  return (
    <Box bg="#141416" border="1px solid rgba(255,255,255,0.07)" borderRadius="xl" overflow="hidden">
      <Flex align="center" justify="space-between" px={5} pt={5} pb={3} gap={4} flexWrap="wrap">
        <Flex align="center" gap={2}>
          <Box w="3px" h="14px" bg="brand.500" />
          <Text fontSize="9px" fontWeight="black" letterSpacing="0.4em" color="text.muted">
            SEASON CALENDAR · {season}
          </Text>
        </Flex>
        <Flex gap={1.5} flexWrap="wrap">
          {FAMILIES.map((f) => (
            <Pill key={f.id} active={family === f.id} color={f.color} onClick={() => setFamily(f.id)}>{f.label}</Pill>
          ))}
        </Flex>
      </Flex>

      <Flex px={5} pb={3} gap={1} flexWrap="wrap">
        <Pill active={teamId === "all"} onClick={() => setTeamId("all")}>Every team</Pill>
        {teams.map((s) => (
          <Box
            key={s.teamId}
            as="button"
            onClick={() => setTeamId(teamId === s.teamId ? "all" : s.teamId)}
            w={8}
            h={8}
            p={1}
            borderRadius="md"
            bg={teamId === s.teamId ? "whiteAlpha.200" : "transparent"}
            opacity={teamId === "all" || teamId === s.teamId ? 1 : 0.4}
            _hover={{ opacity: 1, bg: "whiteAlpha.100" }}
            title={s.team?.name ?? s.teamId}
          >
            {s.team?.logo ? (
              <Image src={s.team.logo} alt="" w="full" h="full" objectFit="contain" />
            ) : (
              <Text fontSize="0.5rem" fontWeight="black" color="whiteAlpha.700">{String(s.teamId).replace(/^(swac|meac)/, "").toUpperCase()}</Text>
            )}
          </Box>
        ))}
      </Flex>

      <Grid templateColumns={COLS} gap={3} px={5} py={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
        {["Date", "Event", "Matchup", "Venue", "Also"].map((h) => (
          <Text key={h} fontSize="0.6rem" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.2em">{h}</Text>
        ))}
      </Grid>

      {rows.length === 0 ? (
        <Flex py={10} justify="center">
          <Text fontSize="xs" fontWeight="black" letterSpacing="0.4em" color="whiteAlpha.400">NOTHING MATCHES</Text>
        </Flex>
      ) : rows.map((occ, i) => {
        const color = familyColorFor(occ);
        return (
          <Grid
            key={occ.key}
            templateColumns={COLS}
            gap={3}
            px={5}
            py={2.5}
            alignItems="center"
            borderBottom={i === rows.length - 1 ? "none" : "1px solid"}
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
      })}
    </Box>
  );
};

export default SeasonCalendarList;
