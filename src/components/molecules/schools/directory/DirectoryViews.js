// Featured players/coaches come from Schools Hub. Missing data keeps logo frames only.
import { DirectoryShell, DirectoryGrid } from "./DirectoryPrimitives";
import { teams, v5Id } from "./directoryModel";
import { CompactSchoolCard } from "./CompactSchoolCard";
import { useSchoolsHub } from "../../../../hooks/useSchoolsHub";
import { StandardSchoolCard } from "./StandardSchoolCard";

export const SchoolDirectoryCompact = ({ navigate, target }) => (
  <DirectoryShell variant="compact">
    <DirectoryGrid variant="compact">
      {teams.map((team) => (
        <CompactSchoolCard key={team.id} team={team} navigate={navigate} target={target} />
      ))}
    </DirectoryGrid>
  </DirectoryShell>
);

export const SchoolDirectoryStandard = ({ navigate, target }) => {
  const { hub } = useSchoolsHub();
  const topPlayersByTeamId = hub?.topPlayersByTeamId ?? {};
  const headCoachesByTeamId = hub?.headCoachByTeamId ?? {};

  return (
    <DirectoryShell variant="standard">
      <DirectoryGrid variant="standard">
        {teams.map((team) => (
          <StandardSchoolCard
            key={team.id}
            team={team}
            navigate={navigate}
            target={target}
            topPlayers={topPlayersByTeamId[v5Id(team)]}
            headCoach={headCoachesByTeamId[v5Id(team)]}
          />
        ))}
      </DirectoryGrid>
    </DirectoryShell>
  );
};
