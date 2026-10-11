import React, { useMemo } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";

const hexToHsv = (hex) => {
  const raw = String(hex || "").replace("#", "");
  if (raw.length !== 6) {
    return { h: 0, s: 0, v: 0 };
  }

  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }

  h = Math.round((h * 60 + 360) % 360);
  const s = max === 0 ? 0 : delta / max;

  return { h, s: Math.round(s * 100), v: Math.round(max * 100) };
};

// Black/white/gray primaries have no hue (hexToHsv falls back to h=0), which
// would otherwise wrongly stack every black-primary team into the red wedge.
// When the primary is achromatic, position the team by its secondary color's
// hue instead — that's the color that actually reads on the wheel for a
// team like Grambling (black/gold) or UAPB (black/gold).
const ACHROMATIC_SATURATION_THRESHOLD = 12;

const getWheelHue = (colors) => {
  const primary = hexToHsv(colors?.primary);
  if (primary.s >= ACHROMATIC_SATURATION_THRESHOLD) {
    return { ...primary, hex: colors.primary };
  }
  const secondary = hexToHsv(colors?.secondary);
  if (secondary.s >= ACHROMATIC_SATURATION_THRESHOLD) {
    return { ...secondary, hex: colors.secondary };
  }
  return { ...primary, hex: colors?.primary };
};

const wheelPosition = (angleDeg, radiusPct) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: 50 + Math.cos(rad) * radiusPct,
    y: 50 + Math.sin(rad) * radiusPct,
  };
};

// Groups teams whose true hue angle falls within CLUSTER_GAP_DEG of each
// other into a shared wedge, then stacks them at increasing radii instead of
// sweeping overflow around into unrelated (empty) hue territory. Teams keep
// their real hue angle — position never lies about a team's actual color.
const CLUSTER_GAP_DEG = 10;
const STACK_RADII_PCT = [46, 39.5, 33, 26.5];

const clusterAndStack = (teamsWithHue) => {
  const sorted = [...teamsWithHue].sort((a, b) => a.angle - b.angle);
  if (sorted.length === 0) return [];

  const clusters = [];
  sorted.forEach((team) => {
    const current = clusters[clusters.length - 1];
    const prevTeam = current?.items[current.items.length - 1];
    if (current && team.angle - prevTeam.angle <= CLUSTER_GAP_DEG) {
      current.items.push(team);
    } else {
      clusters.push({ items: [team] });
    }
  });

  // Merge the wraparound seam: if the first cluster starts close (mod 360)
  // to where the last cluster ends, they're really one wedge.
  if (clusters.length > 1) {
    const first = clusters[0];
    const last = clusters[clusters.length - 1];
    const wrapGap = first.items[0].angle + 360 - last.items[last.items.length - 1].angle;
    if (wrapGap <= CLUSTER_GAP_DEG) {
      last.items.push(...first.items);
      clusters.shift();
    }
  }

  const placed = [];
  clusters.forEach((cluster) => {
    cluster.items.forEach((team, index) => {
      const radius = STACK_RADII_PCT[index % STACK_RADII_PCT.length];
      // Only if a wedge holds more teams than we have stack rings do we add
      // a small angular nudge (a few degrees) — never enough to cross into
      // a neighboring hue's territory.
      const ringPass = Math.floor(index / STACK_RADII_PCT.length);
      const nudge = ringPass === 0 ? 0 : (index % 2 === 0 ? 1 : -1) * ringPass * 4;
      const angle = team.angle + nudge;
      const pos = wheelPosition(angle, radius);
      placed.push({ ...team, angle, radius, x: pos.x, y: pos.y });
    });
  });

  return placed;
};

const TeamNameList = ({ items, align = "left" }) => (
  <Flex direction="column" gap={2.5} minW={{ base: "110px", xl: "150px" }}>
    {items.map((team) => (
      <Text
        key={team.id}
        color={team.primary}
        fontSize={{ base: "lg", md: "xl", xl: "28px" }}
        fontWeight="black"
        lineHeight={0.95}
        textAlign={align}
        letterSpacing="-0.02em"
      >
        {team.shortName}
      </Text>
    ))}
  </Flex>
);

export const ConferencePrimaryColorWheelB = () => {
  const teams = useMemo(() => {
    const base = Array.isArray(teamsData?.teams) ? teamsData.teams : [];

    const withHue = base.map((team) => {
      const primary = team?.colors?.primary || "#888888";
      const wheelHue = getWheelHue(team?.colors);
      return {
        id: team.id,
        shortName: team.shortName,
        name: team.name,
        logo: team.logo,
        conference: team.conference,
        primary,
        angle: wheelHue.h,
        s: wheelHue.s,
        v: wheelHue.v,
        wheelSourceColor: wheelHue.hex,
      };
    });

    return clusterAndStack(withHue);
  }, []);

  const orderedByAngle = useMemo(() => [...teams].sort((a, b) => a.angle - b.angle), [teams]);
  const left = orderedByAngle.filter((t) => t.x < 50);
  const right = orderedByAngle.filter((t) => t.x >= 50);

  const fullSpectrumStops = useMemo(
    () =>
      Array.from({ length: 72 }, (_, index) => {
        const start = index * 5;
        const end = start + 5;
        return `hsl(${start} 100% 55%) ${start}deg ${end}deg`;
      }).join(", "),
    []
  );

  return (
    <Box
      w="full"
      h="full"
      minH={{ base: "700px", xl: "860px" }}
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(180deg, #F7F7F7 0%, #ECEDEE 100%)"
      p={{ base: 4, md: 6, xl: 8 }}
      position="relative"
      overflow="hidden"
    >
      <Text
        position="absolute"
        top={3}
        right={4}
        fontSize="10px"
        letterSpacing="0.16em"
        textTransform="uppercase"
        fontWeight="black"
        color="rgba(15,23,42,0.6)"
      >
        HBCU football primary color map — clustered by true hue
      </Text>

      <Flex h="full" w="full" direction={{ base: "column", xl: "row" }} align="center" justify="center" gap={{ base: 6, xl: 10 }}>
        <TeamNameList items={left} align={{ base: "left", xl: "left" }} />

        <Box
          w={{ base: "94vw", md: "76vw", xl: "660px" }}
          maxW="660px"
          aspectRatio={1}
          position="relative"
          borderRadius="full"
          bg={`conic-gradient(from -90deg, ${fullSpectrumStops})`}
          boxShadow="0 18px 42px rgba(15,23,42,0.2), inset 0 0 0 1px rgba(255,255,255,0.35)"
          overflow="hidden"
        >
          {/* concentric ring dividers, echoing the reference wheel's radial bands */}
          <Box
            position="absolute"
            inset={0}
            bg="repeating-radial-gradient(circle, transparent 0%, transparent 11%, rgba(255,255,255,0.55) 11.3%, transparent 11.8%)"
          />
          {/* spoke dividers every 15deg */}
          <Box
            position="absolute"
            inset={0}
            bg="repeating-conic-gradient(from -90deg, rgba(255,255,255,0.9) 0deg 0.6deg, transparent 0.6deg 15deg)"
          />
          {/* soft center fade so the wheel doesn't compete with the hub label */}
          <Box position="absolute" inset={0} bg="radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 30%)" />

          <Box
            position="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            w="20%"
            h="20%"
            borderRadius="full"
            bg="rgba(11,11,13,0.86)"
            border="2px solid"
            borderColor="rgba(255,255,255,0.55)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            px={2}
            zIndex={2}
          >
            <Text
              color="white"
              fontSize={{ base: "9px", md: "10px", xl: "12px" }}
              fontWeight="black"
              letterSpacing="0.08em"
              textTransform="uppercase"
              lineHeight={1.1}
            >
              HBCU
              <br />
              Color Wheel
            </Text>
          </Box>

          {teams.map((team) => (
            <Box
              key={team.id}
              position="absolute"
              left={`${team.x}%`}
              top={`${team.y}%`}
              transform="translate(-50%, -50%)"
              w={{ base: "50px", md: "58px", xl: "64px" }}
              h={{ base: "50px", md: "58px", xl: "64px" }}
              borderRadius="full"
              bg="rgba(255,255,255,0.9)"
              border="2px solid"
              borderColor={team.primary}
              p={{ base: 1, md: 1.5 }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 6px 16px rgba(15,23,42,0.24)"
              zIndex={3}
              title={`${team.name} | ${team.primary} | wheel hue from ${team.wheelSourceColor} (${team.angle}°)`}
            >
              <Image src={team.logo} alt={`${team.name} logo`} objectFit="contain" w="100%" h="100%" />
            </Box>
          ))}
        </Box>

        <TeamNameList items={right} align={{ base: "left", xl: "right" }} />
      </Flex>
    </Box>
  );
};
