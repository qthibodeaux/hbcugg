import { Text, Flex, Box, Image, Grid } from "@chakra-ui/react";
import { inkOn, BRAND, P_PANEL, brandOf, STRIP } from "../scoutPresentation";
import { withAlpha, teamLogo, teamName, teamMascot, matchupInks } from "../../../export/exportData";
import { longDate } from "../../../../../utils/gamePreview";

// Full-size scout export frame/header/counting-strip presentation.

export const PKick = ({ children, color = "rgba(var(--gg-fg), 0.55)", size = 11, ...rest }) => (
  <Text fontSize={`${size}px`} fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.15} {...rest}>{children}</Text>
);

export const PChip = ({ rank, color, w = "34px" }) => (
  <Flex align="center" justify="center" minW={w} h="20px" px="4px" borderRadius="4px" bg={rank ? color : "rgba(var(--gg-fg), 0.08)"} flexShrink={0}>
    <Text fontSize="12px" fontWeight="900" color={rank ? inkOn(color) : "var(--gg-ink)"} lineHeight={1}>{rank ? `#${rank}` : "—"}</Text>
  </Flex>
);

export const PBox = ({ title, color = BRAND, right, children, ...rest }) => (
  <Flex direction="column" bg={P_PANEL} minW={0} {...rest}>
    <Flex align="center" justify="space-between" px="12px" h="26px" bg={withAlpha(color, 0.22)} borderTop={`3px solid ${color}`} flexShrink={0}>
      <PKick color="var(--gg-ink)" size={11}>{title}</PKick>
      {right}
    </Flex>
    <Box px="12px" py="8px" flex={1} minH={0}>{children}</Box>
  </Flex>
);

const daysTo = (date) => {
  const d = new Date(`${date}T00:00:00`);
  const n = Math.round((d.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
  return n <= 0 ? "Game day" : `${n} ${n === 1 ? "day" : "days"}`;
};

const PBannerSide = ({ sd, right, fill }) => {
  const ink = inkOn(fill);
  const soft = (a) => (ink === "#FFFFFF" ? `rgba(255,255,255,${a})` : `rgba(11,11,13,${a})`);
  const coaches = [["Head coach", sd.coaches.head_coach], ["Off. coord.", sd.coaches.offensive_coordinator], ["Def. coord.", sd.coaches.defensive_coordinator]];
  return (
    <Box position="relative" overflow="hidden" bg={fill} color={ink} minW={0}>
      <Image src={teamLogo(sd.team_id)} alt="" position="absolute" top="50%" transform="translateY(-50%)" h="300px" opacity={0.14} objectFit="contain"
        filter={ink === "#FFFFFF" ? "grayscale(1) brightness(2.2)" : "grayscale(1) brightness(0.2)"} {...(right ? { right: "-12%" } : { left: "-12%" })} />
      <Flex position="relative" direction="column" justify="center" gap="14px" minW={0} h="full" px="28px" py="18px">
        <Flex align="center" gap="22px" direction={right ? "row-reverse" : "row"} minW={0}>
          <Image src={teamLogo(sd.team_id)} alt="" h="100px" objectFit="contain" flexShrink={0} filter={`drop-shadow(0 3px 8px rgba(0,0,0,0.35))`} />
          <Box minW={0} textAlign={right ? "right" : "left"}>
            <Text fontSize="29px" fontWeight="900" textTransform="uppercase" letterSpacing="0.03em" lineHeight={1}>{teamName(sd.team_id)}</Text>
            <Text fontSize="21px" fontWeight="900" color={soft(0.8)} textTransform="uppercase" letterSpacing="0.05em" lineHeight={1.05} mt="4px">{teamMascot(sd.team_id)}</Text>
            <Flex align="baseline" gap="6px" mt="6px" justify={right ? "flex-end" : "flex-start"}>
              <Text fontSize="15px" fontWeight="900">{sd.conference_record} {String(sd.conference ?? "").toUpperCase()}</Text>
              <Text fontSize="15px" fontWeight="500" color={soft(0.65)}>({sd.record ?? "—"})</Text>
            </Flex>
          </Box>
        </Flex>
        <Grid templateColumns="repeat(3, minmax(0,1fr))" gap="12px" pt="10px" borderTop={`1px solid ${soft(0.25)}`} textAlign={right ? "right" : "left"}>
          {(right ? [...coaches].reverse() : coaches).map(([role, name]) => (
            <Box key={role} minW={0}>
              <PKick size={8} color={soft(0.6)}>{role}</PKick>
              <Text fontSize="12.5px" fontWeight="800" lineHeight={1.15} mt="2px">{name ?? "—"}</Text>
            </Box>
          ))}
        </Grid>
      </Flex>
    </Box>
  );
};

export const PBanner = ({ m }) => {
  const inks = matchupInks(m.away.team_id, m.home.team_id);
  const muted = (a) => `rgba(255,255,255,${a})`;
  return (
    <Grid templateColumns="minmax(0,1fr) 250px minmax(0,1fr)" alignItems="stretch">
      <PBannerSide sd={m.away} fill={inks.away} />
      <Flex direction="column" align="center" justify="center" gap="8px" px="12px" py="14px" bg="#1F1F23" color="white">
        <Box px="16px" py="4px" bg={BRAND} transform="skewX(-10deg)">
          <Text fontSize="10px" fontWeight="900" color="white" letterSpacing="0.1em" transform="skewX(10deg)">PREVIEW</Text>
        </Box>
        <Text fontSize="15px" fontWeight="900" fontStyle="italic" textTransform="uppercase" letterSpacing="0.06em">{daysTo(m.date)}</Text>
        <Text fontSize="14px" fontWeight="900" textTransform="uppercase" whiteSpace="nowrap">{longDate(m.date)}</Text>
        <Text fontSize="10px" fontWeight="700" color={muted(0.6)} textAlign="center" textTransform="uppercase" letterSpacing="0.08em">
          {[m.week_label, m.kickoff_label ?? "Kickoff TBA"].filter(Boolean).join(" · ")}
        </Text>
        <Text fontSize="9px" fontWeight="900" color={muted(0.5)} textAlign="center" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1.3} maxW="220px">{m.venue}</Text>
      </Flex>
      <PBannerSide sd={m.home} right fill={inks.home} />
    </Grid>
  );
};

const stripRows = (label) => {
  const at = label.indexOf(" / ");
  if (at >= 0) return [label.slice(0, at), label.slice(at + 1)];
  const space = label.indexOf(" ");
  return space >= 0 ? [label.slice(0, space), label.slice(space + 1)] : [label];
};

export const PStrip = ({ sd }) => {
  const c = brandOf(sd.team_id);
  return (
    <Grid templateColumns="repeat(5, minmax(0,1fr))" bg={P_PANEL} borderTop={`3px solid ${c}`}>
      {STRIP.map(([k, label], i) => {
        const v = sd.strip[k];
        return (
          <Box key={k} px="12px" py="7px" borderLeft={i ? `1px solid ${withAlpha(c, 0.3)}` : "none"}>
            {/* Always two rows, so the five titles line up: "Off EPA" over "/ play". */}
            <PKick size={10}>
              {stripRows(label).map((row) => <Box as="span" key={row} display="block" whiteSpace="nowrap">{row}</Box>)}
            </PKick>
            <Flex align="center" gap="8px" mt="3px">
              <Text fontSize="22px" fontWeight="900" fontFamily="mono" lineHeight={1}>{v.display}</Text>
              <PChip rank={v.rank} color={c} />
            </Flex>
          </Box>
        );
      })}
    </Grid>
  );
};
