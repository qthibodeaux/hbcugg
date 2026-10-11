import { Box, Flex, Text } from "@chakra-ui/react"

function GameButton({ item, isActive, onClick }) {
    const gameInfo = item?.gameInfo

    const {
        isPlayed = false,
        awayTeam = {
            logo: "",
            abbreviation: "",
            score: null
        },
        homeTeam = {
            logo: "",
            abbreviation: "",
            score: null
        }
    } = gameInfo || {}

    return (
        <Box
            w="100%"
            py={4}
            position="relative"
            overflow="hidden"
            bg="rgba(255, 255, 255, 0.05)"
            borderLeft="3px solid"
            borderLeftColor="brand.500"
        >
            {awayTeam.logo && (
                <Box
                    position="absolute"
                    left="15%"
                    top="50%"
                    transform="translateY(-50%) rotate(-15deg) scale(2)"
                    opacity="0.08"
                    transition="opacity 0.2s"
                    pointerEvents="none"
                    w="12"
                    h="12"
                >
                    <img
                        src={awayTeam.logo}
                        alt=""
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            filter: "grayscale(100%) brightness(150%)"
                        }}
                    />
                </Box>
            )}

            {homeTeam.logo && (
                <Box
                    position="absolute"
                    right="5%"
                    top="50%"
                    transform="translateY(-50%) rotate(15deg) scale(2)"
                    opacity={isActive ? 0.08 : 0.04}
                    transition="opacity 0.2s"
                    pointerEvents="none"
                    w="12"
                    h="12"
                >
                    <img
                        src={homeTeam.logo}
                        alt=""
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            filter: "grayscale(100%) brightness(150%)"
                        }}
                    />
                </Box>
            )}

            <Flex
                align="center"
                justify="center"
                position="relative"
                zIndex={1}
                w="100%"
            >

                <Flex align="center">
                    {awayTeam.logo && (
                        <Box w="5" h="5" display="flex" alignItems="center">
                            <img
                                src={awayTeam.logo}
                                alt={awayTeam.abbreviation}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                        </Box>
                    )}
                    <Text
                        fontSize="md"
                        color="white"
                        fontWeight="extrabold"
                        textTransform="uppercase"
                    >
                        {awayTeam.abbreviation}
                    </Text>


                    {isPlayed && (
                        <Text
                            fontSize="md"
                            color="white"
                            fontWeight="black"
                            ml={1}
                        >
                            {awayTeam.score}
                        </Text>
                    )}
                </Flex>

                <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="text.muted"
                    mx={2}
                    textTransform="uppercase"
                >
                    vs
                </Text>

                <Flex align="center">

                    {isPlayed && (
                        <Text
                            fontSize="md"
                            color="white"
                            fontWeight="black"
                            mr={1}
                        >
                            {homeTeam.score}
                        </Text>
                    )}

                    <Text
                        fontSize="md"
                        color="white"
                        fontWeight="extrabold"
                        textTransform="uppercase"
                    >
                        {homeTeam.abbreviation}
                    </Text>

                    {homeTeam.logo && (
                        <Box w="5" h="5" display="flex" alignItems="center">
                            <img
                                src={homeTeam.logo}
                                alt={homeTeam.abbreviation}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                        </Box>
                    )}
                </Flex>
            </Flex>
        </Box>
    )
}

export default GameButton