import { useState } from "react";
import { Box, Flex, HStack, Image, Text } from "@chakra-ui/react";
import { FAMILY_COLOR } from "./EventPrimitives";

// 2x2 slot — the wiki RivalryCard's collision layout, over the named
// classics. Rotates with the dot strip. Every number is a count off
// event_instances.json (editions, seasons, venue); series records wait on
// the game-file join and are not shown.
//
// The slot is two row units on a side, so every cqmin value here is half a
// 1x1's.

const Stat = ({ label, value, accent }) => (
  <Box minW={0}>
    <Text fontSize="1.7cqmin" fontWeight="black" color="rgba(255,255,255,0.4)" letterSpacing="0.3em" lineHeight={1.2}>
      {label}
    </Text>
    <Text fontSize="3.6cqmin" fontWeight="black" color={accent ?? "#F4F4F5"} lineHeight={1.15} lineClamp={1}>
      {value}
    </Text>
  </Box>
);

const Mark = ({ team, teamId, side }) => {
  const label = team?.shortName ?? String(teamId ?? "").replace(/^(swac|meac)/, "").toUpperCase();
  return (
    <Flex direction="column" align="center" gap="1.5cqmin" minW={0} flex={1}>
      {team?.logo ? (
        <Image src={team.logo} alt={label} w="18cqmin" h="18cqmin" objectFit="contain" />
      ) : (
        <Flex w="18cqmin" h="18cqmin" align="center" justify="center" borderRadius="md" bg="whiteAlpha.100">
          <Text fontSize="5cqmin" fontWeight="black" color="whiteAlpha.700">{label}</Text>
        </Flex>
      )}
      <Text fontSize="3.2cqmin" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em" textAlign={side} lineClamp={1}>
        {team?.name ?? label}
      </Text>
    </Flex>
  );
};

export const ClassicsFeatureCard = ({ classics }) => {
  const [idx, setIdx] = useState(0);
  const list = classics.filter((c) => c.editionCount >= 3);
  const c = list[idx] ?? list[0] ?? null;

  if (!c) {
    return (
      <Box h="100%" w="100%" bg="#0a0014" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="xs" fontWeight="black" letterSpacing="0.4em" color="whiteAlpha.400">NO CLASSIC DATA</Text>
      </Box>
    );
  }

  const [a, b] = c.teams;
  const primaryA = a?.team?.colors?.primary ?? "#E53E3E";
  const primaryB = b?.team?.colors?.primary ?? "#2D3748";
  const familyColor = FAMILY_COLOR[c.family] ?? FAMILY_COLOR.classic;
  const dots = list.slice(0, 12);

  return (
    <Box
      h="100%"
      w="100%"
      containerType="size"
      bg="#0a0a0f"
      borderRadius="xl"
      border="1px solid rgba(255,255,255,0.07)"
      position="relative"
      overflow="hidden"
    >
      {/* team-color wash + big faded logos */}
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${primaryA}55 0%, transparent 45%, transparent 55%, ${primaryB}55 100%)`} />
      {a?.team?.logo && (
        <Image src={a.team.logo} alt="" position="absolute" left="-8%" top="50%" transform="translateY(-50%)" h="80%" w="auto" objectFit="contain" opacity={0.1} filter="grayscale(1) brightness(2)" pointerEvents="none" />
      )}
      {b?.team?.logo && (
        <Image src={b.team.logo} alt="" position="absolute" right="-8%" top="50%" transform="translateY(-50%)" h="80%" w="auto" objectFit="contain" opacity={0.1} filter="grayscale(1) brightness(2)" pointerEvents="none" />
      )}
      <Box position="absolute" inset={0} bg="radial-gradient(ellipse at center, rgba(10,10,15,0.7) 0%, rgba(10,10,15,0.15) 100%)" />

      <Flex direction="column" h="full" p="3.5cqmin" justify="space-between" position="relative" zIndex={2}>
        {/* top: eyebrow + dots */}
        <HStack justify="space-between" align="center">
          <Flex align="center" gap="1cqmin">
            <Box w="0.4cqmin" h="2.2cqmin" bg={familyColor} />
            <Text fontSize="1.8cqmin" fontWeight="black" letterSpacing="0.4em" color={familyColor}>
              {c.family === "postseason" ? "POSTSEASON" : "THE CLASSICS"}
            </Text>
          </Flex>
          <HStack gap="0.6cqmin">
            {dots.map((d, i) => (
              <Box
                key={d.typeId}
                as="button"
                onClick={() => setIdx(i)}
                h="0.9cqmin"
                w={i === idx ? "2.8cqmin" : "0.9cqmin"}
                borderRadius="full"
                bg={i === idx ? "white" : "rgba(255,255,255,0.25)"}
                transition="all 0.2s"
                title={d.label}
              />
            ))}
          </HStack>
        </HStack>

        {/* center: name + collision */}
        <Box>
          <Text fontSize="7cqmin" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.03em" lineHeight={0.95} textAlign="center" lineClamp={2}>
            {c.label}
          </Text>
          <Text fontSize="2.2cqmin" fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.14em" textAlign="center" mt="1cqmin" lineClamp={1}>
            {c.venue?.name ?? c.venueName ?? "Venue varies"}{c.venue?.location ? ` · ${c.venue.location}` : ""}
          </Text>
          <Flex align="center" justify="center" gap="4cqmin" mt="3cqmin">
            <Mark team={a?.team} teamId={a?.teamId} side="center" />
            <Text fontSize="5cqmin" fontWeight="black" fontStyle="italic" color="whiteAlpha.500" lineHeight={1}>VS</Text>
            {b ? <Mark team={b.team} teamId={b.teamId} side="center" /> : <Box flex={1} />}
          </Flex>
        </Box>

        {/* bottom: counts */}
        <Flex justify="space-between" gap="3cqmin" pt="2cqmin" borderTop="1px solid rgba(255,255,255,0.1)">
          <Stat label="EDITIONS ON FILE" value={c.editionCount} />
          <Stat label="SEASONS" value={c.firstSeason === c.lastSeason ? c.firstSeason : `${c.firstSeason}–${c.lastSeason}`} />
          <Stat label="NEXT" value={c.next ? c.next.dateLabel : "—"} accent={c.next ? familyColor : undefined} />
          <Stat label="LAST PLAYED" value={c.last ? `${c.last.dateLabel} ${c.last.season}` : "—"} />
        </Flex>
      </Flex>
    </Box>
  );
};

export default ClassicsFeatureCard;
