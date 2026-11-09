import { Micro, Mark, useTileVariant, lastName } from "../LiveTile";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { useState } from "react";
import { teamMeta, withAlpha, teamLogo, teamShort } from "../../../game/export/exportData";

// Home Players tile typography, player photo fallback, identity and stat-line primitives.

export const GOOD = "#22C55E";

export const GOLD = "#5A9F68";

export const INK = "rgba(255,255,255,0.88)";

export const FAINT = "rgba(255,255,255,0.14)";

export const DIM = "rgba(255,255,255,0.45)";

export const PT_CSS = `
  @keyframes ptFlip { 0%, 86% { transform: rotateY(0); } 89%, 97% { transform: rotateY(180deg); } 100% { transform: rotateY(360deg); } }
  .pt-card { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: ptFlip var(--pt-cycle, 30s) ease-in-out infinite; animation-delay: var(--pt-delay, 0s); }
  .pt-side { position: absolute; inset: 0; backface-visibility: hidden; }
  .pt-back { transform: rotateY(180deg); }
  @media (prefers-reduced-motion: reduce) { .pt-card { animation: none; } }
`;

export const Title = ({ children, color = DIM, ...rest }) => <Micro color={color} size={2.6} {...rest}>{children}</Micro>;

export const Svg = ({ w, h, children, ...rest }) => (
  <Box as="svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" w="100%" h="100%" display="block" overflow="visible" {...rest}>
    {children}
  </Box>
);

export const Photo = ({ player, fade = true, ...rest }) => {
  const [broken, setBroken] = useState(false);
  const color = teamMeta(player.team_id)?.colors?.primary ?? "#27272A";
  if (!player.image_url || broken) {
    return (
      <Flex align="center" justify="center" bg={withAlpha(color, 0.55)} {...rest}>
        <Mark logo={teamLogo(player.team_id)} label={teamShort(player.team_id)} size={14} />
      </Flex>
    );
  }
  return (
    <Image
      src={player.image_url}
      alt=""
      objectFit="cover"
      objectPosition="top"
      onError={() => setBroken(true)}
      style={fade ? { maskImage: "linear-gradient(180deg, #000 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(180deg, #000 55%, transparent 100%)" } : undefined}
      {...rest}
    />
  );
};

export const Who = ({ player, size = 7 }) => {
  const mobile = useTileVariant() === "mobile";
  return (
  <Box minW={0}>
    <Flex align="center" gap="1.6cqmin">
      <Mark logo={teamLogo(player.team_id)} label={teamShort(player.team_id)} size={5.5} />
      <Micro size={2.3} color={INK}>{[player.position, teamShort(player.team_id), player.class_year].filter(Boolean).join(" · ")}</Micro>
    </Flex>
    <Text fontSize={`${size}cqmin`} fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.95} letterSpacing="-0.02em" mt="1cqmin" lineClamp={2} textShadow="0 2px 12px rgba(0,0,0,0.7)">
      {mobile ? lastName(player.name) : player.name}
    </Text>
  </Box>
  );
};

export const Line = ({ cells, accent }) => (
  <Flex borderTop="0.4cqmin solid" borderColor={accent}>
    {cells.map((c) => (
      <Box key={c.label} flex={1} py="1.6cqmin" textAlign="center" borderRight="1px solid" borderColor={FAINT} _last={{ borderRight: "none" }} bg="rgba(0,0,0,0.35)">
        <Text fontSize="5.4cqmin" fontWeight="black" fontStyle="italic" color="white" lineHeight={1}>{c.display}</Text>
        <Micro size={2} mt="0.6cqmin">{c.label}</Micro>
      </Box>
    ))}
  </Flex>
);
