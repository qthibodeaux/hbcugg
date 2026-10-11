import { Box, Text } from "@chakra-ui/react";

/**
 * HeroSection - Page hero section with branded styling
 * @param {Object} props
 * @param {string} props.eyebrow - Eyebrow text
 * @param {string} props.title - Main title
 * @param {string} props.subtitle - Subtitle text
 * @param {ReactNode} props.children - Additional content
 */
const HeroSection = ({ eyebrow, title, subtitle, children }) => {
  return (
    <Box
      position="relative"
      pt={12} pb={10}
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bg: "linear-gradient(135deg, rgba(229,62,62,0.06) 0%, transparent 55%)",
        pointerEvents: "none",
      }}
    >
      {eyebrow && (
        <Text
          fontSize="10px"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.2em"
          mb={3}
        >
          {eyebrow}
        </Text>
      )}

      <Box mb={7}>
        <Box lineHeight={0.9} mb={1}>
          <Text
            as="span"
            fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            letterSpacing="-0.02em"
          >
            {title.includes("GRIDIRON") ? (
              <>
                HBCU{" "}
                <Text
                  as="span"
                  fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                  fontWeight="black"
                  color="brand.400"
                  textTransform="uppercase"
                  fontStyle="italic"
                  letterSpacing="-0.02em"
                >
                  GRIDIRON
                </Text>
              </>
            ) : (
              title
            )}
          </Text>
        </Box>
        {subtitle && (
          <Text
            fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            lineHeight={0.9}
            letterSpacing="-0.02em"
          >
            {subtitle}
          </Text>
        )}
      </Box>

      {children}
    </Box>
  );
};

export default HeroSection;
