import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

/**
 * SideNavGameButton
 *
 * A compact cinematic collision button for the sidebar.
 * Shows faded team logos in background, team abbreviations, and score.
 * Same height/padding as regular nav items.
 *
 * The score comes from the game the page already loaded: the button watches
 * the page's ["game", key] query without fetching it (enabled: false), so it
 * fills in the moment the page has the game. A preview shows its date.
 */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortDate = (iso) => {
  const [, m, d] = String(iso ?? "").split("-").map(Number);
  return m && d ? `${MONTHS[m - 1]} ${d}` : "";
};
// The matchup as a two-line mini scoreboard — one team per line, the
// loser dimmed. Sizes follow the sidebar's width (it is a size container).
const ScoreRow = ({ side, dim, right }) => (
  <Flex align="center" gap={1.5} minW={0}>
    {side?.logo ? <Image src={side.logo} alt="" w="clamp(1rem, 8cqw, 1.3rem)" h="clamp(1rem, 8cqw, 1.3rem)" objectFit="contain" flexShrink={0} /> : null}
    <Text flex={1} minW={0} fontSize="clamp(0.78rem, 6.4cqw, 1rem)" fontWeight="900" color={dim ? "whiteAlpha.600" : "white"} textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>
      {side?.shortName || ""}
    </Text>
    {right != null ? (
      <Text fontSize="clamp(0.85rem, 7cqw, 1.1rem)" fontWeight="900" fontFamily="mono" color={dim ? "whiteAlpha.600" : "white"} lineHeight={1} flexShrink={0}>{right}</Text>
    ) : null}
  </Flex>
);

export const SideNavGameButton = ({ gameData, isActive, onClick }) => {
  const isPreview = gameData?.kind === "preview";
  const { data: game } = useQuery({
    queryKey: ["game", gameData?.key],
    enabled: false,
  });
  const scores = {
    away: game?.away_team?.score ?? game?.metadata?.away_team?.score ?? null,
    home: game?.home_team?.score ?? game?.metadata?.home_team?.score ?? null,
  };
  const away = gameData?.away ? { ...gameData.away, score: gameData.away.score ?? (isPreview ? null : scores.away) } : null;
  const home = gameData?.home ? { ...gameData.home, score: gameData.home.score ?? (isPreview ? null : scores.home) } : null;
  const awayColor = away?.color || "#E53E3E";
  const homeColor = home?.color || "#69B3E7";

  // Format score display
  const awayScore = away?.score != null ? String(away.score) : "";
  const homeScore = home?.score != null ? String(home.score) : "";
  const hasScore = awayScore !== "" && homeScore !== "";

  return (
    <Box
      as="button"
      w="100%"
      onClick={onClick}
      pl="clamp(0.9rem, 10cqw, 1.75rem)"
      pr={3}
      py="clamp(0.7rem, 7cqw, 1.125rem)"
      textAlign="left"
      transition="all 0.12s"
      bg={isActive ? "whiteAlpha.100" : "transparent"}
      borderLeft="3px solid"
      borderColor={isActive ? away?.color || "#E53E3E" : "whiteAlpha.100"}
      _hover={{ bg: isActive ? "whiteAlpha.100" : "whiteAlpha.50" }}
      position="relative"
      overflow="hidden"
    >
      {/* Background gradient */}
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(90deg, ${awayColor}22 0%, transparent 40%, transparent 60%, ${homeColor}22 100%)`}
        pointerEvents="none"
      />

      {/* Faded logos */}
      {away?.logo && (
        <Image
          src={away.logo}
          alt=""
          position="absolute"
          left="10%"
          top="50%"
          transform="translateY(-50%) rotate(-12deg)"
          h="160%"
          opacity={0.08}
          filter="grayscale(1) brightness(2)"
          pointerEvents="none"
        />
      )}
      {home?.logo && (
        <Image
          src={home.logo}
          alt=""
          position="absolute"
          right="10%"
          top="50%"
          transform="translateY(-50%) rotate(12deg)"
          h="160%"
          opacity={0.08}
          filter="grayscale(1) brightness(2)"
          pointerEvents="none"
        />
      )}

      <Flex direction="column" gap={1} position="relative" zIndex={1}>
        <ScoreRow
          side={away}
          dim={hasScore && Number(awayScore) < Number(homeScore)}
          right={hasScore ? awayScore : isPreview && gameData?.date ? shortDate(gameData.date).toUpperCase() : null}
        />
        <ScoreRow
          side={home}
          dim={hasScore && Number(homeScore) < Number(awayScore)}
          right={hasScore ? homeScore : null}
        />
      </Flex>
    </Box>
  );
};

export default SideNavGameButton;
