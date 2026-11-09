import { Box, Grid } from "@chakra-ui/react";
import { RosterCta, ProgressLine } from "./RailControls";
import { CarouselStage } from "./CarouselStage";
import { RosterDnaBlock, ClassStackBlock } from "./RosterCompositionBlocks";
import { nextIndex } from "./featureRailModel";

export const RosterFeatureRailStandard = ({ team, model, slides, visibleSlides, featured, activeIndex, paused, secondaryAccent, onFullRoster, onSelect, onTogglePause, onNavigate }) => {
  const primary = team.colors?.primary ?? "#E53E3E";

  return (
    <Box h="100%" w="100%" bg="#FFFFFF" color={primary} border={`1px solid ${primary}2E`} borderRadius="lg" overflow="hidden" position="relative">
      <Grid h="100%" templateColumns="1.1fr 2.45fr 0.8fr 0.75fr" templateRows="1fr">
        <RosterCta team={team} model={model} secondaryAccent={secondaryAccent} onFullRoster={onFullRoster} />
        <CarouselStage
          team={team}
          slides={slides}
          visibleSlides={visibleSlides}
          featured={featured}
          activeIndex={activeIndex}
          paused={paused}
          variant="standard"
          onSelect={onSelect}
          onTogglePause={onTogglePause}
          onNavigate={onNavigate}
        />
        <RosterDnaBlock model={model} team={team} secondaryAccent={secondaryAccent} />
        <ClassStackBlock model={model} team={team} secondaryAccent={secondaryAccent} />
      </Grid>
      <ProgressLine primary={primary} secondaryAccent={secondaryAccent} paused={paused} slides={slides} onAdvance={() => onSelect(nextIndex(activeIndex, slides.length))} />
    </Box>
  );
};

export const RosterFeatureRailCompact = ({ team, model, slides, visibleSlides, featured, activeIndex, paused, secondaryAccent, onFullRoster, onSelect, onTogglePause, onNavigate }) => {
  const primary = team.colors?.primary ?? "#E53E3E";

  return (
    <Box h="100%" w="100%" bg="#FFFFFF" color={primary} border={`1px solid ${primary}2E`} borderRadius="lg" overflow="hidden" position="relative">
      <Grid h="100%" templateColumns="0.82fr 2.18fr 0.92fr" templateRows="1fr">
        <RosterCta team={team} model={model} secondaryAccent={secondaryAccent} compact onFullRoster={onFullRoster} />
        <CarouselStage
          team={team}
          slides={slides}
          visibleSlides={visibleSlides}
          featured={featured}
          activeIndex={activeIndex}
          paused={paused}
          variant="compact"
          onSelect={onSelect}
          onTogglePause={onTogglePause}
          onNavigate={onNavigate}
        />
        <ClassStackBlock model={model} team={team} secondaryAccent={secondaryAccent} />
      </Grid>
      <ProgressLine primary={primary} secondaryAccent={secondaryAccent} paused={paused} slides={slides} onAdvance={() => onSelect(nextIndex(activeIndex, slides.length))} />
    </Box>
  );
};

export const RosterFeatureRailMobile = ({ team, model, slides, visibleSlides, featured, activeIndex, paused, secondaryAccent, onFullRoster, onSelect, onTogglePause, onNavigate }) => {
  const primary = team.colors?.primary ?? "#E53E3E";

  return (
    <Box h="100%" w="100%" bg="#FFFFFF" color={primary} border={`1px solid ${primary}2E`} overflow="hidden" position="relative">
      <Grid h="100%" templateColumns="minmax(0, 0.95fr) minmax(0, 2.05fr)" templateRows="1fr">
        <Grid templateRows="minmax(0, 1fr) minmax(0, 1fr)" minH={0} overflow="hidden">
          <RosterCta team={team} model={model} secondaryAccent={secondaryAccent} compact onFullRoster={onFullRoster} />
          <ClassStackBlock model={model} team={team} secondaryAccent={secondaryAccent} />
        </Grid>
        <CarouselStage
          team={team}
          slides={slides}
          visibleSlides={visibleSlides}
          featured={featured}
          activeIndex={activeIndex}
          paused={paused}
          variant="compact"
          onSelect={onSelect}
          onTogglePause={onTogglePause}
          onNavigate={onNavigate}
        />
      </Grid>
      <ProgressLine primary={primary} secondaryAccent={secondaryAccent} paused={paused} slides={slides} onAdvance={() => onSelect(nextIndex(activeIndex, slides.length))} />
    </Box>
  );
};
