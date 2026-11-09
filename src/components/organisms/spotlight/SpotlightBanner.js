import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { BANNER_PILL_BG, BANNER_STRIP_BG, BannerControlStrip, BannerTitleArea } from "../BannerControls";

// The Team Spotlight banner — the school-page banner (BannerTeamDetail4x1):
// the team's primary sweeping into black, the logo bled off the right corner
// at the standard spec, the mascot as a ghost word, the name as the title.
// No kicker or subtitle on the title tier; "Team of the Week" rides in the
// control strip as a pill.

const Pill = ({ children, accent }) => (
  <Flex align="center" gap="0.4rem" px="0.7rem" h="2rem" bg={BANNER_PILL_BG} border="1px solid" borderColor={accent ?? "whiteAlpha.200"} borderRadius="md">
    {children}
  </Flex>
);
const PillText = ({ children, color = "white" }) => (
  <Text fontSize="0.72rem" fontWeight="900" color={color} textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">{children}</Text>
);

// The strip carries one pill: whose week it is. The numbers live in the KPI
// strip under the banner, as on the team page.
const pills = (spotlight, palette) => {
  const totw = spotlight?.facts?.team_of_the_week ?? {};
  return [{ key: "totw", accent: palette.ink, text: `Team of the Week · ${totw.week_label ?? `Week ${spotlight?.through_week ?? ""}`}`, color: palette.ink }];
};

export const SpotlightBanner = ({ spotlight, palette }) => {
  const team = palette.team;
  const gradient = `linear-gradient(110deg, ${palette.primary} 0%, ${palette.primary}88 25%, #0B0B0D 58%, ${BANNER_STRIP_BG} 100%)`;
  return (
    <Box position="relative" overflow="hidden" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100" h="full" w="full" bg={gradient} display="flex" flexDirection="column">
      {team?.logo && (
        <Image src={team.logo} alt="" position="absolute" right="-38px" top="50%" transform="translateY(-50%)"
          w={{ base: "220px", xl: "300px" }} h={{ base: "220px", xl: "300px" }} objectFit="contain" opacity={0.18} pointerEvents="none" />
      )}
      <Text position="absolute" bottom="-0.9rem" left="0" fontWeight="black" fontStyle="italic" color="white" opacity={0.05} textTransform="uppercase"
        lineHeight={1} letterSpacing="-0.05em" pointerEvents="none" userSelect="none" whiteSpace="nowrap" style={{ fontSize: "clamp(60px, 12vw, 130px)" }}>
        {String(team?.mascot ?? "").toUpperCase()}
      </Text>
      <BannerTitleArea>
        <Text position="relative" zIndex={1} fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.85}
          letterSpacing="-0.04em" whiteSpace="nowrap" fontSize="clamp(2.6rem, 7vw, 7.5rem)">
          {team?.bannerName ?? team?.name ?? ""}
        </Text>
      </BannerTitleArea>
      <BannerControlStrip>
        {pills(spotlight, palette).map((p) => (
          <Pill key={p.key} accent={p.accent}><PillText color={p.color}>{p.text}</PillText></Pill>
        ))}
      </BannerControlStrip>
    </Box>
  );
};

// Mobile: the title tier locked to the nav-bar height (like every mobile
// banner), the pills as a scrolling row under it.
export const SpotlightBannerMobile = ({ spotlight, palette }) => {
  const team = palette.team;
  const gradient = `linear-gradient(110deg, ${palette.primary} 0%, ${palette.primary}88 25%, #0B0B0D 58%, ${BANNER_STRIP_BG} 100%)`;
  return (
    <Box>
      <Box position="relative" overflow="hidden" h="var(--app-header-height)" bg={gradient} display="flex" flexDirection="column">
        <BannerTitleArea>
          <Box position="absolute" right="-1rem" top="50%" style={{ transform: "translateY(-50%)" }} pointerEvents="none">
            {team?.logo && <Image src={team.logo} alt="" w="5.5rem" h="5.5rem" objectFit="contain" style={{ opacity: 0.25 }} />}
          </Box>
          <Text position="relative" zIndex={1} fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.85}
            letterSpacing="-0.04em" whiteSpace="nowrap" fontSize="clamp(2.6rem, 7vw, 7.5rem)">
            {team?.shortName ?? ""}
          </Text>
        </BannerTitleArea>
      </Box>
      <Flex gap="0.4rem" px="0.75rem" py="0.6rem" overflowX="auto" bg={BANNER_STRIP_BG} borderBottom="1px solid" borderColor="whiteAlpha.100" css={{ scrollbarWidth: "none" }}>
        {pills(spotlight, palette).map((p) => (
          <Pill key={p.key} accent={p.accent}><PillText color={p.color}>{p.text}</PillText></Pill>
        ))}
      </Flex>
    </Box>
  );
};
