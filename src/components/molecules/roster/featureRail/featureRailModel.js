

export const isLightColor = (hex) => {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
};

const formatHeight = (height) => {
  const inches = Number(height);
  if (!Number.isFinite(inches) || inches <= 0) return "--";
  return `${Math.floor(inches / 12)}'${inches % 12}`;
};

const toTitle = (value) =>
  String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const nameFromImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  return toTitle(
    decodeURIComponent(String(imageUrl).split("/").pop() || "")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/^\d+[_-]+/, "")
      .replace(/\?.*$/, ""),
  );
};

const getPlayerName = (player) => {
  const direct = player.full_name || [player.first_name, player.last_name].filter(Boolean).join(" ");
  return direct || nameFromImageUrl(player.image_url) || "Featured Player";
};

export const getClassCount = (model, classKey) =>
  model?.composition?.classDistribution?.find((item) => item.class === classKey)?.count ?? 0;

const getPosition = (player) => player.position_abbr || player.position_group || player.position || "--";

const getJersey = (player) => player.jersey_number ?? player.jersey ?? "--";

export const wrapIndex = (index, length) => (index + length) % length;

export const nextIndex = (index, length) => wrapIndex(index + 1, length);

const MAX_PLAYER_SLIDES = 7;

const MAX_SLIDES = 8;

export const buildSlides = ({ players = [], model, primary, secondary }) => {
  const playerSlides = players
    .filter((player) => player.image_url)
    .slice(0, MAX_PLAYER_SLIDES)
    .map((player) => {
      const position = getPosition(player);
      const size = `${formatHeight(player.height)} / ${player.weight ?? "--"}`;
      return {
        type: "player",
        name: getPlayerName(player),
        label: getPlayerName(player),
        jersey: getJersey(player),
        pos: position,
        image: player.image_url,
        stats: [position, size, player.class_year || "--", player.transfer_tier || "Roster"],
        player,
      };
    });

  const deepestRoom = model?.composition?.positionDistribution?.find((item) => item.count > 0);
  const roomSlide = deepestRoom
    ? {
        type: "room",
        name: `${deepestRoom.group} Room`,
        label: `${deepestRoom.group} Room`,
        jersey: deepestRoom.group,
        pos: "Room",
        image: null,
        stats: [`${deepestRoom.count} Players`, `${Math.round(deepestRoom.pct ?? 0)}% Share`, "Deepest Room", "Roster Build"],
        primary,
        secondary,
      }
    : null;

  return [...playerSlides, roomSlide].filter(Boolean).slice(0, MAX_SLIDES);
};

export const DECK = {
  // Desktop's stage is much wider than the compact one, so the same peek
  // left the fan bunched at the left with dead space to its right — it
  // steps out further to use the width available.
  standard: { aspect: 0.76, peek: 56, shrink: 4, drop: 2, inset: 3 },
  compact: { aspect: 0.8, peek: 44, shrink: 4, drop: 2, inset: 2 },
};

export const DECK_CARDS = { standard: 6, compact: 4 };

export const DECK_OPACITY = [1, 0.88, 0.7, 0.52, 0.36, 0.22];
