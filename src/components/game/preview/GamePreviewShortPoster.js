import { longDate } from "../../../utils/gamePreview";
import { Flex, Text } from "@chakra-ui/react";
import { ExportWordmark } from "../../molecules/export/ExportWordmark";
import { caps, LogoTile, TeamText, Panel } from "./shortPoster/ShortPosterPanels";

// ─────────────────────────────────────────────────────────────────────────────
// GAME PREVIEW — SHORT. The preview's second export: one compact square image,
// 1080 x 1080, for a pasted post. The tale-of-the-tape read, in our colours: the HBCUGG wordmark, the two teams, one panel of stat tiles
// per team, and each team's last six results.
//
//   tiles, row 1   adjusted EPA, offense · defense — the rank is the number (the
//                  raw values are thousandths)
//   tiles, row 2   points per drive · allowed per drive · net EPA per play
//   tiles, 2 x 2   points · allowed · pass yds · rush yds, per game
//   last six       opponent mark, side, result and score
//
// A tile shows the backend's value and rank (utils/gamePreviewScout.js); on each stat, the team
// with the better rank gets its tile filled in the school's colours (rank in the tile's own ink),
// and a tie fills neither. Other tiles print the rank green / orange / red by
// third. A missing value prints a dash. Mobile style: square corners everywhere, the
// tiles flush on 2px black lines with no gaps; logos sit in squares, never circles.
// Follows the Light / Night switch through `pal` (WeekRecapExport PALETTES).
// ─────────────────────────────────────────────────────────────────────────────

export const SHORT_W = 1080;
export const SHORT_H = 1080;

export const GamePreviewShortPoster = ({ m, pal, innerRef }) => {
  const n = m.ranked_teams || 15;
  const when = [m.week_label, longDate(m.date), m.kickoff_label].filter(Boolean).join(" · ");
  return (
    <Flex ref={innerRef} direction="column" w={`${SHORT_W}px`} h={`${SHORT_H}px`} bg={pal.bg} color={pal.ink} px="36px" pt="28px" pb="30px">
      <Flex align="center" justify="space-between" gap="20px">
        <ExportWordmark ink={pal.ink} accent={pal.brand} size="36px" />
        <Text fontSize="19px" color={pal.orange} {...caps}>{when}</Text>
      </Flex>

      <Flex align="center" gap="14px" mt="14px" mb="14px">
        <LogoTile id={m.away.team_id} pal={pal} />
        <TeamText s={m.away} pal={pal} />
        <Text fontSize="42px" fontWeight="950" fontStyle="italic" color={pal.orange} lineHeight={1}>@</Text>
        <TeamText s={m.home} pal={pal} right />
        <LogoTile id={m.home.team_id} pal={pal} />
      </Flex>

      <Flex gap="2px" flex={1} minH={0}>
        <Panel s={m.away} other={m.home} n={n} pal={pal} />
        <Panel s={m.home} other={m.away} n={n} pal={pal} />
      </Flex>
    </Flex>
  );
};
