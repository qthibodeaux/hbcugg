import { Box, Text, Button, Flex } from "@chakra-ui/react";
import { useTeams } from "../../hooks/useTeams";
import { useNavigate } from "react-router-dom";
import { SchoolDirectoryFusion } from "../../components/molecules/schools/SchoolDirectory";
import { BannerSchools } from "../../components/organisms/test/BannerPages";

const Schools = () => {
	const { data: teams = [] } = useTeams();
	const navigate = useNavigate();

	return (
		<Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">
			<Box px={{ md: "4px", lg: "10px" }} pt={{ md: "4px", lg: "10px" }}>
				<Box h="clamp(160px, 20vw, 260px)"><BannerSchools /></Box>
			</Box>
			<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={8}>

				{/* Team Buttons Row */}
				<Flex wrap="wrap" gap={2} justify="center" mb={8}>
					{[...teams].sort((a, b) => a.name.localeCompare(b.name)).map((team) => (
						<Button
							key={team.id}
							size="sm"
							colorScheme="red"
							variant="outline"
							onClick={() => navigate(`/teams/${team.id}`)}
						>
							{team.shortName}
						</Button>
					))}
				</Flex>

				{/* Placeholder */}
				<Box mb={8} textAlign="center">
					<Text color="text.secondary" fontSize="md">Select a school above or explore the grid below.</Text>
				</Box>

				{/* HBCU Directory — Fusion Banner */}
				<SchoolDirectoryFusion />
			</Box>
		</Box>
	);
};

export default Schools;
