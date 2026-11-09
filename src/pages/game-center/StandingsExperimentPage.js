import PageShell from "../../components/layouts/PageShell";
import { RaceProbabilityMatrix } from "../../components/molecules/game/standingsExperiment/RaceProbabilityMatrix";
import { BannerStandings } from "../../components/molecules/banners/StandingsBanner";
import { featureCards, standingsGroups } from "../../data/standingsExperiment";
import { Box, Flex, Text } from "@chakra-ui/react";
import { DivisionStandingsCard, GloryRankingsCard } from "../../components/molecules/game/standingsExperiment/StandingsCards";

const StandingsExperimentPage = () => (
  <PageShell listContent={<RaceProbabilityMatrix />}>
    <PageShell.Slot cols={4}>
      <BannerStandings />
    </PageShell.Slot>

    {featureCards.map((card) => (
      <PageShell.Slot key={card.label} cols={1}>
        <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={4} overflow="hidden">
          <Flex h="100%" direction="column" justify="space-between">
            <Text fontSize="10px" color={card.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              {card.label}
            </Text>
            <Box>
              <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.95}>
                {card.value}
              </Text>
              <Text fontSize="xs" color="text.secondary" fontWeight="bold" mt={2}>
                {card.sub}
              </Text>
            </Box>
          </Flex>
        </Box>
      </PageShell.Slot>
    ))}

    {standingsGroups.map((group) => (
      <PageShell.Slot key={group.id} cols={2} rows={2}>
        <DivisionStandingsCard group={group} />
      </PageShell.Slot>
    ))}

    <PageShell.Slot cols={2} rows={2}>
      <GloryRankingsCard />
    </PageShell.Slot>
  </PageShell>
);

export default StandingsExperimentPage;
