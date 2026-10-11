import { Box, Text } from "@chakra-ui/react"


function SidebarButton({ item, isActive }) {
    const isSub = item.isSubItem

    return (
        <Box
            w="100%"
            py={isSub ? 2.5 : 4}
            px={isSub ? 10 : 6}
            bg={isActive ? "rgba(229, 62, 62, 0.15)" : "transparent"}

            borderLeft="3px solid"
            borderLeftColor={isActive ? "brand.500" : "transparent"}

            cursor="pointer"
            transition="all 0.15s ease-in-out"
            _hover={{
                bg: isActive ? "rgba(229, 62, 62, 0.2)" : "whiteAlpha.50",
            }}
        >
            <Text
                fontSize={isSub ? "0.9rem" : "1.15rem"}
                color={isActive ? "white" : (isSub ? "text.secondary" : "white")}
                fontWeight={isSub ? "bold" : "extrabold"}
                textTransform="uppercase"
                lineHeight="none"
            >
                {item.label}
            </Text>
        </Box>
    )
}

export default SidebarButton