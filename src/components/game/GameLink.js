import { forwardRef } from "react";
import { Link } from "react-router-dom";

/**
 * GameLink — wrapper around react-router Link for game navigation.
 * Preserves sidebar context by embedding fromSection in URL state.
 */
export const GameLink = forwardRef(({ gameStem, fromSection = "games", children, ...props }, ref) => {
  const to = `/game/${gameStem}`;
  return (
    <Link
      ref={ref}
      to={to}
      state={{ fromSection }}
      {...props}
    >
      {children}
    </Link>
  );
});

GameLink.displayName = "GameLink";

export default GameLink;
