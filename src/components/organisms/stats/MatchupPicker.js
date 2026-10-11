import { useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "../BottomSheet";

// Local copy of the page's kicker — importing it from TeamAnalyticsTabs would
// close an import cycle, since that file imports this one.
const Kicker = ({ children, color = "text.muted", ...rest }) => (
  <Text fontSize="9px" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.13em" lineClamp={1} {...rest}>
    {children}
  </Text>
);

// ─────────────────────────────────────────────────────────────────────────────
// MATCHUP PICKER
//
// Two grids side by side, one per slot, in the mobile team-schedule tile
// language: 6 columns x 3 rows of square logo tiles with the team's colour as
// a bottom rule, filled with the team's primary when picked. Under each grid,
// a full-width
// LEAGUE AVERAGE bar that drops the 18-team mean into that slot, so any team
// can be measured against the league instead of another team.
//
// The same team can't hold both slots; picking one that's already opposite
// swaps the two rather than refusing the click.
// ─────────────────────────────────────────────────────────────────────────────

export const LEAGUE_ID = "__league";

// Also used by the Glossary tab's pull ladder, which stands the same grid
// up in 3 columns of 6 to pick whose season the ladder is read against.
export const TeamTile = ({ team, active, disabled, onClick }) => (
  <Box
    as="button"
    type="button"
    aria-label={team.name}
    aria-pressed={active}
    onClick={onClick}
    aspectRatio="1"
    minW={0}
    bg={active ? team.primary ?? "whiteAlpha.300" : "rgba(255,255,255,0.05)"}
    border="1px solid"
    borderColor={active ? team.secondary ?? "whiteAlpha.400" : "rgba(255,255,255,0.08)"}
    borderBottomWidth="0.2rem"
    borderBottomColor={team.primary ?? "whiteAlpha.400"}
    display="flex"
    alignItems="center"
    justifyContent="center"
    p="0.35rem"
    opacity={disabled ? 0.35 : 1}
    transition="background 0.15s, border-color 0.15s"
    _hover={{ bg: active ? team.primary ?? "whiteAlpha.300" : "rgba(255,255,255,0.12)" }}
  >
    {team.logo ? (
      <Image src={team.logo} alt="" w="74%" h="74%" objectFit="contain" />
    ) : (
      <Text fontSize="10px" fontWeight="black" color="white">{team.short}</Text>
    )}
  </Box>
);

const Slot = ({ label, teams, value, other, onChange, accent }) => {
  const picked = teams.find((t) => t.id === value) ?? null;
  return (
    <Box flex="1" minW={0}>
      <Flex align="center" justify="space-between" gap={2} mb={2} minW={0}>
        <Kicker color={accent}>{label}</Kicker>
        <Flex align="center" gap={2} minW={0}>
          {picked?.logo && <Image src={picked.logo} alt="" w="16px" h="16px" objectFit="contain" />}
          <Text fontSize="11px" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>
            {picked?.name ?? "—"}
          </Text>
        </Flex>
      </Flex>

      <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap="1px" bg="whiteAlpha.100" borderRadius="md" overflow="hidden">
        {teams.map((t) => (
          <TeamTile key={t.id} team={t} active={t.id === value} disabled={t.id === other} onClick={() => onChange(t.id)} />
        ))}
      </Grid>

      <Box
        as="button"
        type="button"
        w="100%"
        mt="1px"
        py={2.5}
        borderRadius="md"
        bg={value === LEAGUE_ID ? "brand.500" : "whiteAlpha.100"}
        _hover={{ bg: value === LEAGUE_ID ? "brand.500" : "whiteAlpha.200" }}
        onClick={() => onChange(LEAGUE_ID)}
        transition="background 0.15s"
      >
        <Text fontSize="0.62rem" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em" color={value === LEAGUE_ID ? "white" : "whiteAlpha.600"}>
          League Average · 18
        </Text>
      </Box>
    </Box>
  );
};

// ── Mobile: one face-off bar, the wall in a sheet ────────────────────────────
// Each half is a slot: logo + short name, washed in the team's colour. Tap a
// half and the sheet opens on the 6 x 3 wall plus League Average for it.
const LEAGUE_FACE = { id: LEAGUE_ID, name: "League Average", short: "LEAGUE", logo: null, primary: "#A855F7" };

const FaceHalf = ({ team, side, onClick }) => {
  const color = team?.primary && team.primary !== "#000000" ? team.primary : "#3F3F46";
  const right = side === "b";
  return (
    <Flex as="button" type="button" onClick={onClick} flex={1} minW={0} h="100%" align="center" gap="0.55rem" px="0.7rem"
      direction={right ? "row-reverse" : "row"}
      bg={`linear-gradient(${right ? 250 : 110}deg, ${color}cc 0%, ${color}33 70%, transparent 100%)`}>
      {team?.logo ? (
        <Image src={team.logo} alt="" w="2.6rem" h="2.6rem" objectFit="contain" flexShrink={0} filter="drop-shadow(0 2px 6px rgba(0,0,0,0.6))" />
      ) : (
        <Flex w="2.6rem" h="2.6rem" flexShrink={0} align="center" justify="center" bg="blackAlpha.400">
          <Text fontSize="0.6rem" fontWeight="black" color="white">AVG</Text>
        </Flex>
      )}
      <Flex direction="column" align={right ? "flex-end" : "flex-start"} minW={0}>
        <Text fontSize="1.15rem" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1} letterSpacing="-0.02em" lineClamp={1}>
          {team?.short ?? "—"}
        </Text>
        <ChevronDown size="0.95rem" color="rgba(255,255,255,0.8)" strokeWidth={3} />
      </Flex>
    </Flex>
  );
};

const MobileMatchupPicker = ({ teams, teamA, teamB, pick }) => {
  const [slot, setSlot] = useState(null);
  const faceOf = (id) => (id === LEAGUE_ID ? LEAGUE_FACE : teams.find((t) => t.id === id) ?? null);
  const value = slot === "a" ? teamA : teamB;
  const other = slot === "a" ? teamB : teamA;
  const choose = (id) => { pick(slot)(id); setSlot(null); };
  return (
    <>
      <Flex h="4.5rem" align="stretch" bg="#141416" borderTop="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
        <FaceHalf team={faceOf(teamA)} side="a" onClick={() => setSlot("a")} />
        <Flex align="center" justify="center" px="0.5rem" flexShrink={0}>
          <Text fontSize="1.4rem" fontWeight="black" fontStyle="italic" color="whiteAlpha.500" letterSpacing="-0.04em">VS</Text>
        </Flex>
        <FaceHalf team={faceOf(teamB)} side="b" onClick={() => setSlot("b")} />
      </Flex>

      <BottomSheet isOpen={slot != null} onClose={() => setSlot(null)} title={slot === "a" ? "Team A" : "Team B"}>
        <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap="1px" bg="whiteAlpha.100">
          {teams.map((t) => (
            <TeamTile key={t.id} team={t} active={t.id === value} disabled={t.id === other} onClick={() => choose(t.id)} />
          ))}
        </Grid>
        <Box as="button" type="button" w="100%" py="0.9rem" bg={value === LEAGUE_ID ? "brand.500" : "whiteAlpha.100"} onClick={() => choose(LEAGUE_ID)}>
          <Text fontSize="0.75rem" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" color={value === LEAGUE_ID ? "white" : "whiteAlpha.700"}>
            League Average · 18
          </Text>
        </Box>
      </BottomSheet>
    </>
  );
};

export const MatchupPicker = ({ teams, teamA, teamB, setTeamA, setTeamB, colorA, colorB, mobile = false }) => {
  const pick = (slot) => (next) => {
    const [cur, opp] = slot === "a" ? [teamA, teamB] : [teamB, teamA];
    if (next === opp && next !== LEAGUE_ID) {
      // Picking the other slot's team swaps them rather than refusing.
      if (slot === "a") { setTeamA(next); setTeamB(cur); } else { setTeamB(next); setTeamA(cur); }
      return;
    }
    (slot === "a" ? setTeamA : setTeamB)(next);
  };

  if (mobile) return <MobileMatchupPicker teams={teams} teamA={teamA} teamB={teamB} pick={pick} />;

  return (
    <Flex gap={4} direction={{ base: "column", md: "row" }} align="stretch">
      <Slot label="Team A" teams={teams} value={teamA} other={teamB} onChange={pick("a")} accent={colorA} />
      <Flex align="center" justify="center" px={1} flexShrink={0}>
        <Text fontSize="clamp(1rem, 2vw, 1.6rem)" fontWeight="black" fontStyle="italic" color="whiteAlpha.300" textTransform="uppercase" letterSpacing="-0.02em">
          vs
        </Text>
      </Flex>
      <Slot label="Team B" teams={teams} value={teamB} other={teamA} onChange={pick("b")} accent={colorB} />
    </Flex>
  );
};

export default MatchupPicker;
