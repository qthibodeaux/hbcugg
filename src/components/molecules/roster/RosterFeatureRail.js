import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const isLightColor = (hex) => {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
};

const formatHeight = (height) => {
  const inches = Number(height);
  if (!Number.isFinite(inches) || inches <= 0) return "--";
  return `${Math.floor(inches / 12)}'${inches % 12}`;
};

const toTitle = (value) =>
  String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const nameFromImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  return toTitle(
    decodeURIComponent(String(imageUrl).split("/").pop() || "")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/^\d+[_-]+/, "")
      .replace(/\?.*$/, ""),
  );
};

const getPlayerName = (player) => {
  const direct = player.full_name || [player.first_name, player.last_name].filter(Boolean).join(" ");
  return direct || nameFromImageUrl(player.image_url) || "Featured Player";
};

const getClassCount = (model, classKey) =>
  model?.composition?.classDistribution?.find((item) => item.class === classKey)?.count ?? 0;

const getPosition = (player) => player.position_abbr || player.position_group || player.position || "--";
const getJersey = (player) => player.jersey_number ?? player.jersey ?? "--";

const wrapIndex = (index, length) => (index + length) % length;
const nextIndex = (index, length) => wrapIndex(index + 1, length);

// Caps raised from 4 players / 5 slides — the deck renders up to DECK_CARDS
// entries (6 on desktop), so the old caps silently starved it of slides no
// matter what the deck asked for.
const MAX_PLAYER_SLIDES = 7;
const MAX_SLIDES = 8;

const buildSlides = ({ players = [], model, primary, secondary }) => {
  const playerSlides = players
    .filter((player) => player.image_url)
    .slice(0, MAX_PLAYER_SLIDES)
    .map((player) => {
      const position = getPosition(player);
      const size = `${formatHeight(player.height)} / ${player.weight ?? "--"}`;
      return {
        type: "player",
        name: getPlayerName(player),
        label: getPlayerName(player),
        jersey: getJersey(player),
        pos: position,
        image: player.image_url,
        stats: [position, size, player.class_year || "--", player.transfer_tier || "Roster"],
        player,
      };
    });

  const deepestRoom = model?.composition?.positionDistribution?.find((item) => item.count > 0);
  const roomSlide = deepestRoom
    ? {
        type: "room",
        name: `${deepestRoom.group} Room`,
        label: `${deepestRoom.group} Room`,
        jersey: deepestRoom.group,
        pos: "Room",
        image: null,
        stats: [`${deepestRoom.count} Players`, `${Math.round(deepestRoom.pct ?? 0)}% Share`, "Deepest Room", "Roster Build"],
        primary,
        secondary,
      }
    : null;

  return [...playerSlides, roomSlide].filter(Boolean).slice(0, MAX_SLIDES);
};

// Fanned deck geometry.
//
// Cards are sized by ASPECT RATIO, not a width percentage — the stage is
// short and wide, so a 62%-wide/100%-tall card was a landscape box, and
// objectFit:cover cropped a portrait headshot down to the player's eyes.
// A portrait card shows the whole photo.
//
// The fan uses transform:translateX rather than `left` because CSS
// transform percentages resolve against the element's OWN width, so each
// card can step out by a fixed fraction of a card regardless of how wide
// the stage is. Cards behind the front one keep the same size and z-order
// descends, so each shows exactly PEEK of itself past the card ahead.
const DECK = {
  // Desktop's stage is much wider than the compact one, so the same peek
  // left the fan bunched at the left with dead space to its right — it
  // steps out further to use the width available.
  standard: { aspect: 0.76, peek: 56, shrink: 4, drop: 2, inset: 3 },
  compact: { aspect: 0.8, peek: 44, shrink: 4, drop: 2, inset: 2 },
};
// Desktop shows more of the deck than the compact rail has room for.
const DECK_CARDS = { standard: 6, compact: 4 };
const DECK_OPACITY = [1, 0.88, 0.7, 0.52, 0.36, 0.22];

const StackCard = ({ slide, team, variant = "standard", active = false, offset = 0, onClick }) => {
  const primary = team.colors?.primary ?? "#E53E3E";
  const secondary = team.colors?.secondary ?? "#FFFFFF";
  const isRoom = slide.type === "room";
  const compact = variant === "compact";
  const deck = compact ? DECK.compact : DECK.standard;

  return (
    <Box
      as="button"
      onClick={onClick}
      position="absolute"
      left={`${deck.inset}%`}
      top={`${offset * deck.drop}%`}
      h={`${100 - offset * deck.shrink}%`}
      aspectRatio={deck.aspect}
      opacity={DECK_OPACITY[offset] ?? 0.25}
      overflow="hidden"
      bg={isRoom ? primary : "#f4f0f7"}
      border="1px solid"
      borderColor={active ? `${primary}1F` : "transparent"}
      cursor="pointer"
      textAlign="left"
      zIndex={8 - offset}
      boxShadow={active ? `16px 0 34px ${primary}24` : `10px 0 24px ${primary}18`}
      style={{
        transform: `translateX(${offset * deck.peek}%)`,
        transition: "transform 360ms ease, height 360ms ease, top 360ms ease, opacity 360ms ease",
      }}
      _hover={{ borderColor: secondary }}
    >
      <Text
        position="absolute"
        top={active ? "-20px" : "-12px"}
        left={active ? "-10px" : "-8px"}
        fontSize={active ? "116px" : "76px"}
        fontWeight="black"
        color={isRoom ? "white" : primary}
        opacity={isRoom ? 0.08 : 0.1}
        lineHeight="1"
        zIndex={1}
      >
        {slide.jersey}
      </Text>

      {isRoom ? (
        <Flex position="relative" zIndex={2} h="100%" direction="column" justify="center" px={5}>
          <Text fontSize="9px" fontWeight="black" color={secondary} textTransform="uppercase" letterSpacing="0.16em">
            Position group
          </Text>
          <Text mt={2} fontSize={active ? "3xl" : "xl"} fontWeight="black" color="white" textTransform="uppercase" lineHeight="0.86">
            {slide.name}
          </Text>
          <Text mt={3} fontSize="sm" fontWeight="black" color={secondary} textTransform="uppercase">
            {slide.stats[0]}
          </Text>
        </Flex>
      ) : (
        <Image
          src={slide.image}
          alt={slide.name}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="top center"
          position="relative"
          zIndex={0}
        />
      )}

      <Box position="absolute" inset={0} zIndex={2} bg={`linear-gradient(180deg, transparent 56%, ${primary}22 76%, #ffffff 100%)`} />

      {/* Softened from a 22%/0.5 wash — with the fanned geometry the only
          part of a deck card you see IS its right edge, so the old overlay
          bleached the very sliver it's meant to reveal. Depth fading is
          handled by the card's own opacity now; this just feathers the edge. */}
      {!active && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          w="14%"
          zIndex={4}
          bg="linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 100%)"
          pointerEvents="none"
        />
      )}

      {!isRoom && (
        <Text
          position="absolute"
          left={3}
          bottom={2}
          zIndex={3}
          fontSize={active ? "12px" : "10px"}
          color={primary}
          fontWeight="black"
          textTransform="uppercase"
          lineHeight="1"
          lineClamp={1}
        >
          #{slide.jersey} {slide.pos}
        </Text>
      )}
    </Box>
  );
};

const RosterDnaBlock = ({ model, team, secondaryAccent }) => {
  const primary = team.colors?.primary ?? "#E53E3E";
  const juniorCount = getClassCount(model, "Jr.");
  const seniorCount = getClassCount(model, "Sr.");
  const graduateCount = getClassCount(model, "Gr.");

  return (
    <Box position="relative" minW={0} borderLeft={`1px solid ${primary}29`} overflow="hidden" px={4} py={4}>
      <Text position="absolute" right="-10px" bottom="-18px" fontSize="72px" fontWeight="black" color={primary} opacity={0.07} lineHeight="1">
        {Math.round(model.kpis.upperclassPct ?? 0)}
      </Text>
      <Flex h="100%" direction="column" justify="center" position="relative" zIndex={1}>
        <Text fontSize="8px" fontWeight="black" color={primary} textTransform="uppercase" letterSpacing="0.16em">
          Roster DNA
        </Text>
        <Text mt={2} fontSize="3xl" fontWeight="black" color={primary} textTransform="uppercase" lineHeight="0.82">
          {model.identity}
        </Text>
        <Grid mt={3} templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
          {[
            ["Jr.", juniorCount],
            ["Sr.", seniorCount],
            ["Gr.", graduateCount],
          ].map(([label, count]) => (
            <Box key={label}>
              <Text fontSize="lg" fontWeight="black" color={secondaryAccent} lineHeight="1">
                {count}
              </Text>
              <Text fontSize="7px" fontWeight="black" color={primary} textTransform="uppercase">
                {label}
              </Text>
            </Box>
          ))}
        </Grid>
      </Flex>
    </Box>
  );
};

const ClassStackBlock = ({ model, team, secondaryAccent }) => {
  const { isMobile } = useLayoutDensity();
  const primary = team.colors?.primary ?? "#E53E3E";
  const secondary = team.colors?.secondary ?? "#FFFFFF";
  const accent = team.colors?.accent ?? secondaryAccent;
  const readableSecondary = isLightColor(secondary) ? accent : secondary;
  const classStack = model.composition.classDistribution.filter((item) => item.count > 0);
  const colorFor = (index) => [primary, `${primary}CC`, secondaryAccent, "#111111", readableSecondary][index % 5];

  // Mobile — the horizontal segmented bar can't work in a ~110px column:
  // five segments at minW 12% land ~22px each while the count inside them
  // renders at 18px, so the numbers overlapped into an unreadable smear.
  // Each class becomes its own row instead — label, a proportional bar, and
  // the count — which reads correctly at any column width.
  if (isMobile) {
    const maxCount = Math.max(...classStack.map((item) => item.count), 1);

    return (
      <Box position="relative" minW={0} borderLeft={`1px solid ${primary}29`} overflow="hidden" px={2} py={2}>
        <Flex h="100%" direction="column" justify="center" gap="2px">
          <Text fontSize="7px" fontWeight="black" color={primary} textTransform="uppercase" letterSpacing="0.12em" mb="2px">
            Class Stack
          </Text>
          {classStack.map((item, index) => (
            <Flex key={item.class} align="center" gap="3px" minW={0}>
              <Text fontSize="7px" fontWeight="black" color={primary} textTransform="uppercase" w="14px" flexShrink={0}>
                {String(item.class).replace(".", "")}
              </Text>
              <Box flex="1" h="6px" bg={`${primary}1A`} minW={0}>
                <Box h="100%" w={`${Math.round((item.count / maxCount) * 100)}%`} bg={colorFor(index)} />
              </Box>
              <Text fontSize="8px" fontWeight="black" color={primary} w="14px" textAlign="right" flexShrink={0}>
                {item.count}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    );
  }

  return (
    <Box position="relative" minW={0} borderLeft={`1px solid ${primary}29`} overflow="hidden" px={4} py={4}>
      <Flex h="100%" direction="column" justify="center">
        <Text fontSize="8px" fontWeight="black" color={primary} textTransform="uppercase" letterSpacing="0.16em">
          Class Stack
        </Text>
        <Flex mt={3} h="46px" w="100%" overflow="hidden" border={`1px solid ${primary}29`}>
          {classStack.map((item, index) => {
            const bg = colorFor(index);
            return (
              <Flex
                key={item.class}
                w={`${item.pct ?? 0}%`}
                minW="12%"
                bg={bg}
                align="center"
                justify="center"
                direction="column"
                color={isLightColor(bg) ? primary : "white"}
              >
                <Text fontSize="lg" fontWeight="black" lineHeight="1">
                  {item.count}
                </Text>
                <Text fontSize="7px" fontWeight="black" textTransform="uppercase" lineHeight="1">
                  {String(item.class).replace(".", "")}
                </Text>
              </Flex>
            );
          })}
        </Flex>
        <Text mt={3} fontSize="10px" fontWeight="black" color={secondaryAccent} textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
          {Math.round(model.kpis.upperclassPct ?? 0)}% upperclass players
        </Text>
      </Flex>
    </Box>
  );
};

const StatChip = ({ value, team }) => (
  <Text fontSize="8px" fontWeight="black" color={team.colors?.primary ?? "#E53E3E"} textTransform="uppercase" letterSpacing="0.02em" whiteSpace="nowrap">
    {value}
  </Text>
);

const CarouselControls = ({ slides, activeIndex, paused, team, onTogglePause, onSelect }) => {
  const primary = team.colors?.primary ?? "#E53E3E";

  return (
    <Flex align="center" justify="flex-end" gap={2} h="100%">
      <Box
        as="button"
        onClick={onTogglePause}
        w="24px"
        h="24px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={primary}
        color="white"
        borderRadius="sm"
        title={paused ? "Resume carousel" : "Pause carousel"}
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
      </Box>
      <Flex align="center" gap={1.25}>
        {slides.map((slide, index) => (
          <Box
            key={slide.name}
            as="button"
            onClick={() => onSelect(index)}
            title={slide.name}
            w={index === activeIndex ? "18px" : "10px"}
            h="10px"
            borderRadius="full"
            bg={index === activeIndex ? primary : "#0B0B0D"}
            border={index === activeIndex ? `2px solid ${primary}` : "0"}
            boxShadow={index === activeIndex ? "0 0 0 2px #ffffff inset" : "none"}
            style={{ transition: "width 180ms ease" }}
          />
        ))}
      </Flex>
    </Flex>
  );
};

const RosterCta = ({ team, model, secondaryAccent, compact = false, onFullRoster }) => {
  const primary = team.colors?.primary ?? "#E53E3E";
  const lines = ["View", "Roster"];

  return (
    <Box
      as="button"
      type="button"
      onClick={onFullRoster}
      textAlign="left"
      bg={primary}
      color="white"
      borderRadius="lg"
      px={compact ? 4 : 6}
      py={compact ? 3 : 5}
      position="relative"
      overflow="hidden"
      h="100%"
      style={{ transition: "filter 0.15s" }}
      _hover={{ filter: "brightness(0.92)" }}
    >
      <Text position="absolute" right="-16px" bottom="-26px" fontSize={compact ? "86px" : "110px"} fontWeight="black" color="white" opacity={0.08} lineHeight="1">
        {model.kpis.totalPlayers}
      </Text>
      <Flex h="100%" direction="column" justify="space-between" position="relative" zIndex={1}>
        <Box minH={0}>
          {lines.map((line) => (
            <Text key={line} fontSize={compact ? "clamp(1.45rem, 3.6vw, 2.35rem)" : "clamp(2rem, 4vw, 3.75rem)"} fontWeight="black" textTransform="uppercase" lineHeight="0.78" letterSpacing="-0.04em">
              {line}
            </Text>
          ))}
        </Box>
        <Flex align="center" justify="flex-end">
          <ArrowRight size={compact ? 16 : 22} color={secondaryAccent} />
        </Flex>
      </Flex>
    </Box>
  );
};

const CarouselStage = ({ team, slides, visibleSlides, featured, activeIndex, paused, variant, onSelect, onTogglePause, onNavigate }) => {
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

const RosterFeatureRailStandard = ({ team, model, slides, visibleSlides, featured, activeIndex, paused, secondaryAccent, onFullRoster, onSelect, onTogglePause, onNavigate }) => {
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

const RosterFeatureRailCompact = ({ team, model, slides, visibleSlides, featured, activeIndex, paused, secondaryAccent, onFullRoster, onSelect, onTogglePause, onNavigate }) => {
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

// Mobile — two columns instead of three or four. The carousel takes the
// majority; View Roster and Class Stack share one narrow sidebar column,
// stacked as two rows. Roster DNA is dropped entirely, following the
// compact variant's existing precedent. Four columns at phone width made
// each column narrower than its own words ("VIE / W / ROS / TER").
// Square corners, no outer radius — mobile page rules.
const RosterFeatureRailMobile = ({ team, model, slides, visibleSlides, featured, activeIndex, paused, secondaryAccent, onFullRoster, onSelect, onTogglePause, onNavigate }) => {
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

const ProgressLine = ({ primary, secondaryAccent, paused, slides, onAdvance }) => (
  <Box position="absolute" left="20%" right="18%" bottom={0} h="4px" bg={`${primary}1F`} pointerEvents="none">
    <Box
      h="100%"
      w="100%"
      bg={secondaryAccent}
      transformOrigin="left"
      style={{ animation: paused || slides.length <= 1 ? "none" : "rosterFeatureProgress 5s linear infinite" }}
      onAnimationIteration={() => {
        if (!paused && slides.length > 1) onAdvance();
      }}
    />
  </Box>
);

export const RosterFeatureRail = ({ team, model, players = [], variant = "standard", onFullRoster }) => {
  const navigate = useNavigate();
  const { isMobile } = useLayoutDensity();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  if (!team || !model?.hasData) return null;

  const goToPlayer = (slide) => {
    if (!slide?.player) return;
    navigate(`/player/${encodeURIComponent(`${slide.name}__${slide.player.team_id}`)}`, { state: { player: slide.player } });
  };

  const primary = team.colors?.primary ?? "#E53E3E";
  const secondary = team.colors?.secondary ?? "#FFFFFF";
  const secondaryAccent = isLightColor(secondary) ? team.colors?.accent ?? "#111111" : secondary;
  const slides = buildSlides({ players, model, primary, secondary: secondaryAccent });
  const featured = slides[activeIndex] ?? slides[0];
  const deckCards = isMobile ? DECK_CARDS.compact : DECK_CARDS[variant] ?? DECK_CARDS.standard;
  const visibleSlides = slides.map((_, offset) => ({
    slide: slides[wrapIndex(activeIndex + offset, slides.length)],
    offset,
    index: wrapIndex(activeIndex + offset, slides.length),
  })).slice(0, deckCards);
  const sharedProps = {
    team,
    model,
    slides,
    visibleSlides,
    featured,
    activeIndex,
    paused,
    secondaryAccent,
    onFullRoster,
    onSelect: setActiveIndex,
    onTogglePause: () => setPaused((value) => !value),
    onNavigate: goToPlayer,
  };

  return (
    <>
      <style>{`
        @keyframes rosterFeatureProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
      {isMobile
        ? <RosterFeatureRailMobile {...sharedProps} />
        : variant === "compact"
          ? <RosterFeatureRailCompact {...sharedProps} />
          : <RosterFeatureRailStandard {...sharedProps} />}
    </>
  );
};

export default RosterFeatureRail;
