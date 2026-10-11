import { useMemo } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM PROFILE PICKER — 4x1
//
// The Profile tab's team selector, modelled on TeamScheduleBannerA's desktop
// layout: a vertical "All Teams" rail, a 6x3 grid of abbreviation pills, and
// a detail panel that reads "select a team" until one is picked. Static pills
// — no rotation, no live-tile treatment — this is a directory, the tiles
// above it already do the selling.
//
// Once a team is picked the panel becomes the GameOnPaper "App State" card:
// a 3x2 of cells — record, conference record, composite rating + rank, and
// the three strongest win levers with that team's value and league
// percentile — each cell filled SOLID by percentile (green good, purple bad,
// deeper = further from the middle), the way GOP colours its cells. No
// gradients anywhere on this card. All of it is in the hub file already;
// nothing here is derived from play data.
//
// Sized off the slot (cqmin = row unit) so it holds the 4x1 shape at any
// width. No px heights.
// ─────────────────────────────────────────────────────────────────────────────

const GOOD = "#22C55E";
const BAD = "#A855F7";
const NEUTRAL_CELL = "rgba(255,255,255,0.05)";

// Solid fill, one colour per cell: the further the percentile sits from the
// middle, the deeper the fill. Alpha is a flat mix, not a gradient.
const cellFill = (pct) => {
  if (!Number.isFinite(pct)) return NEUTRAL_CELL;
  const strength = Math.min(1, Math.abs(pct - 50) / 50);
  const alpha = (0.18 + 0.5 * strength).toFixed(2);
  const hex = pct >= 50 ? GOOD : BAD;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const fmt = (value, unit) =>
  !Number.isFinite(value) ? "—" : unit === "pct" ? `${(value * 100).toFixed(1)}%` : value.toFixed(2);

const ordinal = (n) => {
  if (!Number.isFinite(n)) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

const headlineStats = (hub, row, season) => {
  if (!row) return [];
  const levers = [...(hub.levers ?? [])].sort((a, b) => b.abs - a.abs).slice(0, 3);
  const teamCount = Object.keys(hub.teams ?? {}).length;
  // Rank 1 of 18 reads as the 100th percentile so the rating cell colours on
  // the same scale as the lever cells.
  const ratingPct = Number.isFinite(row.rating_rank) && teamCount > 1 ? Math.round((1 - (row.rating_rank - 1) / (teamCount - 1)) * 100) : null;
  return [
    { label: `${season} Record`, value: row.record?.record ?? "—", sub: row.record?.conference_record ? `Conf: ${row.record.conference_record}` : null, fill: NEUTRAL_CELL },
    {
      label: "Rating",
      value: `${row.rating > 0 ? "+" : ""}${row.rating ?? "—"}`,
      sub: Number.isFinite(row.rating_rank) ? `#${row.rating_rank}` : null,
      fill: cellFill(ratingPct),
    },
    { label: "Streak", value: row.record?.streak ?? "—", sub: row.record?.last5 ? `Last 5: ${row.record.last5}` : null, fill: NEUTRAL_CELL },
    ...levers.map((l) => {
      const pct = row.percentiles?.[l.field];
      return {
        label: l.short,
        value: fmt(row.metrics?.[l.field], l.unit),
        sub: Number.isFinite(pct) ? `${ordinal(pct)} %ile` : null,
        fill: cellFill(pct),
      };
    }),
  ];
};

// ── Mobile ───────────────────────────────────────────────────────────────────
// The Team Schedules logo wall: 6 x 3 square logos, flush, each underlined in
// the team's primary. Picking one drops the stat card in under the wall —
// name and logo, then the same six cells as a 3 x 2, in rem.
const MobilePicker = ({ teams, team, teamId, row, stats, season, onChange }) => (
  <Box bg="#0B0B0D">
    <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap={0}>
      {teams.map((t) => {
        const isSelected = t.id === teamId;
        return (
          <Box
            key={t.id}
            as="button"
            type="button"
            aria-label={t.name}
            aria-pressed={isSelected}
            aspectRatio="1"
            bg={isSelected ? t.primary : "rgba(255,255,255,0.07)"}
            border="1px solid"
            borderColor={isSelected ? t.secondary : "rgba(255,255,255,0.1)"}
            borderBottomWidth="0.2rem"
            borderBottomColor={t.primary}
            onClick={() => onChange(isSelected ? null : t.id)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="0.4rem"
          >
            {t.logo
              ? <Image src={t.logo} alt={t.name} w="72%" h="72%" objectFit="contain" />
              : <Text fontSize="0.7rem" fontWeight="black" color="whiteAlpha.800">{t.short}</Text>}
          </Box>
        );
      })}
    </Grid>

    {team && (
      <Box borderTop="0.25rem solid" borderColor={team.identity.primary} bg="#141416">
        <Flex align="center" gap="0.75rem" px="0.75rem" py="0.7rem">
          <Box flex={1} minW={0}>
            <Text fontSize="1.5rem" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.02em" lineClamp={2}>
              {team.identity.name}
            </Text>
            <Text fontSize="0.7rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.14em" mt="0.3rem">
              {team.identity.conference} {team.identity.division} · {season}
            </Text>
          </Box>
          {team.identity.logo && <Image src={team.identity.logo} alt="" w="3rem" h="3rem" objectFit="contain" flexShrink={0} />}
        </Flex>

        {row ? (
          <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="1px" bg="whiteAlpha.100" borderTop="1px solid" borderColor="whiteAlpha.100">
            {stats.map((s) => (
              <Flex key={s.label} direction="column" justify="center" minW={0} px="0.6rem" py="0.65rem" style={{ background: `linear-gradient(${s.fill}, ${s.fill}), #141416` }}>
                <Text fontSize="0.62rem" fontWeight="black" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1} mb="0.3rem">
                  {s.label}
                </Text>
                <Text fontSize="1.45rem" fontWeight="black" lineHeight={1} color="white" fontVariantNumeric="tabular-nums" lineClamp={1}>
                  {s.value}
                </Text>
                {s.sub && (
                  <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.800" letterSpacing="0.04em" mt="0.25rem" lineClamp={1} fontVariantNumeric="tabular-nums">
                    {s.sub}
                  </Text>
                )}
              </Flex>
            ))}
          </Grid>
        ) : (
          <Text fontSize="0.85rem" color="whiteAlpha.500" px="0.75rem" pb="0.75rem">—</Text>
        )}
      </Box>
    )}
  </Box>
);

export const TeamProfilePicker = ({ hub, season, teamId, onChange, mobile = false }) => {
  const teams = useMemo(
    () =>
      Object.values(hub.teams ?? {})
        .map((t) => t.identity)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [hub.teams],
  );
  const team = teamId ? hub.teams?.[teamId] : null;
  const row = team?.seasons?.[season] ?? null;
  const stats = useMemo(() => headlineStats(hub, row, season), [hub, row, season]);
  const primary = team?.identity?.primary ?? "#FFFFFF";

  if (mobile) {
    return <MobilePicker teams={teams} team={team} teamId={teamId} row={row} stats={stats} season={season} onChange={onChange} />;
  }

  return (
    <Box h="100%" w="100%" containerType="size">
      <Flex
        h="100%"
        align="stretch"
        overflow="hidden"
        borderRadius="2xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        bg="#0B0B0D"
      >
        {/* ── Rail: All Teams (clears the selection) ── */}
        <Box
          as="button"
          type="button"
          w="9cqmin"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg={!teamId ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)"}
          borderRight="1px solid"
          borderColor="rgba(255,255,255,0.1)"
          onClick={() => onChange(null)}
          transition="all 0.15s"
          _hover={{ bg: !teamId ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.07)" }}
        >
          <Text
            fontSize="2.4cqmin"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.18em"
            color={!teamId ? "white" : "rgba(255,255,255,0.25)"}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            All Teams
          </Text>
        </Box>

        {/* ── Pills: 6 x 3 ── */}
        <Grid
          flex={1}
          minW={0}
          templateColumns="repeat(6, minmax(0, 1fr))"
          templateRows="repeat(3, minmax(0, 1fr))"
          gap="2cqmin"
          px="4cqmin"
          py="4cqmin"
        >
          {teams.map((t) => {
            const isSelected = t.id === teamId;
            return (
              <Box
                key={t.id}
                as="button"
                type="button"
                aria-label={t.name}
                aria-pressed={isSelected}
                borderRadius="md"
                cursor="pointer"
                minW={0}
                minH={0}
                bg={isSelected ? t.primary : "rgba(255,255,255,0.07)"}
                border="1px solid"
                borderColor={isSelected ? t.secondary : "rgba(255,255,255,0.1)"}
                onClick={() => onChange(isSelected ? null : t.id)}
                display="flex"
                alignItems="center"
                justifyContent="center"
                px="1.5cqmin"
                transition="all 0.15s"
                _hover={{ bg: isSelected ? t.primary : "rgba(255,255,255,0.12)", borderColor: isSelected ? t.secondary : "rgba(255,255,255,0.25)" }}
              >
                <Text
                  fontSize="2.8cqmin"
                  fontWeight="black"
                  textTransform="uppercase"
                  letterSpacing="0.03em"
                  color={isSelected ? "white" : "rgba(255,255,255,0.7)"}
                  lineHeight={1.05}
                  lineClamp={2}
                  textAlign="center"
                >
                  {t.name}
                </Text>
              </Box>
            );
          })}
        </Grid>

        {/* Hairline */}
        <Box w="1px" bg="rgba(255,255,255,0.12)" my="4cqmin" flexShrink={0} />

        {/* ── Detail: identity + headline stats, or the prompt ── */}
        <Flex
          w="34%"
          flexShrink={0}
          direction="column"
          justify="center"
          px="4cqmin"
          py="4cqmin"
          gap="2.5cqmin"
          minW={0}
          bg={team ? "#141416" : undefined}
          borderLeft={team ? "0.8cqmin solid" : undefined}
          borderLeftColor={team ? primary : undefined}
        >
          {!team ? (
            <Flex align="center" justify="center" h="100%">
              <Text fontSize="4cqmin" color="rgba(255,255,255,0.3)" textAlign="center" fontStyle="italic">
                Select a team to view their profile
              </Text>
            </Flex>
          ) : (
            <>
              <Flex align="center" gap="2.5cqmin" minW={0} flexShrink={0}>
                <Box minW={0} flex={1}>
                  <Text
                    fontSize="6cqmin"
                    fontWeight="black"
                    color="white"
                    textTransform="uppercase"
                    letterSpacing="-0.01em"
                    lineHeight={0.95}
                    lineClamp={2}
                    wordBreak="normal"
                    style={{ overflowWrap: "normal", hyphens: "none" }}
                  >
                    {team.identity.name}
                  </Text>
                  <Text fontSize="2.4cqmin" fontWeight="black" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.16em" mt="1.2cqmin">
                    {team.identity.conference} {team.identity.division} · {season}
                  </Text>
                </Box>
                {team.identity.logo && (
                  <Box w="12cqmin" h="12cqmin" flexShrink={0}>
                    <Image src={team.identity.logo} alt="" w="100%" h="100%" objectFit="contain" onError={(e) => { e.target.style.display = "none"; }} />
                  </Box>
                )}
              </Flex>

              {row ? (
                <Grid templateColumns="repeat(3, minmax(0, 1fr))" templateRows="repeat(2, minmax(0, 1fr))" gap="1.2cqmin" flex={1} minH={0}>
                  {stats.map((s) => (
                    <Flex
                      key={s.label}
                      direction="column"
                      justify="center"
                      minW={0}
                      minH={0}
                      px="2cqmin"
                      py="1.2cqmin"
                      borderRadius="sm"
                      bg={s.fill}
                    >
                      <Text fontSize="2.2cqmin" fontWeight="black" color="rgba(255,255,255,0.75)" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1} mb="0.8cqmin">
                        {s.label}
                      </Text>
                      <Flex align="baseline" gap="1.2cqmin" minW={0}>
                        <Text fontSize="5.4cqmin" fontWeight="black" lineHeight={1} color="white" fontVariantNumeric="tabular-nums" lineClamp={1}>
                          {s.value}
                        </Text>
                        {s.sub && (
                          <Text fontSize="2.4cqmin" color="rgba(255,255,255,0.8)" fontWeight="black" letterSpacing="0.06em" lineClamp={1} fontVariantNumeric="tabular-nums">
                            {s.sub}
                          </Text>
                        )}
                      </Flex>
                    </Flex>
                  ))}
                </Grid>
              ) : (
                <Text fontSize="3.6cqmin" color="rgba(255,255,255,0.4)" fontStyle="italic">
                  No {season} season on file.
                </Text>
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default TeamProfilePicker;
