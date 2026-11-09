import { Box, Text, Flex, Image } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";
import { GRID_GAP, CARD_ACCENTS, DIVISION_MAP, DIVISION_ACCENT } from "../../../utils/rosterHubConfig";
import { ArrowRight } from "lucide-react";
import { SectionCard } from "./RosterHubPrimitives";
import { ClassPie } from "./RosterCompositionCards";
import { PhysicalRows } from "./RosterPhysicalCharts";
import { GeoKpis } from "./RosterGeographyCards";
import { TransferKpis } from "./RosterTransferCards";
import { useNavigate } from "react-router-dom";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { useMemo } from "react";
import { aggregateDivision } from "../../../utils/rosterHubModel";

// Owns one roster-hub view/control responsibility; existing behavior preserved.

const DivisionColumn = ({ name, mod, accent, teamIds, navigate, isMobile = false }) => {
  if (!mod)
    return (
      <Box p={4} textAlign="center">
        <Text textStyle="kicker" color="text.muted">
          No data
        </Text>
      </Box>
    );
  const total = mod.composition?.total_players ?? 0;
  const teamEntries = teamIds
    .map((tid) => teamsData.teams.find((t) => t.exportId.replace(/25$/, "") === tid))
    .filter(Boolean);
  // Mobile — alphabetical by school, with the real logo; DIVISION_MAP's own
  // order (standings-ish) is fine for desktop's tighter list but reads
  // arbitrary once each row gets real weight on mobile.
  if (isMobile) {
    teamEntries.sort((a, b) => a.shortName.localeCompare(b.shortName));
  }
  return (
    <Flex direction="column" gap={GRID_GAP} minW={0}>
      {/* Header */}
      <Box
        bg="bg.secondary"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius={isMobile ? 0 : "xl"}
        px={isMobile ? 0 : 4}
        py={3}
      >
        <Box px={isMobile ? 4 : 0}>
          <Flex align="flex-start" gap="0.5rem">
            <Box w="0.1875rem" h="1.1rem" mt="0.2rem" bg={accent} borderRadius="full" flexShrink={0} />
            <Text
              fontSize="lg"
              fontWeight="black"
              color="white"
              textTransform="uppercase"
              letterSpacing="0.05em"
              lineHeight={1.15}
              minH={isMobile ? "2.6rem" : undefined}
            >
              {name}
            </Text>
          </Flex>
          <Text textStyle="kicker" color="text.muted" mt={1}>
            {total} players
          </Text>
        </Box>

        {/* Team roster links — mobile: the 3 divisions stay side by side as
            columns (MEAC / SWAC East / SWAC West), each a compact stack of
            small logo + abbreviation rows since the column itself is too
            narrow for a grid. No horizontal padding here — these span the
            full width of the card instead of inheriting the header's
            inset. Desktop keeps the text row list, still inset. */}
        {isMobile ? (
          <Flex direction="column" gap="0.3rem" mt={3}>
            {teamEntries.map((teamEntry) => (
              <Flex
                key={teamEntry.exportId}
                as="button"
                aria-label={teamEntry.name}
                align="center"
                gap="0.4rem"
                w="100%"
                borderRadius={0}
                bg="rgba(255,255,255,0.05)"
                border="1px solid"
                borderColor="whiteAlpha.100"
                borderBottomWidth="0.2rem"
                borderBottomColor={teamEntry.colors?.primary || accent}
                onClick={() => navigate(`/teams/${teamEntry.id}/roster/full`)}
                px="0.6rem"
                py="0.3rem"
                style={{ transition: "all 0.15s" }}
              >
                <Image src={teamEntry.logo} alt="" boxSize="1.5rem" objectFit="contain" flexShrink={0} />
                <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
                  {teamEntry.shortName}
                </Text>
              </Flex>
            ))}
          </Flex>
        ) : (
          <Flex direction="column" gap={1} mt={3}>
            {teamEntries.map((teamEntry) => (
              <Flex
                key={teamEntry.exportId}
                as="button"
                align="center"
                justify="space-between"
                px={2}
                py={1}
                borderRadius="md"
                bg="whiteAlpha.50"
                _hover={{ bg: "whiteAlpha.100" }}
                onClick={() => navigate(`/teams/${teamEntry.id}/roster/full`)}
                style={{ transition: "all 0.15s" }}
                w="100%"
              >
                <Text fontSize="xs" fontWeight="semibold" color="text.secondary">
                  {teamEntry.shortName}
                </Text>
                <ArrowRight size={10} color="var(--chakra-colors-brand-500)" />
              </Flex>
            ))}
          </Flex>
        )}
      </Box>
      {/* Composition/Physical/Geographic/Transfers are all live on both
          platforms now, all flat/notched, all auto-height — no guessed
          fixed row height, since this whole column already lives in
          listContent (not the PageShell.Slot row-unit grid) rather than
          fighting it with a TALL_ROW_H estimate. */}
      <Box h="auto">
        <SectionCard title="Composition" accent={CARD_ACCENTS.composition} h="auto" borderRadius={isMobile ? 0 : "lg"} flat>
          <ClassPie data={mod.composition} experience={mod.experience} />
        </SectionCard>
      </Box>
      <Box h="auto">
        <SectionCard title="Physical" accent={CARD_ACCENTS.physical} h="auto" borderRadius={isMobile ? 0 : "lg"} flat>
          <PhysicalRows data={mod.physical} />
        </SectionCard>
      </Box>
      <Box h="auto">
        <SectionCard title="Geographic" accent={CARD_ACCENTS.geographic} h="auto" borderRadius={isMobile ? 0 : "lg"} flat>
          <GeoKpis data={mod.geographic} />
        </SectionCard>
      </Box>
      <Box h="auto">
        <SectionCard title="Transfers" accent={CARD_ACCENTS.transfers} h="auto" borderRadius={isMobile ? 0 : "lg"} flat>
          <TransferKpis data={mod.transfers} />
        </SectionCard>
      </Box>
    </Flex>
  );
};

export const DivisionsModeContent = ({ teamsMap }) => {
  const navigate = useNavigate();
  const { isMobile } = useLayoutDensity();
  const divMods = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(DIVISION_MAP).map(([name, ids]) => [
          name,
          aggregateDivision(ids, teamsMap),
        ]),
      ),
    [teamsMap],
  );

  return (
    <Box display="grid" gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap={isMobile ? "0.4rem" : GRID_GAP}>
      {Object.entries(DIVISION_MAP).map(([name, ids]) => (
        <DivisionColumn
          key={name}
          name={name}
          mod={divMods[name]}
          accent={DIVISION_ACCENT[name]}
          teamIds={ids}
          navigate={navigate}
          isMobile={isMobile}
        />
      ))}
    </Box>
  );
};
