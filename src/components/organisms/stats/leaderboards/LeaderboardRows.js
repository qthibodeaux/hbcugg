import { Text, Flex, Grid, Image, Box } from "@chakra-ui/react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { tab, MEDAL, num, gameLine, SEASON_LINES, TEAM_LINES, ordinal, primaryOf, lastName, photoUrls, PHOTO_H, focusOf } from "./leaderboardPresentation";
import { teamFillColors as winnerColors, teamLogo, teamShortName } from "../../../game/export/exportData";
import { formatTeamValue, TEAM_UNITS } from "../../../../pages/stats/leaderboardSections";
import { useMemo, useState } from "react";

// Leaderboard rank/movement rows and photo fallback presentation.

const Move = ({ pal, change, delta, ink }) => {
  if (!change) return null;
  if (change.new) return <Text fontSize="9px" fontWeight="900" color={ink ?? `rgba(${pal.fg}, 0.5)`} letterSpacing="0.02em" lineHeight={1}>NEW</Text>;
  if (delta == null) return null;
  if (delta === 0) return <Text fontSize="12px" fontWeight="900" color={ink ?? `rgba(${pal.fg}, 0.35)`} lineHeight={1}>–</Text>;
  const up = delta > 0;
  const color = ink ?? (up ? pal.up : pal.down);
  const Icon = up ? ChevronUp : ChevronDown;
  return (
    <Flex direction="column" align="center" color={color}>
      <Icon size={14} strokeWidth={3.5} />
      <Text fontSize="11px" fontWeight="900" lineHeight={1} color={color} {...tab}>{Math.abs(delta)}</Text>
    </Flex>
  );
};

export const Row = ({ pal, board, r, rank, kind, mode, player, team, winner, byConference }) => {
  const win = winner ? winnerColors(r.team_id) : null;
  const medal = win ? null : MEDAL[rank];
  const fg = (a) => (win ? `rgba(${win.rgb}, ${Math.min(1, a + 0.3)})` : `rgba(${pal.fg}, ${a})`);
  const isPlayer = kind === "player";
  const value = isPlayer ? num(r.value) : formatTeamValue(board.id, r.value);
  const unit = board.unit ?? (isPlayer ? null : TEAM_UNITS[board.id]);
  const line1 = mode === "week"
    ? gameLine(r)
    : isPlayer ? (player && SEASON_LINES[board.id]?.(player)) || `${num(r.total)} total` : (team && TEAM_LINES[board.id]?.(team)) || `${r.games} G`;
  const line2 = mode === "week"
    ? isPlayer && r.season_game_rank && r.season_games ? `${ordinal(r.season_game_rank)} of ${num(r.season_games)} games this season` : null
    : isPlayer ? `${r.games} G, ${num(r.total)} total` : team && TEAM_LINES[board.id] ? `${r.games} G` : null;
  return (
    <Grid templateColumns="26px 48px minmax(0,1fr) auto" columnGap="12px" alignItems="center" bg={win ? win.fill : medal ? `linear-gradient(${medal}, ${medal}), ${pal.panel}` : pal.panel} color={win ? win.ink : undefined} borderLeft={`4px solid ${win ? win.ink : primaryOf(r.team_id)}`} px="12px" py="10px" minH="78px">
      <Flex direction="column" align="center" gap="3px" alignSelf="start" pt="2px">
        <Text fontSize="14px" fontWeight="900" color={fg(0.4)} lineHeight={1.1} {...tab}>{rank}</Text>
        {mode === "season" && <Move pal={pal} change={r.change} delta={byConference ? r.change?.conference_rank_change : r.change?.rank_change} ink={win?.ink} />}
      </Flex>
      {/* The logo sits on white on a winner's card, so a school's logo never melts into its own colour. */}
      <Flex w="48px" h="48px" align="center" justify="center" bg={win ? "#FFFFFF" : "transparent"}>
        <Image src={teamLogo(r.team_id)} alt="" w="44px" h="44px" objectFit="contain" />
      </Flex>
      <Box minW={0}>
        {/* A player's name keeps its room; the position and class give way first. */}
        <Flex align="baseline" gap="8px" minW={0} overflow="hidden">
          <Text fontSize="20px" fontWeight="900" lineHeight={1.1} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" minW={0} flexShrink={isPlayer ? 0 : 1}>{isPlayer ? lastName(r.display_name) : teamShortName(r.team_id)}</Text>
          {isPlayer && <Text fontSize="12px" fontWeight="900" color={fg(0.5)} letterSpacing="0.04em" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" minW={0}>{[r.position, r.class_year].filter(Boolean).join(" · ")}</Text>}
        </Flex>
        {line1 && <Text fontSize="15px" fontWeight="700" color={fg(0.65)} lineHeight={1.3} lineClamp={1}>{line1}</Text>}
        {line2 && <Text fontSize="13px" fontWeight="600" fontStyle="italic" color={fg(0.5)} lineHeight={1.3} lineClamp={1}>{line2}</Text>}
      </Box>
      <Flex align="baseline" gap="5px" flexShrink={0}>
        <Text fontSize="34px" fontWeight="950" lineHeight={1} letterSpacing="-0.02em" whiteSpace="nowrap" {...tab}>{value}</Text>
        {unit && <Text fontSize="11px" fontWeight="900" color={fg(0.5)} letterSpacing="0.08em" whiteSpace="nowrap">{unit}</Text>}
      </Flex>
    </Grid>
  );
};

export const Photo = ({ pal, leaders, mode, week, show, onFound }) => {
  const urls = useMemo(() => photoUrls(leaders, mode, week), [leaders, mode, week]);
  const [at, setAt] = useState(0);
  const src = urls[at];
  return (
    <Box position="relative" h={show ? `${PHOTO_H}px` : 0} overflow="hidden" bg={pal.panel} mb={show ? "12px" : 0}>
      {src ? (
        <Image src={src} alt="" w="full" h={`${PHOTO_H}px`} objectFit="cover" objectPosition={focusOf(src)} onLoad={onFound} onError={() => setAt((i) => i + 1)} />
      ) : (
        <Flex h={`${PHOTO_H}px`} align="center" justify="center">
          {leaders[0] && <Image src={teamLogo(leaders[0].team_id)} alt="" w="150px" h="150px" objectFit="contain" opacity={0.35} />}
        </Flex>
      )}
    </Box>
  );
};
