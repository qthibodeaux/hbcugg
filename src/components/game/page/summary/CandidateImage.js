import { useState } from "react";
import { Image } from "@chakra-ui/react";

// Extracted from GameSummaryTabV2; behavior and visual variants are preserved.

// ═══════════════════════════════════════════════════════════════════════════════
// 5. GAME LEADERS — Head-to-head with editorial player presentation
// ═══════════════════════════════════════════════════════════════════════════════
// Tries each headshot candidate in order and hands off to `fallback` once they're all
// exhausted — so a dead placeholder URL never reads as a broken image.
export const CandidateImage = ({ srcs, fallback, ...imgProps }) => {
  const [attempt, setAttempt] = useState(0);
  const candidates = Array.isArray(srcs) ? srcs : [];
  const current = candidates[attempt] ?? null;
  if (!current) return fallback ?? null;
  return <Image key={current} src={current} onError={() => setAttempt((a) => a + 1)} {...imgProps} />;
};
