// A changed face restarts the five-second dwell; selecting the same face keeps
// the current deadline. Rotation is mount-managed, and both faces keep their
// existing 700ms transform transition.
import { usePassportRotation } from "../../../../hooks/usePassportRotation";
import { CAROUSEL_CONFS, AUTO_ADVANCE_MS, FLIP_MS } from "./passportModel";
import { Box, Flex, Text } from "@chakra-ui/react";
import { MobilePassportCard } from "./MobilePassport";

export const ConferencePassportCarousel = () => {
  const [activeIndex, setActiveIndex] = usePassportRotation(CAROUSEL_CONFS.length, AUTO_ADVANCE_MS);

  return (
    <Box>
      <Flex gap="0.4rem" mb="0.5rem">
        {CAROUSEL_CONFS.map((conf, index) => {
          const isActive = index === activeIndex;
          return (
            <Box
              key={conf.key}
              as="button"
              type="button"
              onClick={() => setActiveIndex(index)}
              flex="1"
              py="0.4rem"
              border="1px solid"
              borderColor={isActive ? conf.colors.secondary : "whiteAlpha.150"}
              bg={isActive ? `${conf.colors.secondary}22` : "transparent"}
            >
              <Text fontSize="0.7rem" fontWeight="black" color={isActive ? "white" : "whiteAlpha.500"} textTransform="uppercase" letterSpacing="0.06em" textAlign="center">
                {conf.key}
              </Text>
            </Box>
          );
        })}
      </Flex>

      <Box style={{ perspective: "1400px" }}>
        <Box
          position="relative"
          style={{
            transformStyle: "preserve-3d",
            transition: `transform ${FLIP_MS}ms cubic-bezier(0.4, 0.2, 0.2, 1)`,
            transform: activeIndex === 1 ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <Box style={{ backfaceVisibility: "hidden" }}>
            <MobilePassportCard conf={CAROUSEL_CONFS[0]} />
          </Box>
          <Box position="absolute" inset={0} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <MobilePassportCard conf={CAROUSEL_CONFS[1]} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
