import { Box, Flex, Grid, Text, Table } from "@chakra-ui/react";
import { Database, BarChart3 } from "lucide-react";
import teamsData from "../../../../data/teams.json";

const TEAM_BY_ANY = teamsData.teams.reduce((acc, team) => {
	const v5Id = team.exportId.replace(/25$/, "");
	acc[String(team.exportId).toLowerCase()] = team.shortName;
	acc[String(v5Id).toLowerCase()] = team.shortName;
	acc[String(team.name).toLowerCase()] = team.shortName;
	acc[String(team.shortName).toLowerCase()] = team.shortName;
	return acc;
}, {});

const resolveTeamLabel = (teamId) => {
	const key = String(teamId ?? "").trim().toLowerCase();
	return TEAM_BY_ANY[key] ?? teamId ?? "Unknown";
};

export const CountingLeaderTables = ({ effectiveYear, topOffenses, completionLeaders }) => (
	<Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
		<Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
			<Flex align="center" gap={2} mb={4}>
				<BarChart3 size={16} color="var(--chakra-colors-brand-500)" />
				<Text fontSize="sm" color="text.primary" fontWeight="bold">Top Offense by Points ({effectiveYear})</Text>
			</Flex>
			<Table.Root size="sm" variant="line">
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeader>Team</Table.ColumnHeader>
						<Table.ColumnHeader textAlign="right">Points</Table.ColumnHeader>
						<Table.ColumnHeader textAlign="right">Plays</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{topOffenses.map((row) => (
						<Table.Row key={`${row.year}_${row.team_id}_pts`}>
							<Table.Cell>{resolveTeamLabel(row.team_id)}</Table.Cell>
							<Table.Cell textAlign="right">{row.points_scored ?? 0}</Table.Cell>
							<Table.Cell textAlign="right">{row.plays_offense ?? 0}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</Box>

		<Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
			<Flex align="center" gap={2} mb={4}>
				<Database size={16} color="var(--chakra-colors-brand-500)" />
				<Text fontSize="sm" color="text.primary" fontWeight="bold">Top Passing Volume ({effectiveYear})</Text>
			</Flex>
			<Table.Root size="sm" variant="line">
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeader>Team</Table.ColumnHeader>
						<Table.ColumnHeader textAlign="right">Completions</Table.ColumnHeader>
						<Table.ColumnHeader textAlign="right">Attempts</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{completionLeaders.map((row) => (
						<Table.Row key={`${row.year}_${row.team_id}_pass`}>
							<Table.Cell>{resolveTeamLabel(row.team_id)}</Table.Cell>
							<Table.Cell textAlign="right">{row.pass_completions ?? 0}</Table.Cell>
							<Table.Cell textAlign="right">{row.pass_attempts ?? 0}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</Box>
	</Grid>
);
