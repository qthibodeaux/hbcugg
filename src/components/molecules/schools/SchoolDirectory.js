import React, { useCallback, useMemo, useRef, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import useMountEffect from "../../../hooks/useMountEffect";
import teamsData from "../../../data/teams.json";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { useSchoolsHub } from "../../../hooks/useSchoolsHub";

const teams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

// player_stats_2025_enriched / coaches_all_years key teams by v5 id
// (e.g. "swacalc"), while teams.json keys by slug ("alcorn") — exportId
// minus its trailing "25" is the shared id.
const v5Id = (team) => team.exportId?.replace(/25$/, "") ?? null;

const FRAMES = ["abbrev", "fullName", "shortName", "logo", "logoCenter", "logoCollage", "player", "playerBig", "coach", "logoBig"];

// Frames that fill the tile edge to edge with the school's mark — the faint
// corner watermark and the tile gradient step back for them.
const LOGO_FILL_FRAMES = new Set(["logoBig", "logoCenter", "logoCollage"]);

const ENTER_ANIM = {
  abbrev: "fusionFromRight",
  fullName: "fusionFadeScale",
  shortName: "fusionFromBottom",
  logo: "fusionFromTop",
  logoCenter: "fusionFadeScale",
  logoCollage: "fusionFadeScale",
  player: "fusionFromBottom",
  playerBig: "fusionFadeScale",
  coach: "fusionFromRight",
  logoBig: "fusionFadeScale",
};

const EXIT_ANIM = {
  abbrev: "fusionToLeft",
  fullName: "fusionFadeScaleOut",
  shortName: "fusionToTop",
  logo: "fusionToBottom",
  logoCenter: "fusionFadeScaleOut",
  logoCollage: "fusionFadeScaleOut",
  player: "fusionToTop",
  playerBig: "fusionFadeScaleOut",
  coach: "fusionToLeft",
  logoBig: "fusionFadeScaleOut",
};

const EXIT_DURATION = 350;
const KEN_BURNS_DURATION = 8000;

const COLOR_TREATMENTS = [
  () => ({ filter: "none", opacity: 0.9 }),
  () => ({ filter: "saturate(1.8) contrast(1.1)", opacity: 0.85 }),
  () => ({ filter: "brightness(2) saturate(0)", opacity: 0.15 }),
  () => ({ filter: "grayscale(0.6) sepia(0.4) saturate(1.4)", opacity: 0.75 }),
  () => ({ filter: "contrast(1.6) saturate(1.3)", opacity: 0.8 }),
];

const STATIC_CSS = `
  @keyframes fusionFromRight    { from { opacity:0; transform:translateX(28px);  } to { opacity:1; transform:translateX(0);  } }
  @keyframes fusionToLeft       { from { opacity:1; transform:translateX(0);     } to { opacity:0; transform:translateX(-20px); } }
  @keyframes fusionFadeScale    { from { opacity:0; transform:scale(0.94);       } to { opacity:1; transform:scale(1);       } }
  @keyframes fusionFadeScaleOut { from { opacity:1; transform:scale(1);          } to { opacity:0; transform:scale(0.94);   } }
  @keyframes fusionFromTop      { from { opacity:0; transform:translateY(-22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fusionToBottom     { from { opacity:1; transform:translateY(0);     } to { opacity:0; transform:translateY(16px);  } }
  @keyframes fusionFromBottom   { from { opacity:0; transform:translateY(22px);  } to { opacity:1; transform:translateY(0); } }
  @keyframes fusionToTop        { from { opacity:1; transform:translateY(0);     } to { opacity:0; transform:translateY(-16px); } }
  @keyframes kenBurns {
    0%   { transform: scale(1.34) translate(-5%, -5%) rotate(-3deg); }
    100% { transform: scale(1.52) translate(5%, 5%) rotate(3deg); }
  }
  /* Faces get their own drift: no rotation, and it starts at 1 so the portrait
     is never cropped tighter than the frame already crops it. */
  @keyframes kenBurnsFace {
    0%   { transform: scale(1.00) translate(-2.5%, -1.5%); }
    100% { transform: scale(1.09) translate(2.5%, 1.5%); }
  }
`;

const compactLabel = (team) => team.bannerShort || team.shortName || team.name;

const routeFor = (team, target) => {
  if (typeof target === "function") return target(team);
  if (target === "wiki") return `/teams/${team.id}/wiki`;
  return `/teams/${team.id}`;
};

// Mobile "standard" tiles go edge-to-edge (no shell padding, no grid gap,
// square corners) to match TeamScheduleBannerA's mobile tile look — the
// rotating frame content inside each tile is unchanged.
const DirectoryShell = ({ children, variant }) => {
  const { isMobile } = useLayoutDensity();
  const isMobileStandard = isMobile && variant !== "compact";
  return (
    <Box
      w="full"
      h="full"
      minH={variant === "compact" ? "144px" : "clamp(160px, 20vw, 260px)"}
      bg="#0B0B0D"
      overflow="hidden"
      p={isMobileStandard ? 0 : variant === "compact" ? "4px" : { base: "4px", lg: "6px" }}
    >
      <style>{STATIC_CSS}</style>
      {children}
    </Box>
  );
};

const DirectoryGrid = ({ children, variant }) => {
  const { isMobile } = useLayoutDensity();
  const isMobileStandard = isMobile && variant !== "compact";
  return (
    <Grid
      h="full"
      minH={0}
      templateColumns="repeat(6, minmax(0, 1fr))"
      templateRows="repeat(3, minmax(0, 1fr))"
      gap={isMobileStandard ? "0" : variant === "compact" ? "4px" : { base: "4px", lg: "6px" }}
    >
      {children}
    </Grid>
  );
};

// The mobile tile's universal fallback — used wherever a frame has nothing
// real to show (no headshot) and for the fullName frame, which is too long
// for a 6-across tile.
const MobileAbbrev = ({ team }) => (
  <Text
    fontSize="clamp(0.9rem, 1.45vw, 1.22rem)"
    fontWeight="black"
    fontStyle="italic"
    color="white"
    textTransform="uppercase"
    lineHeight={0.92}
    lineClamp={1}
  >
    {compactLabel(team)}
  </Text>
);

const FrameContent = ({ frame, team, primaryColor, colorTreatment, isMobile, player, coach }) => {
  if (frame === "abbrev") {
    return (
      <Text
        fontSize="clamp(0.9rem, 1.45vw, 1.22rem)"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={0.92}
        lineClamp={1}
      >
        {compactLabel(team)}
      </Text>
    );
  }

  if (frame === "fullName") {
    // Mobile shows the abbreviation instead — at 6-across the tile is far
    // too narrow for a full name, which wrapped to two clipped lines
    // ("FLORID / A A&M", "SOUTH CARO...").
    if (isMobile) return <MobileAbbrev team={team} />;

    return (
      <Text
        fontSize="clamp(0.7rem, 1.05vw, 0.92rem)"
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={1.02}
        lineClamp={2}
      >
        {team.name}
      </Text>
    );
  }

  if (frame === "shortName") {
    // teams.json displayName — "Miss. Valley", "SC State", "Pine Bluff".
    return (
      <Text
        fontSize={isMobile ? "clamp(0.62rem, 2.6vw, 0.9rem)" : "clamp(0.8rem, 1.25vw, 1.08rem)"}
        fontWeight="black"
        fontStyle="italic"
        color="white"
        textTransform="uppercase"
        lineHeight={0.95}
        lineClamp={2}
        overflowWrap="anywhere"
      >
        {team.displayName || team.name}
      </Text>
    );
  }

  if (frame === "logoCenter") {
    // The mark, centred and still — no drift, no treatment.
    return (
      <Flex position="absolute" inset={0} align="center" justify="center">
        <Image
          src={team.logo}
          alt={team.name}
          maxW="72%"
          maxH="72%"
          objectFit="contain"
          filter="drop-shadow(0 2px 10px rgba(0,0,0,0.6))"
        />
      </Flex>
    );
  }

  if (frame === "logoCollage") {
    // Fifteen of the school's own mark, three rows of five.
    return (
      <Grid
        position="absolute"
        inset={0}
        templateColumns="repeat(5, minmax(0, 1fr))"
        templateRows="repeat(3, minmax(0, 1fr))"
        gap={0}
        p={0}
      >
        {/* Each mark fills its whole cell — no gutters, the collage is the button. */}
        {Array.from({ length: 15 }, (_, i) => (
          <Image key={i} src={team.logo} alt="" w="100%" h="100%" objectFit="contain" minW={0} minH={0} />
        ))}
      </Grid>
    );
  }

  if (frame === "logo") {
    // Mobile — cards are too narrow at 6-across for the logo+mascot inline
    // row (desktop layout below) to read at all. Logo dominates the square,
    // team name sits as its own caption bar pinned to the bottom instead of
    // sharing a vertically-centered row with it.
    if (isMobile) {
      return (
        <Flex direction="column" h="full" w="full" align="center" justify="space-between">
          <Flex flex="1" align="center" justify="center" minH={0} w="full">
            <Image
              src={team.logo}
              alt={team.name}
              maxW="80%"
              maxH="80%"
              objectFit="contain"
              filter="drop-shadow(0 2px 8px rgba(0,0,0,0.6))"
            />
          </Flex>
          <Text
            fontSize="clamp(0.42rem, 1.6vw, 0.58rem)"
            fontWeight="black"
            fontStyle="italic"
            color="white"
            textTransform="uppercase"
            letterSpacing="-0.01em"
            lineHeight={1}
            lineClamp={1}
            textAlign="center"
            w="full"
          >
            {compactLabel(team)}
          </Text>
        </Flex>
      );
    }

    return (
      <Flex align="center" gap={{ base: 1.5, lg: 2.5 }} minW={0}>
        <Image
          src={team.logo}
          alt={team.name}
          boxSize="clamp(24px, 3vw, 38px)"
          objectFit="contain"
          filter="drop-shadow(0 2px 10px rgba(0,0,0,0.6))"
          flexShrink={0}
        />
        <Text
          fontSize="clamp(0.45rem, 0.75vw, 0.62rem)"
          fontWeight="black"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.1em"
          lineHeight={1.15}
          lineClamp={2}
          minW={0}
        >
          {team.mascot}
        </Text>
      </Flex>
    );
  }

  if (frame === "player") {
    // Mobile — the picture spans the whole tile like the logo frame does,
    // with no name/position caption: at this tile size the text was
    // unreadable and squeezed the thumbnail down to a few pixels.
    if (isMobile) {
      // No headshot — fall back to the abbreviation rather than a bare
      // person glyph. Without the name/position caption (dropped on mobile)
      // a lone icon says nothing about which team's tile you're looking at.
      if (!player?.image_url) return <MobileAbbrev team={team} />;

      return (
        <Box position="absolute" inset={0} overflow="hidden">
          <Image src={player.image_url} alt={player.last_name} w="full" h="full" objectFit="cover" />
        </Box>
      );
    }

    return (
      <Flex align="center" gap={{ base: 1.5, lg: 2.5 }} minW={0}>
        <Box
          w="clamp(24px, 3vw, 34px)"
          h="clamp(24px, 3vw, 34px)"
          borderRadius="8px"
          bg={`${primaryColor}33`}
          border="1px solid"
          borderColor={`${primaryColor}66`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          overflow="hidden"
        >
          {player?.image_url ? (
            <Image src={player.image_url} alt={player.last_name} w="full" h="full" objectFit="cover" />
          ) : (
            <User size={14} color={primaryColor} />
          )}
        </Box>
        <Box minW={0}>
          <Text
            fontSize="clamp(0.42rem, 0.7vw, 0.56rem)"
            fontWeight="black"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.12em"
            lineClamp={1}
          >
            {player?.position || team.conference}
          </Text>
          <Text fontSize="clamp(0.58rem, 0.85vw, 0.72rem)" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
            {player?.last_name || compactLabel(team)}
          </Text>
        </Box>
      </Flex>
    );
  }

  if (frame === "coach") {
    // Mobile — same full-bleed treatment as the player frame above.
    if (isMobile) {
      if (!coach?.image_url) return <MobileAbbrev team={team} />;

      return (
        <Box position="absolute" inset={0} overflow="hidden">
          <Image src={coach.image_url} alt={coach.last_name} w="full" h="full" objectFit="cover" />
        </Box>
      );
    }

    return (
      <Flex align="center" gap={{ base: 1.5, lg: 2.5 }} minW={0}>
        <Box
          w="clamp(24px, 3vw, 34px)"
          h="clamp(24px, 3vw, 34px)"
          borderRadius="8px"
          bg={`${primaryColor}33`}
          border="1px solid"
          borderColor={`${primaryColor}66`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          overflow="hidden"
        >
          {coach?.image_url ? (
            <Image src={coach.image_url} alt={coach.last_name} w="full" h="full" objectFit="cover" />
          ) : (
            <User size={14} color={primaryColor} />
          )}
        </Box>
        <Box minW={0}>
          <Text
            fontSize="clamp(0.42rem, 0.7vw, 0.56rem)"
            fontWeight="black"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.12em"
            lineClamp={1}
          >
            HEAD COACH
          </Text>
          <Text fontSize="clamp(0.58rem, 0.85vw, 0.72rem)" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
            {coach?.last_name || compactLabel(team)}
          </Text>
        </Box>
      </Flex>
    );
  }

  // The portrait frame: the face fills the tile, the copy rides over it. Same
  // construction as the Summary tab's Notable Performers card — a scrim pulls the
  // lower half down so the name reads, position above a large last name, both
  // hard against the bottom-left. No team mark and no score: the face is the
  // subject here, and the tile's colour edge already says whose it is.
  if (frame === "playerBig") {
    if (!player?.image_url) return <MobileAbbrev team={team} />;

    return (
      <Box position="absolute" inset={0} overflow="hidden">
        <Image
          src={player.image_url}
          alt={player.last_name}
          position="absolute"
          inset={0}
          w="full"
          h="full"
          objectFit="cover"
          // Anchored at the top rather than 18% down: on a wide tile a portrait
          // photo is cropped to a horizontal band either way, and taking it from
          // the top gives head and shoulders instead of a face close-up.
          objectPosition="center top"
          transformOrigin="center center"
          style={{ animation: `kenBurnsFace ${KEN_BURNS_DURATION}ms ease-in-out infinite alternate` }}
        />
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(to top, rgba(8,8,10,0.94) 0%, rgba(8,8,10,0.62) 34%, rgba(8,8,10,0) 68%)"
          pointerEvents="none"
        />
        <Box position="absolute" left={0} right={0} bottom={0} px={{ base: 2, lg: 3 }} pb={{ base: 1.5, lg: 2 }} minW={0}>
          <Text
            fontSize="clamp(0.42rem, 0.7vw, 0.56rem)"
            fontWeight="black"
            // Not the team colour: fifteen of the eighteen primaries sit under
            // 0.28 luminance and three (Alabama State, Pine Bluff, Grambling)
            // are pure black, which would vanish into the scrim. The tile's
            // 3px bottom edge already carries the team colour.
            color="rgba(255,255,255,0.72)"
            textTransform="uppercase"
            letterSpacing="0.16em"
            lineHeight={1.2}
            lineClamp={1}
          >
            {player.position || team.conference}
          </Text>
          <Text
            fontSize="clamp(1rem, 1.9vw, 1.6rem)"
            fontWeight="black"
            fontStyle="italic"
            color="white"
            textTransform="uppercase"
            letterSpacing="-0.02em"
            lineHeight={0.95}
            lineClamp={1}
          >
            {player.last_name || compactLabel(team)}
          </Text>
        </Box>
      </Box>
    );
  }

  if (frame === "logoBig") {
    return (
      <Box position="absolute" inset={0} overflow="hidden">
        <Box
          as="img"
          src={team.logo}
          alt=""
          position="absolute"
          w="100%"
          h="100%"
          objectFit="contain"
          transformOrigin="center center"
          style={{
            animation: `kenBurns ${KEN_BURNS_DURATION}ms ease-in-out infinite alternate`,
            ...colorTreatment,
          }}
        />
      </Box>
    );
  }

  return null;
};

// Only ever surface people we can actually show. A frame whose subject has no
// headshot used to render a generic user icon, which reads as broken rather
// than intentional — so pick someone else instead, and if nobody on the team
// has a photo, drop that frame from the rotation entirely.
const withPhoto = (people) => (people ?? []).filter((p) => p?.image_url);

const pickRandomPlayer = (topPlayers) => {
  const pool = withPhoto(topPlayers);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
};

const StandardSchoolCard = ({ team, navigate, target, topPlayers, headCoach }) => {
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

const CompactSchoolCard = ({ team, navigate, target }) => {
  const primaryColor = team.colors?.primary || "#888888";
  const label = compactLabel(team);

  return (
    <Box
      as="button"
      onClick={() => navigate(routeFor(team, target))}
      h="full"
      w="full"
      minW={0}
      minH={0}
      borderRadius="7px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderBottom="2px solid"
      borderBottomColor={primaryColor}
      bg={`linear-gradient(135deg, ${primaryColor}22 0%, rgba(11,11,13,0.96) 58%)`}
      position="relative"
      overflow="hidden"
      textAlign="left"
      px={{ base: 1.5, lg: 2 }}
      display="flex"
      alignItems="center"
      gap={{ base: 1.5, lg: 2 }}
      transition="transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease"
      _hover={{ borderColor: primaryColor, transform: "translateY(-1px)", boxShadow: `0 0 12px ${primaryColor}33` }}
    >
      <Image src={team.logo} alt={team.name} boxSize="clamp(18px, 2.2vw, 28px)" objectFit="contain" flexShrink={0} />
      <Box minW={0} flex={1}>
        <Text
          fontSize="clamp(0.48rem, 0.86vw, 0.68rem)"
          color="white"
          fontWeight="black"
          fontStyle="italic"
          textTransform="uppercase"
          lineHeight={0.95}
          lineClamp={1}
          whiteSpace="nowrap"
        >
          {label}
        </Text>
        <Text
          display={{ base: "none", lg: "block" }}
          mt="2px"
          fontSize="7px"
          color="text.muted"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.12em"
          lineClamp={1}
        >
          {team.conference}
        </Text>
      </Box>
      <Text position="absolute" right="-6px" bottom="-9px" fontSize="38px" color="white" opacity={0.045} fontWeight="black" lineHeight={1}>
        {label}
      </Text>
    </Box>
  );
};

const SchoolDirectoryCompact = ({ navigate, target }) => (
  <DirectoryShell variant="compact">
    <DirectoryGrid variant="compact">
      {teams.map((team) => (
        <CompactSchoolCard key={team.id} team={team} navigate={navigate} target={target} />
      ))}
    </DirectoryGrid>
  </DirectoryShell>
);

// Featured players and the head coach come from the Schools Hub file — this
// season's people as of the week, picked by the backend. Before the file loads
// (or if it is missing) the tiles run their logo frames only.
const SchoolDirectoryStandard = ({ navigate, target }) => {
  const { hub } = useSchoolsHub();
  const topPlayersByTeamId = hub?.topPlayersByTeamId ?? {};
  const headCoachesByTeamId = hub?.headCoachByTeamId ?? {};

  return (
    <DirectoryShell variant="standard">
      <DirectoryGrid variant="standard">
        {teams.map((team) => (
          <StandardSchoolCard
            key={team.id}
            team={team}
            navigate={navigate}
            target={target}
            topPlayers={topPlayersByTeamId[v5Id(team)]}
            headCoach={headCoachesByTeamId[v5Id(team)]}
          />
        ))}
      </DirectoryGrid>
    </DirectoryShell>
  );
};

export const SchoolDirectoryFusion = ({ variant = "standard", target = "team" }) => {
  const navigate = useNavigate();

  if (variant === "compact") {
    return <SchoolDirectoryCompact navigate={navigate} target={target} />;
  }

  return <SchoolDirectoryStandard navigate={navigate} target={target} />;
};
