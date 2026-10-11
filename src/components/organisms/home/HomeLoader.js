import { useMemo, useState } from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import teamsData from "../../../data/teams.json";

/**
 * HomeLoader
 *
 * PHILOSOPHY:
 *   Purpose: First-visit intro. HBCU / GRIDIRON / GLORY centered, all 18 logos
 *   framed around it on plain black. It covers the home page while the hero's
 *   data loads, then disappears and the page underneath is the new state.
 *   Overlay only — it never moves the page layout.
 *
 * BEHAVIOR:
 *   - Plays once per browser session (sessionStorage flag, set when it ends).
 *   - Leaves when BOTH the data is ready (`ready`) and a minimum hold has
 *     elapsed. The hold is a CSS animation, not a timer — no useEffect.
 *   - Click or any key sends the visitor straight to the Game Center.
 *   - Frame: SWAC across the top and bottom (6 + 6), MEAC down the sides (3 + 3).
 *
 * CONTENT TIERS:
 *   Essential: wordmark, 18 logos. Nothing else — no hint text, no tiles.
 *
 * SIZING:
 *   Grid tracks are fr units; logos fill 78% of their cell; the wordmark scales
 *   off the smaller of viewport width and height. No fixed px.
 */

const SEEN_KEY = "hbcugg-home-intro-seen";
const HOLD_MS = 2200;
const FADE_MS = 450;

const readSeen = () => {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

const markSeen = () => {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // storage blocked — the intro simply plays again next visit
  }
};

const KEYFRAMES = `
  @keyframes hbHomeLoaderHold { from { opacity: 0.999; } to { opacity: 1; } }
  @keyframes hbHomeLoaderOut { from { opacity: 1; } to { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .hb-home-loader-out { animation-duration: 1ms !important; }
  }
`;

const byExportId = (a, b) => a.exportId.localeCompare(b.exportId);

const LogoCell = ({ team, column, row }) => (
  <Box gridColumn={column} gridRow={row} display="flex" alignItems="center" justifyContent="center" minW={0} minH={0}>
    <Image src={team.logo} alt={team.name} maxW="78%" maxH="78%" objectFit="contain" />
  </Box>
);

const wordStyle = {
  fontWeight: 900,
  fontStyle: "italic",
  textTransform: "uppercase",
  letterSpacing: "-0.05em",
  lineHeight: 0.86,
  fontSize: "clamp(3rem, min(11vw, 17vh), 11rem)",
};

const HomeLoader = ({ ready }) => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(() => !readSeen());
  const [holdDone, setHoldDone] = useState(false);

  const frame = useMemo(() => {
    const teams = teamsData.teams;
    const swac = teams.filter((t) => t.conference === "SWAC").sort(byExportId);
    const meac = teams.filter((t) => t.conference === "MEAC").sort(byExportId);
    return { top: swac.slice(0, 6), bottom: swac.slice(6, 12), left: meac.slice(0, 3), right: meac.slice(3, 6) };
  }, []);

  if (!mounted) return null;

  const leaving = ready && holdDone;

  const enterGameCenter = () => {
    markSeen();
    navigate("/game-center");
  };

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={2000}
      bg="#0B0B0D"
      cursor="pointer"
      role="button"
      aria-label="Enter the Game Center"
      tabIndex={0}
      autoFocus
      outline="none"
      onClick={enterGameCenter}
      onKeyDown={enterGameCenter}
      className={leaving ? "hb-home-loader-out" : undefined}
      style={leaving ? { animation: `hbHomeLoaderOut ${FADE_MS}ms ease forwards`, pointerEvents: "none" } : undefined}
      onAnimationEnd={(e) => {
        // Only the overlay's own fade-out ends the loader (not the hold marker).
        if (e.target === e.currentTarget && leaving) {
          markSeen();
          setMounted(false);
        }
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Minimum hold: an invisible element whose animation end says "long enough". */}
      <Box w={0} h={0} overflow="hidden" style={{ animation: `hbHomeLoaderHold ${HOLD_MS}ms linear forwards` }} onAnimationEnd={() => setHoldDone(true)} />

      <Box
        w="100%"
        h="100%"
        p="clamp(0.75rem, 2.8vw, 2.5rem)"
        display="grid"
        gridTemplateColumns="repeat(6, minmax(0, 1fr))"
        gridTemplateRows="repeat(5, minmax(0, 1fr))"
        gap="clamp(0.25rem, 1.1vw, 1rem)"
      >
        {frame.top.map((t, i) => <LogoCell key={t.id} team={t} column={i + 1} row={1} />)}
        {frame.left.map((t, i) => <LogoCell key={t.id} team={t} column={1} row={i + 2} />)}

        <Box gridColumn="2 / 6" gridRow="2 / 5" display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" minW={0}>
          <Text {...wordStyle} color="#F4F4F5">HBCU</Text>
          <Text {...wordStyle} color="#A855F7">Gridiron</Text>
          <Text {...wordStyle} color="#F4F4F5">Glory</Text>
        </Box>

        {frame.right.map((t, i) => <LogoCell key={t.id} team={t} column={6} row={i + 2} />)}
        {frame.bottom.map((t, i) => <LogoCell key={t.id} team={t} column={i + 1} row={5} />)}
      </Box>
    </Box>
  );
};

export default HomeLoader;
