import { Box, Text, VStack } from "@chakra-ui/react"
import { Link } from 'react-router-dom'
import { GameButton, HubButton, SchoolButton, SchoolHubSwitcher, SidebarButton } from "../organisms/SidebarButtons/index"


function Sidebar({ navState }) {
    const { hubInfo, items, pathname } = navState

    return (
        <Box
            width="100%"
            minH="100vh"
            bg='bg.secondary'
            borderRight="1px solid"
            borderColor="whiteAlpha.100"
        >
            {hubInfo && (
                hubInfo.type === "school" ? (
                    <SchoolButton
                        hubInfo={hubInfo}
                        onClick={() => { }}
                    />
                ) : (
                    <HubButton
                        hubInfo={hubInfo}

                    />
                )
            )}
            <VStack align="stretch" py={10}>
                {items && items.map((item) => {
                    const isActive = pathname === item.path

                    //Render Grouping
                    if (item.type === 'group') {
                        return (
                            <Box
                                key={item.id}
                                w="100%"
                                pt={6}
                                pb={2}
                                px={6}
                            >
                                <Text
                                    fontSize="1.15rem"
                                    color="white"
                                    fontWeight="extrabold"
                                    textTransform="uppercase"
                                    lineHeight="none"
                                >
                                    {item.label}
                                </Text>
                            </Box>
                        )
                    }

                    //Render Team Switcher
                    if (item.type === 'school-hub-switcher') {
                        return (
                            <SchoolHubSwitcher
                                key={item.id}
                                schoolId={item.schoolId}
                            />
                        )
                    }

                    //Render Game Buttons
                    const isGameItem = item.type === 'game'
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            state={item.state}
                        >
                            {isGameItem
                                ? (
                                    <GameButton
                                        item={item}
                                        isActive={isActive}
                                    />
                                )
                                : (
                                    <SidebarButton
                                        item={item}
                                        isActive={isActive}
                                    />
                                )
                            }
                        </Link>

                    )
                })}
            </VStack>
        </Box>
    )
}

export default Sidebar