import { useMemo, useState, useRef, useCallback } from "react";
import { withPhoto, FRAMES, COLOR_TREATMENTS, pickRandomPlayer, EXIT_DURATION, KEN_BURNS_DURATION, EXIT_ANIM, ENTER_ANIM, LOGO_FILL_FRAMES, routeFor } from "./directoryModel";
import useMountEffect from "../../../../hooks/useMountEffect";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { Box, Image, Flex } from "@chakra-ui/react";
import { FrameContent } from "./DirectoryFrameContent";

export const StandardSchoolCard = ({ team, navigate, target, topPlayers, headCoach }) => {
  // Per-team frame list: a team with no player headshots never shows the player
  // frame, and a coach with no headshot never shows the coach frame.
  const frames = useMemo(() => {
    const hasPlayer = withPhoto(topPlayers).length > 0;
    const hasCoach = Boolean(headCoach?.image_url);
    return FRAMES.filter(
      (f) => ((f !== "player" && f !== "playerBig") || hasPlayer) && (f !== "coach" || hasCoach),
    );
  }, [topPlayers, headCoach]);

  // Every tile used to open on index 0 — so all eighteen showed the abbreviation
  // at once on load and stayed locked together until the first tick drifted them
  // apart, which is 5-20 seconds of a dead-looking wall. Each tile now opens on
  // its own random frame.
  const [frameIndex, setFrameIndex] = useState(() => Math.floor(Math.random() * Math.max(frames.length, 1)));
  const [phase, setPhase] = useState("idle");
  const [enterKey, setEnterKey] = useState(0);
  // Picked up front too, so a tile that opens on logoBig is already treated
  // rather than sitting untreated until its first turn.
  const [colorTreatment, setColorTreatment] = useState(
    () => COLOR_TREATMENTS[Math.floor(Math.random() * COLOR_TREATMENTS.length)](),
  );
  const [activePlayer, setActivePlayer] = useState(() => pickRandomPlayer(topPlayers));

  // Three timers, three handles. They used to share one `timeoutRef`, so each
  // overwrote the one before it: the cycle timer's handle was replaced by the
  // exit timer's, then by the idle timer's, and unmount cleared only whichever
  // was last — leaking the other two on every tile, every cycle.
  const cycleTimer = useRef(null);
  const exitTimer = useRef(null);
  const idleTimer = useRef(null);

  // The cycle is scheduled once on mount, so anything it reads through a closure
  // is frozen at mount — which is before React Query has returned players or
  // coaches. These refs let the mount-time scheduler see current values.
  const frameIndexRef = useRef(frameIndex);
  const framesRef = useRef(frames);
  framesRef.current = frames;

  const primaryColor = team.colors?.primary || "#888888";
  const frame = frames[frameIndex] ?? frames[0] ?? "logo";

  const advance = useCallback(() => {
    setPhase("exiting");

    exitTimer.current = setTimeout(() => {
      // Picked out here rather than inside a setState updater. It used to be
      // assigned in the updater body and read on the next line — but React runs
      // an updater during render, not at the call site, so `nextIndex` was still
      // undefined for every line below it. Both branches fell through to
      // `frames[0]`, which is "abbrev", so the logoBig colour treatment and the
      // player re-pick never once fired. That is the missing tile effect.
      const prev = frameIndexRef.current;
      const options = frames.map((_, index) => index).filter((index) => index !== prev);
      const nextIndex = options.length
        ? options[Math.floor(Math.random() * options.length)]
        : prev;
      const nextFrame = frames[nextIndex];

      frameIndexRef.current = nextIndex;
      setFrameIndex(nextIndex);

      if (nextFrame === "logoBig") {
        const treatment = COLOR_TREATMENTS[Math.floor(Math.random() * COLOR_TREATMENTS.length)];
        setColorTreatment(treatment(primaryColor));
      }

      if (nextFrame === "player" || nextFrame === "playerBig") {
        setActivePlayer(pickRandomPlayer(topPlayers));
      }

      setEnterKey((key) => key + 1);
      setPhase("entering");
      idleTimer.current = setTimeout(() => setPhase("idle"), 600);
    }, EXIT_DURATION);
  }, [primaryColor, topPlayers, frames]);

  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  useMountEffect(() => {
    const runCycle = (isFirst) => {
      const currentFrame = framesRef.current[frameIndexRef.current];
      // The first turn comes early and on a short random fuse, so the wall fans
      // out within a second or two of load instead of eighteen tiles sitting
      // still for up to twenty seconds and then flipping together.
      const duration = isFirst
        ? 600 + Math.random() * 5000
        : currentFrame === "logoBig"
          ? KEN_BURNS_DURATION
          : 5000 + Math.random() * 15000;
      cycleTimer.current = setTimeout(() => {
        advanceRef.current();
        runCycle(false);
      }, duration);
    };

    runCycle(true);

    return () => {
      clearTimeout(cycleTimer.current);
      clearTimeout(exitTimer.current);
      clearTimeout(idleTimer.current);
    };
  });

  const animStyle =
    phase === "exiting"
      ? { animation: `${EXIT_ANIM[frame]} ${EXIT_DURATION}ms ease forwards` }
      : phase === "entering"
        // Indexed into this team's own filtered `frames`, not the global FRAMES.
        // Any team missing a player or coach photo has a shorter list, so the two
        // fall out of step and the tile played the enter animation belonging to
        // whatever frame sat at that index in the unfiltered array — logoBig
        // sliding in from the right instead of fading up, and so on. The exit
        // side was always right, which is why it read as half-broken rather than
        // missing.
        ? { animation: `${ENTER_ANIM[frames[frameIndex]]} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both` }
        : {};

  const { isMobile } = useLayoutDensity();
  const isLogoFill = LOGO_FILL_FRAMES.has(frame);
  // player/coach join the full-bleed set on mobile — but only when there's
  // actually an image to bleed. With no headshot they fall back to the
  // abbreviation, which is text and needs the tile's normal padding.
  const activeFace = frame === "player" || frame === "playerBig" ? (activePlayer ?? withPhoto(topPlayers)[0] ?? null) : frame === "coach" ? headCoach : null;
  // playerBig is full-bleed at every width, not just on mobile — the whole point
  // of the frame is the face filling the tile.
  const isFullBleedFace = !!activeFace?.image_url && (frame === "playerBig" || (isMobile && (frame === "player" || frame === "coach")));
  const isFullBleedLogoFrame = isLogoFill || (isMobile && frame === "logo") || isFullBleedFace;

  return (
    <Box
      as="button"
      role="group"
      cursor="pointer"
      h="full"
      w="full"
      minW={0}
      minH={0}
      bg="bg.primary"
      borderRadius={isMobile ? 0 : "8px"}
      overflow="hidden"
      position="relative"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderBottom="3px solid"
      borderBottomColor={primaryColor}
      transition="transform 0.25s ease, box-shadow 0.25s ease"
      _hover={{
        transform: "scale(1.025)",
        boxShadow: `0 0 16px ${primaryColor}44`,
      }}
      onClick={() => navigate(routeFor(team, target))}
      textAlign="left"
    >
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(45deg, ${primaryColor}33 0%, transparent 65%)`}
        opacity={isLogoFill ? 0.4 : 1}
        transition="opacity 0.5s ease"
        pointerEvents="none"
      />

      <Image
        src={team.logo}
        alt=""
        position="absolute"
        right="-8%"
        bottom="-12%"
        boxSize="clamp(44px, 5vw, 66px)"
        objectFit="contain"
        opacity={isLogoFill ? 0 : 0.07}
        filter="grayscale(1)"
        transition="opacity 0.4s ease"
        pointerEvents="none"
      />

      <Flex
        key={enterKey}
        position="absolute"
        inset={0}
        align={isFullBleedLogoFrame ? "stretch" : "center"}
        px={isFullBleedLogoFrame ? 0 : { base: 2.5, lg: 3.5 }}
        py={isMobile && frame === "logo" ? 1 : 0}
        style={animStyle}
        minW={0}
      >
        <FrameContent
          frame={frame}
          team={team}
          primaryColor={primaryColor}
          colorTreatment={colorTreatment}
          isMobile={isMobile}
          player={activePlayer ?? withPhoto(topPlayers)[0] ?? null}
          coach={headCoach}
        />
      </Flex>
    </Box>
  );
};
