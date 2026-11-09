import { useJumpSections } from "../page/mobile/useJumpSections";
import { Box } from "@chakra-ui/react";
import { Banner, JumpHeader } from "./mobile/ScoutChrome";
import { Tape } from "./mobile/ScoutTape";
import { Units } from "./mobile/ScoutUnits";
import { Quarterbacks, Leaders } from "./mobile/ScoutPersonnel";
import { JUMP_MARGIN } from "./mobile/scoutMobilePresentation";

// ── Page body ────────────────────────────────────────────────────────────────
export const GamePreviewScoutMobile = ({ m, history = null }) => {
  const parts = [
    { id: "tape", label: "Tale of the tape" },
    { id: "units", label: "Unit matchups" },
    { id: "qb", label: "Quarterbacks" },
    { id: "leaders", label: "Production leaders" },
    ...(history ? [{ id: "history", label: "History" }] : []),
  ];
  const { current, refs, jump } = useJumpSections(parts.map((p) => p.id));
  return (
    <Box>
      <Banner m={m} />
      <JumpHeader m={m} parts={parts} current={current} onJump={jump} />
      <Tape m={m} refs={refs} />
      <Units m={m} refs={refs} />
      <Quarterbacks m={m} refs={refs} />
      <Leaders m={m} refs={refs} />
      {history && (
        <Box ref={refs.history} data-jump="history" style={{ scrollMarginTop: JUMP_MARGIN }} px="0.75rem" py="0.85rem">
          {history}
        </Box>
      )}
    </Box>
  );
};

export default GamePreviewScoutMobile;
