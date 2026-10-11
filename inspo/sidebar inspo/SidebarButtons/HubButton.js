import { Box, Flex, Text } from "@chakra-ui/react"

function HubButton({ hubInfo, onClick }) {
    const { title, subtitle, logoChar, logoUrl, colors } = hubInfo
    const accentColors = colors || ["#E53E3E", "#E53E3E"]

    return (
        <Flex
            w="100%"
            gap={0}
            direction="column"
        >
            <Flex
                align="center"
                gap={3}
                p={4}
                bg="bg.secondary"
                w="100%"
            >
                {logoUrl ? (
                    <Box
                        w="9"
                        h="9"
                        minW="9"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <img
                            src={logoUrl}
                            alt={`${title} Logo`}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain"
                            }}
                        />
                    </Box>
                ) : (
                    <Flex
                        align="center"
                        justify="center"
                        w="9"
                        h="9"
                        minW="9"
                        bg="brand.500"
                        borderRadius="lg"
                        color="white"
                        fontWeight="black"
                        fontSize="lg"
                        boxShadow="sm"
                    >
                        {logoChar}
                    </Flex>
                )}

                <Flex
                    align="start"
                    gap={0.5}
                    direction="column"
                >
                    <Text
                        color="text.primary"
                        fontWeight="extrabold"
                        fontSize="md"
                        letterSpacing="widest"
                        lineHeight="shorter"
                    >
                        {title}
                    </Text>
                    <Text
                        color="text.muted"
                        fontSize="2xs"
                        fontWeight="bold"
                        letterSpacing="wider"
                    >
                        {subtitle}
                    </Text>
                </Flex>
            </Flex>
            <Flex w="100%" h="3px">
                <Box flex="1" bg={accentColors[0]} />
                <Box flex="1" bg={accentColors[1]} />
            </Flex>
        </Flex>
    )
}

export default HubButton