import { useNavigate } from "react-router-dom";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { useState } from "react";
import { isLightColor, buildSlides, DECK_CARDS, wrapIndex } from "./featureRail/featureRailModel";
import { RosterFeatureRailMobile, RosterFeatureRailCompact, RosterFeatureRailStandard } from "./featureRail/FeatureRailLayouts";

export const RosterFeatureRail = ({ team, model, players = [], variant = "standard", onFullRoster }) => {
  const navigate = useNavigate();
  const { isMobile } = useLayoutDensity();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  if (!team || !model?.hasData) return null;

  const goToPlayer = (slide) => {
    if (!slide?.player) return;
    navigate(`/player/${encodeURIComponent(`${slide.name}__${slide.player.team_id}`)}`, { state: { player: slide.player } });
  };

  const primary = team.colors?.primary ?? "#E53E3E";
  const secondary = team.colors?.secondary ?? "#FFFFFF";
  const secondaryAccent = isLightColor(secondary) ? team.colors?.accent ?? "#111111" : secondary;
  const slides = buildSlides({ players, model, primary, secondary: secondaryAccent });
  const featured = slides[activeIndex] ?? slides[0];
  const deckCards = isMobile ? DECK_CARDS.compact : DECK_CARDS[variant] ?? DECK_CARDS.standard;
  const visibleSlides = slides.map((_, offset) => ({
    slide: slides[wrapIndex(activeIndex + offset, slides.length)],
    offset,
    index: wrapIndex(activeIndex + offset, slides.length),
  })).slice(0, deckCards);
  const sharedProps = {
    team,
    model,
    slides,
    visibleSlides,
    featured,
    activeIndex,
    paused,
    secondaryAccent,
    onFullRoster,
    onSelect: setActiveIndex,
    onTogglePause: () => setPaused((value) => !value),
    onNavigate: goToPlayer,
  };

  return (
    <>
      <style>{`
        @keyframes rosterFeatureProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
      {isMobile
        ? <RosterFeatureRailMobile {...sharedProps} />
        : variant === "compact"
          ? <RosterFeatureRailCompact {...sharedProps} />
          : <RosterFeatureRailStandard {...sharedProps} />}
    </>
  );
};

export default RosterFeatureRail;
