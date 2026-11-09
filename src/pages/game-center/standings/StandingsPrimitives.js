import { Image, Flex, Box, Text } from "@chakra-ui/react";
import { logo, teamLabel } from "./standingsData";

// Standings team marks, form/heat display, export frame and matrix controls.

export const TeamLogo = ({ team, size = "1.625rem" }) => (
  <Image src={logo(team)} alt={teamLabel(team)} w={size} h={size} objectFit="contain" />
);

const FORM_BOX_COLOR = { W: "#22C55E", L: "#B91C1C", "-": "#27272A" };

export const FormBoxes = ({ form = "-----" }) => (
  <Flex gap="0.25rem" justify="end">
    {form.split("").map((result, index) => (
      <Box key={index} w="1.25rem" h="2.25rem" borderRadius="0.25rem" bg={FORM_BOX_COLOR[result] ?? FORM_BOX_COLOR["-"]} />
    ))}
  </Flex>
);

export const heatColor = (value) => {
  if (value >= 40) return "linear-gradient(135deg, #0F8F55 0%, #32C77A 100%)";
  if (value >= 25) return "linear-gradient(135deg, #2FA96B 0%, #8AD7AF 100%)";
  if (value >= 12) return "linear-gradient(135deg, #DCEFE5 0%, #94CFAF 100%)";
  if (value > 0) return "linear-gradient(135deg, #DFA19A 0%, #B8473F 100%)";
  return "linear-gradient(135deg, #7B211F 0%, #C6554B 100%)";
};

export const exportName = (kind, group) => `${kind}-${String(group.label ?? group.id).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

const EXPORT_W = "420px";

export const ExportFrame = ({ frameRef, children }) => (
  <Box position="fixed" left="-20000px" top={0} aria-hidden="true" pointerEvents="none">
    <Box ref={frameRef} w={EXPORT_W} bg="var(--gg-bg-primary)" pb="0.6rem">
      {children}
    </Box>
  </Box>
);

export const MatrixControl = ({ active, disabled = false, children, onClick }) => (
  <Box as="button" px={3} py={1.5} borderRadius="full" bg={active ? "brand.500" : "line"} opacity={disabled ? 0.35 : 1} cursor={disabled ? "default" : "pointer"} onClick={disabled ? undefined : onClick}>
    <Text fontSize="9px" color={active ? "white" : "var(--gg-ink)"} fontWeight="black" textTransform="uppercase">
      {children}
    </Text>
  </Box>
);

export const DESTINY_RING = "inset 0 0 0 2px #A855F7";
