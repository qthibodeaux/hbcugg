import { Badge, Box, Flex, Grid, GridItem, Image, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const hexToRgba = (hex, alpha) => {
  const raw = String(hex ?? "").replace("#", "").trim();
  if (raw.length !== 3 && raw.length !== 6) return `rgba(229, 62, 62, ${alpha})`;

  const expanded = raw.length === 3 ? raw.split("").map((c) => `${c}${c}`).join("") : raw;
  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const CardShell = ({ clickTo, children, bg, borderColor = "whiteAlpha.100", dense = false }) => (
  <Box
    as={clickTo ? RouterLink : "div"}
    to={clickTo || undefined}
    h={dense ? "auto" : "100%"}
    minH={dense ? "unset" : "320px"}
    p={dense ? 3 : 4}
    borderRadius="xl"
    bg={bg}
    border="1px solid"
    borderColor={borderColor}
    cursor={clickTo ? "pointer" : "default"}
    _hover={clickTo ? { transform: "translateY(-2px)", borderColor: "whiteAlpha.400" } : undefined}
    transition="all 0.18s ease"
  >
    {children}
  </Box>
);

const getTeamTicker = (team) => {
  const base = String(team?.shortName ?? team?.name ?? "TEAM")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return (base || "TEAM").slice(0, 4);
};

const getPreviewCenterLabel = (stageLabel) => {
  return /^week\s+\d+/i.test(String(stageLabel ?? "")) ? stageLabel : null;
};

const PreviewDenseTeamColumn = ({ team }) => (
  <Flex direction="column" align="center" justify="center" gap={1.5} flex="1" minW={0}>
    <Box
      w="38px"
      h="38px"
      borderRadius="10px"
      bg="whiteAlpha.100"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {team?.logo ? (
        <Image src={team.logo} alt={team?.shortName ?? team?.name} w="28px" h="28px" objectFit="contain" />
      ) : (
        <Text fontSize="10px" color="white">--</Text>
      )}
    </Box>
    <Text fontSize="sm" color="white" fontWeight="black" letterSpacing="0.06em" textTransform="uppercase" lineClamp={1}>
      {getTeamTicker(team)}
    </Text>
    <Text fontSize="10px" color="text.muted" lineClamp={1}>
      {team?.record ?? "--"}
    </Text>
  </Flex>
);

const PreviewDenseLayout = ({ game, clickTo, accent = "rgba(99,179,237,0.16)" }) => (
  <CardShell
    clickTo={clickTo}
    bg={`linear-gradient(145deg, ${accent} 0%, rgba(8,8,10,0.95) 75%)`}
    borderColor="whiteAlpha.200"
    dense
  >
    <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2} lineClamp={1}>
      {game?.gameName ?? game?.stageLabel ?? "Preview"}
    </Text>

    <Flex align="stretch" justify="space-between" gap={3}>
      <PreviewDenseTeamColumn team={game?.away} />
      <Flex direction="column" justify="center" align="center" color="whiteAlpha.500" fontSize="10px" fontWeight="bold" textTransform="uppercase" gap={1}>
        <Text>vs</Text>
        {getPreviewCenterLabel(game?.stageLabel) ? <Text>{getPreviewCenterLabel(game?.stageLabel)}</Text> : null}
      </Flex>
      <PreviewDenseTeamColumn team={game?.home} />
    </Flex>

    <Box mt={3} pt={2} borderTop="1px solid" borderColor="whiteAlpha.200">
      <Text fontSize="10px" color="text.secondary" lineClamp={2}>
        {game?.fact ?? game?.playerLine ?? game?.location ?? "Preview storyline pending."}
      </Text>
    </Box>
  </CardShell>
);

const TeamLine = ({ team, score, muted = false, compact = false }) => (
  <Flex justify="space-between" align="center" gap={3} py={compact ? 1 : 1.5}>
    <Flex align="center" gap={2} minW={0}>
      <Box
        w={compact ? "24px" : "28px"}
        h={compact ? "24px" : "28px"}
        borderRadius="8px"
        bg="whiteAlpha.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {team?.logo ? (
          <Image src={team.logo} alt={team?.shortName ?? team?.name} w={compact ? "18px" : "20px"} h={compact ? "18px" : "20px"} objectFit="contain" />
        ) : (
          <Text fontSize="10px" color="white">--</Text>
        )}
      </Box>
      <Text color="white" fontSize={compact ? "xs" : "sm"} fontWeight="bold" lineClamp={1}>
        {getTeamTicker(team)}
      </Text>
    </Flex>
    <Text color={muted ? "whiteAlpha.600" : "white"} fontWeight="black" fontSize={compact ? "lg" : "xl"}>
      {score ?? "--"}
    </Text>
  </Flex>
);

const ResultVariantMinimal = ({ game, clickTo, dense = false }) => (
  <CardShell clickTo={clickTo} bg="blackAlpha.400" dense={dense}>
    <Flex justify="space-between" mb={dense ? 2 : 3}>
      <Badge bg="whiteAlpha.200" color="white" fontSize="9px">FINAL</Badge>
      <Text fontSize="10px" color="text.muted" textTransform="uppercase">{game.stageLabel}</Text>
    </Flex>
    <TeamLine team={game.home} score={game.homeScore} />
    <TeamLine team={game.away} score={game.awayScore} />
    {!dense ? <Text mt={4} fontSize="xs" color="text.secondary">{game.gameName}</Text> : null}
  </CardShell>
);

const ResultVariantEspn = ({ game, clickTo, dense = false }) => {
  const homeScore = Number(game.homeScore ?? 0);
  const awayScore = Number(game.awayScore ?? 0);
  const winnerTeam = homeScore >= awayScore ? game.home : game.away;
  const winnerColor = winnerTeam?.primary ?? "#E53E3E";
  const bg = `linear-gradient(145deg, ${hexToRgba(winnerColor, 0.3)} 0%, rgba(8,8,10,0.96) 70%)`;
  const columnSize = dense ? "22px" : "28px";

  return (
  <CardShell clickTo={clickTo} bg={bg} borderColor="whiteAlpha.200" dense={dense}>
    <Text fontSize={dense ? "xs" : "sm"} color="white" fontWeight="bold" mb={dense ? 1 : 2}>{game.stageLabel}</Text>
    <Flex justify="space-between" align="center" mb={dense ? 2 : 3}>
      <Badge bg="whiteAlpha.200" color="white" fontSize="9px">FINAL</Badge>
      <Grid templateColumns={`repeat(5, ${columnSize})`} gap={1}>
        {["1", "2", "3", "4", "T"].map((q) => (
          <Text key={q} fontSize="10px" color="text.muted" textAlign="center" fontWeight="bold">{q}</Text>
        ))}
      </Grid>
    </Flex>

    {[game.home, game.away].map((team, idx) => {
      const q = idx === 0 ? game.homeByQ : game.awayByQ;
      const total = idx === 0 ? game.homeScore : game.awayScore;
      return (
        <Flex key={team?.id ?? idx} justify="space-between" align="center" py={dense ? 1 : 1.5} borderTop={idx > 0 ? "1px solid" : "none"} borderColor="whiteAlpha.100">
          <Flex align="center" gap={2} minW={0}>
            <Box w="24px" h="24px" borderRadius="8px" bg="whiteAlpha.100" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
              {team?.logo ? <Image src={team.logo} alt={team?.shortName ?? team?.name} w="18px" h="18px" objectFit="contain" /> : null}
            </Box>
            <Box minW={0}>
              <Text fontSize="sm" color="white" fontWeight="black" letterSpacing="0.05em" textTransform="uppercase" lineClamp={1}>
                {getTeamTicker(team)}
              </Text>
              {!dense ? <Text fontSize="10px" color="text.muted" lineClamp={1}>{team?.record ?? "--"}</Text> : null}
            </Box>
          </Flex>
          <Grid templateColumns={`repeat(5, ${columnSize})`} gap={1}>
            {[q?.[0], q?.[1], q?.[2], q?.[3], total].map((val, i) => (
              <Text key={`${team?.id ?? idx}-${i}`} fontSize={dense ? "xs" : "sm"} color="white" fontWeight={i === 4 ? "black" : "semibold"} textAlign="center">
                {val ?? "-"}
              </Text>
            ))}
          </Grid>
        </Flex>
      );
    })}

    {!dense ? <Text mt={3} fontSize="xs" color="text.secondary">{game.location}</Text> : null}
  </CardShell>
);
};

const ResultVariantStory = ({ game, clickTo, dense = false }) => (
  <CardShell clickTo={clickTo} bg="linear-gradient(135deg, rgba(229,62,62,0.16) 0%, rgba(8,8,10,0.95) 62%)" borderColor="whiteAlpha.200" dense={dense}>
    <Flex justify="space-between" mb={dense ? 2 : 3}>
      <Text fontSize="10px" color="orange.200" textTransform="uppercase" letterSpacing="0.12em">Result Brief</Text>
      <Text fontSize="10px" color="text.muted" textTransform="uppercase">{game.stageLabel}</Text>
    </Flex>
    <TeamLine team={game.home} score={game.homeScore} compact />
    <TeamLine team={game.away} score={game.awayScore} compact />
    {!dense ? <Box mt={3} pt={3} borderTop="1px solid" borderColor="whiteAlpha.200">
      <Text fontSize="xs" color="white" fontWeight="bold" lineClamp={1}>MVP: {game.mvp}</Text>
      <Text fontSize="xs" color="text.secondary" mt={1} lineClamp={1}>{game.playerLine}</Text>
      <Text fontSize="xs" color="text.secondary" mt={1} lineClamp={2}>{game.fact}</Text>
    </Box> : null}
  </CardShell>
);

const ResultVariantStats = ({ game, clickTo, dense = false }) => (
  <CardShell clickTo={clickTo} bg="blackAlpha.500" borderColor="whiteAlpha.200" dense={dense}>
    <Badge bg="brand.500" color="white" fontSize="9px" mb={3}>FINAL SNAPSHOT</Badge>
    <TeamLine team={game.home} score={game.homeScore} />
    <TeamLine team={game.away} score={game.awayScore} />

    {!dense ? <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={3}>
      <GridItem bg="whiteAlpha.100" borderRadius="md" p={2}>
        <Text fontSize="10px" color="text.muted" textTransform="uppercase">Total Yards</Text>
        <Text fontSize="sm" color="white" fontWeight="bold">{game.totalYards ?? "--"}</Text>
      </GridItem>
      <GridItem bg="whiteAlpha.100" borderRadius="md" p={2}>
        <Text fontSize="10px" color="text.muted" textTransform="uppercase">Top Line</Text>
        <Text fontSize="sm" color="white" fontWeight="bold" lineClamp={1}>{game.playerLine ?? "--"}</Text>
      </GridItem>
    </Grid> : null}
  </CardShell>
);

const PreviewVariantMinimal = ({ game, clickTo, dense = false }) => (
  dense ? (
    <PreviewDenseLayout game={game} clickTo={clickTo} accent="rgba(255,255,255,0.06)" />
  ) : (
  <CardShell clickTo={clickTo} bg="blackAlpha.400" dense={dense}>
    <Badge bg="whiteAlpha.200" color="white" fontSize="9px" mb={3}>UPCOMING</Badge>
    <TeamLine team={game.home} score="--" muted />
    <TeamLine team={game.away} score="--" muted />
    {!dense ? <Text mt={4} fontSize="xs" color="text.secondary">{game.location}</Text> : null}
  </CardShell>
  )
);

const PreviewVariantEvent = ({ game, clickTo, dense = false }) => (
  dense ? (
    <PreviewDenseLayout game={game} clickTo={clickTo} accent="rgba(246,173,85,0.12)" />
  ) : (
  <CardShell clickTo={clickTo} bg="linear-gradient(135deg, rgba(246,173,85,0.12) 0%, rgba(8,8,10,0.95) 70%)" borderColor="whiteAlpha.200" dense={dense}>
    <Text fontSize="10px" color="orange.200" textTransform="uppercase" letterSpacing="0.12em" mb={2}>{game.stageLabel}</Text>
    {!dense ? <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1} mb={3}>{game.gameName}</Text> : null}
    <TeamLine team={game.home} score="--" muted compact />
    <TeamLine team={game.away} score="--" muted compact />
    {!dense ? <Text mt={3} fontSize="xs" color="text.secondary">{game.dateLabel} · {game.location}</Text> : null}
  </CardShell>
  )
);

const PreviewVariantRanked = ({ game, clickTo, dense = false }) => (
  dense ? (
    <PreviewDenseLayout game={game} clickTo={clickTo} accent="rgba(255,255,255,0.08)" />
  ) : (
  <CardShell clickTo={clickTo} bg="blackAlpha.500" borderColor="whiteAlpha.200" dense={dense}>
    <Flex justify="space-between" mb={dense ? 2 : 3}>
      <Badge bg="whiteAlpha.200" color="white" fontSize="9px">PREVIEW</Badge>
      <Text fontSize="10px" color="text.muted" textTransform="uppercase">{game.dateLabel}</Text>
    </Flex>
    <Flex direction="column" gap={2}>
      <Flex align="center" justify="space-between">
        <Text fontSize="xs" color="orange.200" fontWeight="bold">#{game.homeRank ?? "--"}</Text>
        <TeamLine team={game.home} score="--" muted compact />
      </Flex>
      <Flex align="center" justify="space-between">
        <Text fontSize="xs" color="orange.200" fontWeight="bold">#{game.awayRank ?? "--"}</Text>
        <TeamLine team={game.away} score="--" muted compact />
      </Flex>
    </Flex>
    {!dense ? <Text mt={3} fontSize="xs" color="text.secondary">{game.home?.record ?? "--"} vs {game.away?.record ?? "--"}</Text> : null}
  </CardShell>
  )
);

const PreviewVariantWatch = ({ game, clickTo, dense = false }) => (
  dense ? (
    <PreviewDenseLayout game={game} clickTo={clickTo} accent="rgba(99,179,237,0.16)" />
  ) : (
  <CardShell clickTo={clickTo} bg="linear-gradient(145deg, rgba(99,179,237,0.16) 0%, rgba(8,8,10,0.95) 70%)" borderColor="whiteAlpha.200" dense={dense}>
    <Text fontSize="10px" color="blue.200" textTransform="uppercase" letterSpacing="0.12em" mb={2}>Watch Factors</Text>
    <TeamLine team={game.home} score="--" muted compact />
    <TeamLine team={game.away} score="--" muted compact />
    {!dense ? <Box mt={3} pt={3} borderTop="1px solid" borderColor="whiteAlpha.200">
      <Text fontSize="xs" color="white" fontWeight="bold">{game.fact ?? "Feature storyline"}</Text>
      <Text fontSize="xs" color="text.secondary" mt={1}>{game.playerLine ?? "Key player line"}</Text>
      <Text fontSize="xs" color="text.secondary" mt={1}>{game.location}</Text>
    </Box> : null}
  </CardShell>
  )
);

const RESULT_VARIANTS = [ResultVariantMinimal, ResultVariantEspn, ResultVariantStory, ResultVariantStats];
const PREVIEW_VARIANTS = [PreviewVariantMinimal, PreviewVariantEvent, PreviewVariantRanked, PreviewVariantWatch];

const GameScheduleStyleLab = ({ game, mode = "result", variantIndex = 0, dense = false }) => {
  const Variant =
    mode === "preview"
      ? PREVIEW_VARIANTS[variantIndex % PREVIEW_VARIANTS.length]
      : RESULT_VARIANTS[variantIndex % RESULT_VARIANTS.length];

  const clickTo = game?.gameId ? `/game/${encodeURIComponent(game.gameId)}` : null;

  return <Variant game={game} clickTo={clickTo} dense={dense} />;
};

export default GameScheduleStyleLab;
