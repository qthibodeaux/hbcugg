import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

// VARIANT 1: Floating text particles with animated gradient - Cascade (2026-04-11 9:06am)
export const WikiBannerSchools = () => {
  const floatingTexts = [
    "HERITAGE",
    "CULTURE",
    "COMMUNITY",
    "EXCELLENCE",
    "TRADITION",
  ];

  return (
    <Box
      bg="linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #15803D 100%)"
      p={{ base: 8, md: 12 }}
      w="100%"
      minH="200px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Floating background text */}
      {floatingTexts.map((text, i) => (
        <Text
          key={i}
          position="absolute"
          fontSize={{ base: "sm", md: "md" }}
          fontWeight="bold"
          color="whiteAlpha.200"
          textTransform="uppercase"
          letterSpacing="0.2em"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `float${i} ${8 + i * 2}s ease-in-out infinite`,
          }}
        >
          {text}
        </Text>
      ))}

      <Flex
        direction="column"
        align="center"
        gap={6}
        textAlign="center"
        position="relative"
        zIndex={1}
      >
        <Text
          fontSize={{ base: "4xl", md: "6xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          letterSpacing="0.1em"
          lineHeight="1"
          style={{ animation: "glow 2s ease-in-out infinite alternate" }}
        >
          Schools
        </Text>

        <Text
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          color="white"
          lineHeight="1.4"
          fontStyle="italic"
        >
          Saturdays With A Culture
        </Text>

        <Box
          as={RouterLink}
          to="/schools"
          bg="white"
          color="#22C55E"
          px={8}
          py={4}
          borderRadius="md"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.1em"
          _hover={{
            bg: "whiteAlpha.900",
            transform: "scale(1.05) translateY(-2px)",
          }}
          transition="all 0.3s"
          cursor="pointer"
          display="inline-block"
          boxShadow="0 4px 20px rgba(0,0,0,0.2)"
        >
          Click here
        </Box>
      </Flex>

      <style>{`
        ${floatingTexts
          .map(
            (_, i) => `
          @keyframes float${i} {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
            25% { transform: translateY(-20px) rotate(5deg); opacity: 0.4; }
            50% { transform: translateY(-10px) rotate(-3deg); opacity: 0.3; }
            75% { transform: translateY(-30px) rotate(2deg); opacity: 0.5; }
          }
        `,
          )
          .join("")}
        @keyframes glow {
          0% { textShadow: 0 0 10px rgba(255,255,255,0.3); }
          100% { textShadow: 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.3); }
        }
      `}</style>
    </Box>
  );
};

// VARIANT 2: Glitch effect with animated scanlines - Cascade (2026-04-11 9:06am)
export const WikiBannerSchoolsDark = () => (
  <Box
    bg="#0B0B0D"
    p={{ base: 8, md: 12 }}
    w="100%"
    minH="200px"
    display="flex"
    alignItems="center"
    justifyContent="center"
    position="relative"
    overflow="hidden"
  >
    {/* Animated scanlines */}
    <Box
      position="absolute"
      inset={0}
      bg="linear-gradient(0deg, transparent 50%, rgba(229,62,62,0.03) 50%)"
      bgSize="100% 4px"
      style={{ animation: "scanlines 8s linear infinite" }}
    />

    {/* Glitch overlay */}
    <Box
      position="absolute"
      inset={0}
      bg="linear-gradient(90deg, transparent, rgba(229,62,62,0.1), transparent)"
      style={{ animation: "glitch 3s ease-in-out infinite" }}
    />

    <Flex
      direction="column"
      align="center"
      gap={6}
      textAlign="center"
      position="relative"
      zIndex={1}
    >
      <Text
        fontSize={{ base: "4xl", md: "6xl" }}
        fontWeight="black"
        color="#E53E3E"
        textTransform="uppercase"
        letterSpacing="0.1em"
        lineHeight="1"
        style={{ animation: "textGlitch 4s ease-in-out infinite" }}
      >
        Schools
      </Text>

      <Text
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="bold"
        color="white"
        lineHeight="1.4"
        style={{ animation: "subtitlePulse 2s ease-in-out infinite alternate" }}
      >
        Saturdays With A Culture
      </Text>

      <Box
        as={RouterLink}
        to="/schools"
        bg="#E53E3E"
        color="white"
        px={8}
        py={4}
        borderRadius="md"
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.1em"
        _hover={{ bg: "#C53030", transform: "scale(1.05) translateY(-2px)" }}
        transition="all 0.3s"
        cursor="pointer"
        display="inline-block"
        boxShadow="0 0 20px rgba(229,62,62,0.4)"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)"
          style={{ animation: "shimmer 3s infinite" }}
        />
        <Text position="relative" zIndex={1}>
          Click here
        </Text>
      </Box>
    </Flex>

    <style>{`
      @keyframes scanlines {
        0% { transform: translateY(0); }
        100% { transform: translateY(10px); }
      }
      @keyframes glitch {
        0%, 100% { opacity: 0; transform: translateX(-100%); }
        50% { opacity: 1; transform: translateX(100%); }
      }
      @keyframes textGlitch {
        0%, 100% { transform: translateX(0); filter: hue-rotate(0deg); }
        20% { transform: translateX(-2px); filter: hue-rotate(90deg); }
        40% { transform: translateX(2px); filter: hue-rotate(180deg); }
        60% { transform: translateX(-1px); filter: hue-rotate(270deg); }
        80% { transform: translateX(1px); filter: hue-rotate(360deg); }
      }
      @keyframes subtitlePulse {
        0% { opacity: 0.8; transform: scale(1); }
        100% { opacity: 1; transform: scale(1.02); }
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </Box>
);

// VARIANT 3: Morphing blob background with parallax text - Cascade (2026-04-11 9:06am)
export const WikiBannerSchoolsSplit = () => (
  <Box
    bg="linear-gradient(135deg, #1E293B 0%, #0F172A 100%)"
    p={{ base: 8, md: 12 }}
    w="100%"
    minH="200px"
    display="flex"
    alignItems="center"
    position="relative"
    overflow="hidden"
  >
    {/* Morphing blobs */}
    <Box
      position="absolute"
      top="20%"
      left="10%"
      w="200px"
      h="200px"
      bg="radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)"
      borderRadius="30% 70% 70% 30% / 30% 30% 70% 70%"
      style={{ animation: "morph1 15s ease-in-out infinite" }}
    />
    <Box
      position="absolute"
      bottom="20%"
      right="10%"
      w="180px"
      h="180px"
      bg="radial-gradient(circle, rgba(229,62,62,0.2) 0%, transparent 70%)"
      borderRadius="60% 40% 30% 70% / 60% 30% 70% 40%"
      style={{ animation: "morph2 18s ease-in-out infinite" }}
    />
    <Box
      position="absolute"
      top="50%"
      left="50%"
      w="150px"
      h="150px"
      bg="radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)"
      borderRadius="40% 60% 60% 40% / 70% 30% 30% 70%"
      style={{ animation: "morph3 12s ease-in-out infinite" }}
    />

    <Flex
      justify="space-between"
      align="center"
      w="100%"
      maxW="1200px"
      mx="auto"
      position="relative"
      zIndex={1}
    >
      <Flex direction="column" gap={4} textAlign="left">
        <Text
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          letterSpacing="0.08em"
          lineHeight="1"
          style={{ animation: "parallaxX 8s ease-in-out infinite" }}
        >
          Schools
        </Text>

        <Text
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="bold"
          color="white"
          lineHeight="1.4"
          maxW="400px"
          style={{ animation: "parallaxY 6s ease-in-out infinite" }}
        >
          Saturdays With A Culture
        </Text>
      </Flex>

      <Box
        as={RouterLink}
        to="/schools"
        bg="linear-gradient(135deg, #22C55E, #16A34A)"
        color="white"
        px={8}
        py={4}
        borderRadius="md"
        fontWeight="black"
        textTransform="uppercase"
        letterSpacing="0.1em"
        _hover={{
          bg: "linear-gradient(135deg, #16A34A, #15803D)",
          transform: "scale(1.05) translateY(-2px)",
          boxShadow: "0 10px 30px rgba(34,197,94,0.3)",
        }}
        transition="all 0.3s"
        cursor="pointer"
        display="inline-block"
        flexShrink={0}
        position="relative"
        overflow="hidden"
        style={{ animation: "buttonFloat 4s ease-in-out infinite" }}
      >
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)"
          style={{ animation: "shimmer 3s infinite" }}
        />
        <Text position="relative" zIndex={1}>
          Click here
        </Text>
      </Box>
    </Flex>

    <style>{`
      @keyframes morph1 {
        0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: rotate(0deg) scale(1); }
        25% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; transform: rotate(90deg) scale(1.1); }
        50% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; transform: rotate(180deg) scale(0.9); }
        75% { border-radius: 30% 70% 70% 30% / 70% 30% 30% 70%; transform: rotate(270deg) scale(1.05); }
      }
      @keyframes morph2 {
        0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translateX(0) translateY(0) scale(1); }
        33% { border-radius: 40% 60% 70% 30% / 30% 70% 40% 60%; transform: translateX(20px) translateY(-10px) scale(1.2); }
        66% { border-radius: 70% 30% 40% 60% / 40% 60% 70% 30%; transform: translateX(-15px) translateY(15px) scale(0.8); }
      }
      @keyframes morph3 {
        0%, 100% { border-radius: 40% 60% 60% 40% / 70% 30% 30% 70%; transform: rotate(0deg) scale(1); }
        50% { border-radius: 60% 40% 40% 60% / 30% 70% 70% 30%; transform: rotate(180deg) scale(1.3); }
      }
      @keyframes parallaxX {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(10px); }
      }
      @keyframes parallaxY {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      @keyframes buttonFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </Box>
);
