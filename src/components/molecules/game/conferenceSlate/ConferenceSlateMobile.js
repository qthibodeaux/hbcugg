import { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson, gameCenterPaths } from "../../../../utils/gameCenterPayloads";
import { getTeamsForView, buildLookup, toMatrixMatchup, logo, TEAM_BY_ID } from "./slateModel";
import { Box, Flex, Text, Spinner, Image } from "@chakra-ui/react";
import { TeamSlateCard } from "./TeamSlateCard";

export const ConferenceSlateMobile = ({ season = 2025 }) => {
  const [conference, setConference] = useState("MEAC");
  const [swacScope, setSwacScope] = useState("WEST");
  const scrollRef = useRef(null);
  const { data, isPending } = useQuery({
    queryKey: ["conference-slate", season],
    queryFn: () => fetchJson(gameCenterPaths.conferenceSlate(season)),
    staleTime: Infinity,
  });
  const teamIds = useMemo(() => getTeamsForView(conference, swacScope, data?.axes), [conference, swacScope, data]);
  const lookup = useMemo(() => buildLookup(data?.matchups?.map(toMatrixMatchup) ?? []), [data]);

  const scrollToTeam = (index) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" px="0.75rem" py="0.6rem" gap="0.5rem" flexWrap="wrap">
        <Box>
          <Text fontSize="0.55rem" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            Conference Slate
          </Text>
          <Text fontSize="1.1rem" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
            {season} Matrix
          </Text>
        </Box>
        <Flex gap="0.35rem">
          {["MEAC", "SWAC"].map((item) => (
            <Box
              key={item}
              as="button"
              type="button"
              px="0.6rem"
              py="0.3rem"
              borderRadius="0"
              bg={conference === item ? "brand.500" : "whiteAlpha.100"}
              onClick={() => {
                setConference(item);
                if (item === "SWAC" && swacScope === "ALL") setSwacScope("WEST");
              }}
            >
              <Text fontSize="0.6rem" color="white" fontWeight="black">{item}</Text>
            </Box>
          ))}
        </Flex>
      </Flex>

      {conference === "SWAC" && (
        <Flex gap="0.3rem" px="0.75rem" pb="0.5rem">
          {["ALL", "WEST", "EAST"].map((item) => (
            <Box
              key={item}
              as="button"
              type="button"
              px="0.55rem"
              py="0.25rem"
              borderRadius="0"
              border="1px solid"
              borderColor="whiteAlpha.200"
              bg={swacScope === item ? "whiteAlpha.300" : "transparent"}
              onClick={() => setSwacScope(item)}
            >
              <Text fontSize="0.6rem" color={swacScope === item ? "white" : "text.muted"} fontWeight="black">{item}</Text>
            </Box>
          ))}
        </Flex>
      )}

      {/* Both strips below are driven off the payload's axes, so until it lands there is
          nothing to draw — the conference toggles above stay live either way. */}
      {isPending ? (
        <Flex minH="14rem" align="center" justify="center">
          <Spinner color="brand.500" size="lg" />
        </Flex>
      ) : (
        <>
          <Flex gap="0.4rem" px="0.75rem" py="0.5rem" overflowX="auto" borderBottom="1px solid" borderColor="whiteAlpha.100">
            {teamIds.map((id, index) => (
              <Box
                key={id}
                as="button"
                type="button"
                flexShrink={0}
                onClick={() => scrollToTeam(index)}
                p="0.3rem"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <Image src={logo(TEAM_BY_ID[id])} alt="" w="1.6rem" h="1.6rem" objectFit="contain" />
              </Box>
            ))}
          </Flex>

          <Flex ref={scrollRef} overflowX="auto" style={{ scrollSnapType: "x mandatory" }}>
            {teamIds.map((id) => (
              <TeamSlateCard key={id} teamId={id} teamIds={teamIds} lookup={lookup} />
            ))}
          </Flex>
        </>
      )}
    </Box>
  );
};
