import React, { useMemo } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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

  return {
    h,
    s: Math.round(s * 100),
    v: Math.round(max * 100),
  };
};

const toWheelPosition = (h, s, v) => {
  const ringPct = clamp(12 + s * 0.36 + v * 0.06, 10, 46);
  const angle = ((h - 90) * Math.PI) / 180;
  return {
    x: 50 + Math.cos(angle) * ringPct,
    y: 50 + Math.sin(angle) * ringPct,
  };
};

const placeTeamsWithoutOverlap = (teams) => {
  const minDistance = 8.8;
  const centerX = 50;
  const centerY = 50;
  const maxRadius = 47;
  const placed = [];

  teams.forEach((team) => {
    let chosen = null;

    for (let step = 0; step < 96; step += 1) {
      const ring = Math.floor(step / 8);
      const local = step % 8;
      const theta = (local / 8) * Math.PI * 2;
      const drift = ring * 1.55;

      const cx = team.x + Math.cos(theta) * drift;
      const cy = team.y + Math.sin(theta) * drift;

      const dxCenter = cx - centerX;
      const dyCenter = cy - centerY;
      const centerDistance = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
      if (centerDistance > maxRadius) continue;

      const collides = placed.some((existing) => {
        const dx = cx - existing.x;
        const dy = cy - existing.y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });

      if (!collides) {
        chosen = { ...team, x: cx, y: cy };
        break;
      }
    }

    placed.push(chosen ?? team);
  });

  return placed;
};

const TeamNameList = ({ items, align = "left" }) => (
  <Flex direction="column" gap={2} minW={{ base: "120px", xl: "160px" }}>
    {items.map((team) => (
      <Text
        key={team.id}
        color={team.primary}
        fontSize={{ base: "xl", md: "2xl", xl: "42px" }}
        fontWeight="black"
        lineHeight={0.95}
        textAlign={align}
        letterSpacing="-0.02em"
        textTransform="capitalize"
      >
        {team.shortName}
      </Text>
    ))}
  </Flex>
);

export const ConferencePrimaryColorWheelA = () => {
  const teams = useMemo(() => {
    const base = Array.isArray(teamsData?.teams) ? teamsData.teams : [];

    const rawTeams = base
      .map((team) => {
        const primary = team?.colors?.primary || "#888888";
        const hsv = hexToHsv(primary);
        const position = toWheelPosition(hsv.h, hsv.s, hsv.v);

        return {
          id: team.id,
          shortName: team.shortName,
          name: team.name,
          logo: team.logo,
          conference: team.conference,
          primary,
          h: hsv.h,
          s: hsv.s,
          v: hsv.v,
          x: position.x,
          y: position.y,
        };
      })
      .sort((a, b) => a.h - b.h || b.s - a.s);

    return placeTeamsWithoutOverlap(rawTeams);
  }, []);

  const splitIndex = Math.ceil(teams.length / 2);
  const left = teams.slice(0, splitIndex);
  const right = teams.slice(splitIndex);
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
        HBCU football primary color map
      </Text>

      <Flex h="full" w="full" direction={{ base: "column", xl: "row" }} align="center" justify="center" gap={{ base: 6, xl: 10 }}>
        <TeamNameList items={left} align={{ base: "left", xl: "left" }} />

        <Box
          w={{ base: "94vw", md: "76vw", xl: "720px" }}
          maxW="720px"
          aspectRatio={1}
          position="relative"
          borderRadius="full"
          bg={`
            radial-gradient(circle, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0) 37%),
            conic-gradient(from -90deg, ${fullSpectrumStops})
          `}
          boxShadow="0 18px 42px rgba(15,23,42,0.2), inset 0 0 0 1px rgba(255,255,255,0.35)"
          overflow="hidden"
        >
          <Box
            position="absolute"
            inset={0}
            bg="repeating-radial-gradient(circle, transparent 0%, transparent 14%, rgba(255,255,255,0.7) 14.3%, transparent 14.8%)"
          />
          <Box
            position="absolute"
            inset={0}
            bg="repeating-conic-gradient(from -90deg, rgba(255,255,255,0.95) 0deg 1deg, transparent 1deg 10deg)"
          />

          <Box
            position="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            w="22%"
            h="22%"
            borderRadius="full"
            bg="rgba(11,11,13,0.84)"
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

          {teams.map((team, index) => (
            <Box
              key={team.id}
              position="absolute"
              left={`${team.x}%`}
              top={`${team.y}%`}
              transform="translate(-50%, -50%)"
              w={{ base: "54px", md: "64px", xl: "74px" }}
              h={{ base: "54px", md: "64px", xl: "74px" }}
              borderRadius="full"
              bg="rgba(255,255,255,0.84)"
              border="2px solid"
              borderColor="rgba(15,23,42,0.3)"
              p={{ base: 1, md: 1.5 }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 6px 16px rgba(15,23,42,0.24)"
              zIndex={3 + (index % 3)}
              title={`${team.name} | ${team.primary} | H:${team.h} S:${team.s} V:${team.v}`}
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
