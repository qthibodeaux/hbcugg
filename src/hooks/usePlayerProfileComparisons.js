import { useMemo } from "react";
import { normalizeTeamId, rankToPct, percentileRank, average } from "../utils/playerProfileModel";

// Shared player comparison derivation; preserves backend-first fallback rules.
export const usePlayerProfileComparisons = ({ profileDoc, rosterPlayers, statPlayers, player, height, weight, identity, classYear, homeState }) => {
const docComparatives = profileDoc?.comparatives;
const positionPeers = useMemo(
    () => rosterPlayers.filter((p) => p.position_group === player?.position_group),
    [rosterPlayers, player],
  );
const statPositionPeers = useMemo(
    () => statPlayers.filter((p) => p.position_group === player?.position_group),
    [statPlayers, player],
  );
const heightPercentile = docComparatives
    ? Math.round(rankToPct(docComparatives.height.rank, docComparatives.height.total))
    : percentileRank(positionPeers.map((p) => p.height), Number(height));
const weightPercentile = docComparatives
    ? Math.round(rankToPct(docComparatives.weight.rank, docComparatives.weight.total))
    : percentileRank(positionPeers.map((p) => p.weight), Number(weight));
const heightAvg = docComparatives?.height.group_avg ?? average(positionPeers.map((p) => p.height));
const weightAvg = docComparatives?.weight.group_avg ?? average(positionPeers.map((p) => p.weight));
const teamPeers = useMemo(() => {
    const teamKey = normalizeTeamId(player?.team ?? player?.team_id);
    return rosterPlayers.filter((p) => normalizeTeamId(p.team_id) === teamKey);
  }, [rosterPlayers, player]);
const onTeamTotal = (label) =>
    docComparatives?.on_this_team?.find((c) => c.label.toUpperCase() === label)?.total;
const positionTeamCount = onTeamTotal("QUARTERBACKS") ?? onTeamTotal(`${identity?.position_group ?? ""}S`) ??
    teamPeers.filter((p) => p.position_group === player?.position_group).length;
const classTeamCount = onTeamTotal(`${(identity?.class_label ?? "").toUpperCase()}S`) ??
    teamPeers.filter((p) => p.class_year === classYear).length;
const transferTeamCount = onTeamTotal("TRANSFERS") ?? teamPeers.filter((p) => p.is_transfer).length;
const inStateTeamCount = onTeamTotal("IN-STATE PLAYERS") ?? teamPeers.filter((p) => p.is_in_state).length;
const homeStateTeamCount = teamPeers.filter(
    (p) => String(p.home_state ?? "").toUpperCase() === String(homeState ?? "").toUpperCase()
  ).length;
const CLASS_TO_NUM = { "Fr.": 1, "So.": 2, "Jr.": 3, "Sr.": 4, "Gr.": 5 };
const positionTeammates = teamPeers.filter((p) => p.position_group === player?.position_group);
const positionClassCounts = docComparatives?.position_room
    ? docComparatives.position_room.reduce((acc, item) => {
        const num = CLASS_TO_NUM[item.class];
        if (num) acc[num] = item.count;
        return acc;
      }, {})
    : [1, 2, 3, 4, 5].reduce((acc, year) => {
        acc[year] = positionTeammates.filter((p) => p.class_year === year).length;
        return acc;
      }, {});
return { statPositionPeers, heightPercentile, weightPercentile, heightAvg, weightAvg, teamPeers, positionTeamCount, classTeamCount, transferTeamCount, inStateTeamCount, homeStateTeamCount, positionClassCounts };
};
