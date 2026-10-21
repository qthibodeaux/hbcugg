import { useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { teamLogo, teamShort, withAlpha, teamAccent } from "../export/exportData";
import { longDate } from "../../../utils/gamePreview";
import PreviewCountdown from "./PreviewCountdown";
import { COUNTING, EFFICIENCY, PassGrid, STRIP, brandOf, inkOn } from "./GamePreviewScout";
import { BottomSheet } from "../../organisms/BottomSheet";
import { BANNER_STRIP_BG } from "../../organisms/BannerControls";
import { useJumpSections } from "../page/mobile/useJumpSections";

// ─────────────────────────────────────────────────────────────────────────────
// GAME PREVIEW — MOBILE. Its own tree (the desktop scout is a three-column
// board): banner, then a sticky jump header, then the sections one after
// another, flush and square, every number big.
//
//   tape        both teams' season lines as one mirrored table, the better
//               rank lit on each row
//   units       each offense against the other defense, the edge marked
//   qb          one quarterback at a time (team switch): line + the 3x3 pass grid
//   leaders     one team at a time: top 8 by season production
//   history     the meetings sheet, as the desktop page shows it
//
// Same model as the desktop scout (utils/gamePreviewScout.js).
// ─────────────────────────────────────────────────────────────────────────────

const PANEL = "#141416";
const LINE = "rgba(255,255,255,0.08)";
const DIM = "rgba(255,255,255,0.55)";
const JUMP_MARGIN = "calc(var(--app-header-height) + 2.8rem)";
const ACCENT = "#A855F7";

const Label = ({ children, color = DIM, ...rest }) => (
  <Text fontSize="0.62rem" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.2} {...rest}>{children}</Text>
);

// A rank chip that lights only when it is the better side of the row.
const Chip = ({ rank, color, on }) => (
  <Flex align="center" justify="center" minW="2.3rem" h="1.5rem" px="0.3rem" bg={rank ? (on ? color : "whiteAlpha.150") : "whiteAlpha.100"} flexShrink={0}>
    <Text fontSize="0.74rem" fontWeight="900" color={rank && on ? inkOn(color) : "whiteAlpha.800"} fontVariantNumeric="tabular-nums" lineHeight={1}>{rank ? `#${rank}` : "—"}</Text>
  </Flex>
);

const Section = ({ id, refs, title, right, children }) => (
  <Box ref={refs?.[id]} data-jump={id} style={{ scrollMarginTop: JUMP_MARGIN }} bg={PANEL} borderBottom="1px solid" borderColor={LINE}>
    <Flex align="center" justify="space-between" gap="0.5rem" px="0.75rem" pt="0.85rem" pb="0.6rem">
      <Flex align="center" gap="0.5rem">
        <Box w="0.4rem" h="0.4rem" borderRadius="full" bg={ACCENT} flexShrink={0} />
        <Text fontSize="0.8rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.14em">{title}</Text>
      </Flex>
      {right}
    </Flex>
    {children}
  </Box>
);

// Two-team switch: logos + abbreviations, the picked side in its colour.
const TeamSwitch = ({ m, value, onChange }) => (
  <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="1px" bg={LINE} borderTop="1px solid" borderBottom="1px solid" borderColor={LINE}>
    {[m.away, m.home].map((s) => {
      const on = value === s.team_id;
      const c = brandOf(s.team_id);
      return (
        <Flex key={s.team_id} as="button" type="button" onClick={() => onChange(s.team_id)} align="center" justify="center" gap="0.5rem" py="0.6rem"
          bg={on ? withAlpha(c, 0.22) : PANEL} borderBottom="2px solid" borderBottomColor={on ? c : "transparent"}>
          <Image src={teamLogo(s.team_id)} alt="" w="1.4rem" h="1.4rem" objectFit="contain" />
          <Text fontSize="0.85rem" fontWeight="900" color={on ? "white" : "whiteAlpha.600"} textTransform="uppercase">{teamShort(s.team_id)}</Text>
        </Flex>
      );
    })}
  </Grid>
);

// ── Banner ───────────────────────────────────────────────────────────────────
const BannerSide = ({ side }) => (
  <Flex direction="column" align="center" gap="0.3rem" minW={0}>
    <Image src={teamLogo(side.team_id)} alt="" w="3.8rem" h="3.8rem" objectFit="contain" />
    <Text fontSize="1.6rem" fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1} letterSpacing="-0.02em">{teamShort(side.team_id)}</Text>
    <Flex align="baseline" gap="0.25rem">
      <Text fontSize="0.85rem" fontWeight="900" color="white">{side.conference_record ?? "—"}</Text>
      <Text fontSize="0.72rem" fontWeight="800" color="whiteAlpha.600">({side.record ?? "—"})</Text>
    </Flex>
  </Flex>
);

const Banner = ({ m }) => {
  const a = teamAccent(m.away.team_id);
  const h = teamAccent(m.home.team_id);
  return (
    <Box position="relative" overflow="hidden" bg="#08080A" px="0.75rem" py="1rem">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${withAlpha(a, 0.3)} 0%, #08080A 40%, #08080A 60%, ${withAlpha(h, 0.3)} 100%)`} />
      <Grid position="relative" templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="center" gap="0.5rem">
        <BannerSide side={m.away} />
        <Flex direction="column" align="center" gap="0.35rem" maxW="9.5rem">
          <Box px="0.75rem" py="0.15rem" bg="brand.500" transform="skewX(-10deg)">
            <Text fontSize="0.62rem" fontWeight="900" color="white" letterSpacing="0.08em" transform="skewX(10deg)">PREVIEW</Text>
          </Box>
          <PreviewCountdown kickoffAt={m.kickoff_at ?? null} date={m.date} />
          <Text fontSize="0.8rem" fontWeight="900" color="white" textTransform="uppercase" textAlign="center" lineHeight={1.15}>{longDate(m.date)}</Text>
          <Text fontSize="0.65rem" fontWeight="800" color="whiteAlpha.650" textAlign="center">{[m.week_label, m.kickoff_label ?? "Kickoff TBA"].filter(Boolean).join(" · ")}</Text>
          {m.venue && <Text fontSize="0.6rem" fontWeight="800" color="whiteAlpha.500" textAlign="center" lineHeight={1.25} lineClamp={2}>{m.venue}</Text>}
        </Flex>
        <BannerSide side={m.home} />
      </Grid>
    </Box>
  );
};

// ── Jump header ──────────────────────────────────────────────────────────────
const JumpHeader = ({ m, parts, current, onJump }) => {
  const [open, setOpen] = useState(false);
  const part = parts.find((p) => p.id === current) ?? parts[0];
  return (
    <>
      <Flex position="sticky" top="var(--app-header-height)" zIndex={20} align="stretch" justify="space-between" bg={BANNER_STRIP_BG} borderBottom="1px solid" borderColor="whiteAlpha.100" minH="2.6rem">
        <Flex as="button" type="button" onClick={() => setOpen(true)} align="center" gap="0.45rem" pl="0.75rem" pr="1.5rem" minW={0}
          bg={`linear-gradient(110deg, ${ACCENT} 0%, ${BANNER_STRIP_BG} 100%)`} borderBottomRightRadius="1.75rem">
          <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.08em" flexShrink={0}>Preview</Text>
          <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.600">/</Text>
          <Text fontSize="0.8rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>{part.label}</Text>
          <ChevronDown size={15} color="white" style={{ flexShrink: 0 }} />
        </Flex>
        <Flex align="center" gap="0.4rem" px="0.75rem" flexShrink={0}>
          <Image src={teamLogo(m.away.team_id)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" />
          <Text fontSize="0.72rem" fontWeight="black" color="white">{teamShort(m.away.team_id)}</Text>
          <Text fontSize="0.62rem" fontWeight="black" color="whiteAlpha.500">AT</Text>
          <Text fontSize="0.72rem" fontWeight="black" color="white">{teamShort(m.home.team_id)}</Text>
          <Image src={teamLogo(m.home.team_id)} alt="" w="1.1rem" h="1.1rem" objectFit="contain" />
        </Flex>
      </Flex>
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Jump to">
        <Flex direction="column" py="0.4rem">
          {parts.map((p) => {
            const on = p.id === part.id;
            return (
              <Box key={p.id} as="button" type="button" onClick={() => { setOpen(false); onJump(p.id); }} w="full" textAlign="left" px="1rem" py="0.85rem"
                bg={on ? "whiteAlpha.100" : "transparent"} borderLeft="3px solid" borderColor={on ? ACCENT : "transparent"}>
                <Text fontSize="0.85rem" fontWeight="black" color={on ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.04em">{p.label}</Text>
              </Box>
            );
          })}
        </Flex>
      </BottomSheet>
    </>
  );
};

// ── Tale of the tape ─────────────────────────────────────────────────────────
const TAPE = [
  { title: "Scoring & EPA", key: "strip", rows: STRIP },
  { title: "Counting", key: "counting", rows: COUNTING },
  { title: "Efficiency", key: "efficiency", rows: EFFICIENCY },
];

const TapeRow = ({ label, a, h, ac, hc }) => {
  // Lower rank is better on every row (the backend ranks each field by its own
  // polarity), so the lit side is simply the smaller rank.
  const aOn = a.rank && h.rank ? a.rank < h.rank : false;
  const hOn = a.rank && h.rank ? h.rank < a.rank : false;
  return (
    <Grid templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="center" gap="0.5rem" px="0.75rem" py="0.55rem" borderTop="1px solid" borderColor={LINE}>
      <Flex align="center" gap="0.4rem" minW={0}>
        <Chip rank={a.rank} color={ac} on={aOn} />
        <Text fontSize="1.05rem" fontWeight="900" color={aOn ? "white" : "whiteAlpha.700"} fontVariantNumeric="tabular-nums" whiteSpace="nowrap">{a.display}</Text>
      </Flex>
      <Text fontSize="0.62rem" fontWeight="900" color={DIM} textTransform="uppercase" letterSpacing="0.06em" textAlign="center" maxW="6.5rem" lineHeight={1.2}>{label}</Text>
      <Flex align="center" gap="0.4rem" justify="flex-end" minW={0}>
        <Text fontSize="1.05rem" fontWeight="900" color={hOn ? "white" : "whiteAlpha.700"} fontVariantNumeric="tabular-nums" whiteSpace="nowrap">{h.display}</Text>
        <Chip rank={h.rank} color={hc} on={hOn} />
      </Flex>
    </Grid>
  );
};

const Tape = ({ m, refs }) => {
  const ac = brandOf(m.away.team_id);
  const hc = brandOf(m.home.team_id);
  return (
    <Section id="tape" refs={refs} title="Tale of the tape" right={<Label>{m.away.games ?? "—"} · {m.home.games ?? "—"} games</Label>}>
      <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr)" px="0.75rem" pb="0.5rem">
        <Flex align="center" gap="0.4rem"><Image src={teamLogo(m.away.team_id)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" /><Text fontSize="0.85rem" fontWeight="900" color={ac}>{teamShort(m.away.team_id)}</Text></Flex>
        <Flex align="center" gap="0.4rem" justify="flex-end"><Text fontSize="0.85rem" fontWeight="900" color={hc}>{teamShort(m.home.team_id)}</Text><Image src={teamLogo(m.home.team_id)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" /></Flex>
      </Grid>
      {TAPE.map((g) => (
        <Box key={g.key}>
          <Box px="0.75rem" py="0.4rem" bg="blackAlpha.300" borderTop="1px solid" borderColor={LINE}><Label color="whiteAlpha.700">{g.title}</Label></Box>
          {g.rows.map(([k, label]) => (
            <TapeRow key={k} label={label} a={m.away[g.key][k]} h={m.home[g.key][k]} ac={ac} hc={hc} />
          ))}
        </Box>
      ))}
    </Section>
  );
};

// ── Unit matchups ────────────────────────────────────────────────────────────
const UnitBlock = ({ offId, defId, rows }) => {
  const oc = brandOf(offId);
  const dc = brandOf(defId);
  return (
    <Box>
      <Grid templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="center" px="0.75rem" py="0.55rem" bg="blackAlpha.300" borderTop="1px solid" borderColor={LINE}>
        <Flex align="center" gap="0.4rem"><Image src={teamLogo(offId)} alt="" w="1.2rem" h="1.2rem" objectFit="contain" /><Label color="white">{teamShort(offId)} offense</Label></Flex>
        <Label px="0.5rem">vs</Label>
        <Flex align="center" gap="0.4rem" justify="flex-end"><Label color="white">{teamShort(defId)} defense</Label><Image src={teamLogo(defId)} alt="" w="1.2rem" h="1.2rem" objectFit="contain" /></Flex>
      </Grid>
      {rows.map((r) => {
        const gap = r.off.rank && r.def.rank ? r.def.rank - r.off.rank : 0;
        const edge = gap > 0 ? offId : gap < 0 ? defId : null;
        return (
          <Box key={r.label} px="0.75rem" py="0.55rem" borderTop="1px solid" borderColor={LINE}>
            <Label textAlign="center" mb="0.35rem">{r.label}</Label>
            <Grid templateColumns="minmax(0, 1fr) 2rem minmax(0, 1fr)" alignItems="center" gap="0.5rem">
              <Flex align="center" gap="0.4rem">
                <Chip rank={r.off.rank} color={oc} on={edge === offId} />
                <Text fontSize="1.05rem" fontWeight="900" color={edge === offId ? "white" : "whiteAlpha.700"} fontVariantNumeric="tabular-nums" whiteSpace="nowrap">{r.off.display}</Text>
              </Flex>
              <Flex align="center" justify="center" w="2rem" h="2rem" borderRadius="full" bg="#0B0B0D" border="1px solid" borderColor="whiteAlpha.300">
                {edge ? <Image src={teamLogo(edge)} alt="" w="1.35rem" h="1.35rem" objectFit="contain" /> : <Text fontSize="0.8rem" fontWeight="900" color={DIM}>=</Text>}
              </Flex>
              <Flex align="center" gap="0.4rem" justify="flex-end">
                <Text fontSize="1.05rem" fontWeight="900" color={edge === defId ? "white" : "whiteAlpha.700"} fontVariantNumeric="tabular-nums" whiteSpace="nowrap">{r.def.display}</Text>
                <Chip rank={r.def.rank} color={dc} on={edge === defId} />
              </Flex>
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

const Units = ({ m, refs }) => (
  <Section id="units" refs={refs} title="Unit matchups">
    <UnitBlock offId={m.away.team_id} defId={m.home.team_id} rows={m.units.away_offense} />
    <UnitBlock offId={m.home.team_id} defId={m.away.team_id} rows={m.units.home_offense} />
  </Section>
);

// ── Quarterbacks ─────────────────────────────────────────────────────────────
const Quarterbacks = ({ m, refs }) => {
  const [team, setTeam] = useState(m.away.team_id);
  const side = team === m.home.team_id ? m.home : m.away;
  const qb = side.qb;
  const color = brandOf(side.team_id);
  const l = qb?.line ?? {};
  return (
    <Section id="qb" refs={refs} title="Quarterbacks">
      <TeamSwitch m={m} value={team} onChange={setTeam} />
      {!qb ? (
        <Text px="0.75rem" py="1rem" fontSize="0.85rem" color={DIM}>—</Text>
      ) : (
        <Box px="0.75rem" py="0.85rem">
          <Flex align="center" gap="0.75rem">
            <Box w="4.2rem" h="4.2rem" borderRadius="0.6rem" overflow="hidden" bg="whiteAlpha.100" border="2px solid" borderColor={color} flexShrink={0}>
              {qb.image_url ? <Image src={qb.image_url} alt="" w="full" h="full" objectFit="cover" objectPosition="top center" /> : null}
            </Box>
            <Box minW={0}>
              <Text fontSize="1.6rem" fontWeight="900" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1} lineClamp={1}>{qb.last_name ?? qb.name}</Text>
              <Text fontSize="0.78rem" fontWeight="800" color={DIM} mt="0.25rem" lineClamp={1}>{qb.name}</Text>
            </Box>
          </Flex>
          <Grid templateColumns="repeat(5, minmax(0, 1fr))" gap="1px" bg={LINE} mt="0.85rem" mx="-0.75rem">
            {[["C/A", l.att != null ? `${l.cmp}/${l.att}` : "—"], ["Yds", l.yds ?? "—"], ["TD", l.td ?? "—"], ["INT", l.int ?? "—"], ["Sk", l.sacks ?? "—"]].map(([k, v]) => (
              <Box key={k} bg={PANEL} py="0.6rem" textAlign="center" minW={0}>
                <Label>{k}</Label>
                <Text fontSize="1.05rem" fontWeight="900" color="white" fontVariantNumeric="tabular-nums" whiteSpace="nowrap" mt="0.2rem">{v}</Text>
              </Box>
            ))}
          </Grid>
          {qb.pass_map?.cells && (
            <Box mt="0.85rem">
              <PassGrid cells={qb.pass_map.cells} color={color} />
            </Box>
          )}
        </Box>
      )}
    </Section>
  );
};

// ── Production leaders ───────────────────────────────────────────────────────
const Leaders = ({ m, refs }) => {
  const [team, setTeam] = useState(m.away.team_id);
  const side = team === m.home.team_id ? m.home : m.away;
  const color = brandOf(side.team_id);
  const max = Math.max(...[...m.away.leaders, ...m.home.leaders].map((p) => p.production), 1);
  return (
    <Section id="leaders" refs={refs} title="Production leaders">
      <TeamSwitch m={m} value={team} onChange={setTeam} />
      {side.leaders.map((p, i) => (
        <Grid key={p.person_id} templateColumns="1.2rem 2.8rem minmax(0, 1fr)" alignItems="center" gap="0.6rem" px="0.75rem" py="0.6rem" borderTop={i ? "1px solid" : "none"} borderColor={LINE}>
          <Text fontSize="0.9rem" fontWeight="900" fontStyle="italic" color={i === 0 ? color : DIM}>{i + 1}</Text>
          <Box w="2.8rem" h="2.8rem" borderRadius="0.5rem" overflow="hidden" bg="whiteAlpha.100">
            {p.image_url ? <Image src={p.image_url} alt="" w="full" h="full" objectFit="cover" objectPosition="top center" /> : null}
          </Box>
          <Box minW={0}>
            <Flex align="baseline" justify="space-between" gap="0.5rem">
              <Flex align="baseline" gap="0.4rem" minW={0}>
                <Text fontSize="1rem" fontWeight="900" color="white" textTransform="uppercase" lineClamp={1}>{p.last_name}</Text>
                <Label flexShrink={0}>{p.position}</Label>
              </Flex>
              <Text fontSize="1rem" fontWeight="900" color="white" fontVariantNumeric="tabular-nums" flexShrink={0}>{p.production.toFixed(1)}</Text>
            </Flex>
            <Box h="0.35rem" mt="0.3rem" bg="whiteAlpha.100" overflow="hidden">
              <Box h="full" bg={color} style={{ width: `${(p.production / max) * 100}%` }} />
            </Box>
            <Flex gap="0.85rem" mt="0.35rem" wrap="wrap">
              {(p.stats ?? []).map((st) => (
                <Flex key={st.label} align="baseline" gap="0.25rem">
                  <Text fontSize="0.85rem" fontWeight="900" color="white" fontVariantNumeric="tabular-nums">{st.value}</Text>
                  <Label fontSize="0.55rem">{st.label}</Label>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Grid>
      ))}
    </Section>
  );
};

// ── Page body ────────────────────────────────────────────────────────────────
export const GamePreviewScoutMobile = ({ m, history = null }) => {
  const parts = [
    { id: "tape", label: "Tale of the tape" },
    { id: "units", label: "Unit matchups" },
    { id: "qb", label: "Quarterbacks" },
    { id: "leaders", label: "Production leaders" },
    ...(history ? [{ id: "history", label: "History" }] : []),
  ];
  const { current, refs, jump } = useJumpSections(parts.map((p) => p.id));
  return (
    <Box>
      <Banner m={m} />
      <JumpHeader m={m} parts={parts} current={current} onJump={jump} />
      <Tape m={m} refs={refs} />
      <Units m={m} refs={refs} />
      <Quarterbacks m={m} refs={refs} />
      <Leaders m={m} refs={refs} />
      {history && (
        <Box ref={refs.history} data-jump="history" style={{ scrollMarginTop: JUMP_MARGIN }} px="0.75rem" py="0.85rem">
          {history}
        </Box>
      )}
    </Box>
  );
};

export default GamePreviewScoutMobile;
