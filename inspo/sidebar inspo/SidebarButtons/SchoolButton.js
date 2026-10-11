import { Box, Flex, Text } from "@chakra-ui/react"

function SchoolButton({ hubInfo, onClick }) {
    const { title, division, logoUrl, colors } = hubInfo

    const primaryColor = colors?.[0] || "#E53E3E"
    const secondaryColor = colors?.[1] || "##FFFFFF"

    return (
        <Flex
            w="100%"
            align="center"
            gap={3}
            p={4}
            bg={primaryColor}
            cursor="pointer"
            onClick={onClick}
        >
            {logoUrl && (
                <Box
                    w="11"
                    h="11"
                    minW="10"
                    alignItems="center"
                    justifyContent="center"
                    bg="white"
                    p={1.5}
                    borderRadius="lg"
                    boxShdow="sm"
                >
                    <img
                        src={logoUrl}
                        alt={`${title} logo`}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
                        }}
                    />

                </Box>
            )}

            <Flex
                align="start"
                gap={0.5}
                direction="column"

            >
                <Text
                    color={secondaryColor}
                    fontWeight="black"
                    fontSize="1.3rem"
                    letterSpacing="tight"
                    lineHeight="shorter"
                    textWrap="nowrap"
                >
                    {title}
                </Text>
                <Text
                    color="white"
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="wider"
                    opacity={0.8}
                >
                    {division}
                </Text>
            </Flex>
        </Flex>
    )
}

export default SchoolButton