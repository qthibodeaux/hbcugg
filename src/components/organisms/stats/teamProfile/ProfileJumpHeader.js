import { useState } from "react";
import { PROFILE_PARTS, JUMP_ACCENT } from "./profilePresentation";
import { Flex, Text, Image, Box } from "@chakra-ui/react";
import { BANNER_STRIP_BG } from "../../BannerControls";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "../../BottomSheet";

export const ProfileJumpHeader = ({ current, onJump, team }) => {
  const [open, setOpen] = useState(false);
  const part = PROFILE_PARTS.find((p) => p.id === current) ?? PROFILE_PARTS[0];
  return (
    <>
      <Flex position="sticky" top="var(--app-header-height)" zIndex={20} align="stretch" justify="space-between" bg={BANNER_STRIP_BG} borderBottom="1px solid" borderColor="whiteAlpha.100" minH="2.6rem">
        <Flex as="button" type="button" onClick={() => setOpen(true)} align="center" gap="0.45rem" pl="0.75rem" pr="1.5rem" minW={0}
          bg={`linear-gradient(110deg, ${JUMP_ACCENT} 0%, ${BANNER_STRIP_BG} 100%)`} borderBottomRightRadius="1.75rem">
          <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.08em" flexShrink={0}>Profile</Text>
          <Text fontSize="0.68rem" fontWeight="black" color="whiteAlpha.600">/</Text>
          <Text fontSize="0.8rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>{part.label}</Text>
          <ChevronDown size={15} color="white" style={{ flexShrink: 0 }} />
        </Flex>
        <Flex align="center" gap="0.4rem" px="0.75rem" flexShrink={0}>
          {team.logo && <Image src={team.logo} alt="" w="1.2rem" h="1.2rem" objectFit="contain" />}
          <Text fontSize="0.78rem" fontWeight="black" color="white" textTransform="uppercase">{team.short}</Text>
        </Flex>
      </Flex>
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Jump to">
        <Flex direction="column" py="0.4rem">
          {PROFILE_PARTS.map((p) => {
            const on = p.id === part.id;
            return (
              <Box key={p.id} as="button" type="button" onClick={() => { setOpen(false); onJump(p.id); }} w="full" textAlign="left" px="1rem" py="0.85rem"
                bg={on ? "whiteAlpha.100" : "transparent"} borderLeft="3px solid" borderColor={on ? JUMP_ACCENT : "transparent"}>
                <Text fontSize="0.85rem" fontWeight="black" color={on ? "white" : "whiteAlpha.700"} textTransform="uppercase" letterSpacing="0.04em">{p.label}</Text>
              </Box>
            );
          })}
        </Flex>
      </BottomSheet>
    </>
  );
};
