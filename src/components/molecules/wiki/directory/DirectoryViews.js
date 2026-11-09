import { DirectoryShell, DirectoryGrid } from "./DirectoryPrimitives";
import { teams } from "./wikiDirectoryModel";
import { CompactSchoolCard, StandardSchoolCard } from "./SchoolCards";

export const SchoolDirectoryCompact = ({ navigate, target }) => (
  <DirectoryShell variant="compact">
    <DirectoryGrid variant="compact">
      {teams.map((team) => (
        <CompactSchoolCard key={team.id} team={team} navigate={navigate} target={target} />
      ))}
    </DirectoryGrid>
  </DirectoryShell>
);

export const SchoolDirectoryStandard = ({ navigate, target }) => (
  <DirectoryShell variant="standard">
    <DirectoryGrid variant="standard">
      {teams.map((team) => (
        <StandardSchoolCard key={team.id} team={team} navigate={navigate} target={target} />
      ))}
    </DirectoryGrid>
  </DirectoryShell>
);
