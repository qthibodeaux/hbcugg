import { useMemo } from "react";
import { Box, Flex, Image } from "@chakra-ui/react";

// Two rows of roster headshots, each a continuous slow horizontal scroll
// (same CSS-loop technique as the ticker bar above it — duplicate the row's
// content once and animate translateX(0) -> translateX(-50%) so the seam
// never shows).
const STATIC_CSS = `
  @keyframes avatarMarqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
`;

const ROW_DURATION_S = 110;
const MIN_PHOTOS = 8;

const AvatarRow = ({ players }) => {
  const loop = [...players, ...players];
  return (
    <Box flex={1} minH={0} overflow="hidden">
      <Flex
        h="full"
        w="max-content"
        style={{ animation: `avatarMarqueeScroll ${ROW_DURATION_S}s linear infinite` }}
      >
        {loop.map((p, i) => (
          <Box key={i} h="full" aspectRatio="1" flexShrink={0} bg="whiteAlpha.100">
            <Image src={p.image_url} alt={p.last_name || ""} w="full" h="full" objectFit="cover" />
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

// Alternates players into `rowCount` even rows (round-robin) so both rows
// draw from across the whole shuffled roster rather than a front/back split.
const buildRows = (players, rowCount) =>
  Array.from({ length: rowCount }, (_, row) => players.filter((_, i) => i % rowCount === row));

export const PlayerAvatarCollage = ({ players = [], rowCount = 2 }) => {
  const withPhotos = useMemo(() => players.filter((p) => p?.image_url), [players]);
  const shuffled = useMemo(() => [...withPhotos].sort(() => Math.random() - 0.5), [withPhotos]);
  const rows = useMemo(() => buildRows(shuffled, rowCount), [shuffled, rowCount]);

  // Not enough real photos to make a convincing scroll — stay out of the way.
  if (shuffled.length < MIN_PHOTOS) return null;

  return (
    <>
      <style>{STATIC_CSS}</style>
      <Flex direction="column" w="full" h="full" gap="0">
        {rows.map((row, i) => (
          <AvatarRow key={i} players={row} />
        ))}
      </Flex>
    </>
  );
};
