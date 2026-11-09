import React, { useState, useMemo } from "react";
import { Box, Flex, Grid, GridItem, Text, Input, Button, Container } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Sparkles,
    Send,
    ArrowUpRight,
    RotateCcw,
    User,
    SlidersHorizontal,
    Clock,
    CheckCircle2
} from "lucide-react";
import {
    QUICK_TEST_PROMPTS,
    ACTIVE_CLOCK_PRESETS,
    DEFAULT_ACTIVE_CLOCK
} from "./fauxAiDictionary";
import { parseFauxAiQuery } from "./fauxAiEngine";
import { fetchJson } from "../../../utils/gameCenterPayloads";
import { gameCenterPaths } from "../../../utils/gameCenter/payloadPaths";

const INITIAL_CONVERSATION_TURNS = [
    {
        id: "turn_initial_today",
        rawInput: "Who does Southern play today?",
        timestamp: "12:00:00",
        forceDashboard: false,
        preferredIntentId: null
    },
    {
        id: "turn_initial_classic",
        rawInput: "Who won the Labor Day Classic?",
        timestamp: "12:00:05",
        forceDashboard: false,
        preferredIntentId: null
    }
];

/**
 * Lab Section: HomeFauxChatSection
 * Left Column: Pure, focused Chat Experience with Tiered Response Mode:
 *   - ⚡ QUICK_ANSWER: Instant punchy answer card right in the bubble + 2–3 contextual action pills
 *   - 📊 FULL_DASHBOARD: Broad exploratory query or user-expanded Bento Blueprint
 * Top Bar: Active Clock & Relative Temporal Simulator ("today", "this week", "last week", "next week")
 * Right Column: Pre-Bento Box Output, Tokenizer Response, Fuzzy Matches & Hub Inspector.
 * Purely event-driven & render-derived useMemo state.
 */
function HomeFauxChatSection() {
    const [inputText, setInputText] = useState("");
    const [activeClockId, setActiveClockId] = useState(DEFAULT_ACTIVE_CLOCK.id);
    const [customWeekOverride, setCustomWeekOverride] = useState(null);
    const [turns, setTurns] = useState(INITIAL_CONVERSATION_TURNS);
    const [selectedMsgId, setSelectedMsgId] = useState("turn_initial_classic");
    const [activeInspectorTab, setActiveInspectorTab] = useState("bento"); // "bento" | "tokens" | "matches"

    // Fetch canonical validated 2025 & 2026 Team Schedule payloads + 2025 Players & Coaches via React Query
    const schedule2025Query = useQuery({
        queryKey: ["team-schedules-season", 2025],
        queryFn: () => fetchJson(gameCenterPaths.teamSchedules(2025)),
        staleTime: Infinity
    });

    const schedule2026Query = useQuery({
        queryKey: ["team-schedules-season", 2026],
        queryFn: () => fetchJson(gameCenterPaths.teamSchedules(2026)),
        staleTime: Infinity
    });

    const players2025Query = useQuery({
        queryKey: ["faux-ai-players-2025"],
        queryFn: () => fetchJson("/data/3-players/player_seasons_2025.json"),
        staleTime: Infinity
    });

    const coachesAllQuery = useQuery({
        queryKey: ["coaches-all-years"],
        queryFn: () => fetchJson("/data/4-coaches/coaches_all_years.json"),
        staleTime: Infinity
    });

    const playersList = useMemo(() => {
        const raw = players2025Query.data;
        if (!raw) return [];
        return Array.isArray(raw) ? raw : raw.players || Object.values(raw);
    }, [players2025Query.data]);

    const coachesList = useMemo(() => {
        const raw = coachesAllQuery.data;
        if (!Array.isArray(raw)) return [];
        return raw.filter((c) => String(c?.season) === "2025");
    }, [coachesAllQuery.data]);

    const schedulesBySeason = useMemo(
        () => ({
            2025: schedule2025Query.data || null,
            2026: schedule2026Query.data || null
        }),
        [schedule2025Query.data, schedule2026Query.data]
    );

    const activeClock = useMemo(() => {
        const base = ACTIVE_CLOCK_PRESETS.find((p) => p.id === activeClockId) || DEFAULT_ACTIVE_CLOCK;
        if (customWeekOverride === null) return base;
        return {
            ...base,
            week: customWeekOverride,
            label: `${base.dayLabel} · Custom Wk ${customWeekOverride}`
        };
    }, [activeClockId, customWeekOverride]);

    const messages = useMemo(
        () =>
            turns.map((turn) =>
                parseFauxAiQuery(turn.rawInput, {
                    id: turn.id,
                    timestamp: turn.timestamp,
                    activeClock,
                    schedulesBySeason,
                    players: playersList,
                    coaches: coachesList,
                    forceDashboard: turn.forceDashboard,
                    preferredIntentId: turn.preferredIntentId
                })
            ),
        [turns, activeClock, schedulesBySeason, playersList, coachesList]
    );

    const inspectedResult = messages.find((m) => m.id === selectedMsgId) || messages[messages.length - 1];
    const primarySchool = inspectedResult?.matchedSchools?.[0] || null;
    const accentPrimary = primarySchool?.colors?.primary || "#6D28D9";
    const accentSecondary = primarySchool?.colors?.secondary || "#FFD100";

    const handleSendPrompt = (rawPrompt, forceDashboard = false) => {
        const trimmed = (rawPrompt || "").trim();
        if (!trimmed) return;
        const newId = `turn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const newTurn = {
            id: newId,
            rawInput: trimmed,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            forceDashboard,
            preferredIntentId: null
        };
        setTurns((prev) => [...prev, newTurn]);
        setSelectedMsgId(newId);
        setInputText("");
    };

    const handleExpandToDashboard = (msgId, targetIntentId = null) => {
        setTurns((prev) =>
            prev.map((t) =>
                t.id === msgId
                    ? { ...t, forceDashboard: true, preferredIntentId: targetIntentId || t.preferredIntentId }
                    : t
            )
        );
        setSelectedMsgId(msgId);
        setActiveInspectorTab("bento");
    };

    const handleCollapseToQuickAnswer = (msgId) => {
        setTurns((prev) =>
            prev.map((t) => (t.id === msgId ? { ...t, forceDashboard: false } : t))
        );
        setSelectedMsgId(msgId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSendPrompt(inputText);
    };

    const handleReset = () => {
        setTurns(INITIAL_CONVERSATION_TURNS);
        setSelectedMsgId("turn_initial_classic");
    };

    const handleSelectClockPreset = (presetId) => {
        setActiveClockId(presetId);
        setCustomWeekOverride(null);
    };

    const handleStepWeek = (delta) => {
        const nextWk = Math.max(0, Math.min(15, (activeClock.week ?? 8) + delta));
        setCustomWeekOverride(nextWk);
    };

    return (
        <Box pt="calc(var(--app-header-height, 64px) + 16px)" pb={8} color="text.primary" minH="100vh" bg="bg.primary">
            <Container maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
                {/* =========================================================
                    TOP SIMULATOR BAR: ACTIVE CLOCK & RELATIVE TIME RESOLVER
                   ========================================================= */}
                <Flex
                    mb={4}
                    px={4}
                    py={2.5}
                    borderRadius="xl"
                    bg="#121216"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    gap={3}
                >
                    <Flex align="center" gap={2.5} wrap="wrap">
                        <Flex
                            align="center"
                            gap={1.5}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            bg="rgba(234, 179, 8, 0.14)"
                            border="1px solid rgba(234, 179, 8, 0.35)"
                        >
                            <Clock size={13} color="#FACC15" />
                            <Text fontSize="11px" fontWeight="800" color="#FACC15" letterSpacing="0.06em" textTransform="uppercase">
                                SIMULATED CLOCK
                            </Text>
                        </Flex>

                        <Text fontSize="xs" color="whiteAlpha.800" fontWeight="700">
                            {activeClock.dayLabel} · Season {activeClock.season} · Week {activeClock.week}
                        </Text>
                        {activeClock.label && (
                            <Text fontSize="11px" color="whiteAlpha.500" display={{ base: "none", xl: "inline" }}>
                                ({activeClock.label})
                            </Text>
                        )}
                    </Flex>

                    <Flex align="center" gap={1.5} wrap="wrap">
                        {ACTIVE_CLOCK_PRESETS.map((preset) => {
                            const isSelected = preset.id === activeClockId && customWeekOverride === null;
                            return (
                                <Box
                                    as="button"
                                    type="button"
                                    key={preset.id}
                                    onClick={() => handleSelectClockPreset(preset.id)}
                                    px={2.5}
                                    py={1}
                                    borderRadius="md"
                                    fontSize="11px"
                                    fontWeight={isSelected ? "800" : "600"}
                                    bg={isSelected ? accentSecondary : "#1A1A20"}
                                    color={isSelected ? "#0B0B0D" : "whiteAlpha.700"}
                                    border="1px solid"
                                    borderColor={isSelected ? accentSecondary : "whiteAlpha.200"}
                                    _hover={{ borderColor: accentSecondary, color: isSelected ? "#0B0B0D" : "white" }}
                                >
                                    {preset.shortLabel || preset.label}
                                </Box>
                            );
                        })}

                        {/* Quick Week Stepper */}
                        <Flex
                            align="center"
                            gap={1}
                            ml={1}
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            bg="#0B0B0D"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                        >
                            <Box
                                as="button"
                                type="button"
                                onClick={() => handleStepWeek(-1)}
                                px={1.5}
                                fontSize="xs"
                                fontWeight="800"
                                color="whiteAlpha.700"
                                _hover={{ color: "white" }}
                            >
                                −
                            </Box>
                            <Text fontSize="11px" fontFamily="mono" fontWeight="700" color={accentSecondary}>
                                Wk {activeClock.week}
                            </Text>
                            <Box
                                as="button"
                                type="button"
                                onClick={() => handleStepWeek(1)}
                                px={1.5}
                                fontSize="xs"
                                fontWeight="800"
                                color="whiteAlpha.700"
                                _hover={{ color: "white" }}
                            >
                                +
                            </Box>
                        </Flex>
                    </Flex>
                </Flex>

                <Grid
                    templateColumns={{ base: "1fr", lg: "minmax(400px, 520px) 1fr" }}
                    gap={6}
                    alignItems="start"
                >
                    {/* =========================================================
                        LEFT COLUMN: DEDICATED CHAT EXPERIENCE
                       ========================================================= */}
                    <GridItem
                        bg="#121215"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        borderRadius="2xl"
                        overflow="hidden"
                        display="flex"
                        flexDirection="column"
                        h={{ base: "auto", lg: "calc(100vh - 165px)" }}
                        boxShadow="0 16px 40px rgba(0,0,0,0.5)"
                    >
                        {/* Chat Header */}
                        <Flex
                            px={5}
                            py={3.5}
                            align="center"
                            justify="space-between"
                            borderBottom="1px solid"
                            borderColor="whiteAlpha.150"
                            bg={`linear-gradient(90deg, ${accentPrimary}44 0%, #141418 100%)`}
                        >
                            <Flex align="center" gap={3}>
                                <Flex
                                    w="34px"
                                    h="34px"
                                    borderRadius="lg"
                                    bg={accentPrimary}
                                    border="1px solid"
                                    borderColor="whiteAlpha.300"
                                    align="center"
                                    justify="center"
                                >
                                    <Sparkles size={16} color={accentSecondary} />
                                </Flex>
                                <Box>
                                    <Text fontSize="sm" fontWeight="900" letterSpacing="0.04em" textTransform="uppercase">
                                        HBCU GG CONCIERGE
                                    </Text>
                                    <Text fontSize="11px" color="whiteAlpha.600">
                                        {primarySchool
                                            ? `Context: ${primarySchool.name} · Clock: Wk ${activeClock.week}`
                                            : `SWAC & MEAC Intelligence · Clock: Wk ${activeClock.week}`}
                                    </Text>
                                </Box>
                            </Flex>

                            <Button
                                size="xs"
                                variant="ghost"
                                color="whiteAlpha.600"
                                onClick={handleReset}
                                _hover={{ color: "white", bg: "whiteAlpha.100" }}
                            >
                                <Flex align="center" gap={1}>
                                    <RotateCcw size={12} />
                                    <Text fontSize="11px">Reset</Text>
                                </Flex>
                            </Button>
                        </Flex>

                        {/* Conversation Stream */}
                        <Box
                            flex="1"
                            overflowY="auto"
                            px={4}
                            py={4}
                            display="flex"
                            flexDirection="column"
                            gap={5}
                        >
                            {messages.map((msg) => {
                                const isInspected = msg.id === inspectedResult.id;
                                const msgSchool = msg.matchedSchools?.[0];
                                const msgPrimary = msgSchool?.colors?.primary || "#27272A";
                                const msgAccent = msgSchool?.colors?.secondary || "#FFD100";
                                const qa = msg.resolution.quickAnswer;

                                return (
                                    <Box
                                        key={msg.id}
                                        onClick={() => setSelectedMsgId(msg.id)}
                                        cursor="pointer"
                                    >
                                        {/* User Bubble */}
                                        <Flex justify="flex-end" mb={2.5}>
                                            <Flex
                                                maxW="86%"
                                                align="flex-start"
                                                gap={2.5}
                                                bg="whiteAlpha.150"
                                                border="1px solid"
                                                borderColor={isInspected ? msgAccent : "whiteAlpha.200"}
                                                px={3.5}
                                                py={2}
                                                borderRadius="2xl"
                                                borderBottomRightRadius="sm"
                                            >
                                                <Text fontSize="sm" fontWeight="600" color="white">
                                                    {msg.tokenInfo.rawInput}
                                                </Text>
                                                <Box mt={0.5} color="whiteAlpha.600">
                                                    <User size={14} />
                                                </Box>
                                            </Flex>
                                        </Flex>

                                        {/* Bot Response Container (Glory Editorial Style) */}
                                        <Box>
                                            {/* Inline Fuzzy Correction Notice if any */}
                                            {msg.corrections.length > 0 && (
                                                <Flex
                                                    align="center"
                                                    gap={1.5}
                                                    mb={2}
                                                    px={2.5}
                                                    py={1}
                                                    borderRadius="sm"
                                                    bg="#141416"
                                                    borderLeft="3px solid #E53E3E"
                                                >
                                                    <Text fontSize="10px" fontWeight="900" letterSpacing="0.08em" textTransform="uppercase" color="whiteAlpha.700">
                                                        AUTO-CORRECTED:{" "}
                                                        <span style={{ color: "#FFFFFF" }}>
                                                            {msg.corrections.map((c) => `"${c.inputToken}" → ${c.correctedTo}`).join(", ")}
                                                        </span>
                                                    </Text>
                                                </Flex>
                                            )}

                                            {qa ? (
                                                <Box mb={2}>
                                                    {/* =======================================================
                                                        GLORY EDITORIAL TILE (SCOREBOARD / PERSON / FACT)
                                                       ======================================================= */}
                                                    <Box
                                                        position="relative"
                                                        overflow="hidden"
                                                        borderRadius="xl"
                                                        border="1px solid"
                                                        borderColor={isInspected ? "whiteAlpha.300" : "whiteAlpha.150"}
                                                        bg="#0B0B0D"
                                                        mb={2}
                                                    >
                                                        {/* Ghost Watermark */}
                                                        {qa.ghostText && (
                                                            <Text
                                                                position="absolute"
                                                                right="-6px"
                                                                bottom="-18px"
                                                                fontSize="84px"
                                                                fontWeight="900"
                                                                fontStyle="italic"
                                                                letterSpacing="-0.05em"
                                                                color="whiteAlpha.50"
                                                                lineHeight="0.85"
                                                                pointerEvents="none"
                                                                userSelect="none"
                                                            >
                                                                {qa.ghostText}
                                                            </Text>
                                                        )}

                                                        {/* Top Editorial Kicker Bar */}
                                                        <Flex
                                                            px={3.5}
                                                            py={1.5}
                                                            align="center"
                                                            justify="space-between"
                                                            borderBottom="1px solid"
                                                            borderColor="whiteAlpha.100"
                                                            bg="#121215"
                                                        >
                                                            <Flex align="center" gap={2}>
                                                                <Box w="3px" h="11px" bg="brand.500" />
                                                                <Text
                                                                    fontSize="9px"
                                                                    fontWeight="900"
                                                                    letterSpacing="0.14em"
                                                                    textTransform="uppercase"
                                                                    color="whiteAlpha.700"
                                                                >
                                                                    {qa.kicker}
                                                                </Text>
                                                            </Flex>
                                                            {msg.resolution.temporalContext?.temporalMode !== "SEASON_DEFAULT" && (
                                                                <Text fontSize="9px" fontWeight="800" color="brand.400" letterSpacing="0.08em" textTransform="uppercase">
                                                                    {msg.resolution.temporalContext.temporalBadge}
                                                                </Text>
                                                            )}
                                                        </Flex>

                                                        {/* Variant A: SCOREBOARD SPLIT ("PVAMU 22 – TSU 21") */}
                                                        {qa.variant === "SCOREBOARD" && qa.teamA && qa.teamB ? (
                                                            <Box>
                                                                <Grid templateColumns="1fr auto 1fr" alignItems="center">
                                                                    {/* Team A */}
                                                                    <Flex
                                                                        align="center"
                                                                        justify="space-between"
                                                                        px={3.5}
                                                                        py={3}
                                                                        bg={`linear-gradient(120deg, ${qa.teamA.color}66 0%, transparent 85%)`}
                                                                    >
                                                                        <Flex align="center" gap={2.5}>
                                                                            {qa.teamA.logo && (
                                                                                <Box
                                                                                    as="img"
                                                                                    src={qa.teamA.logo}
                                                                                    alt={qa.teamA.abbrev}
                                                                                    w="30px"
                                                                                    h="30px"
                                                                                    objectFit="contain"
                                                                                />
                                                                            )}
                                                                            <Text
                                                                                fontSize="lg"
                                                                                fontWeight="900"
                                                                                fontStyle="italic"
                                                                                letterSpacing="-0.03em"
                                                                                color="white"
                                                                                textTransform="uppercase"
                                                                            >
                                                                                {qa.teamA.abbrev}
                                                                            </Text>
                                                                        </Flex>
                                                                        {qa.teamA.score !== null && (
                                                                            <Text
                                                                                fontSize="3xl"
                                                                                fontWeight="900"
                                                                                lineHeight="0.9"
                                                                                color={qa.teamA.won ? "white" : "whiteAlpha.500"}
                                                                            >
                                                                                {qa.teamA.score}
                                                                            </Text>
                                                                        )}
                                                                    </Flex>

                                                                    {/* Center Divider */}
                                                                    <Flex direction="column" align="center" px={2}>
                                                                        <Text fontSize="10px" fontWeight="900" color="whiteAlpha.400">
                                                                            {qa.teamA.score !== null ? "—" : "VS"}
                                                                        </Text>
                                                                    </Flex>

                                                                    {/* Team B */}
                                                                    <Flex
                                                                        align="center"
                                                                        justify="space-between"
                                                                        px={3.5}
                                                                        py={3}
                                                                        bg={`linear-gradient(240deg, ${qa.teamB.color}66 0%, transparent 85%)`}
                                                                    >
                                                                        {qa.teamB.score !== null && (
                                                                            <Text
                                                                                fontSize="3xl"
                                                                                fontWeight="900"
                                                                                lineHeight="0.9"
                                                                                color={qa.teamB.won ? "white" : "whiteAlpha.500"}
                                                                            >
                                                                                {qa.teamB.score}
                                                                            </Text>
                                                                        )}
                                                                        <Flex align="center" gap={2.5} ml="auto">
                                                                            <Text
                                                                                fontSize="lg"
                                                                                fontWeight="900"
                                                                                fontStyle="italic"
                                                                                letterSpacing="-0.03em"
                                                                                color={qa.teamB.won || qa.teamB.score === null ? "white" : "whiteAlpha.700"}
                                                                                textTransform="uppercase"
                                                                            >
                                                                                {qa.teamB.abbrev}
                                                                            </Text>
                                                                            {qa.teamB.logo && (
                                                                                <Box
                                                                                    as="img"
                                                                                    src={qa.teamB.logo}
                                                                                    alt={qa.teamB.abbrev}
                                                                                    w="30px"
                                                                                    h="30px"
                                                                                    objectFit="contain"
                                                                                />
                                                                            )}
                                                                        </Flex>
                                                                    </Flex>
                                                                </Grid>

                                                                {qa.detail && (
                                                                    <Box px={3.5} py={1.5} borderTop="1px solid" borderColor="whiteAlpha.100" bg="blackAlpha.500">
                                                                        <Text fontSize="9px" fontWeight="800" letterSpacing="0.1em" color="whiteAlpha.600" textTransform="uppercase">
                                                                            {qa.detail}
                                                                        </Text>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        ) : (
                                                            /* Variant B: PERSON / SCHOOL FACT TILE */
                                                            <Flex
                                                                align="center"
                                                                gap={3}
                                                                px={3.5}
                                                                py={3}
                                                                bg={`linear-gradient(125deg, ${qa.primaryColor || msgPrimary}55 0%, #0B0B0D 80%)`}
                                                                position="relative"
                                                            >
                                                                {qa.avatarUrl ? (
                                                                    <Box
                                                                        as="img"
                                                                        src={qa.avatarUrl}
                                                                        alt=""
                                                                        w="44px"
                                                                        h="44px"
                                                                        borderRadius="lg"
                                                                        objectFit="cover"
                                                                        border="1px solid"
                                                                        borderColor="whiteAlpha.300"
                                                                        flexShrink={0}
                                                                        bg="#18181C"
                                                                    />
                                                                ) : qa.schoolLogo ? (
                                                                    <Box
                                                                        as="img"
                                                                        src={qa.schoolLogo}
                                                                        alt=""
                                                                        w="34px"
                                                                        h="34px"
                                                                        objectFit="contain"
                                                                        flexShrink={0}
                                                                    />
                                                                ) : null}

                                                                <Box minW={0}>
                                                                    <Text
                                                                        fontSize="xl"
                                                                        fontWeight="900"
                                                                        fontStyle="italic"
                                                                        letterSpacing="-0.03em"
                                                                        lineHeight="1.05"
                                                                        color="white"
                                                                        textTransform="uppercase"
                                                                    >
                                                                        {qa.headline}
                                                                    </Text>
                                                                    {qa.detail && (
                                                                        <Text
                                                                            mt={1}
                                                                            fontSize="9px"
                                                                            fontWeight="800"
                                                                            letterSpacing="0.1em"
                                                                            color="whiteAlpha.600"
                                                                            textTransform="uppercase"
                                                                        >
                                                                            {qa.detail}
                                                                        </Text>
                                                                    )}
                                                                </Box>
                                                            </Flex>
                                                        )}
                                                    </Box>

                                                    {/* Quick Pill Buttons directly below the Glory tile */}
                                                    {qa.actionPills && qa.actionPills.length > 0 && (
                                                        <Flex wrap="wrap" gap={1.5}>
                                                            {qa.actionPills.map((pill) => {
                                                                if (pill.type === "ROUTE" && pill.route) {
                                                                    return (
                                                                        <Link
                                                                            key={pill.label}
                                                                            to={pill.route}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <Flex
                                                                                align="center"
                                                                                gap={1}
                                                                                px={2.5}
                                                                                py={1}
                                                                                borderRadius="md"
                                                                                bg="#141416"
                                                                                border="1px solid"
                                                                                borderColor="whiteAlpha.200"
                                                                                color="white"
                                                                                fontSize="10px"
                                                                                fontWeight="900"
                                                                                letterSpacing="0.08em"
                                                                                textTransform="uppercase"
                                                                                _hover={{ borderColor: "brand.500", bg: "whiteAlpha.100" }}
                                                                            >
                                                                                <Text>{pill.label}</Text>
                                                                                <ArrowUpRight size={11} color="#F56565" />
                                                                            </Flex>
                                                                        </Link>
                                                                    );
                                                                }

                                                                if (pill.type === "EXPAND_DASHBOARD") {
                                                                    return (
                                                                        <Box
                                                                            as="button"
                                                                            type="button"
                                                                            key={pill.label}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleExpandToDashboard(msg.id, pill.targetIntentId);
                                                                            }}
                                                                            px={2.5}
                                                                            py={1}
                                                                            borderRadius="md"
                                                                            bg="#141416"
                                                                            border="1px solid"
                                                                            borderColor="whiteAlpha.200"
                                                                            fontSize="10px"
                                                                            fontWeight="900"
                                                                            letterSpacing="0.08em"
                                                                            textTransform="uppercase"
                                                                            color="whiteAlpha.800"
                                                                            _hover={{ borderColor: "brand.500", color: "white" }}
                                                                        >
                                                                            {pill.label} ⊞
                                                                        </Box>
                                                                    );
                                                                }

                                                                return (
                                                                    <Box
                                                                        as="button"
                                                                        type="button"
                                                                        key={pill.label}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSendPrompt(pill.prompt || pill.label);
                                                                        }}
                                                                        px={2.5}
                                                                        py={1}
                                                                        borderRadius="md"
                                                                        bg="#141416"
                                                                        border="1px solid"
                                                                        borderColor="whiteAlpha.200"
                                                                        fontSize="10px"
                                                                        fontWeight="900"
                                                                        letterSpacing="0.08em"
                                                                        textTransform="uppercase"
                                                                        color="whiteAlpha.800"
                                                                        _hover={{ borderColor: "brand.500", color: "white" }}
                                                                    >
                                                                        {pill.label}
                                                                    </Box>
                                                                );
                                                            })}
                                                        </Flex>
                                                    )}
                                                </Box>
                                            ) : (
                                                /* TIER 2: FULL BENTO DASHBOARD CONVERSATIONAL SUMMARY */
                                                <Box
                                                    bg="#141416"
                                                    border="1px solid"
                                                    borderColor={isInspected ? "whiteAlpha.300" : "whiteAlpha.100"}
                                                    borderLeft="4px solid"
                                                    borderLeftColor="brand.500"
                                                    borderRadius="lg"
                                                    p={3}
                                                    mb={2}
                                                >
                                                    <Text fontSize="xs" fontWeight="700" color="whiteAlpha.900" lineHeight="1.5">
                                                        {msg.resolution.conversationalSummary}
                                                    </Text>
                                                </Box>
                                            )}

                                            {/* Follow-up Inquiry Suggestions */}
                                            <Flex wrap="wrap" gap={1.5}>
                                                {msg.resolution.followUpPrompts.slice(0, 3).map((chip) => (
                                                    <Box
                                                        as="button"
                                                        type="button"
                                                        key={chip}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSendPrompt(chip);
                                                        }}
                                                        px={2.5}
                                                        py={1}
                                                        borderRadius="full"
                                                        bg="#0B0B0D"
                                                        border="1px solid"
                                                        borderColor="whiteAlpha.150"
                                                        fontSize="10px"
                                                        fontWeight="700"
                                                        color="whiteAlpha.600"
                                                        textAlign="left"
                                                        _hover={{ borderColor: "whiteAlpha.400", color: "white" }}
                                                    >
                                                        + {chip}
                                                    </Box>
                                                ))}
                                            </Flex>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Quick Starter Strip + Chat Input Bar pinned at bottom */}
                        <Box
                            p={3.5}
                            borderTop="1px solid"
                            borderColor="whiteAlpha.150"
                            bg="#0E0E11"
                        >
                            {/* Compact scrollable starter pills */}
                            <Flex
                                gap={1.5}
                                overflowX="auto"
                                pb={2.5}
                                mb={2}
                                css={{
                                    "&::-webkit-scrollbar": { height: "4px" },
                                    "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.15)", borderRadius: "4px" }
                                }}
                            >
                                {QUICK_TEST_PROMPTS.map((item) => (
                                    <Box
                                        as="button"
                                        type="button"
                                        key={item.prompt}
                                        onClick={() => handleSendPrompt(item.prompt)}
                                        px={2.5}
                                        py={1}
                                        borderRadius="md"
                                        bg="#18181C"
                                        border="1px solid"
                                        borderColor="whiteAlpha.150"
                                        whiteSpace="nowrap"
                                        fontSize="11px"
                                        color="whiteAlpha.700"
                                        _hover={{ borderColor: accentSecondary, color: "white" }}
                                    >
                                        {item.category}
                                    </Box>
                                ))}
                            </Flex>

                            <Box as="form" onSubmit={handleSubmit}>
                                <Flex
                                    align="center"
                                    gap={2}
                                    bg="#18181C"
                                    border="1px solid"
                                    borderColor="whiteAlpha.250"
                                    borderRadius="xl"
                                    px={3}
                                    py={1.5}
                                >
                                    <Input
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Ask a quick fact ('Who won the Labor Day Classic?') or full dashboard..."
                                        bg="transparent"
                                        border="none"
                                        color="white"
                                        fontSize="sm"
                                        px={1}
                                        _focus={{ boxShadow: "none", outline: "none" }}
                                        _placeholder={{ color: "whiteAlpha.400" }}
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        bg={accentSecondary}
                                        color="#0B0B0D"
                                        fontWeight="800"
                                        borderRadius="lg"
                                        px={3.5}
                                        _hover={{ opacity: 0.9 }}
                                    >
                                        <Send size={14} />
                                    </Button>
                                </Flex>
                            </Box>
                        </Box>
                    </GridItem>

                    {/* =========================================================
                        RIGHT COLUMN: PRE-BENTO STAGE & ENGINE INSPECTOR
                       ========================================================= */}
                    {inspectedResult && (
                        <GridItem display="flex" flexDirection="column" gap={4}>
                            {/* Compact School / Hub Header Banner */}
                            <Box
                                position="relative"
                                overflow="hidden"
                                borderRadius="2xl"
                                border="1px solid"
                                borderColor="whiteAlpha.200"
                                bg={`linear-gradient(125deg, ${accentPrimary} 0%, #141418 75%, #0B0B0D 100%)`}
                                p={6}
                            >
                                <Text
                                    position="absolute"
                                    right="-8px"
                                    bottom="-22px"
                                    fontSize={{ base: "64px", md: "110px" }}
                                    fontWeight="900"
                                    fontStyle="italic"
                                    letterSpacing="-0.04em"
                                    color="whiteAlpha.100"
                                    userSelect="none"
                                    pointerEvents="none"
                                    lineHeight="0.9"
                                    textTransform="uppercase"
                                >
                                    {primarySchool ? primarySchool.abbrev : "HBCU"}
                                </Text>

                                <Flex justify="space-between" align="flex-start" wrap="wrap" gap={3}>
                                    <Box>
                                        <Flex align="center" gap={2} mb={1.5} wrap="wrap">
                                            <Text
                                                fontSize="11px"
                                                fontWeight="800"
                                                letterSpacing="0.14em"
                                                color={accentSecondary}
                                                textTransform="uppercase"
                                            >
                                                • {inspectedResult.resolution.primaryIntent.hub}
                                            </Text>
                                            <Box
                                                px={2}
                                                py={0.5}
                                                borderRadius="md"
                                                bg={
                                                    inspectedResult.resolution.responseMode === "QUICK_ANSWER"
                                                        ? "rgba(16, 185, 129, 0.2)"
                                                        : "rgba(139, 92, 246, 0.25)"
                                                }
                                                border="1px solid"
                                                borderColor={
                                                    inspectedResult.resolution.responseMode === "QUICK_ANSWER"
                                                        ? "#34D399"
                                                        : "#C4B5FD"
                                                }
                                                fontSize="10px"
                                                fontFamily="mono"
                                                fontWeight="800"
                                                color={
                                                    inspectedResult.resolution.responseMode === "QUICK_ANSWER"
                                                        ? "#34D399"
                                                        : "#C4B5FD"
                                                }
                                            >
                                                {inspectedResult.resolution.responseMode === "QUICK_ANSWER"
                                                    ? "⚡ TIER 1: QUICK CHAT ANSWER"
                                                    : "📊 TIER 2: FULL BENTO DASHBOARD"}
                                            </Box>
                                        </Flex>

                                        <Text
                                            fontSize={{ base: "2xl", md: "4xl" }}
                                            fontWeight="900"
                                            fontStyle="italic"
                                            letterSpacing="-0.03em"
                                            textTransform="uppercase"
                                            lineHeight="1.0"
                                        >
                                            {inspectedResult.matchedPlayers?.[0]
                                                ? inspectedResult.matchedPlayers[0].full_name
                                                : inspectedResult.matchedCoaches?.[0]
                                                    ? inspectedResult.matchedCoaches[0].full_name
                                                    : inspectedResult.matchedClassic
                                                        ? inspectedResult.matchedClassic.name
                                                        : primarySchool
                                                            ? primarySchool.name
                                                            : "CONFERENCE WIDE"}
                                        </Text>
                                    </Box>

                                    <Link to={inspectedResult.resolution.primaryIntent.resolvedRoute}>
                                        <Flex
                                            align="center"
                                            gap={1.5}
                                            px={3.5}
                                            py={2}
                                            borderRadius="lg"
                                            bg="blackAlpha.600"
                                            border="1px solid"
                                            borderColor="whiteAlpha.300"
                                            fontSize="xs"
                                            fontWeight="700"
                                            color="white"
                                            _hover={{ bg: "blackAlpha.800", borderColor: accentSecondary }}
                                        >
                                            <Text>{inspectedResult.resolution.primaryIntent.resolvedRoute}</Text>
                                            <ArrowUpRight size={14} />
                                        </Flex>
                                    </Link>
                                </Flex>

                                {/* Quick Summary Strip of Matched Entities & Temporal Context */}
                                <Flex wrap="wrap" gap={2} mt={4}>
                                    {(inspectedResult.matchedPlayers || []).map((p) => (
                                        <Box
                                            key={p.person_id}
                                            px={2.5}
                                            py={1}
                                            borderRadius="md"
                                            bg="blackAlpha.600"
                                            border="1px solid"
                                            borderColor="#34D399"
                                            fontSize="xs"
                                            fontFamily="mono"
                                            color="#34D399"
                                        >
                                            Player: <strong>{p.full_name}</strong> ({p.position} #{p.jersey_number} · {p.matchType})
                                        </Box>
                                    ))}
                                    {(inspectedResult.matchedCoaches || []).map((c) => (
                                        <Box
                                            key={c.person_id}
                                            px={2.5}
                                            py={1}
                                            borderRadius="md"
                                            bg="blackAlpha.600"
                                            border="1px solid"
                                            borderColor="#60A5FA"
                                            fontSize="xs"
                                            fontFamily="mono"
                                            color="#60A5FA"
                                        >
                                            Coach: <strong>{c.full_name}</strong> ({c.matchType})
                                        </Box>
                                    ))}
                                    {inspectedResult.matchedSchools.map((s) => (
                                        <Box
                                            key={s.id}
                                            px={2.5}
                                            py={1}
                                            borderRadius="md"
                                            bg="blackAlpha.600"
                                            border="1px solid"
                                            borderColor="whiteAlpha.200"
                                            fontSize="xs"
                                            fontFamily="mono"
                                        >
                                            School: <strong>{s.name}</strong> ({s.matchType})
                                        </Box>
                                    ))}
                                    {inspectedResult.matchedConcepts.map((c) => (
                                        <Box
                                            key={c.tag}
                                            px={2.5}
                                            py={1}
                                            borderRadius="md"
                                            bg="blackAlpha.600"
                                            border="1px solid"
                                            borderColor="whiteAlpha.200"
                                            fontSize="xs"
                                            fontFamily="mono"
                                            color={accentSecondary}
                                        >
                                            {c.tag}
                                        </Box>
                                    ))}
                                    <Box
                                        px={2.5}
                                        py={1}
                                        borderRadius="md"
                                        bg="blackAlpha.600"
                                        border="1px solid"
                                        borderColor="whiteAlpha.200"
                                        fontSize="xs"
                                        fontFamily="mono"
                                        color="#FACC15"
                                    >
                                        Temporal: {inspectedResult.resolution.temporalContext?.temporalBadge}
                                    </Box>
                                </Flex>
                            </Box>

                            {/* Right-Column Mode Switcher: Pre-Bento Box Output | Tokenizer | Matches & Contracts */}
                            <Flex
                                bg="#121215"
                                p={1.5}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="whiteAlpha.150"
                                gap={2}
                            >
                                {[
                                    { id: "bento", label: "1. Tiered Response & Bento Stage" },
                                    { id: "tokens", label: "2. Tokenizer & Fuzzy Log" },
                                    { id: "matches", label: "3. Keyword Web & Data Contracts" }
                                ].map((tab) => {
                                    const active = activeInspectorTab === tab.id;
                                    return (
                                        <Box
                                            as="button"
                                            type="button"
                                            key={tab.id}
                                            onClick={() => setActiveInspectorTab(tab.id)}
                                            flex="1"
                                            py={2}
                                            px={3}
                                            borderRadius="lg"
                                            bg={active ? "whiteAlpha.200" : "transparent"}
                                            color={active ? "white" : "whiteAlpha.600"}
                                            fontWeight={active ? "800" : "600"}
                                            fontSize="xs"
                                            textAlign="center"
                                            transition="all 0.15s"
                                        >
                                            {tab.label}
                                        </Box>
                                    );
                                })}
                            </Flex>

                            {/* TAB 1: TIERED RESPONSE & PRE-BENTO WIREFRAME STAGE */}
                            {activeInspectorTab === "bento" && (
                                <Box
                                    bg="#121215"
                                    border="1px solid"
                                    borderColor="whiteAlpha.200"
                                    borderRadius="2xl"
                                    p={5}
                                >
                                    {inspectedResult.resolution.responseMode === "QUICK_ANSWER" &&
                                    inspectedResult.resolution.quickAnswer ? (
                                        /* QUICK ANSWER GATE: Show why the heavy dashboard was suppressed + 1-click expand */
                                        <Box>
                                            <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
                                                <Flex align="center" gap={2}>
                                                    <CheckCircle2 size={16} color="#34D399" />
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="800"
                                                        letterSpacing="0.08em"
                                                        textTransform="uppercase"
                                                        color="#34D399"
                                                    >
                                                        DIRECT CHAT ANSWER DELIVERED — FULL DASHBOARD SUPPRESSED
                                                    </Text>
                                                </Flex>
                                                <Text fontSize="xs" fontFamily="mono" color="whiteAlpha.500">
                                                    Source: {inspectedResult.resolution.quickAnswer.verifiedSource}
                                                </Text>
                                            </Flex>

                                            <Box
                                                bg="#0B0B0D"
                                                border="1px solid"
                                                borderColor="whiteAlpha.200"
                                                borderRadius="xl"
                                                p={5}
                                                mb={4}
                                            >
                                                <Text fontSize="xs" color="whiteAlpha.500" textTransform="uppercase" fontWeight="800" mb={1}>
                                                    {inspectedResult.resolution.quickAnswer.category} · {inspectedResult.resolution.quickAnswer.kicker}
                                                </Text>
                                                <Text fontSize="lg" fontWeight="900" color="white" mb={2}>
                                                    {inspectedResult.resolution.quickAnswer.headline}
                                                </Text>
                                                <Text fontSize="sm" color="whiteAlpha.700" mb={4}>
                                                    {inspectedResult.resolution.quickAnswer.detail}
                                                </Text>

                                                <Flex align="center" justify="space-between" wrap="wrap" gap={3} pt={3} borderTop="1px solid" borderColor="whiteAlpha.100">
                                                    <Text fontSize="xs" color="whiteAlpha.500">
                                                        Narrow factual / temporal questions resolve directly in the chat stream so the user gets an instant answer without visual clutter.
                                                    </Text>
                                                    <Button
                                                        size="sm"
                                                        bg={accentSecondary}
                                                        color="#0B0B0D"
                                                        fontWeight="800"
                                                        onClick={() => handleExpandToDashboard(inspectedResult.id)}
                                                        _hover={{ opacity: 0.9 }}
                                                    >
                                                        Expand Full Bento Blueprint ({inspectedResult.resolution.primaryIntent.id})
                                                    </Button>
                                                </Flex>
                                            </Box>
                                        </Box>
                                    ) : (
                                        /* FULL BENTO DASHBOARD WIREFRAME */
                                        <Box>
                                            <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
                                                <Flex align="center" gap={2}>
                                                    <SlidersHorizontal size={15} color={accentSecondary} />
                                                    <Text fontSize="xs" fontWeight="800" letterSpacing="0.1em" textTransform="uppercase" color="whiteAlpha.800">
                                                        PRE-BENTO LAYOUT BLUEPRINT ({inspectedResult.resolution.primaryIntent.id})
                                                    </Text>
                                                </Flex>
                                                <Flex align="center" gap={3}>
                                                    {inspectedResult.resolution.quickAnswer && (
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            borderColor="whiteAlpha.300"
                                                            color="whiteAlpha.800"
                                                            onClick={() => handleCollapseToQuickAnswer(inspectedResult.id)}
                                                        >
                                                            Return to Quick Answer Mode
                                                        </Button>
                                                    )}
                                                    <Text fontSize="xs" color="whiteAlpha.500">
                                                        Owner: {inspectedResult.resolution.primaryIntent.sectionOwner}
                                                    </Text>
                                                </Flex>
                                            </Flex>

                                            {/* Visual Bento Grid Wireframe */}
                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3.5}>
                                                {inspectedResult.resolution.primaryIntent.bentoPreview.map((slotName, index) => {
                                                    const isWide = index === 0;
                                                    return (
                                                        <GridItem
                                                            key={slotName}
                                                            colSpan={{ base: 1, md: isWide ? 2 : 1 }}
                                                            bg="#0B0B0D"
                                                            border="1px dashed"
                                                            borderColor={isWide ? accentSecondary : "whiteAlpha.300"}
                                                            borderRadius="xl"
                                                            p={4}
                                                            minH={isWide ? "90px" : "130px"}
                                                            display="flex"
                                                            flexDirection="column"
                                                            justifyContent="space-between"
                                                        >
                                                            <Flex justify="space-between" align="center">
                                                                <Text fontSize="10px" fontFamily="mono" fontWeight="800" color={accentSecondary}>
                                                                    SLOT 0{index + 1} · {isWide ? "COLS={4} HERO" : "COLS={2} CARD"}
                                                                </Text>
                                                                <Text fontSize="10px" color="whiteAlpha.400" fontFamily="mono">
                                                                    PageShell.Slot
                                                                </Text>
                                                            </Flex>

                                                            <Text fontSize="sm" fontWeight="800" color="white" my={2}>
                                                                {slotName}
                                                            </Text>

                                                            <Text fontSize="11px" color="whiteAlpha.500">
                                                                {primarySchool
                                                                    ? `Scoped to ${primarySchool.name} (${primarySchool.exportId}) · ${inspectedResult.resolution.temporalContext?.targetSeason || inspectedResult.tokenInfo.detectedSeason}`
                                                                    : `Conference-wide SWAC / MEAC scope · ${inspectedResult.resolution.temporalContext?.targetSeason || inspectedResult.tokenInfo.detectedSeason}`}
                                                            </Text>
                                                        </GridItem>
                                                    );
                                                })}
                                            </Grid>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* TAB 2: TOKENIZER & FUZZY SPELL-CHECK */}
                            {activeInspectorTab === "tokens" && (
                                <Box
                                    bg="#121215"
                                    border="1px solid"
                                    borderColor="whiteAlpha.200"
                                    borderRadius="2xl"
                                    p={5}
                                    display="flex"
                                    flexDirection="column"
                                    gap={4}
                                >
                                    <Box bg="#0B0B0D" p={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
                                        <Text fontSize="10px" fontWeight="700" color="whiteAlpha.500" textTransform="uppercase" mb={2}>
                                            RAW vs. NORMALIZED TOKENS
                                        </Text>
                                        <Text fontSize="xs" color="whiteAlpha.600" mb={2} fontFamily="mono">
                                            Cleaned string: "{inspectedResult.tokenInfo.cleanedText}"
                                        </Text>
                                        <Flex wrap="wrap" gap={2}>
                                            {inspectedResult.tokenInfo.allTokens.map((tok, i) => {
                                                const isKept = inspectedResult.tokenInfo.meaningfulTokens.includes(tok);
                                                return (
                                                    <Box
                                                        key={`${tok}-${i}`}
                                                        px={2.5}
                                                        py={1}
                                                        borderRadius="md"
                                                        fontFamily="mono"
                                                        fontSize="xs"
                                                        bg={isKept ? "whiteAlpha.200" : "whiteAlpha.50"}
                                                        color={isKept ? accentSecondary : "whiteAlpha.400"}
                                                        textDecoration={isKept ? "none" : "line-through"}
                                                    >
                                                        {tok}
                                                    </Box>
                                                );
                                            })}
                                        </Flex>
                                    </Box>

                                    <Box bg="#0B0B0D" p={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
                                        <Text fontSize="10px" fontWeight="700" color="whiteAlpha.500" textTransform="uppercase" mb={2}>
                                            FUZZY / STEM CORRECTIONS
                                        </Text>
                                        {inspectedResult.corrections.length > 0 ? (
                                            <Flex direction="column" gap={2}>
                                                {inspectedResult.corrections.map((c, i) => (
                                                    <Box key={i} fontSize="xs" fontFamily="mono" color="#FBBF24">
                                                        • "{c.inputToken}" → <strong>{c.correctedTo}</strong> ({c.reason})
                                                    </Box>
                                                ))}
                                            </Flex>
                                        ) : (
                                            <Text fontSize="xs" color="whiteAlpha.600">
                                                No fuzzy corrections needed — all matched tokens were exact aliases.
                                            </Text>
                                        )}
                                    </Box>
                                </Box>
                            )}

                            {/* TAB 3: KEYWORD WEB & DATA CONTRACTS */}
                            {activeInspectorTab === "matches" && (
                                <Box
                                    bg="#121215"
                                    border="1px solid"
                                    borderColor="whiteAlpha.200"
                                    borderRadius="2xl"
                                    p={5}
                                    display="flex"
                                    flexDirection="column"
                                    gap={4}
                                >
                                    <Box bg="#0B0B0D" p={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
                                        <Text fontSize="10px" fontWeight="700" color="whiteAlpha.500" textTransform="uppercase" mb={2}>
                                            SYNONYM & CONCEPT HITS
                                        </Text>
                                        {inspectedResult.matchedConcepts.length > 0 ? (
                                            <Flex direction="column" gap={2}>
                                                {inspectedResult.matchedConcepts.map((c) => (
                                                    <Flex key={c.tag} justify="space-between" align="center" fontSize="xs">
                                                        <Text color="white" fontWeight="700">
                                                            {c.label} <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>({c.hits.map((h) => `"${h.term}"`).join(", ")})</span>
                                                        </Text>
                                                        <Text fontFamily="mono" color={accentSecondary}>
                                                            {c.tag}
                                                        </Text>
                                                    </Flex>
                                                ))}
                                            </Flex>
                                        ) : (
                                            <Text fontSize="xs" color="whiteAlpha.500">No narrow concept tags matched.</Text>
                                        )}
                                    </Box>

                                    <Box bg="#0B0B0D" p={4} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
                                        <Text fontSize="10px" fontWeight="700" color="whiteAlpha.500" textTransform="uppercase" mb={2}>
                                            TARGET JSON PAYLOAD CONTRACTS
                                        </Text>
                                        <Flex direction="column" gap={1.5}>
                                            {inspectedResult.resolution.primaryIntent.dataContracts.map((path) => (
                                                <Text key={path} fontSize="xs" fontFamily="mono" color="whiteAlpha.800">
                                                    • {path}
                                                </Text>
                                            ))}
                                        </Flex>
                                    </Box>
                                </Box>
                            )}
                        </GridItem>
                    )}
                </Grid>
            </Container>
        </Box>
    );
}

export default HomeFauxChatSection;
