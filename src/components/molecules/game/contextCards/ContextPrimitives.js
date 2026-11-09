import { Image, Text } from "@chakra-ui/react";
import { teamLogo, teamShort } from "../../../game/export/exportData";

// Shared primitives; live/lab typography and shell remain separate settings.
export // ─────────────────────────────────────────────────────────────────────────────
// GAME CENTER HUB — CONTEXT CARDS. The 15 narrative card types from
// src/pages/game-center/mds/GameCenterHubCardsPlan.md §6, one bespoke visual
// each, all in one shell: eyebrow title, the visual, one big number, and the
// engine's first `why_reasons` line as the supporting copy. Sized in cqmin off
// the card (a size container), so any card fits the 1x1 or the 2-col slot.
// Payload shapes: Game Center Hub Design Doc §4. Lab copy: organisms/test/GameCenterContextCardsA.js.
// ─────────────────────────────────────────────────────────────────────────────

const GOOD = "#22C55E";

export const BAD = "#EF4444";

export // the brand's secondary green (was burnt orange, then gold)
const DIM = "rgba(255,255,255,0.5)";

export const FAINT = "rgba(255,255,255,0.12)";

export const Logo = ({
  id,
  size,
  ...rest
}) => <Image src={teamLogo(id)} alt="" w={`${size}cqmin`} h={`${size}cqmin`} objectFit="contain" flexShrink={0} {...rest} />;

export const Big = ({
  children,
  size = 18,
  color = "white",
  ...rest
}) => <Text fontSize={`${size}cqmin`} fontWeight="black" fontStyle="italic" color={color} lineHeight={0.88} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" lineClamp={1} {...rest}>
    {children}
  </Text>;
// Supporting type (records, dates, venues). Mobile turns on --ctx-m (set by the
// mobile page), which scales it 1.3x and floors it in rem so it reads at a
// glance on a half-width card; desktop is unchanged.

export const Abbr = ({
  id,
  size = 6,
  color = "white"
}) => <Text fontSize={`${size}cqmin`} fontWeight="black" color={color} textTransform="uppercase" lineHeight={1} lineClamp={1}>{teamShort(id)}</Text>;

// One shell for every card: title, watermark, body, the why line.
