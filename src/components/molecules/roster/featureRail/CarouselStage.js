import { Grid, Box, Flex, Text } from "@chakra-ui/react";
import { StackCard } from "./StackCard";
import { StatChip, CarouselControls } from "./RailControls";

export const CarouselStage = ({ team, slides, visibleSlides, featured, activeIndex, paused, variant, onSelect, onTogglePause, onNavigate }) => {
  const primary = team.colors?.primary ?? "#E53E3E";
  const compact = variant === "compact";
  const featuredIsPlayer = featured?.type === "player";

  return (
    <Grid templateRows={compact ? "82% 18%" : "84% 16%"} minH={0} overflow="hidden" borderLeft={`1px solid ${primary}29`} borderRight={`1px solid ${primary}29`}>
      <Box position="relative" minH={0} overflow="hidden">
        <Box position="relative" h="100%" w="100%">
          {visibleSlides.map(({ slide, offset, index }) => (
            <StackCard
              key={`${slide.name}-${offset}`}
              slide={slide}
              team={team}
              variant={variant}
              active={offset === 0}
              offset={offset}
              // Active card (already front-and-center) goes to the player's
              // page; side cards still just bring themselves forward — click-
              // to-browse and click-to-open shouldn't fight over one action.
              onClick={() => (offset === 0 && slide.type === "player" ? onNavigate(slide) : onSelect(index))}
            />
          ))}
        </Box>
      </Box>

      <Grid templateColumns="minmax(0, 1fr) auto" borderTop={`1px solid ${primary}29`} minH={0}>
        <Flex align="center" px={compact ? 2 : 3} gap={compact ? 1.5 : 2.5} minW={0}>
          <Box
            as={featuredIsPlayer ? "button" : "div"}
            type={featuredIsPlayer ? "button" : undefined}
            onClick={featuredIsPlayer ? () => onNavigate(featured) : undefined}
            bg="transparent"
            border="none"
            p={0}
            cursor={featuredIsPlayer ? "pointer" : "default"}
            minW={0}
          >
            <Text
              fontSize={compact ? "sm" : "lg"}
              fontWeight="black"
              color={primary}
              textTransform="uppercase"
              lineHeight="0.85"
              lineClamp={1}
              _hover={featuredIsPlayer ? { textDecoration: "underline" } : undefined}
            >
              {featured?.label}
            </Text>
          </Box>
          <Box h={compact ? "14px" : "20px"} w="1px" bg={`${primary}47`} flexShrink={0} />
          <Flex align="center" gap={compact ? 1.25 : 2.25} minW={0} overflow="hidden">
            {featured?.stats?.slice(0, compact ? 3 : 4).map((stat) => (
              <StatChip key={stat} value={stat} team={team} />
            ))}
          </Flex>
        </Flex>
        <Box pr={compact ? 2 : 3}>
          <CarouselControls
            slides={slides}
            activeIndex={activeIndex}
            paused={paused}
            team={team}
            onTogglePause={onTogglePause}
            onSelect={onSelect}
          />
        </Box>
      </Grid>
    </Grid>
  );
};
