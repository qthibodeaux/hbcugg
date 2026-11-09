import { Flex, Image, Text, Box, Grid } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { X, ChevronDown } from "lucide-react";
import { getTeamColor } from "../../../game/page/utils/teamHelpers";
import { FILTER_GROUPS } from "../../../../utils/playByPlayModel";

// Extracted from the live PlayByPlayPanel; behavior preserved.

const MobileChip = ({ label, checked, onChange, accent = "#A855F7", logo = null }) => (
  <Flex
    as="button"
    type="button"
    onClick={onChange}
    align="center"
    justify="center"
    gap="0.3rem"
    w="full"
    minW={0}
    px="0.3rem"
    py="0.4rem"
    borderRadius="md"
    bg={checked ? `${accent}2E` : "rgba(255,255,255,0.04)"}
    border="1px solid"
    borderColor={checked ? accent : "whiteAlpha.100"}
  >
    {logo ? <Image src={logo} alt="" w="0.95rem" h="0.95rem" objectFit="contain" flexShrink={0} /> : null}
    <Text fontSize="0.64rem" fontWeight="black" color={checked ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.03em" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
      {label}
    </Text>
  </Flex>
);

const MobileColumn = ({ label, children }) => (
  <Flex direction="column" gap="0.3rem" minW={0}>
    <Text fontSize="0.55rem" fontWeight="black" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.1em" whiteSpace="nowrap">{label}</Text>
    {children}
  </Flex>
);

const POSITION_ORDER = ["QB", "RB", "FB", "WR", "TE", "OL", "DL", "DE", "DT", "LB", "DB", "CB", "S", "K", "P", "LS"];

const posRank = (pos) => {
  const i = POSITION_ORDER.indexOf(String(pos ?? "").toUpperCase());
  return i === -1 ? POSITION_ORDER.length : i;
};

const PickerRow = ({ p, onPick }) => (
  <Flex as="button" type="button" onClick={() => onPick(p)} w="full" align="center" gap="0.6rem" px="0.75rem" py="0.55rem" borderBottom="1px solid" borderColor="whiteAlpha.50" textAlign="left">
    <Text w="2.2rem" fontSize="0.62rem" fontWeight="black" color="whiteAlpha.500" flexShrink={0}>{p.position ?? "—"}</Text>
    <Text flex={1} minW={0} fontSize="0.85rem" fontWeight="black" color="white" lineClamp={1}>{p.display}</Text>
    <Text fontSize="0.62rem" fontWeight="900" color="whiteAlpha.400" flexShrink={0}>{p.playCount} plays</Text>
    <Text w="2.6rem" textAlign="right" fontFamily="mono" fontSize="0.8rem" fontWeight="950" color={p.score == null ? "whiteAlpha.300" : "white"} flexShrink={0}>
      {p.score == null ? "—" : p.score.toFixed(1)}
    </Text>
  </Flex>
);

const MobilePlayerPicker = ({ players, selected, onSelect, onClear, awayId, homeId, teamShortFn, teamLogoFn, production }) => {
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState(null);
  const [mode, setMode] = useState("score");

  const roster = useMemo(() => {
    if (!team) return [];
    return players
      .filter((p) => p.team === team)
      .map((p) => {
        const prod = production.get(p.id) ?? null;
        return { ...p, position: prod?.position ?? null, score: typeof prod?.total === "number" ? prod.total : null };
      })
      .sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity) || b.playCount - a.playCount);
  }, [players, team, production]);

  const groups = useMemo(() => {
    if (mode !== "position") return [];
    const map = new Map();
    roster.forEach((p) => {
      const k = p.position ? String(p.position).toUpperCase() : "Other";
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(p);
    });
    return [...map.entries()].sort((a, b) => posRank(a[0]) - posRank(b[0]));
  }, [roster, mode]);

  const pick = (p) => {
    onSelect(p);
    setOpen(false);
  };

  return (
    <Box borderTop="1px solid" borderColor="whiteAlpha.100">
      {selected ? (
        <Flex as="button" type="button" onClick={onClear} w="full" align="center" gap="0.5rem" px="0.75rem" py="0.6rem" bg="rgba(168,85,247,0.18)">
          <Text fontSize="0.62rem" fontWeight="black" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.12em">Player</Text>
          {selected.team && teamLogoFn ? <Image src={teamLogoFn(selected.team)} alt="" w="1rem" h="1rem" objectFit="contain" /> : null}
          <Text flex={1} textAlign="left" fontSize="0.85rem" fontWeight="black" color="white" lineClamp={1}>{selected.display}</Text>
          <X size={14} color="white" />
        </Flex>
      ) : (
        <Flex as="button" type="button" onClick={() => setOpen((v) => !v)} w="full" align="center" gap="0.5rem" px="0.75rem" py="0.6rem" disabled={players.length === 0}>
          <Text fontSize="0.72rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.12em">Player</Text>
          <Text flex={1} textAlign="left" fontSize="0.68rem" fontWeight="900" color="whiteAlpha.500">{players.length ? "Pick a team, then a player" : "No players on file"}</Text>
          <Box transform={open ? "rotate(180deg)" : "none"} transition="transform 0.15s" display="flex"><ChevronDown size={15} color="rgba(255,255,255,0.6)" /></Box>
        </Flex>
      )}

      {open && !selected && (
        <Box borderTop="1px solid" borderColor="whiteAlpha.100">
          <Grid templateColumns="repeat(2, minmax(0, 1fr))">
            {[awayId, homeId].map((id) => {
              const on = id === team;
              return (
                <Flex key={id} as="button" type="button" onClick={() => setTeam(id)} align="center" justify="center" gap="0.45rem" py="0.6rem" bg={on ? "whiteAlpha.100" : "rgba(0,0,0,0.3)"} borderBottom="3px solid" borderColor={on ? getTeamColor(id) : "transparent"}>
                  {teamLogoFn ? <Image src={teamLogoFn(id)} alt="" w="1.3rem" h="1.3rem" objectFit="contain" opacity={on ? 1 : 0.5} /> : null}
                  <Text fontSize="0.85rem" fontWeight="black" color={on ? "white" : "whiteAlpha.500"} textTransform="uppercase">{teamShortFn?.(id) ?? id}</Text>
                </Flex>
              );
            })}
          </Grid>

          {team && (
            <>
              <Flex px="0.75rem" py="0.5rem" gap="0.4rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
                <MobileChip label="By Score" checked={mode === "score"} onChange={() => setMode("score")} />
                <MobileChip label="By Position" checked={mode === "position"} onChange={() => setMode("position")} />
              </Flex>
              <Box maxH="45vh" overflowY="auto">
                {roster.length === 0 ? (
                  <Text px="0.75rem" py="0.8rem" fontSize="0.75rem" color="whiteAlpha.500" fontWeight="black">No players on file</Text>
                ) : mode === "score" ? (
                  roster.map((p) => <PickerRow key={p.id} p={p} onPick={pick} />)
                ) : (
                  groups.map(([pos, list]) => (
                    <Box key={pos}>
                      <Text px="0.75rem" py="0.35rem" bg="rgba(255,255,255,0.04)" fontSize="0.62rem" fontWeight="black" color="whiteAlpha.700" letterSpacing="0.14em">{pos}</Text>
                      {list.map((p) => <PickerRow key={p.id} p={p} onPick={pick} />)}
                    </Box>
                  ))
                )}
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

const MOBILE_LABEL = { specialTeams: "Spec Tms", bigPlays: "Big Plays", scoringPlays: "Scores", scoringDrives: "Scr Drives" };

export const MobileFilterBar = ({ filters, onToggle, awayId, homeId, awayColor, homeColor, players, selectedPlayer, onSelectPlayer, onClearPlayer, teamShortFn, teamLogoFn, production }) => {
  const on = (g, k) => !!filters[g]?.[k];
  return (
    <Box bg="rgba(255,255,255,0.02)" borderBottom="1px solid" borderColor="whiteAlpha.100">
      {/* One row of four columns — each category stacks its options */}
      <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap="0.35rem" px="0.5rem" py="0.6rem" alignItems="start">
        <MobileColumn label="Quarter">
          {FILTER_GROUPS.quarter.options.map((o) => (
            <MobileChip key={o.key} label={o.label} checked={on("quarter", o.key)} onChange={() => onToggle("quarter", o.key)} />
          ))}
        </MobileColumn>
        <MobileColumn label="Team">
          <MobileChip label={teamShortFn?.(awayId) ?? "Away"} logo={teamLogoFn?.(awayId)} checked={on("team", "away")} onChange={() => onToggle("team", "away")} accent={awayColor} />
          <MobileChip label={teamShortFn?.(homeId) ?? "Home"} logo={teamLogoFn?.(homeId)} checked={on("team", "home")} onChange={() => onToggle("team", "home")} accent={homeColor} />
        </MobileColumn>
        <MobileColumn label="Play Type">
          {FILTER_GROUPS.playType.options.map((o) => (
            <MobileChip key={o.key} label={MOBILE_LABEL[o.key] ?? o.label} checked={on("playType", o.key)} onChange={() => onToggle("playType", o.key)} />
          ))}
        </MobileColumn>
        <MobileColumn label="Highlights">
          {FILTER_GROUPS.highlights.options.map((o) => (
            <MobileChip key={o.key} label={MOBILE_LABEL[o.key] ?? o.label} checked={on("highlights", o.key)} onChange={() => onToggle("highlights", o.key)} />
          ))}
        </MobileColumn>
      </Grid>
      <MobilePlayerPicker
        players={players}
        selected={selectedPlayer}
        onSelect={onSelectPlayer}
        onClear={onClearPlayer}
        awayId={awayId}
        homeId={homeId}
        teamShortFn={teamShortFn}
        teamLogoFn={teamLogoFn}
        production={production}
      />
    </Box>
  );
};
