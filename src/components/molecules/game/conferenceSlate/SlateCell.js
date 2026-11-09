import { TEAM_BY_ID, logo, isFinalGame, compactLabel, fmtDate } from "./slateModel";
import { Flex, Image, Box, Text } from "@chakra-ui/react";
import { Logo, CompactGameContent } from "./SlatePrimitives";
import { Link } from "react-router-dom";

export const SlateCell = ({ rowTeamId, colTeamId, game, compact = false }) => {
  const rowTeam = TEAM_BY_ID[rowTeamId];

  if (rowTeamId === colTeamId) {
    return (
      <Flex
        className="slate-cell"
        h={compact ? "62px" : "96px"}
        align="center"
        justify="center"
        bg={`linear-gradient(135deg, ${rowTeam.colors.primary} 0%, ${rowTeam.colors.primary}D9 52%, rgba(8,8,10,0.92) 100%)`}
        border="1px solid rgba(255,255,255,0.08)"
        position="relative"
        overflow="hidden"
      >
        <Image
          src={logo(rowTeam)}
          alt=""
          position="absolute"
          right={compact ? "-22px" : "-34px"}
          bottom={compact ? "-22px" : "-34px"}
          w={compact ? "84px" : "132px"}
          h={compact ? "84px" : "132px"}
          objectFit="contain"
          opacity={compact ? 0.08 : 0.14}
          pointerEvents="none"
          style={{ filter: "grayscale(1) contrast(1.15)" }}
        />
        <Box position="absolute" inset={0} bg="linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 42%)" pointerEvents="none" />
        <Box position="relative" zIndex={1}>
          <Logo team={rowTeam} size={compact ? "32px" : "44px"} />
        </Box>
      </Flex>
    );
  }

  if (!game) {
    return <Box className="slate-cell" h={compact ? "62px" : "96px"} bg="#020203" border="1px solid rgba(255,255,255,0.06)" />;
  }

  const awayTeam = TEAM_BY_ID[game.away];
  const homeTeam = TEAM_BY_ID[game.home];
  const isComplete = isFinalGame(game);
  const winner = isComplete ? (Number(game.awayScore) > Number(game.homeScore) ? awayTeam : homeTeam) : null;
  const awayWon = winner?.exportId === awayTeam.exportId;
  const homeWon = winner?.exportId === homeTeam.exportId;
  const content = (
    <Flex
      className="slate-cell"
      h={compact ? "62px" : "96px"}
      direction="column"
      align="center"
      justify="center"
      gap={compact ? 1 : 1.5}
      px={compact ? 1 : 0}
      position="relative"
      overflow="hidden"
      border="1px solid rgba(255,255,255,0.09)"
      bg={winner ? `linear-gradient(135deg, ${winner.colors.primary}B8 0%, ${winner.colors.primary}66 40%, rgba(14,14,17,0.96) 100%)` : "linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(12,12,15,0.98) 54%, rgba(2,2,3,0.98) 100%)"}
      _hover={game.stem ? { filter: "brightness(1.14)" } : undefined}
    >
      {winner && (
        <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={winner.colors.secondary === "#FFFFFF" ? "white" : winner.colors.secondary} />
      )}
      {compact ? (
        <CompactGameContent awayTeam={awayTeam} homeTeam={homeTeam} game={game} winner={winner} isComplete={isComplete} />
      ) : (
        <>
          <Flex className="slate-compact-content" direction="column" align="center" justify="center" gap={1} display="none">
            <CompactGameContent awayTeam={awayTeam} homeTeam={homeTeam} game={game} winner={winner} isComplete={isComplete} />
          </Flex>
          {isComplete ? (
            <Flex className="slate-wide-content" direction="column" gap={2.5} w="100%" px={{ base: 2, xl: 3 }}>
              {[
                { team: awayTeam, score: game.awayScore, won: awayWon },
                { team: homeTeam, score: game.homeScore, won: homeWon },
              ].map((row) => (
                <Flex key={row.team.exportId} align="center" justify="space-between" gap={3} minW={0}>
                  <Flex align="center" gap={1.5} minW={0}>
                    <Text
                      fontSize={{ base: "15px", xl: "18px" }}
                      color={row.won ? "white" : "text.secondary"}
                      fontWeight={row.won ? "black" : "bold"}
                      textTransform="uppercase"
                      lineHeight={1}
                      lineClamp={1}
                    >
                      {compactLabel(row.team)}
                    </Text>
                  </Flex>
                  <Flex align="center" gap={1.5} flexShrink={0}>
                    {row.won && (
                      <Text fontSize={{ base: "9px", xl: "10px" }} color={row.team.colors.secondary === "#FFFFFF" ? "white" : row.team.colors.secondary} fontWeight="black">
                        W
                      </Text>
                    )}
                    <Text fontSize={{ base: "22px", xl: "27px" }} color={row.won ? "white" : "text.secondary"} fontWeight="black" lineHeight={0.88}>
                      {row.score}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          ) : (
            <Flex className="slate-wide-content" direction="column" h="100%" w="100%" justify="center" px={{ base: 2, xl: 3 }} pt={2} pb="22px" position="relative">
              <Flex direction="column" gap={1.5} minW={0}>
                {[awayTeam, homeTeam].map((team, index) => (
                  <Text
                    key={`${team.exportId}-${index}`}
                    fontSize={{ base: "16px", xl: "19px" }}
                    color={index === 0 ? "text.secondary" : "white"}
                    fontWeight="black"
                    textTransform="uppercase"
                    lineHeight={1}
                    lineClamp={1}
                  >
                    {compactLabel(team)}
                  </Text>
                ))}
              </Flex>
              <Text
                position="absolute"
                left={0}
                right={0}
                bottom={0}
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="rgba(255,255,255,0.12)"
                fontSize={{ base: "10px", xl: "11px" }}
                color="white"
                fontWeight="black"
                textTransform="uppercase"
                lineClamp={1}
              >
                {fmtDate(game.date)}
              </Text>
            </Flex>
          )}
        </>
      )}
    </Flex>
  );

  return game.stem ? (
    <Box as={Link} to={`/game/${game.stem}`} display="block">
      {content}
    </Box>
  ) : content;
};
