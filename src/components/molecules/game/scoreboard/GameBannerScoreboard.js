import { MOCK_GAME, getTeamColor, buildTickerItems, getTeam, getTeamLogo } from "./scoreboardModel";
import { useLayoutDensity, LAYOUT_DENSITY } from "../../../../hooks/useLayoutDensity";
import { Box, Image, Flex, Grid } from "@chakra-ui/react";
import { ScoreboardAway, ScoreboardHome } from "./ScoreboardTeams";
import { ScoreboardStatus, ScoreboardVenue, ScoreboardTicker } from "./ScoreboardMeta";

// Production scoreboard composition; old test-path export remains for retained lab consumers.

export const GameBannerScoreboardA = ({ game = MOCK_GAME, activeTab = "Summary", onTabChange }) => {
  const { density } = useLayoutDensity();
  const isCompact = density === LAYOUT_DENSITY.COMPACT || density === LAYOUT_DENSITY.MOBILE;

  const meta = game?.metadata ?? {};
  const awayTeam = game?.away_team ?? meta.away_team ?? {};
  const homeTeam = game?.home_team ?? meta.home_team ?? {};
  const awayId =
    awayTeam.team_id ??
    awayTeam.id ??
    (typeof meta.away_team === "string" ? meta.away_team : meta.away_team?.id ?? meta.away_team?.team_id ?? "away");
  const homeId =
    homeTeam.team_id ??
    homeTeam.id ??
    (typeof meta.home_team === "string" ? meta.home_team : meta.home_team?.id ?? meta.home_team?.team_id ?? "home");

  const awayScore =
    Number(awayTeam.score ?? awayTeam.points ?? game?.final_score?.away ?? meta.away_points ?? meta.away_score ?? 0);
  const homeScore =
    Number(homeTeam.score ?? homeTeam.points ?? game?.final_score?.home ?? meta.home_points ?? meta.home_score ?? 0);

  const awayColor = getTeamColor(awayId, "#4B0082");
  const homeColor = getTeamColor(homeId, "#002147");
  const winner = game?.winner_team_id ?? (awayScore > homeScore ? awayId : homeScore > awayScore ? homeId : null);
  const margin = Math.abs(awayScore - homeScore);

  const tabs = ["Summary", "Player Stats", "Team Stats", "Drives", "Play By Play"];
  const venue = game?.venue ?? null;
  const event = game?.event ?? null;
  const eventText = event?.name
    ? [event.name, venue?.neutral_site ? "Neutral site" : null].filter(Boolean).join(" · ")
    : venue?.neutral_site ? "Neutral site" : null;
  const venueRows = [
    { key: "sponsor", text: venue?.sponsor ?? null },
    { key: "stadium", text: venue?.stadium ?? meta.site ?? null },
    { key: "city", text: venue?.stadium ? venue?.city ?? null : null },
    { key: "event", text: eventText },
  ].filter((row) => row.text);
  const tickerItems = buildTickerItems(game);
  const tickerLoop = [...tickerItems, ...tickerItems];

  // Records come off the team blocks on the game file (`record`, `conference_record`,
  // `conference`), as they stand once this game is in the books. Dash when absent.
  const teamBlockFor = (teamId) => {
    const want = String(teamId ?? "").replace(/25$/, "");
    const blocks = [game?.away_team, game?.home_team];
    return blocks.find((b) => String(b?.team_id ?? b?.id ?? "").replace(/25$/, "") === want) ?? null;
  };
  const getRecordConf = (teamId) => {
    const b = teamBlockFor(teamId);
    if (!b?.conference_record) return "—";
    return b.conference ? `${b.conference_record} ${String(b.conference).toUpperCase()}` : b.conference_record;
  };
  const getRecordOverall = (teamId) => teamBlockFor(teamId)?.record ?? "—";

  const getMascotLocal = (teamId) => {
    return getTeam(teamId)?.mascot ?? "";
  };

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      w="full"
      h="100%"
      bg="#08080A"
    >
      <style>{`
        @keyframes gameBannerTickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Background gradient */}
      <Box 
        position="absolute" 
        inset={0} 
        bg={`linear-gradient(90deg, ${awayColor}44 0%, #08080A 34%, #08080A 66%, ${homeColor}44 100%)`} 
      />

      {/* Watermarked Logos — Opacity increased to 0.16 for beautiful visibility */}
      <Box position="absolute" left="-5%" top="50%" transform="translateY(-50%)" opacity={0.16} pointerEvents="none">
        <Image src={getTeamLogo(awayId)} h="300px" objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      </Box>
      <Box position="absolute" right="-5%" top="50%" transform="translateY(-50%)" opacity={0.16} pointerEvents="none">
        <Image src={getTeamLogo(homeId)} h="300px" objectFit="contain" filter="grayscale(1) brightness(1.8)" />
      </Box>

      {/* Main content */}
      <Flex h="100%" position="relative" zIndex={1} direction="column">
        {/* Scoreboard row */}
        <Grid 
          flex={1} 
          templateColumns="1fr auto 1fr"
          alignItems="stretch" 
          minH={0}
        >
          {/* Away team */}
          <ScoreboardAway isCompact={isCompact} awayId={awayId} getRecordConf={getRecordConf} getMascotLocal={getMascotLocal} getRecordOverall={getRecordOverall} awayScore={awayScore} homeScore={homeScore} />

          {/* Center Info with Vertical Divider */}
          <ScoreboardStatus isCompact={isCompact} winner={winner} margin={margin} meta={meta} venueRows={venueRows} />

          {/* Home team */}
          <ScoreboardHome isCompact={isCompact} homeId={homeId} getRecordConf={getRecordConf} getMascotLocal={getMascotLocal} getRecordOverall={getRecordOverall} homeScore={homeScore} awayScore={awayScore} />
        </Grid>

        {/* Tab bar */}
        <ScoreboardVenue tabs={tabs} isCompact={isCompact} activeTab={activeTab} onTabChange={onTabChange} meta={meta} />

        {/* Editorial News Ticker Bar */}
        <ScoreboardTicker tickerLoop={tickerLoop} />
      </Flex>
    </Box>
  );
};
