import { Box, Flex, Image, Text } from "@chakra-ui/react";

// Shared bits for the Classics & Homecoming cards. Everything sized in cqmin
// so it scales with whichever slot the caller is in.

export const EVENT_CARD_BG = "#141416";
export const EVENT_CARD_BORDER = "1px solid rgba(255,255,255,0.07)";

export const FAMILY_COLOR = {
  classic: "#F6AD55",
  postseason: "#A855F7",
  theme: "#63B3ED",
  homecoming: "#E53E3E",
};

export const familyColorFor = (occ) => (occ.isHomecoming ? FAMILY_COLOR.homecoming : FAMILY_COLOR[occ.family] ?? FAMILY_COLOR.theme);

// Color-out names from the file → swatch. Team-specific tones ("navy",
// "gold") read against the team's own palette where one exists.
export const swatchFor = (color, team) => {
  const c = String(color ?? "").toLowerCase();
  const p = team?.colors?.primary;
  const s = team?.colors?.secondary;
  switch (c) {
    case "white": return "#F4F4F5";
    case "black": return "#0B0B0D";
    case "grey": case "gray": return "#9CA3AF";
    case "pink": return "#F472B6";
    case "red": return "#E53E3E";
    case "blue": return "#3182CE";
    case "navy": return "#1E3A8A";
    case "purple": return "#7C3AED";
    case "green": return "#22C55E";
    case "gold": return "#F6C343";
    case "orange": return "#F97316";
    case "maroon": return "#7F1D1D";
    default: return s ?? p ?? "#F4F4F5";
  }
};

export const SectionEyebrow = ({ children, accent = "brand.500", size = 3.4, right = null }) => (
  <Flex align="center" justify="space-between" gap="2cqmin">
    <Flex align="center" gap="1.5cqmin">
      <Box w={`${size * 0.24}cqmin`} h={`${size * 1.2}cqmin`} bg={accent} />
      <Text fontSize={`${size}cqmin`} fontWeight="black" letterSpacing="0.4em" color="text.muted">
        {children}
      </Text>
    </Flex>
    {right}
  </Flex>
);

export const TeamMark = ({ team, teamId, size = 7 }) =>
  team?.logo ? (
    <Image src={team.logo} alt={team.shortName} w={`${size}cqmin`} h={`${size}cqmin`} objectFit="contain" flexShrink={0} />
  ) : (
    <Flex w={`${size}cqmin`} h={`${size}cqmin`} align="center" justify="center" borderRadius="sm" bg="whiteAlpha.100" flexShrink={0}>
      <Text fontSize={`${size * 0.38}cqmin`} fontWeight="black" color="whiteAlpha.700">
        {String(teamId ?? "?").replace(/^(swac|meac)/, "").slice(0, 4).toUpperCase()}
      </Text>
    </Flex>
  );

export const teamLabel = (side) => side?.team?.shortName ?? String(side?.teamId ?? "").replace(/^(swac|meac)/, "").toUpperCase();

// "HOST vs OPP" for a single-team tag, "A vs B" for a merged classic.
export const matchupLabel = (occ) => {
  if (occ.sides.length >= 2) return occ.sides.map(teamLabel).join(" vs ");
  const host = teamLabel(occ.host);
  if (!occ.opponentName) return host;
  const mark = occ.host?.homeAway === "away" ? "@" : "vs";
  return `${host} ${mark} ${occ.opponentName}`;
};

export const TagChip = ({ label, color, size = 3 }) => (
  <Box px={`${size * 0.6}cqmin`} py={`${size * 0.2}cqmin`} bg={`${color}26`} border="1px solid" borderColor={`${color}66`} borderRadius="sm" flexShrink={0}>
    <Text fontSize={`${size}cqmin`} fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.08em" lineHeight={1.2} whiteSpace="nowrap">
      {label}
    </Text>
  </Box>
);
