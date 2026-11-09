import { Box, Text, Flex, Grid, Image } from "@chakra-ui/react";
import { getTeamAccent, getTeamLabel, getTeamLogoSrc } from "../../../../utils/gameSummary/teamIdentity";
import { useMemo, useState } from "react";
import { toDriveRow } from "../../../../utils/gameSummary/driveRows";
import { SectionLabel, MicroLabel } from "../summary/SummaryPrimitives";
import { DriveFieldStrip } from "./DriveFieldStrip";
import { ChevronDown } from "lucide-react";

// Extracted from GameSummaryTabV2. Existing data and presentation behavior is preserved.

const RESULT_TIER = {
  TD: "best",
  FG: "good",
  Punt: "neutral", EndHalf: "neutral", EndGame: "neutral",
  FUMB: "bad", INT: "bad", Downs: "bad", MissedFG: "bad", BlockedFG: "bad",
  INT_TD: "worst", FUMB_TD: "worst", SAFETY: "worst", "BLK PUNT": "worst",
};

const TIER_STYLE = {
  best: { bg: "#16A34A", border: "#22C55E", color: "#FFFFFF", glow: "0 0 0.6rem rgba(34,197,94,0.45)" },
  good: { bg: "rgba(34,197,94,0.2)", border: "rgba(34,197,94,0.6)", color: "#4ADE80" },
  neutral: { bg: "transparent", border: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.5)" },
  bad: { bg: "rgba(239,68,68,0.18)", border: "rgba(239,68,68,0.55)", color: "#F87171" },
  worst: { bg: "#DC2626", border: "#EF4444", color: "#FFFFFF", glow: "0 0 0.6rem rgba(239,68,68,0.45)" },
};

export const DriveResultPill = ({ result, label, size = "0.62rem", wrap = false }) => {
  const t = TIER_STYLE[RESULT_TIER[result] ?? "neutral"];
  return (
    <Box px="0.45rem" py="0.15rem" bg={t.bg} border={`1px solid ${t.border}`} borderRadius="md" boxShadow={t.glow ?? "none"} display="inline-block" maxW="full">
      <Text fontSize={size} fontWeight="950" color={t.color} textTransform="uppercase" letterSpacing="0.05em" textAlign="center" lineHeight={wrap ? 1.05 : undefined} whiteSpace={wrap ? "normal" : "nowrap"} lineClamp={wrap ? 2 : 1}>
        {label}
      </Text>
    </Box>
  );
};

export const DriveSummaryTable = ({ driveSummary, awayId, homeId }) => {
  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);

  const drives = useMemo(
    () => (Array.isArray(driveSummary) ? driveSummary : []).map((d) => toDriveRow(d, awayId, homeId)),
    [driveSummary, awayId, homeId],
  );

  // Grouped header, the way a drive chart reads: where it started, where it ended, what it
  // cost, and how it went. Sized in rem with the field taking the remainder.
  const COLS = "3.75rem 2rem 4rem 2.75rem 4rem 4rem 2.75rem 4.5rem 4rem 3rem 3.25rem 3.5rem 2.5rem 2.75rem 3.75rem minmax(9rem, 1fr)";
  const GROUPS = [
    { label: "", span: 1 },
    { label: "", span: 1 },
    { label: "Drive Started", span: 3 },
    { label: "Drive Ended", span: 3 },
    { label: "Consumed", span: 2 },
    { label: "How It Went", span: 4 },
    { label: "", span: 1 },
    { label: "Field", span: 1 },
  ];
  const HEADERS = ["Team", "Qtr", "Spot", "Time", "Obtained", "Spot", "Time", "Result", "Plays-Yds", "TOP", "EPA", "3rd/4th", "Expl", "Pen", "Score", ""];
  const CENTERED = new Set([1, 3, 6, 8, 9, 10, 11, 12, 13, 14]);

  const cell = (i, children) => (
    <Box key={i} minW={0} textAlign={CENTERED.has(i) ? "center" : "left"}>
      {children}
    </Box>
  );

  return (
    <Box
      w="full"
      position="relative"
      borderRadius="xl"
      overflow="hidden"
      className="animate-slide-in"
      style={{ animationDelay: "0.45s", background: "#141416" }}
    >
      <Box position="relative" zIndex={1}>
        <Box px={5} pt={5}>
          <SectionLabel rightContent={<MicroLabel color="rgba(255,255,255,0.3)">{drives.length} Drives</MicroLabel>}>
            Drive Summary
          </SectionLabel>
        </Box>

        <Box overflowX="auto">
          <Box minW="66rem">
            {drives.length === 0 && (
              <Flex align="center" justify="center" py={8}>
                <MicroLabel>No drive summary on file</MicroLabel>
              </Flex>
            )}
            {/* Group header */}
            <Grid templateColumns={COLS} gap={2} px={4} pt={2.5} pb={1}>
              {GROUPS.map((g, i) => (
                <Box key={i} gridColumn={`span ${g.span}`} textAlign={g.span > 1 ? "center" : "left"} minW={0}>
                  {g.label && (
                    <Text fontSize="clamp(0.42rem, 0.52vw, 0.55rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.18em" lineClamp={1}>
                      {g.label}
                    </Text>
                  )}
                </Box>
              ))}
            </Grid>

            {/* Column header */}
            <Grid templateColumns={COLS} gap={2} px={4} pb={2} borderBottom="0.0625rem solid" borderColor="rgba(255,255,255,0.08)" bg="rgba(255,255,255,0.02)">
              {HEADERS.map((h, i) =>
                cell(i, h ? <MicroLabel color="rgba(255,255,255,0.25)">{h}</MicroLabel> : null),
              )}
            </Grid>

            {drives.map((d, i) => {
              const isHome = d.team === "home";
              const teamColor = isHome ? homeColor : awayColor;
              const num = (v) => (v > 0 ? `+${v}` : String(v));
              const dash = (v) => (v == null ? "—" : v);

              return (
                <Grid
                  key={i}
                  templateColumns={COLS}
                  gap={2}
                  px={4}
                  py={2}
                  alignItems="center"
                  borderBottom="0.0625rem solid"
                  borderColor="rgba(255,255,255,0.04)"
                  className="animate-fade"
                  style={{ animationDelay: `${0.5 + i * 0.02}s` }}
                  _hover={{ bg: "rgba(255,255,255,0.04)" }}
                  transition="background 0.15s"
                >
                  {cell(0,
                    <Flex align="center" gap={1.5} minW={0}>
                      <Box w="0.4375rem" h="0.4375rem" borderRadius="full" bg={teamColor} flexShrink={0} />
                      <Text fontSize="clamp(0.6rem, 0.75vw, 0.75rem)" fontWeight="black" color="white" lineClamp={1}>
                        {isHome ? homeLabel : awayLabel}
                      </Text>
                    </Flex>,
                  )}
                  {cell(1, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" color={d.quarter === "OT" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)"} fontWeight="900">{d.quarter}</Text>)}
                  {cell(2, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" color="rgba(255,255,255,0.8)" fontWeight="bold" lineClamp={1}>{d.startSpot}</Text>)}
                  {cell(3, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" color="rgba(255,255,255,0.5)" fontWeight="bold">{d.startTime}</Text>)}
                  {cell(4, <Text fontSize="clamp(0.52rem, 0.64vw, 0.64rem)" color="rgba(255,255,255,0.45)" fontWeight="800" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>{d.obtained}</Text>)}
                  {cell(5, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" color="rgba(255,255,255,0.8)" fontWeight="bold" lineClamp={1}>{d.endSpot}</Text>)}
                  {cell(6, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" color="rgba(255,255,255,0.5)" fontWeight="bold">{d.endTime}</Text>)}
                  {cell(7, <DriveResultPill result={d.result} label={d.resultLabel} size="clamp(0.48rem, 0.58vw, 0.58rem)" />)}
                  {cell(8, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" color="white" fontWeight="950">{dash(d.plays)}-{dash(d.yards)}</Text>)}
                  {cell(9, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" color="rgba(255,255,255,0.55)" fontWeight="bold">{dash(d.top)}</Text>)}
                  {cell(10, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" fontWeight="950" color={d.epa == null ? "rgba(255,255,255,0.25)" : d.epa >= 0 ? "#22c55e" : "#ef4444"}>{d.epa == null ? "—" : num(d.epa.toFixed(1))}</Text>)}
                  {cell(11, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" color="rgba(255,255,255,0.7)" fontWeight="800">{d.thirdDown} / {d.fourthDown}</Text>)}
                  {cell(12, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" fontWeight="950" color={d.explosive > 0 ? "#fbbf24" : "rgba(255,255,255,0.25)"}>{dash(d.explosive)}</Text>)}
                  {cell(13, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" fontWeight="800" color={d.penaltyCount > 0 ? "#ef4444" : "rgba(255,255,255,0.25)"}>{d.penaltyCount > 0 ? `${d.penaltyCount} · ${Math.abs(d.penaltyYards ?? 0)}` : dash(d.penaltyCount)}</Text>)}
                  {cell(14, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" fontWeight="950" color="rgba(255,255,255,0.75)">{dash(d.awayScore)}-{dash(d.homeScore)}</Text>)}
                  {cell(15,
                    <DriveFieldStrip
                      startYard={d.startYard ?? 0}
                      endYard={d.endYard ?? 0}
                      plays={d.plays ?? 1}
                      team={d.team}
                      awayColor={awayColor}
                      homeColor={homeColor}
                      awayLabel={awayLabel}
                      homeLabel={homeLabel}
                      height="1.4rem"
                      showLabels={false}
                    />,
                  )}
                </Grid>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box position="absolute" bottom={0} left={0} right={0} h="0.125rem" bg="linear-gradient(90deg, transparent, rgba(229,62,62,0.4), transparent)" zIndex={2} />
    </Box>
  );
};

const MobileDetail = ({ label, value, color = "rgba(255,255,255,0.85)" }) => (
  <Box minW={0}>
    <Text fontSize="0.55rem" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.12em">{label}</Text>
    <Text fontSize="0.78rem" fontWeight="900" color={color} lineClamp={1}>{value}</Text>
  </Box>
);

const DriveStat = ({ value, label, color = "white" }) => (
  <Box minW={0} textAlign="center">
    <Text fontSize="0.85rem" fontWeight="950" color={color} lineHeight={1.1} whiteSpace="nowrap">{value}</Text>
    <Text fontSize="0.5rem" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em" mt="0.15rem" whiteSpace="nowrap">{label}</Text>
  </Box>
);

export const DriveSummaryMobile = ({ driveSummary, awayId, homeId, wrapGroup = (q, i, node) => node }) => {
  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);
  const [open, setOpen] = useState(() => new Set());
  const toggle = (i) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    return next;
  });

  const drives = useMemo(
    () => (Array.isArray(driveSummary) ? driveSummary : []).map((d) => toDriveRow(d, awayId, homeId)),
    [driveSummary, awayId, homeId],
  );
  const groups = useMemo(() => {
    const out = [];
    drives.forEach((d, i) => {
      const last = out[out.length - 1];
      if (last && last.quarter === d.quarter) last.items.push({ d, i });
      else out.push({ quarter: d.quarter, items: [{ d, i }] });
    });
    return out;
  }, [drives]);

  if (drives.length === 0) {
    return <Flex align="center" justify="center" py={8}><MicroLabel>No drive summary on file</MicroLabel></Flex>;
  }

  const dash = (v) => (v == null ? "—" : v);
  const signed = (v) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1));

  return (
    <Box w="full">
      {groups.map((g, gi) => <Box key={g.quarter}>{wrapGroup(g.quarter, gi, (
        <Box>
          <Flex align="center" justify="space-between" px="0.75rem" py="0.5rem" bg="rgba(255,255,255,0.03)" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="0.78rem" fontWeight="black" color="white" letterSpacing="0.14em">{g.quarter === "OT" ? "OVERTIME" : `QUARTER ${g.quarter.slice(1)}`}</Text>
            <Text fontSize="0.62rem" fontWeight="900" color="rgba(255,255,255,0.4)" letterSpacing="0.1em">{g.items.length} DRIVES</Text>
          </Flex>
          {g.items.map(({ d, i }) => {
            const isHome = d.team === "home";
            const isOpen = open.has(i);
            return (
              <Box key={i} as="button" type="button" onClick={() => toggle(i)} w="full" textAlign="left" display="block" px="0.75rem" py="0.6rem" borderBottom="1px solid" borderColor="whiteAlpha.100" bg={isOpen ? "rgba(255,255,255,0.03)" : "transparent"}>
                {/* Row 1 — everything about the drive, value over label, as tall as the bar */}
                <Grid templateColumns="minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 0.9fr) minmax(0, 0.6fr) minmax(0, 1fr) auto" columnGap="0.35rem" alignItems="center">
                  <Flex align="center" gap="0.4rem" minW={0}>
                    <Image src={getTeamLogoSrc(isHome ? homeId : awayId)} alt={isHome ? homeLabel : awayLabel} w="1.9rem" h="1.9rem" objectFit="contain" flexShrink={0} />
                    <Text fontSize="0.62rem" fontWeight="900" color="rgba(255,255,255,0.5)" letterSpacing="0.04em">{d.startTime}</Text>
                  </Flex>
                  <DriveStat value={`${dash(d.plays)}-${dash(d.yards)}`} label="Plays-Yds" />
                  <DriveStat value={d.epa == null ? "—" : signed(d.epa)} label="EPA" color={d.epa == null ? "rgba(255,255,255,0.3)" : d.epa >= 0 ? "#22c55e" : "#ef4444"} />
                  <DriveStat value={dash(d.explosive)} label="Expl" color={d.explosive > 0 ? "#fbbf24" : "rgba(255,255,255,0.3)"} />
                  <Flex justify="center" minW={0}>
                    <DriveResultPill result={d.result} label={d.resultLabel} size="0.66rem" wrap />
                  </Flex>
                  <Flex align="center" justify="flex-end" gap="0.25rem" minW={0}>
                    {/* Score after the drive — the Scoring Plays scorebug, small */}
                    <Flex flexShrink={0}>
                      <Flex direction="column" align="center" bg="white" color="black" px="0.3rem" py="0.15rem" minW="2.2rem">
                        <Text fontSize="0.5rem" fontWeight="900" letterSpacing="0.06em" lineHeight={1.1}>{awayLabel}</Text>
                        <Text fontSize="1rem" fontWeight="900" lineHeight={1}>{dash(d.awayScore)}</Text>
                      </Flex>
                      <Flex direction="column" align="center" bg={homeColor} color="white" px="0.3rem" py="0.15rem" minW="2.2rem">
                        <Text fontSize="0.5rem" fontWeight="900" letterSpacing="0.06em" lineHeight={1.1}>{homeLabel}</Text>
                        <Text fontSize="1rem" fontWeight="900" lineHeight={1}>{dash(d.homeScore)}</Text>
                      </Flex>
                    </Flex>
                    <Box color="rgba(255,255,255,0.45)" transform={isOpen ? "rotate(180deg)" : "none"} transition="transform 0.15s" display="flex" flexShrink={0}>
                      <ChevronDown size={13} />
                    </Box>
                  </Flex>
                </Grid>

                {/* Row 2 — the drive on the field */}
                <Box mt="0.5rem">
                  <DriveFieldStrip startYard={d.startYard ?? 0} endYard={d.endYard ?? 0} plays={d.plays ?? 1} team={d.team} awayColor={awayColor} homeColor={homeColor} awayLabel={awayLabel} homeLabel={homeLabel} height="1.6rem" showLabels={false} />
                </Box>

                {isOpen && (
                  <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="0.6rem" mt="0.6rem" pt="0.6rem" borderTop="1px solid" borderColor="whiteAlpha.100">
                    <MobileDetail label="Started" value={`${d.startSpot} · ${d.startTime}`} />
                    <MobileDetail label="Obtained" value={d.obtained} />
                    <MobileDetail label="Ended" value={`${d.endSpot} · ${d.endTime}`} />
                    <MobileDetail label="Time of Poss" value={dash(d.top)} />
                    <MobileDetail label="3rd / 4th" value={`${d.thirdDown} / ${d.fourthDown}`} />
                    <MobileDetail label="Penalties" value={d.penaltyCount > 0 ? `${d.penaltyCount} · ${Math.abs(d.penaltyYards ?? 0)} yds` : dash(d.penaltyCount)} color={d.penaltyCount > 0 ? "#ef4444" : undefined} />
                  </Grid>
                )}
              </Box>
            );
          })}
        </Box>
      ))}</Box>)}
    </Box>
  );
};
