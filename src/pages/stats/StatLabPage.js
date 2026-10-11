import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Box,
	Flex,
	Grid,
	Spinner,
	Text,
	Button,
	Table,
} from "@chakra-ui/react";
import { FlaskConical, Database, BarChart3 } from "lucide-react";
import ContentContainer from "../../components/layouts/ContentContainer";
import teamsData from "../../data/teams.json";

const fetchJson = async (path) => {
	const res = await fetch(path);
	if (!res.ok) throw new Error(`Failed to load ${path}`);
	return res.json();
};

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

const StatCard = ({ label, value, accent = "brand.500" }) => (
	<Box
		bg="bg.secondary"
		border="1px solid"
		borderColor="whiteAlpha.100"
		borderRadius="xl"
		p={4}
	>
		<Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="widest" mb={2}>
			{label}
		</Text>
		<Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color={accent} lineHeight={1}>
			{value}
		</Text>
	</Box>
);

const StatLabPage = () => {
	const [selectedYear, setSelectedYear] = useState(2025);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["stat-lab", "counting", "v1"],
		queryFn: async () => {
			const [summary, teamStats, gameStats] = await Promise.all([
				fetchJson("/data/6-stat lab/counting/export_summary.json"),
				fetchJson("/data/6-stat lab/counting/team_stats.json"),
				fetchJson("/data/6-stat lab/counting/game_stats.json"),
			]);
			return { summary, teamStats, gameStats };
		},
		staleTime: Infinity,
		retry: false,
	});

	const years = useMemo(() => {
		const fromSummary = data?.summary?.years_covered ?? [];
		if (fromSummary.length) return [...fromSummary].sort((a, b) => b - a);
		const unique = new Set((data?.teamStats ?? []).map((row) => Number(row.year)).filter(Boolean));
		return [...unique].sort((a, b) => b - a);
	}, [data]);

	const effectiveYear = years.includes(selectedYear) ? selectedYear : (years[0] ?? 2025);

	const filteredTeamStats = useMemo(
		() => (data?.teamStats ?? []).filter((row) => Number(row.year) === Number(effectiveYear)),
		[data, effectiveYear],
	);

	const filteredGameStats = useMemo(
		() => (data?.gameStats ?? []).filter((row) => Number(row.year) === Number(effectiveYear)),
		[data, effectiveYear],
	);

	const topOffenses = useMemo(
		() => [...filteredTeamStats].sort((a, b) => (b.points_scored ?? 0) - (a.points_scored ?? 0)).slice(0, 10),
		[filteredTeamStats],
	);

	const completionLeaders = useMemo(
		() => [...filteredTeamStats].sort((a, b) => (b.pass_completions ?? 0) - (a.pass_completions ?? 0)).slice(0, 10),
		[filteredTeamStats],
	);

	return (
		<Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
			<ContentContainer py={10}>
				<Flex align="center" gap={3} mb={2}>
					<FlaskConical size={18} color="var(--chakra-colors-brand-500)" />
					<Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="widest">
						Counting Model
					</Text>
				</Flex>

				<Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="text.primary" mb={1}>
					Stat Lab
				</Text>
				<Text fontSize="sm" color="text.secondary" mb={8} maxW="780px">
					Counting-only telemetry across play, game, week, season, and team aggregates.
					This v1 release prioritizes seasonal team signal extraction from the new data domain.
				</Text>

				{isLoading && (
					<Flex justify="center" py={16}>
						<Spinner color="brand.500" size="lg" />
					</Flex>
				)}

				{isError && (
					<Box bg="bg.secondary" border="1px solid" borderColor="red.500" borderRadius="lg" p={5}>
						<Text color="red.300" fontWeight="bold" mb={1}>Failed to load Stat Lab exports</Text>
						<Text color="text.muted" fontSize="sm">{String(error?.message ?? "Unknown error")}</Text>
					</Box>
				)}

				{!isLoading && !isError && (
					<>
						<Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4} mb={6}>
							<StatCard label="Years Covered" value={(data?.summary?.years_covered ?? []).join(", ")} accent="orange.300" />
							<StatCard label="Play Rows" value={data?.summary?.play_stats_count ?? 0} />
							<StatCard label="Game Rows" value={data?.summary?.game_stats_count ?? 0} accent="yellow.300" />
							<StatCard label="Team Rows" value={data?.summary?.team_stats_count ?? 0} accent="purple.300" />
						</Grid>

						<Flex gap={2} wrap="wrap" mb={6}>
							{years.map((year) => (
								<Button
									key={year}
									size="sm"
									onClick={() => setSelectedYear(year)}
									bg={Number(year) === Number(effectiveYear) ? "brand.500" : "bg.secondary"}
									color={Number(year) === Number(effectiveYear) ? "white" : "text.secondary"}
									border="1px solid"
									borderColor={Number(year) === Number(effectiveYear) ? "brand.500" : "whiteAlpha.100"}
									_hover={{ bg: Number(year) === Number(effectiveYear) ? "brand.600" : "whiteAlpha.100" }}
								>
									{year}
								</Button>
							))}
						</Flex>

						<Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4} mb={8}>
							<StatCard label="Season" value={effectiveYear} accent="brand.400" />
							<StatCard label="Team Seasons" value={filteredTeamStats.length} accent="green.300" />
							<StatCard label="Team Games" value={filteredGameStats.length} accent="blue.300" />
							<StatCard
								label="Avg Points / Team"
								value={
									filteredTeamStats.length
										? (filteredTeamStats.reduce((sum, row) => sum + (row.points_scored ?? 0), 0) / filteredTeamStats.length).toFixed(1)
										: "0.0"
								}
								accent="orange.300"
							/>
						</Grid>

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
					</>
				)}
			</ContentContainer>
		</Box>
	);
};

export default StatLabPage;
