import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { ENTRIES, fetchGloryTeam, KEYFRAMES } from "./gloryTeam/gloryContent";
import { useQuery } from "@tanstack/react-query";
import { toLocalTeam } from "../../../utils/gameCenterPayloads";
import PageShell from "../../layouts/PageShell";
import { EntryRow, EntryStack } from "./gloryTeam/DictionaryEntry";
import { TeamReveal } from "./gloryTeam/TeamReveal";

// ── Block ─────────────────────────────────────────────────────────────

// One surface shell: the entry and the team banner each get their own. `big` is
// the 4x1 slot, otherwise the stacked layout; `reveal` plays the arrival.
const Surface = ({ big, reveal = false, children }) => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius={big ? "xl" : { base: "0", md: "xl" }}
    border={big ? "1px solid" : { base: "none", md: "1px solid" }}
    borderBottom="1px solid"
    borderColor="whiteAlpha.200"
    bg="#0F0F11"
    h={big ? "100%" : undefined}
    w="100%"
    style={reveal ? { animation: "gloryReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) both" } : undefined}
  >
    {children}
  </Box>
);

const GloryTeamOfWeek = () => {
  // A new word on each load: picked once when the block mounts.
  const [entry] = useState(() => ENTRIES[Math.floor(Math.random() * ENTRIES.length)]);
  const { data } = useQuery({
    queryKey: ["glory-team-of-week"],
    queryFn: fetchGloryTeam,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const teamId = data?.team?.team_id ?? null;
  const team = teamId ? toLocalTeam(teamId) : null;

  return (
    <Box mb={{ base: 0, md: 4 }}>
      <style>{KEYFRAMES}</style>

      <Box display={{ base: "none", lg: "block" }}>
        <PageShell embedded bleed>
          <PageShell.Slot cols={4} radius="xl"><Surface big><EntryRow entry={entry} /></Surface></PageShell.Slot>
          {team ? <PageShell.Slot cols={4} radius="xl"><Surface big reveal><TeamReveal data={data} team={team} big /></Surface></PageShell.Slot> : null}
        </PageShell>
      </Box>
      <Box display={{ base: "block", lg: "none" }}>
        <Surface big={false}><EntryStack entry={entry} /></Surface>
        {team ? <Box mt={4}><Surface big={false} reveal><TeamReveal data={data} team={team} big={false} /></Surface></Box> : null}
      </Box>
    </Box>
  );
};

export default GloryTeamOfWeek;

export { GLORY_TEAM_PATH } from "./gloryTeam/gloryContent";
