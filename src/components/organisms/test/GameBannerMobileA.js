import { useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { GameBannerMobile } from "./gameBannerMobile/LabMobileScoreboard";

// ── Lab export ───────────────────────────────────────────────────────────────
// Real values from public/data/93-FE Docs/game-center/games/2026/uapbalc26.json.

const MOCK_GAME = {
  game_id: "UAPBALC12092026",
  game_path_id: "uapbalc26",
  status: "final",
  metadata: { date: "09/12/2026", attendance: 21881, kickoff_time: "06:05 PM" },
  away_team: { team_id: "swacuapb", score: 51, record: "1-2", conference_record: "0-1", conference: "swac" },
  home_team: { team_id: "swacalc", score: 53, record: "2-1", conference_record: "1-0", conference: "swac" },
  ticker: [
    { label: "MATCHUP", text: "UAPB 51 @ ALCN 53" },
    { label: "UAPB PASSING", text: "Davis,Garrison 12/24, 167 YDS, 4 TD, 1 INT" },
    { label: "UAPB RUSHING", text: "Jennings,Jaylen 16 CAR, 98 YDS, 1 TD" },
    { label: "UAPB RECEIVING", text: "Robinson,D'Avery 4 REC, 89 YDS, 2 TD" },
    { label: "ALCN PASSING", text: "Tolbert,Jaylon 32/45, 485 YDS, 5 TD, 2 INT" },
    { label: "ALCN RUSHING", text: "Temple,Ernest 28 CAR, 144 YDS, 2 TD" },
    { label: "ALCN RECEIVING", text: "Kelly,Tyree 6 REC, 151 YDS, 2 TD" },
    { label: "ALCN TACKLES", text: "Jasper,Timothy 11.5 TKL" },
    { label: "ATTENDANCE", text: "21,881" },
    { label: "KICKOFF", text: "06:05 PM" },
    { label: "VENUE", text: "Memphis, Tennessee (Simmons Bank Liberty Stadium)" },
    { label: "WEEK", text: "Week 2" },
  ],
};

const Phone = ({ width }) => {
  const [tab, setTab] = useState("Summary");
  return (
    <Box>
      <Text fontSize="xs" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={2}>{width}px phone</Text>
      <Box w={`${width}px`} border="1px solid" borderColor="whiteAlpha.200" bg="bg.primary">
        <GameBannerMobile game={MOCK_GAME} activeTab={tab} onTabChange={setTab} />
        <Flex h="5rem" align="center" justify="center">
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">{tab}</Text>
        </Flex>
      </Box>
    </Box>
  );
};

export const GameBannerMobileA = () => (
  <Flex gap={8} wrap="wrap" align="flex-start" h="100%" overflowY="auto">
    <Phone width={390} />
    <Phone width={360} />
  </Flex>
);

export { GameBannerMobile } from "./gameBannerMobile/LabMobileScoreboard";
