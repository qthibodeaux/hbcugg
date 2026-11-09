import { Text, Flex, Image, Grid, Box } from "@chakra-ui/react";
import { compactLabel, KEN_BURNS_DURATION } from "./directoryModel";
import { MobileAbbrev } from "./DirectoryPrimitives";
import { User } from "lucide-react";

export const FrameContent = ({ frame, team, primaryColor, colorTreatment, isMobile, player, coach }) => {
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
