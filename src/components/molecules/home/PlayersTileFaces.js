import { Collage, PlayerOfWeek, Breakout } from "./playerFaces/FeaturedFaces";
import { TransferImpact, Freshman } from "./playerFaces/ArrivalFaces";
import { useTileVariant } from "./LiveTile";
import { PLAYER_FACES_MOBILE } from "./PlayersTileFacesMobile";

// ── Registry ─────────────────────────────────────────────────────────────────

export const PLAYER_FACES = {
  collage: Collage,
  player_of_week: PlayerOfWeek,
  breakout: Breakout,
  transfer_impact: TransferImpact,
  freshman: Freshman,
};

export const playerFacesFor = (payload) => {
  const pool = [...(payload?.items ?? [])];
  return (payload?.rotation ?? [])
    .map((k) => {
      const i = pool.findIndex((x) => x.key === k);
      return i >= 0 ? pool.splice(i, 1)[0] : null;
    })
    .filter((it) => it && PLAYER_FACES[it.key])
    .map((it, n) => <PlayerFace key={`${it.key}-${n}`} item={it} />);
};

// The tile's variant picks the face: mobile tiles get their own versions.
const PlayerFace = ({ item }) => {
  const mobile = useTileVariant() === "mobile";
  const Face = (mobile && PLAYER_FACES_MOBILE[item.key]) || PLAYER_FACES[item.key];
  return <Face item={item} />;
};
