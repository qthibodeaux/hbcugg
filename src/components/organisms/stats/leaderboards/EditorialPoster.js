import { useMemo, useState } from "react";
import { photoUrls, ARTICLE, lastName, primaryOf, ARTICLE_W, tab, num, seasonRankLine, gameLine, focusOf } from "./leaderboardPresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchJson, FE_DOCS_BASE } from "../../../../utils/gameCenterPayloads";
import { teamFillColors as winnerColors, teamShortName, contrast, teamLogo } from "../../../game/export/exportData";
import { lineOf, NUMBERS, playsOf, PLAY_LISTS, conversionLead, LEAD } from "./articleModel";
import { Box, Flex, Text, Grid, Image } from "@chakra-ui/react";
import { ExportWordmark } from "../../../molecules/export/ExportWordmark";
import { SectionHead, Directions, WinChart, PlayTable } from "./EditorialCharts";

// Editorial leaderboard spread and its existing lazy game-document query.

export const EditorialPoster = ({ pal, board, section, week, tag, season, rankOf, innerRef }) => {
  const fg = (a) => `rgba(${pal.fg}, ${a})`;
  const top = board.rows[0] ? rankOf(board.rows[0]) : null;
  const leaders = board.rows.filter((r) => rankOf(r) === top);
  const candidates = useMemo(() => leaders.flatMap((r) => photoUrls([r], "week", week).map((url) => ({ url, r }))), [leaders, week]);
  const [at, setAt] = useState(0);
  const pick = candidates[at];
  const cover = pick?.r ?? leaders[0];
  const gameId = cover?.game_path_id;
  const { data: game } = useQuery({
    queryKey: ["article-game", String(season), gameId],
    queryFn: () => fetchJson(`${FE_DOCS_BASE}/game-center/games/${season}/${gameId}.json`),
    enabled: Boolean(gameId), staleTime: 5 * 60 * 1000, retry: false,
  });
  if (!cover) return null;
  const items = [cover, ...board.rows.filter((r) => r !== cover).slice(0, 2)];
  const c = winnerColors(cover.team_id);
  const soft = (a) => `rgba(${c.rgb}, ${a})`;
  const copy = ARTICLE[board.id];
  const last = lastName(cover.display_name);
  const oppOf = (r) => (r.opponent_team_id ? teamShortName(r.opponent_team_id) : "their opponent");
  const nameInk = (id) => (contrast(primaryOf(id), pal.panel) >= 3 ? primaryOf(id) : pal.ink);
  const stat = lineOf(game, cover);
  const numbers = stat ? NUMBERS[stat.role](stat.line) : [];
  const mine = playsOf(game, cover.person_id);
  const list = PLAY_LISTS[board.id];
  const listed = list ? list.pick(mine) : [];
  const lead = board.id === "third_fourth_conversions" && listed.length
    ? conversionLead(last, listed)
    : stat ? LEAD[stat.role](last, stat.line, stat.rush) : "";
  return (
    <Box ref={innerRef} w={`${ARTICLE_W}px`} bg={pal.panel} color={pal.ink} px="52px" pt="34px" pb="44px">
      <Flex align="flex-end" justify="space-between" pb="14px" borderBottom={`6px solid ${pal.ink}`}>
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="40px" />
        <Text fontSize="17px" fontWeight="900" color={fg(0.65)} textTransform="uppercase" letterSpacing="0.1em">{season} · {tag} · The 18</Text>
      </Flex>

      <Grid templateColumns="290px minmax(0,1fr)" columnGap="34px" mt="26px">
        <Box minW={0}>
          <Flex direction="column" bg={c.fill} color={c.ink} px="20px" pt="18px" pb="20px">
            <Text fontSize="14px" fontWeight="900" color={soft(0.85)} textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.25}>{section.title}</Text>
            <Text mt="10px" fontSize="96px" fontWeight="950" fontStyle="italic" lineHeight={0.95} letterSpacing="-0.04em" {...tab}>{num(cover.value)}</Text>
            {board.unit && <Text fontSize="15px" fontWeight="900" color={soft(0.85)} letterSpacing="0.1em">{board.unit}</Text>}
            <Text mt="12px" fontSize="16px" fontWeight="800" lineHeight={1.3}>{seasonRankLine(cover)}</Text>
          </Flex>

          {numbers.length > 0 && (
            <Box>
              <SectionHead pal={pal}>By the numbers</SectionHead>
              {numbers.map(([label, value]) => (
                <Flex key={label} justify="space-between" align="baseline" gap="8px" py="5px" borderBottom={`1px solid ${fg(0.1)}`}>
                  <Text fontSize="15px" fontWeight="700" color={fg(0.7)} whiteSpace="nowrap">{label}</Text>
                  <Text fontSize="17px" fontWeight="950" whiteSpace="nowrap" {...tab}>{value}</Text>
                </Flex>
              ))}
            </Box>
          )}

          {stat && <Directions pal={pal} role={stat.role} line={stat.line} />}

          <SectionHead pal={pal}>Top 3</SectionHead>
          {items.map((r) => (
            <Grid key={`${r.person_id}-${r.game_path_id}`} templateColumns="42px minmax(0,1fr) auto" columnGap="10px" alignItems="center" py="10px" borderBottom={`1px solid ${fg(0.1)}`}>
              <Image src={teamLogo(r.team_id)} alt="" w="40px" h="40px" objectFit="contain" />
              <Box minW={0}>
                <Text fontSize="18px" fontWeight="900" lineHeight={1.1} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{lastName(r.display_name)}</Text>
                <Text fontSize="13px" fontWeight="700" color={fg(0.6)} lineHeight={1.25} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{r.position} · {teamShortName(r.team_id)}</Text>
              </Box>
              <Text fontSize="28px" fontWeight="950" fontStyle="italic" lineHeight={1} {...tab}>{num(r.value)}</Text>
            </Grid>
          ))}
        </Box>

        <Box minW={0} borderLeft={`4px solid ${pal.ink}`} pl="34px">
          {/* The headline on the left, the school's logo on the right. */}
          <Grid templateColumns="minmax(0,1fr) auto" columnGap="24px" alignItems="center">
            <Box minW={0}>
              <Text fontSize="17px" fontWeight="900" color={pal.brand} textTransform="uppercase" letterSpacing="0.12em">{section.title}</Text>
              <Text mt="8px" fontSize="64px" fontWeight="950" lineHeight={0.98} letterSpacing="-0.035em">{[].concat(copy?.headline(last, num(cover.value), cover.display_name)).map((row) => <Box as="span" key={row} display="block">{row}</Box>)}</Text>
            </Box>
            <Image src={teamLogo(cover.team_id)} alt="" w="150px" h="150px" objectFit="contain" flexShrink={0} />
          </Grid>
          <Text mt="12px" fontSize="22px" fontWeight="600" color={fg(0.7)} lineHeight={1.3}>{gameLine(cover)}. {seasonRankLine(cover)}</Text>
          {pick ? (
            <Image src={pick.url} alt="" mt="20px" w="full" h="400px" objectFit="cover" objectPosition={focusOf(pick.url)} onError={() => setAt((i) => i + 1)} />
          ) : (
            <Flex mt="20px" h="260px" align="center" justify="center" bg={c.fill}>
              <Flex w="180px" h="180px" align="center" justify="center" bg="#FFFFFF"><Image src={teamLogo(cover.team_id)} alt="" w="150px" h="150px" objectFit="contain" /></Flex>
            </Flex>
          )}

          {/* The story, set in two columns. */}
          <Box mt="20px" fontSize="20px" fontWeight="500" lineHeight={1.42} style={{ columnCount: 2, columnGap: "28px" }}>
            <Box as="span" fontWeight="950" color={nameInk(cover.team_id)}>{cover.display_name}</Box>
            {" "}({teamShortName(cover.team_id)}) {copy?.body(cover, num(cover.value), oppOf(cover))} {lead}
          </Box>

          {board.id === "game_changers" && <WinChart pal={pal} game={game} r={cover} plays={mine.map((x) => x.p)} ink={nameInk(cover.team_id)} />}
          {list && listed.length > 0 && <PlayTable pal={pal} list={list} plays={listed} />}

          {items.length > 1 && <SectionHead pal={pal}>Also on the board</SectionHead>}
          {items.slice(1).map((r, i) => (
            <Grid key={`${r.person_id}-${r.game_path_id}`} templateColumns="58px minmax(0,1fr)" columnGap="14px" alignItems="start" py="12px" borderBottom={`1px solid ${fg(0.1)}`}>
              <Text fontSize="60px" fontWeight="950" fontStyle="italic" color={pal.brand} lineHeight={0.85} letterSpacing="-0.04em" {...tab}>{rankOf(r) ?? i + 2}</Text>
              <Text fontSize="19px" fontWeight="500" lineHeight={1.38}>
                <Box as="span" fontWeight="950" color={nameInk(r.team_id)}>{r.display_name}</Box>
                {" "}({teamShortName(r.team_id)}) {copy?.body(r, num(r.value), oppOf(r))}
              </Text>
            </Grid>
          ))}
        </Box>
      </Grid>
    </Box>
  );
};
