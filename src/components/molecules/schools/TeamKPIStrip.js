/**
 * TeamKPIStrip
 *
 * PHILOSOPHY:
 *   Purpose: Second team-page 4x1 banner with a moving sports ticker above four KPIs.
 *   Grid slot: 4x1 PageShell slot.
 *
 * CONTENT TIERS:
 *   Essential: ticker, Avg PAR, roster size, transfer rate, veteran percentage.
 *   Compact: ticker remains; KPI labels shorten; subtitles reduce before values wrap.
 *
 * SIZING:
 *   Root uses h="full" w="full". No fixed root height. Rows use clamp/flex.
 */

import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { usePlayerAnalytics, useRosterHub } from "../../../hooks/useSWACData";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const toV5TeamId = (team) => team?.exportId?.replace(/25$/, "");

const asPct = (value) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n > 1 ? n : n * 100)}%`;
};

const asNumber = (value, fallback = "-") => {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(1);
};

const readableTextColor = (hex) => {
  if (!hex || typeof hex !== 'string') return "#0B0B0D";
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6 && clean.length !== 8) return "#0B0B0D";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "#0B0B0D";
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#0B0B0D" : "#FFFFFF";
};

const ContextRing = ({ pct = 0, color = "#FFFFFF", track = "rgba(255,255,255,0.18)", inner = "#141416", size = 42 }) => (
  <Box
    w={`${size}px`}
    h={`${size}px`}
    borderRadius="full"
    flexShrink={0}
    bg={`conic-gradient(${color} 0deg ${Math.max(0, Math.min(100, pct)) * 3.6}deg, ${track} 0deg 360deg)`}
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Box w={`${Math.round(size * 0.7)}px`} h={`${Math.round(size * 0.7)}px`} borderRadius="full" bg={inner} />
  </Box>
);

const KpiCell = ({ label, compactLabel, value, sub, bg, textColor, ringColor, ringTrack, ringInner, contextPct }) => {
  const { isMobile } = useLayoutDensity();
  const isDark = textColor === "#FFFFFF" || textColor === "text.primary";
  const mutedColor = isDark ? "rgba(255,255,255,0.68)" : "rgba(11,11,13,0.66)";
  const valueText = String(value ?? "--");
  // Mobile drops the big desktop floor (3.35rem/2.5rem) — at 4-across on a
  // phone those minimums were wider than the cell, so values clipped to
  // "3.." / "1..." instead of showing the number they represent.
  const valueSize = isMobile
    ? (valueText.length > 4 ? "clamp(0.95rem, 4vw, 1.4rem)" : "clamp(1.3rem, 5.6vw, 1.9rem)")
    : (valueText.length > 4 ? "clamp(2.5rem, 5.4vw, 3.2rem)" : "clamp(3.35rem, 7vw, 4.65rem)");

  const valueShadow = isDark 
    ? `3px 3px 0 rgba(11,11,13,0.15)`
    : `3px 3px 0 rgba(11,11,13,0.06)`;

  return (
    <Box
      w="full"
      h="full"
      bg={bg}
      color={textColor}
      position="relative"
      overflow="hidden"
      p={{ base: 3, md: 4 }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      borderRight="1px solid"
      borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.100"}
      _last={{ borderRight: "none" }}
    >
      {/* Background Watermark */}
      <Box position="absolute" right="-10px" bottom="-14px" fontSize="4.5rem" fontWeight="black" opacity={isDark ? 0.08 : 0.05} lineHeight="1" pointerEvents="none">
        {valueText}
      </Box>

      {/* Context Ring — smaller and tucked tighter into the corner on
          mobile, where the desktop 42px ring at top/right 3 crowded the
          value beneath it. */}
      <Box position="absolute" top={isMobile ? 1.5 : 3} right={isMobile ? 1.5 : 3} zIndex={2}>
        <ContextRing
          pct={contextPct}
          color={ringColor}
          track={ringTrack}
          inner={ringInner}
          size={isMobile ? 26 : 42}
        />
      </Box>

      <Box position="relative" zIndex={1}>
        <Text fontSize={{ base: "8px", lg: "9px" }} fontWeight="black" color={mutedColor} textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>
          <Box as="span" display={{ base: "inline", lg: "none" }}>{compactLabel ?? label}</Box>
          <Box as="span" display={{ base: "none", lg: "inline" }}>{label}</Box>
        </Text>
      </Box>

      {/* Mobile centers the value in its cell — left-aligned under a
          right-hand ring, the number sat off-balance in a narrow 4-across
          cell. Desktop keeps the left-aligned editorial treatment. */}
      <Flex flex="1" align="center" justify={isMobile ? "center" : "flex-start"} minH={0} position="relative" zIndex={1} mt={isMobile ? 3 : 1}>
        <Text
          fontSize={valueSize}
          fontWeight="black"
          color={textColor}
          lineHeight="0.82"
          letterSpacing="0"
          textShadow={valueShadow}
          textAlign={isMobile ? "center" : "left"}
          lineClamp={1}
        >
          {valueText}
        </Text>
      </Flex>

      <Flex align="end" justify="space-between" gap={3} minH="34px" position="relative" zIndex={1}>
        <Text fontSize={{ base: "9px", lg: "10px" }} color={mutedColor} fontWeight="bold" lineHeight="1.2" lineClamp={2}>
          {sub}
        </Text>
      </Flex>
    </Box>
  );
};

const TickerSegment = ({ label, value, dividerColor, textColor }) => (
  <Flex align="center" gap={{ base: 2, lg: 3 }} flexShrink={0}>
    <Text
      fontSize={{ base: "8px", md: "9px", lg: "10px" }}
      fontWeight="black"
      color={textColor}
      textTransform="uppercase"
      letterSpacing="0.1em"
      whiteSpace="nowrap"
    >
      {label}
    </Text>
    <Text
      fontSize={{ base: "8px", md: "9px", lg: "10px" }}
      fontWeight="black"
      color={textColor}
      opacity={0.68}
      textTransform="uppercase"
      whiteSpace="nowrap"
    >
      {value}
    </Text>
    <Box w="1px" h="12px" bg={dividerColor} opacity={0.3} />
  </Flex>
);

export const TeamKPIStrip = ({ team, season = 2025, stats }) => {
  const { isMobile } = useLayoutDensity();
  const primary = team?.colors?.primary || "#E53E3E";
  const secondary = team?.colors?.secondary || "#FDB913";
  const tickerText = readableTextColor(secondary);
  const v5TeamId = toV5TeamId(team);

  const { teams: rosterTeams } = useRosterHub(season);
  const { teamAnalytics } = usePlayerAnalytics();

  const rosterModule = rosterTeams?.[v5TeamId] ?? {};
  // player_analytics_2025.json is not year-parameterized — it is the 2025
  // season only. Only use it as a fallback when the strip is actually
  // showing 2025; for any other season, an empty roster_hub export (e.g.
  // no roster_hub_2026.json yet) should render honestly as "-", not
  // silently borrow 2025's numbers under a different season's label.
  const teamStats = Number(season) === 2025 ? (teamAnalytics?.[v5TeamId] ?? {}) : {};

  const data = {
    par: asNumber(stats?.par ?? teamStats.avg_par ?? null, "—"),
    parChange: stats?.parChange ?? "team average",
    rosterSize: stats?.rosterSize ?? rosterModule.composition?.total_players ?? teamStats.roster_size ?? "-",
    transferRate: stats?.transfers ?? asPct(rosterModule.transfers?.transfer_rate ?? teamStats.transfer_rate ?? 0),
    transferCount: rosterModule.transfers?.transfer_count ?? teamStats.transfer_count ?? "-",
    veterans: stats?.veterans ?? asPct(rosterModule.experience?.veteran_pct ?? 0),
  };

  const tickerItems = [
    ["Team", `${team?.shortName || "Team"} - ${team?.mascot || "Football"}`],
    ["Avg PAR", data.par],
    ["Roster", `${data.rosterSize} active`],
    ["Transfers", `${data.transferRate} / ${data.transferCount} players`],
    ["Veterans", `${data.veterans} upperclass`],
    ["Conference", `${team?.conference || "HBCU"}${team?.division ? ` ${team.division}` : ""}`],
    ["Season", season],
  ];
  const tickerLoop = [...tickerItems, ...tickerItems];

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius={isMobile ? 0 : "lg"}
      overflow="hidden"
      position="relative"
    >
      <style>{`
        @keyframes teamKpiTickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <Box
        position="absolute"
        inset={0}
        bg="bg.secondary"
      />

      <Flex position="relative" h="full" direction="column" minH={0}>
        <Box
          h="clamp(1.75rem, 18%, 2.25rem)"
          bg={secondary}
          overflow="hidden"
          borderBottom="1px solid"
          borderColor="blackAlpha.200"
          flexShrink={0}
        >
          <Flex
            h="full"
            align="center"
            gap={{ base: 4, lg: 7 }}
            px={4}
            w="max-content"
            style={{ animation: "teamKpiTickerScroll 34s linear infinite" }}
          >
            {tickerLoop.map(([label, value], index) => (
              <TickerSegment
                key={`${label}-${index}`}
                label={label}
                value={value}
                dividerColor={tickerText}
                textColor={tickerText}
              />
            ))}
          </Flex>
        </Box>

        <Grid flex={1} minH={0} templateColumns="repeat(4, minmax(0, 1fr))" bg="rgba(0,0,0,0.2)">
          <KpiCell 
            label="Avg PAR" 
            compactLabel="PAR" 
            value={data.par} 
            sub={data.parChange} 
            bg={primary} 
            textColor={readableTextColor(primary)}
            ringColor={readableTextColor(primary)}
            ringTrack={readableTextColor(primary) === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"}
            ringInner={primary}
            contextPct={(parseFloat(data.par) || 0) / 20 * 100}
          />
          <KpiCell 
            label="Roster" 
            value={data.rosterSize} 
            sub="active players" 
            bg={secondary}
            textColor={readableTextColor(secondary)}
            ringColor={readableTextColor(secondary)}
            ringTrack={readableTextColor(secondary) === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"}
            ringInner={secondary}
            contextPct={(parseInt(data.rosterSize) || 0) / 120 * 100}
          />
          <KpiCell 
            label="Transfer Rate" 
            compactLabel="Transfers" 
            value={data.transferRate} 
            sub="newcomers active" 
            bg="#FFFFFF"
            textColor="#0B0B0D"
            ringColor={primary}
            ringTrack="rgba(11,11,13,0.12)"
            ringInner="#FFFFFF"
            contextPct={parseFloat(data.transferRate) || 0}
          />
          <KpiCell 
            label="Veterans" 
            value={data.veterans} 
            sub="Jr / Sr / Grad" 
            bg="bg.secondary"
            textColor="#FFFFFF"
            ringColor={primary}
            ringTrack="rgba(255,255,255,0.12)"
            ringInner="#141416"
            contextPct={parseFloat(data.veterans) || 0}
          />
        </Grid>
      </Flex>
    </Box>
  );
};
