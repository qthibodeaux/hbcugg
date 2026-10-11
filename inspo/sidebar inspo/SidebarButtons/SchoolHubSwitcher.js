import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Box, Grid, Flex, Text, IconButton } from "@chakra-ui/react"
import { LayoutGrid, List } from "lucide-react"
import teamsData from "../../../utils/teams.json"
import SidebarButton from "./SidebarButton"

const animationStyles = `
@keyframes hubGridFadeIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(4px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
@keyframes hubLogoPulse {
    0%, 100% {
        background-color: rgba(255, 255, 255, 0.05);
    }
    50% {
        background-color: rgba(255, 255, 255, 0.15);
    }
}
@keyframes hubSpinner {
    to {
        transform: rotate(360deg);
    }
}
`;

function GridLoad({ team, index, onClick}) {
    const [isLoaded, setIsLoaded] = useState(false)

    return (
        <Box
            w="14"
            h="14"
        >

        </Box>
    )
}

function SchoolHubSwitcher({ schoolId }) {
    const [showGrid, setShowGrid] = useState(false)
    const [isLoadingGrid, setIsLoadingGrid] = useState(false)

    const location = useLocation()
    const { pathname } = location

    const toggleShowGrid = () => {
        if (!showGrid) {
            setIsLoadingGrid(true)
            setShowGrid(true)
            setTimeout(() => {
                setIsLoadingGrid(false)
            }, 650)
        } else {
            setShowGrid(false)
            setIsLoadingGrid(false)
        }
    }

    const team = teamsData.teams.find(t => t.exportId === schoolId)
    const schoolName = team.mascot

    const SUB_ITEMS = [
        { id: "school-profile", label: "PROFILE", path: `/schools/${schoolId}` },
        { id: "school-schedule", label: "SCHEDULE", path: `/schools/${schoolId}/schedule` },
        { id: "school-roster", label: "ROSTER", path: `/schools/${schoolId}/roster` },
        { id: "school-coaches", label: "COACHES", path: `/schools/${schoolId}/coaches` },
        { id: "school-wiki", label: "SCHOOL WIKI", path: `/schools/${schoolId}/wiki` },
        { id: "school-stats", label: "STATS", path: `/schools/${schoolId}/stats` }
    ]

    const sortedTeams = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name))


    return (
        <VStack
            align="stretch"
            w="100%"
            borderTop="1px solid"
            borderTopColor="whiteAlpha.100"
        >
            <Flex
                justify="space-between"
                py={2}
                px={6}
                w="100%"
                bg={team.colors.primary}
            >
                <Text
                    fontSize="1.15rem"
                    color="white"
                    fontWeight="extrabold"
                    lineHeight="none"
                    py={2}
                >
                    {schoolName.toUpperCase()} HUB
                </Text>
                <IconButton
                    onClick={toggleShowGrid}
                    aria-label="Toggle Team Switcher Grid"
                >
                    {showGrid ? <List size={16} /> : <LayoutGrid size={16} />}
                </IconButton>
            </Flex>

            {showGrid
                ? (
                    <Grid
                        templateColumns="repeat(3, 1fr)"
                        gap={1}
                        p={4}
                        w="100%"
                        justifyItems="center"
                    >
                        {sortedTeams.map((t) => (
                            <Link
                                key={t.id}
                                to={`/schools/${t.exportId}`}
                                onClick={() => setShowGrid(false)}
                            >
                                <Box
                                    w="14"
                                    h="14"
                                    borderRadius="md"
                                    p={1}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    boxShadow="sm"
                                >
                                    <img
                                        src={t.logo}
                                        alt={t.name}
                                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                    />
                                </Box>
                            </Link>
                        ))}
                    </Grid>
                )
                : (
                    <VStack
                        w="100%"
                    >
                        {SUB_ITEMS.map((subItem) => {
                            const isActive = pathname === subItem.path
                            return (
                                <Link key={subItem.id} to={subItem.path}>
                                    <SidebarButton
                                        item={{ ...subItem, isSubItem: true }}
                                        isActive={isActive}
                                    />
                                </Link>
                            )
                        })}
                    </VStack>
                )
            }
        </VStack >
    )
}

function VStack({ children, ...props }) {
    return (
        <Flex
            direction="column"
            {...props}
        >
            {children}
        </Flex>
    )
}

export default SchoolHubSwitcher