import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Navigate, useParams } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import { HistorySheet } from "../../components/game/preview/PreviewTables";
import { GamePreviewScout } from "../../components/game/preview/GamePreviewScout";
import { GamePreviewScoutMobile } from "../../components/game/preview/GamePreviewScoutMobile";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useGamePreview } from "../../hooks/useGamePreview";
import { useGamePreviewScout } from "../../hooks/useGamePreviewScout";

// An upcoming game. The played-game page needs a game file; a preview has none,
// so it is built from the two teams' schedule rows plus history and season
// stats — see useGamePreview. Route: /game/preview/:gameId (the schedule's
// game_id, "YYYY-MM-DD_<away>_at_<home>").

const Message = ({ children }) => (
  <Flex justify="center" align="center" py={20} gap={3}>{children}</Flex>
);

const GamePreviewPage = () => {
  const { gameId } = useParams();
  const { model, isLoading, notFound, playedStem } = useGamePreview(gameId);
  // The scout section (banner, strips, season sheets, QBs, unit matchups,
  // leaders) with its own Export; meeting history stays below it.
  const scout = useGamePreviewScout(model);
  const { isMobile } = useLayoutDensity();

  if (playedStem) return <Navigate to={`/game/${playedStem}`} replace />;

  if (isLoading) {
    return <Message><Spinner color="brand.500" /><Text color="text.muted">Loading preview…</Text></Message>;
  }
  if (notFound) {
    return <Message><Text color="text.muted">We couldn’t find that game on the schedule.</Text></Message>;
  }

  // Phones: their own tree, not PageShell — banner, sticky jump header, then
  // the sections flush. History rides along as the last section.
  if (isMobile) {
    const hasHistory = (model?.meetings?.length ?? 0) > 0 || (model?.eventHistory?.items?.length ?? 0) > 0;
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)" pb="2.5rem">
        {scout ? (
          <GamePreviewScoutMobile m={scout} history={hasHistory ? <HistorySheet model={model} /> : null} />
        ) : (
          <Box px="0.75rem" py="1rem"><HistorySheet model={model} /></Box>
        )}
      </Box>
    );
  }

  const body = (
    <Box display="flex" flexDirection="column" gap="clamp(1.5rem, 3vw, 2.5rem)" pt={2} pb={12}>
      {scout ? <GamePreviewScout m={scout} /> : null}
      <HistorySheet model={model} />
    </Box>
  );

  return <PageShell listContent={body} />;
};

export default GamePreviewPage;
