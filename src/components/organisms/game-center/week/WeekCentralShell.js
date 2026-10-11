import { Box, Flex, Grid, Spinner } from "@chakra-ui/react";
import PageShell from "../../../layouts/PageShell";
import { WeekCentralBanner } from "./WeekCentralBanner";
import { useWeekCentralChrome } from "./WeekCentralProvider";
import { WeekGameList } from "./WeekGameList";
import { WeeklyBriefPanel } from "./WeeklyBriefPanel";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";

export const WeekCentralShell = () => {
  const { isLoading } = useWeekCentralChrome();
  const { isMobile } = useLayoutDensity();

  if (isLoading) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <Flex h="100%" align="center" justify="center">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        </PageShell.Slot>
      </PageShell>
    );
  }

  // Mobile — no PageShell (its grid gap/padding is what was leaving a gap
  // above this content). Columns touch (gap=0) instead of the desktop 0.75rem.
  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        <WeekCentralBanner />
        <Grid h="calc(100vh - var(--app-header-height) - 0.5rem)" minH={0} mt="0.5rem" templateColumns="repeat(2, minmax(0, 1fr))" gap={0}>
          <WeekGameList />
          <WeeklyBriefPanel />
        </Grid>
      </Box>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <WeekCentralBanner />
      </PageShell.Slot>

      <PageShell.Slot cols={4} rows={5}>
        <Grid h="100%" minH={0} w="100%" templateColumns="minmax(0, 1.65fr) minmax(280px, 0.85fr)" gap={3}>
          <WeekGameList />
          <WeeklyBriefPanel />
        </Grid>
      </PageShell.Slot>
    </PageShell>
  );
};
