import { useState } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import { useSeasonScheduleData } from "../../hooks/useSeasonScheduleData";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { SeasonScheduleBanner, SEASON_SCHEDULE_ACCENT as ACCENT } from "../../components/molecules/game/SeasonScheduleBanner";
import { SeasonScheduleGrid, SeasonScheduleMobileGrid } from "../../components/molecules/game/SeasonScheduleGrid";

const SeasonSchedulePage = () => {
  const params = useParams();
  const {
    season,
    setSeason,
    groupId,
    setGroupId,
    includeNonConference,
    setIncludeNonConference,
    group,
    model,
    isLoading,
    isError,
  } = useSeasonScheduleData({ routeYear: params.year });
  const { isMobile } = useLayoutDensity();
  // Mobile, MEAC only: show just the conference weeks (the header row stays).
  const [confWeeksOnly, setConfWeeksOnly] = useState(false);

  const bannerProps = {
    season,
    setSeason,
    groupId,
    setGroupId,
    includeNonConference,
    setIncludeNonConference,
  };

  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        <SeasonScheduleBanner isMobile={isMobile} {...bannerProps} />
        {isLoading && (
          <Flex h="12rem" align="center" justify="center">
            <Spinner color="brand.500" />
          </Flex>
        )}
        {isError && (
          <Flex h="12rem" align="center" justify="center">
            <Text color="text.muted">Unable to load season schedule.</Text>
          </Flex>
        )}
        {!isLoading && !isError && groupId === "meac" && (
          <Flex borderTop="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
            {[[false, "All weeks"], [true, "MEAC weeks"]].map(([on, text]) => (
              <Box key={text} as="button" type="button" onClick={() => setConfWeeksOnly(on)} flex={1} py="0.55rem"
                bg={confWeeksOnly === on ? ACCENT : "transparent"} borderLeft={on ? "1px solid" : "none"} borderColor="whiteAlpha.100">
                <Text fontSize="0.65rem" fontWeight="black" color="white" textAlign="center" textTransform="uppercase" letterSpacing="0.06em">{text}</Text>
              </Box>
            ))}
          </Flex>
        )}
        {!isLoading && !isError && <SeasonScheduleMobileGrid group={group} model={model} confWeeksOnly={groupId === "meac" && confWeeksOnly} />}
      </Box>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <SeasonScheduleBanner isMobile={isMobile} {...bannerProps} />
      </PageShell.Slot>

      <PageShell.Slot cols={4} rows={9}>
        {isLoading && (
          <Flex h="100%" align="center" justify="center" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl">
            <Spinner color="brand.500" />
          </Flex>
        )}
        {isError && (
          <Flex h="100%" align="center" justify="center" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl">
            <Text color="text.muted">Unable to load season schedule.</Text>
          </Flex>
        )}
        {!isLoading && !isError && (
          <SeasonScheduleGrid
            group={group}
            includeNonConference={includeNonConference}
            model={model}
          />
        )}
      </PageShell.Slot>
    </PageShell>
  );
};

export default SeasonSchedulePage;
