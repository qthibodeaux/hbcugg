import {
    STOP_WORDS,
    SCHOOL_WEB,
    CONCEPT_SYNONYMS,
    INTENT_BLUEPRINTS,
    CLASSICS_CATALOG,
    DEFAULT_ACTIVE_CLOCK
} from "./fauxAiDictionary";

/**
 * Pure deterministic Faux AI Parser, Fuzzy Matcher, Temporal Resolver & Tiered Response Engine.
 * Supports:
 *   1. Tiered Response Mode: "QUICK_ANSWER" (instant punchy chat answers) vs. "FULL_DASHBOARD" (Bento Blueprint)
 *   2. Active Clock & Relative Temporal Resolution ("today", "this week", "last week", "next week")
 * No side effects, no React state, pure synchronous functions.
 */

export function levenshteinDistance(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            let val = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
            // Damerau adjacent transposition (e.g., "toblert" <-> "tolbert", "alcron" <-> "alcorn")
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                val = Math.min(val, matrix[i - 2][j - 2] + 1);
            }
            matrix[i][j] = val;
        }
    }
    return matrix[a.length][b.length];
}

export function phoneticSkeleton(word) {
    const s = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!s) return "";
    const first = s[0];
    const rest = s
        .slice(1)
        .replace(/[aeiouyhw]/g, "")
        .replace(/(.)\1+/g, "$1");
    return first + rest;
}

export function matchPeopleFuzzy(meaningfulTokens, players = [], coaches = []) {
    const matchedPlayers = [];
    const matchedCoaches = [];
    const peopleCorrections = [];

    if (!meaningfulTokens || meaningfulTokens.length === 0) {
        return { matchedPlayers, matchedCoaches, peopleCorrections };
    }

    const scoreCandidateList = (candidates, type) => {
        const hits = [];

        // 1. Check adjacent token pairs first (First + Last name, e.g. "jauylon toblert" -> "Jaylon Tolbert")
        for (let idx = 0; idx < meaningfulTokens.length - 1; idx++) {
            const tokA = meaningfulTokens[idx];
            const tokB = meaningfulTokens[idx + 1];
            if (tokA.length < 2 || tokB.length < 3) continue;

            let bestCand = null;
            let bestScore = 99;
            let bestReason = "";

            for (const item of candidates) {
                const first = String(item.first_name || "").toLowerCase().replace(/[^a-z]/g, "");
                const last = String(item.last_name || "").toLowerCase().replace(/[^a-z]/g, "");
                if (!first || !last) continue;

                const dFirst = levenshteinDistance(tokA, first);
                const dLast = levenshteinDistance(tokB, last);
                const totalDist = dFirst + dLast;

                const skelFirstMatch = phoneticSkeleton(tokA) === phoneticSkeleton(first);
                const skelLastMatch = phoneticSkeleton(tokB) === phoneticSkeleton(last);

                const maxFirst = first.length >= 5 ? 2 : 1;
                const maxLast = last.length >= 5 ? 2 : 1;

                const passesEdit = dFirst <= maxFirst && dLast <= maxLast && totalDist <= 3;
                const passesPhonetic = (skelLastMatch && dFirst <= 2 && dLast <= 2) || (skelFirstMatch && skelLastMatch && totalDist <= 4);

                if (passesEdit || passesPhonetic) {
                    const effectiveScore = totalDist - (skelLastMatch ? 0.5 : 0) - (skelFirstMatch ? 0.25 : 0);
                    if (effectiveScore < bestScore) {
                        bestScore = effectiveScore;
                        bestCand = item;
                        bestReason =
                            totalDist === 0
                                ? `Exact full name match`
                                : `Damerau-Levenshtein + Phonetic match (dist ${dFirst}+${dLast}): "${tokA} ${tokB}" → "${item.full_name}"`;
                    }
                }
            }

            if (bestCand) {
                const inputPair = `${tokA} ${tokB}`;
                const isExact = inputPair === String(bestCand.full_name || "").toLowerCase();
                hits.push({
                    ...bestCand,
                    entityType: type,
                    matchType: isExact ? "EXACT_NAME" : "FUZZY_NAME_PAIR",
                    matchedTerm: inputPair,
                    reason: bestReason,
                    score: bestScore
                });
                if (!isExact) {
                    peopleCorrections.push({
                        inputToken: inputPair,
                        correctedTo: `${bestCand.full_name} (${bestCand.position || bestCand.title || type}, ${bestCand.team_id})`,
                        reason: bestReason
                    });
                }
            }
        }

        // 2. If no 2-word full name matched, check single distinctive last names (length >= 5, e.g. "toblert" or "tolbert")
        if (hits.length === 0) {
            for (const tok of meaningfulTokens) {
                if (tok.length < 5) continue;
                // Skip if token is already a known school alias or common football word
                if (SCHOOL_WEB.some((s) => s.aliases.includes(tok))) continue;
                if (CONCEPT_SYNONYMS.some((g) => g.terms.includes(tok))) continue;

                const matchesForLast = [];
                for (const item of candidates) {
                    const last = String(item.last_name || "").toLowerCase().replace(/[^a-z]/g, "");
                    if (last.length < 5) continue;
                    const dist = levenshteinDistance(tok, last);
                    const skelMatch = phoneticSkeleton(tok) === phoneticSkeleton(last);
                    if (dist === 0 || (dist === 1 && (tok[0] === last[0] || skelMatch))) {
                        matchesForLast.push({ item, dist });
                    }
                }

                // Only auto-resolve single last name if it uniquely identifies 1–2 players/coaches
                if (matchesForLast.length >= 1 && matchesForLast.length <= 2) {
                    matchesForLast.sort((a, b) => a.dist - b.dist || (b.item.experience_score || 0) - (a.item.experience_score || 0));
                    const best = matchesForLast[0];
                    const isExact = best.dist === 0;
                    hits.push({
                        ...best.item,
                        entityType: type,
                        matchType: isExact ? "EXACT_SURNAME" : "FUZZY_SURNAME",
                        matchedTerm: tok,
                        score: best.dist
                    });
                    if (!isExact) {
                        peopleCorrections.push({
                            inputToken: tok,
                            correctedTo: `${best.item.full_name} (${best.item.position || best.item.title || type}, ${best.item.team_id})`,
                            reason: `Surname transposition/typo match (dist ${best.dist}): "${tok}" → "${best.item.full_name}"`
                        });
                    }
                }
            }
        }

        return hits;
    };

    if (Array.isArray(players) && players.length > 0) {
        matchedPlayers.push(...scoreCandidateList(players, "PLAYER"));
    }
    if (Array.isArray(coaches) && coaches.length > 0) {
        matchedCoaches.push(...scoreCandidateList(coaches, "COACH"));
    }

    return { matchedPlayers, matchedCoaches, peopleCorrections };
}

export function normalizeAndTokenize(rawInput) {
    const raw = (rawInput || "").trim();
    const cleaned = raw
        .toLowerCase()
        .replace(/['’]s\b/g, "")
        .replace(/[^a-z0-9%#&\-\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const allTokens = cleaned ? cleaned.split(" ") : [];
    const meaningfulTokens = allTokens.filter((t) => !STOP_WORDS.has(t));

    const yearMatch = cleaned.match(/\b(201[0-9]|202[1-6])\b/);
    const explicitSeason = yearMatch ? Number(yearMatch[1]) : null;
    const detectedSeason = explicitSeason || 2025;

    const weekMatch = cleaned.match(/\b(?:week|wk)\s*(\d{1,2})\b/);
    const detectedWeek = weekMatch ? Number(weekMatch[1]) : null;

    return {
        rawInput: raw,
        cleanedText: cleaned,
        allTokens,
        meaningfulTokens,
        explicitSeason,
        detectedSeason,
        detectedWeek
    };
}

const GENERIC_SCHOOL_MODIFIERS = new Set([
    "state", "states", "university", "college", "north", "south", "east", "west",
    "central", "tech", "agricultural", "mechanical", "normal", "city", "beach"
]);

export function matchSchools(cleanedText, meaningfulTokens) {
    const matchedSchools = [];
    const fuzzyCorrections = [];
    const seenIds = new Set();

    // 1. Collect all exact/plural alias matches across all schools, then sort by longest alias first
    // so "south carolina state(s)" always beats shorter substrings.
    const exactCandidates = [];
    SCHOOL_WEB.forEach((school) => {
        const sortedAliases = [...school.aliases].sort((a, b) => b.length - a.length);
        for (const alias of sortedAliases) {
            if (!alias || alias.length < 2) continue;
            const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${escaped}s?\\b`, "i");
            const match = cleanedText.match(regex);
            if (match) {
                exactCandidates.push({
                    school,
                    matchedTerm: match[0].toLowerCase(),
                    alias,
                    length: alias.length
                });
                break;
            }
        }
    });

    exactCandidates
        .sort((a, b) => b.length - a.length)
        .forEach((cand) => {
            if (!seenIds.has(cand.school.id)) {
                seenIds.add(cand.school.id);
                matchedSchools.push({
                    ...cand.school,
                    matchType: "EXACT_ALIAS",
                    matchedTerm: cand.matchedTerm,
                    confidence: 1.0
                });
            }
        });

    // Track tokens already covered by an exact school match so we don't fuzzy-match leftover words like "states"
    const coveredTokens = new Set();
    matchedSchools.forEach((s) => {
        String(s.matchedTerm || "")
            .split(/\s+/)
            .forEach((w) => coveredTokens.add(w));
    });

    meaningfulTokens.forEach((token) => {
        if (token.length < 4) return;
        if (coveredTokens.has(token) || GENERIC_SCHOOL_MODIFIERS.has(token)) return;
        const stem = token.endsWith("s") && token.length > 5 ? token.slice(0, -1) : token;
        if (GENERIC_SCHOOL_MODIFIERS.has(stem)) return;

        SCHOOL_WEB.forEach((school) => {
            if (seenIds.has(school.id)) return;

            for (const alias of school.aliases) {
                if (alias.includes(" ") || alias.length < 4) continue;
                if (GENERIC_SCHOOL_MODIFIERS.has(alias)) continue;

                const dist = Math.min(
                    levenshteinDistance(token, alias),
                    levenshteinDistance(stem, alias)
                );
                const maxAllowed = alias.length >= 6 ? 2 : 1;
                const skelMatch =
                    token.length >= 5 &&
                    alias.length >= 5 &&
                    Math.abs(token.length - alias.length) <= 2 &&
                    phoneticSkeleton(token) === phoneticSkeleton(alias);

                if (dist <= maxAllowed || (skelMatch && dist <= 2)) {
                    seenIds.add(school.id);
                    const matchType = dist === 0 ? "STEM_NORMALIZED" : "FUZZY_TYPO";
                    matchedSchools.push({
                        ...school,
                        matchType,
                        matchedTerm: token,
                        canonicalTerm: alias,
                        distance: dist,
                        confidence: dist === 0 ? 0.96 : 0.85
                    });
                    fuzzyCorrections.push({
                        inputToken: token,
                        correctedTo: `${school.name} (${school.exportId})`,
                        reason:
                            dist === 0
                                ? `Stripped plural/possessive "${token}" → "${alias}"`
                                : `Damerau-Levenshtein / Phonetic match (dist ${dist}): "${token}" → "${alias}"`
                    });
                    break;
                }
            }
        });
    });

    return { matchedSchools, fuzzyCorrections };
}

export function matchConceptsAndSynonyms(cleanedText, meaningfulTokens) {
    const matchedConcepts = [];
    const conceptCorrections = [];
    const seenTags = new Set();

    CONCEPT_SYNONYMS.forEach((group) => {
        const hits = [];
        const sortedTerms = [...group.terms].sort((a, b) => b.length - a.length);

        sortedTerms.forEach((term) => {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${escaped}\\b`, "i");
            if (regex.test(cleanedText)) {
                hits.push({ term, matchType: "SYNONYM_EXACT" });
            }
        });

        if (hits.length > 0) {
            seenTags.add(group.tag);
            matchedConcepts.push({
                tag: group.tag,
                category: group.category,
                label: group.label,
                hits
            });
        }
    });

    meaningfulTokens.forEach((token) => {
        if (token.length < 5) return;

        CONCEPT_SYNONYMS.forEach((group) => {
            if (seenTags.has(group.tag)) return;

            for (const term of group.terms) {
                if (term.includes(" ") || term.length < 5) continue;
                const dist = levenshteinDistance(token, term);
                if (dist === 1) {
                    seenTags.add(group.tag);
                    matchedConcepts.push({
                        tag: group.tag,
                        category: group.category,
                        label: group.label,
                        hits: [{ term: `${token} → ${term}`, matchType: "FUZZY_CONCEPT" }]
                    });
                    conceptCorrections.push({
                        inputToken: token,
                        correctedTo: `${term} (${group.tag})`,
                        reason: `Fuzzy concept correction (edit distance 1): "${token}" → "${term}"`
                    });
                    break;
                }
            }
        });
    });

    return { matchedConcepts, conceptCorrections };
}

export function matchClassics(cleanedText) {
    for (const classic of CLASSICS_CATALOG) {
        const sortedAliases = [...classic.aliases].sort((a, b) => b.length - a.length);
        for (const alias of sortedAliases) {
            const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${escaped}\\b`, "i");
            if (regex.test(cleanedText)) {
                return {
                    ...classic,
                    matchedAlias: alias
                };
            }
        }
    }
    return null;
}

export function resolveTemporalContext(cleanedText, matchedConcepts, tokenInfo, activeClock = DEFAULT_ACTIVE_CLOCK) {
    const clock = activeClock || DEFAULT_ACTIVE_CLOCK;
    const activeTags = new Set(matchedConcepts.map((c) => c.tag));
    const targetSeason = tokenInfo.explicitSeason || clock.season || 2025;
    const currentWeek = Number.isFinite(clock.week) ? clock.week : 8;

    if (tokenInfo.detectedWeek !== null) {
        return {
            temporalMode: "EXPLICIT_WEEK",
            temporalBadge: `Week ${tokenInfo.detectedWeek} (${targetSeason})`,
            targetSeason,
            currentWeek,
            targetWeek: tokenInfo.detectedWeek,
            activeDate: clock.date,
            activeDayLabel: clock.dayLabel,
            clockLabel: clock.label
        };
    }

    if (activeTags.has("temporal:today")) {
        return {
            temporalMode: "TODAY",
            temporalBadge: `Today (${clock.dayLabel}) → Wk ${currentWeek}`,
            targetSeason,
            currentWeek,
            targetWeek: currentWeek,
            activeDate: clock.date,
            activeDayLabel: clock.dayLabel,
            clockLabel: clock.label
        };
    }

    if (activeTags.has("temporal:last_week")) {
        const prevWeek = Math.max(0, currentWeek - 1);
        return {
            temporalMode: "LAST_WEEK",
            temporalBadge: `Last Week → Wk ${prevWeek}`,
            targetSeason,
            currentWeek,
            targetWeek: prevWeek,
            activeDate: clock.date,
            activeDayLabel: clock.dayLabel,
            clockLabel: clock.label
        };
    }

    if (activeTags.has("temporal:next_week")) {
        const nextWeek = Math.min(16, currentWeek + 1);
        return {
            temporalMode: "NEXT_WEEK",
            temporalBadge: `Next Week → Wk ${nextWeek}`,
            targetSeason,
            currentWeek,
            targetWeek: nextWeek,
            activeDate: clock.date,
            activeDayLabel: clock.dayLabel,
            clockLabel: clock.label
        };
    }

    if (activeTags.has("temporal:this_week")) {
        return {
            temporalMode: "THIS_WEEK",
            temporalBadge: `This Week → Wk ${currentWeek}`,
            targetSeason,
            currentWeek,
            targetWeek: currentWeek,
            activeDate: clock.date,
            activeDayLabel: clock.dayLabel,
            clockLabel: clock.label
        };
    }

    return {
        temporalMode: "SEASON_DEFAULT",
        temporalBadge: `${targetSeason} Season (Clock: Wk ${currentWeek})`,
        targetSeason,
        currentWeek,
        targetWeek: currentWeek,
        activeDate: clock.date,
        activeDayLabel: clock.dayLabel,
        clockLabel: clock.label
    };
}

function formatGameDateShort(dateStr) {
    if (!dateStr) return "TBD";
    const parts = String(dateStr).split("-");
    if (parts.length !== 3) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIdx = Math.max(0, Math.min(11, Number(parts[1]) - 1));
    const dayNum = Number(parts[2]);
    return `${months[monthIdx]} ${dayNum}, ${parts[0]}`;
}

function getNormalizedTeamSchedule(school, season, schedulesBySeason) {
    const payload = schedulesBySeason?.[season] || schedulesBySeason?.[String(season)] || null;
    if (!payload || !Array.isArray(payload.teams) || !school) return null;

    const cleanSchoolExport = (school.exportId || "").replace(/25$/, "");
    const entry = payload.teams.find(
        (t) =>
            t.team?.team_id === cleanSchoolExport ||
            t.team?.team_id === school.exportId ||
            t.team?.slug === school.id
    );
    if (!entry) return null;

    const byKey = new Map();
    (entry.games || []).forEach((game) => {
        const oppKey = game.opponent?.team_id || game.opponent?.name || game.game_id;
        const key = `${game.week}_${oppKey}`;
        const existing = byKey.get(key);
        if (!existing) {
            byKey.set(key, game);
        } else if (!existing.has_parsed_game && game.has_parsed_game) {
            byKey.set(key, game);
        } else if (existing.score_authority !== "game_file" && game.score_authority === "game_file") {
            byKey.set(key, game);
        }
    });

    const games = Array.from(byKey.values()).sort((a, b) => {
        if ((a.week ?? 99) !== (b.week ?? 99)) return (a.week ?? 99) - (b.week ?? 99);
        return String(a.date || "").localeCompare(String(b.date || ""));
    });

    return {
        season: payload.season || season,
        teamMeta: entry.team,
        record: entry.record || "0-0",
        conferenceRecord: entry.conference_record || "0-0",
        divisionRecord: entry.division_record || "0-0",
        games
    };
}

function findSchoolByAnyId(teamIdOrName) {
    if (!teamIdOrName) return null;
    const clean = String(teamIdOrName).toLowerCase().replace(/25$/, "").trim();
    return (
        SCHOOL_WEB.find(
            (s) =>
                s.exportId === clean ||
                s.v5TeamId === clean ||
                s.id === clean ||
                s.name.toLowerCase() === clean ||
                s.abbrev.toLowerCase() === clean
        ) || null
    );
}

function formatGameResultLine(school, game) {
    if (!game) return null;
    const oppSchool = findSchoolByAnyId(game.opponent?.team_id || game.opponent?.name);
    const oppShort = oppSchool?.abbrev || game.opponent?.short_name || game.opponent?.name || "OPP";
    const oppName = oppSchool?.name || game.opponent?.name || "Opponent";
    const venuePrefix = game.venue_type === "away" ? "at" : "vs";
    const dateLabel = formatGameDateShort(game.date);
    const hasScore = game.status === "final" && game.team_score !== null && game.opponent_score !== null;

    if (hasScore) {
        const won = game.result === "W" || Number(game.team_score) > Number(game.opponent_score);
        const wlBadge = won ? "FINAL · W" : "FINAL · L";
        return {
            won,
            wlBadge,
            isFinal: true,
            teamA: {
                abbrev: school.abbrev,
                name: school.name,
                logo: school.logo,
                color: school.colors?.primary || "#18181B",
                score: game.team_score,
                won
            },
            teamB: {
                abbrev: oppShort,
                name: oppName,
                logo: oppSchool?.logo || null,
                color: oppSchool?.colors?.primary || "#27272A",
                score: game.opponent_score,
                won: !won
            },
            headline: `${school.abbrev} ${game.team_score} – ${oppShort} ${game.opponent_score}`,
            subline: `WK ${game.week} · ${dateLabel.toUpperCase()} · ${(game.location || game.stadium || oppName).toUpperCase()}`,
            route: game.route || `/teams/${school.id}/schedule`
        };
    }

    return {
        won: null,
        wlBadge: `WK ${game.week}`,
        isFinal: false,
        teamA: {
            abbrev: school.abbrev,
            name: school.name,
            logo: school.logo,
            color: school.colors?.primary || "#18181B",
            score: null,
            won: false
        },
        teamB: {
            abbrev: oppShort,
            name: oppName,
            logo: oppSchool?.logo || null,
            color: oppSchool?.colors?.primary || "#27272A",
            score: null,
            won: false
        },
        headline: `${school.abbrev} ${venuePrefix.toUpperCase()} ${oppShort}`,
        subline: `WK ${game.week} · ${dateLabel.toUpperCase()} · ${game.kickoff_time || "TBA"}`,
        route: game.route || `/teams/${school.id}/schedule`
    };
}

export function buildQuickFactAnswer({
    cleanedText,
    matchedSchools,
    matchedConcepts,
    matchedClassic,
    matchedPlayers = [],
    matchedCoaches = [],
    temporalContext,
    schedulesBySeason,
    forceDashboard = false
}) {
    if (forceDashboard) return null;

    const activeTags = new Set(matchedConcepts.map((c) => c.tag));
    const primarySchool = matchedSchools[0] || null;
    const secondSchool = matchedSchools[1] || null;
    const primaryPlayer = matchedPlayers[0] || null;
    const primaryCoach = matchedCoaches[0] || null;

    // 0. Player Lookup Quick Fact (e.g., "jauylon toblert" -> JAYLON TOLBERT · QB #11 · ALCORN)
    if (primaryPlayer) {
        const cleanTeam = String(primaryPlayer.team_id || "").replace(/25$/, "");
        const playerSchool = findSchoolByAnyId(cleanTeam) || primarySchool;
        const schoolAbbrev = playerSchool?.abbrev || cleanTeam.toUpperCase();
        const schoolRoute = playerSchool ? `/teams/${playerSchool.id}/roster` : "/rosters";
        const heightStr = primaryPlayer.height
            ? `${Math.floor(Number(primaryPlayer.height) / 12)}'${Number(primaryPlayer.height) % 12}"`
            : null;
        const weightStr = primaryPlayer.weight ? `${primaryPlayer.weight} LBS` : null;

        return {
            variant: "PERSON",
            kicker: `${schoolAbbrev} · ${primaryPlayer.class_year_raw || "ROSTER"} ${primaryPlayer.position || "PLAYER"}`,
            headline: `${primaryPlayer.full_name.toUpperCase()} · #${primaryPlayer.jersey_number ?? "—"} ${primaryPlayer.position || ""}`,
            detail: [heightStr, weightStr, primaryPlayer.hometown?.toUpperCase()].filter(Boolean).join(" • "),
            ghostText: `#${primaryPlayer.jersey_number ?? primaryPlayer.position ?? "25"}`,
            avatarUrl: primaryPlayer.image_url || null,
            schoolLogo: playerSchool?.logo || null,
            primaryColor: playerSchool?.colors?.primary || "#18181B",
            verifiedSource: `3-players/player_seasons_${primaryPlayer.season || 2025}.json (${primaryPlayer.person_id})`,
            actionPills: [
                {
                    label: "Player Profile",
                    type: "ROUTE",
                    route: `/player/${primaryPlayer.person_id}`
                },
                {
                    label: `${schoolAbbrev} Roster`,
                    type: "ROUTE",
                    route: schoolRoute
                },
                {
                    label: "Player Bento",
                    type: "EXPAND_DASHBOARD",
                    targetIntentId: "PLAYERS_GLORY_SPOTLIGHT"
                }
            ]
        };
    }

    // 0b. Coach Lookup Quick Fact
    if (primaryCoach) {
        const cleanTeam = String(primaryCoach.team_id || "").replace(/25$/, "");
        const coachSchool = findSchoolByAnyId(cleanTeam) || primarySchool;
        const schoolAbbrev = coachSchool?.abbrev || cleanTeam.toUpperCase();

        return {
            variant: "PERSON",
            kicker: `${schoolAbbrev} · ${primaryCoach.season || 2025} COACHING STAFF`,
            headline: primaryCoach.full_name.toUpperCase(),
            detail: (primaryCoach.title || "Coach").toUpperCase(),
            ghostText: schoolAbbrev,
            avatarUrl: primaryCoach.image_url || null,
            schoolLogo: coachSchool?.logo || null,
            primaryColor: coachSchool?.colors?.primary || "#18181B",
            verifiedSource: `4-coaches/coaches_all_years.json (${primaryCoach.person_id})`,
            actionPills: [
                {
                    label: "Coach Profile",
                    type: "ROUTE",
                    route: `/coaches/${primaryCoach.person_id}`
                },
                {
                    label: `${schoolAbbrev} Staff`,
                    type: "ROUTE",
                    route: coachSchool ? `/teams/${coachSchool.id}/coaches` : "/coaches"
                },
                {
                    label: "Staff Bento",
                    type: "EXPAND_DASHBOARD",
                    targetIntentId: "COACHES_ECOSYSTEM_HUB"
                }
            ]
        };
    }

    // If user explicitly asked for a full dashboard/comparison/starting roster breakdown, let FULL_DASHBOARD handle it
    const wantsFullDashboard =
        activeTags.has("mode:dashboard") ||
        activeTags.has("hub:roster") ||
        activeTags.has("roster:transfers") ||
        activeTags.has("roster:class") ||
        (matchedSchools.length >= 2 && (activeTags.has("hub:statlab") || activeTags.has("stat:passing") || activeTags.has("stat:rushing") || activeTags.has("stat:defense")));

    if (wantsFullDashboard && !matchedClassic && temporalContext.temporalMode === "SEASON_DEFAULT") {
        return null;
    }

    // 1. Named Classic / Championship Game Quick Answer (e.g., "Who won the 2025 Labor Day Classic?" -> "PVAMU 22 – TSU 21")
    if (matchedClassic) {
        const winnerSchool = findSchoolByAnyId(matchedClassic.winnerExportId);
        const loserExportId = (matchedClassic.teamIds || []).find((id) => id !== matchedClassic.winnerExportId);
        const loserSchool = findSchoolByAnyId(loserExportId);

        const winnerShort = winnerSchool?.abbrev || matchedClassic.winnerShort || matchedClassic.winnerName || "WIN";
        const loserShort = loserSchool?.abbrev || matchedClassic.loserShort || matchedClassic.loserName || "OPP";
        const primaryRouteSchool = primarySchool || winnerSchool || SCHOOL_WEB[0];
        const scheduleRoute = primaryRouteSchool ? `/teams/${primaryRouteSchool.id}/schedule` : "/game-center/schedule";
        const weekNum = matchedClassic.week ?? matchedClassic.week2025 ?? 1;
        const dateStr = matchedClassic.date || matchedClassic.date2025;
        const routeStr = matchedClassic.route || matchedClassic.route2025 || scheduleRoute;

        return {
            variant: "SCOREBOARD",
            kicker: `${matchedClassic.season || 2025} ${matchedClassic.name.toUpperCase()} · FINAL`,
            headline: `${winnerShort} ${matchedClassic.winnerScore} – ${loserShort} ${matchedClassic.loserScore}`,
            detail: `WK ${weekNum} • ${formatGameDateShort(dateStr).toUpperCase()} • ${matchedClassic.venue.toUpperCase()}`,
            ghostText: `${matchedClassic.winnerScore}-${matchedClassic.loserScore}`,
            teamA: {
                abbrev: winnerShort,
                name: winnerSchool?.name || matchedClassic.winnerName,
                logo: winnerSchool?.logo || null,
                color: winnerSchool?.colors?.primary || "#4B0082",
                score: matchedClassic.winnerScore,
                won: true
            },
            teamB: {
                abbrev: loserShort,
                name: loserSchool?.name || matchedClassic.loserName,
                logo: loserSchool?.logo || null,
                color: loserSchool?.colors?.primary || "#6F2633",
                score: matchedClassic.loserScore,
                won: false
            },
            verifiedSource: `team_schedules_${matchedClassic.season || 2025}.json`,
            actionPills: [
                {
                    label: "Game Page",
                    type: "ROUTE",
                    route: routeStr
                },
                {
                    label: `${winnerShort} Schedule`,
                    type: "ROUTE",
                    route: scheduleRoute
                },
                {
                    label: "Box Score Bento",
                    type: "EXPAND_DASHBOARD",
                    targetIntentId: "GAMECENTER_TEAM_SCHEDULES"
                }
            ]
        };
    }

    // 2. Relative Temporal & Weekly Matchup Queries ("today", "this week", "last week", "next week", "week X", or "did {team} win?")
    const isTemporalScheduleQuery =
        temporalContext.temporalMode !== "SEASON_DEFAULT" ||
        (primarySchool && activeTags.has("fact:result") && matchedSchools.length === 1);

    if (isTemporalScheduleQuery && primarySchool) {
        const teamSched = getNormalizedTeamSchedule(primarySchool, temporalContext.targetSeason, schedulesBySeason);
        const scheduleRoute = `/teams/${primarySchool.id}/schedule`;

        if (teamSched && teamSched.games.length > 0) {
            const { temporalMode, targetWeek, currentWeek, activeDate, activeDayLabel, targetSeason } = temporalContext;

            if (temporalMode === "TODAY") {
                const gameToday = teamSched.games.find((g) => g.date === activeDate);
                if (gameToday) {
                    const formatted = formatGameResultLine(primarySchool, gameToday);
                    return {
                        variant: "SCOREBOARD",
                        kicker: `GAMEDAY TODAY (${activeDayLabel.toUpperCase()}) · WK ${gameToday.week}`,
                        headline: formatted.headline,
                        detail: formatted.subline,
                        ghostText: formatted.isFinal ? `${gameToday.team_score}-${gameToday.opponent_score}` : `WK${gameToday.week}`,
                        teamA: formatted.teamA,
                        teamB: formatted.teamB,
                        verifiedSource: `team_schedules_${targetSeason}.json (${primarySchool.v5TeamId})`,
                        actionPills: [
                            { label: "Game Page", type: "ROUTE", route: formatted.route },
                            { label: `${primarySchool.abbrev} Schedule`, type: "ROUTE", route: scheduleRoute },
                            { label: "Schedule Bento", type: "EXPAND_DASHBOARD", targetIntentId: "GAMECENTER_TEAM_SCHEDULES" }
                        ]
                    };
                }

                // Does not play on activeDate -> check CURRENT_WEEK
                const weekGame = teamSched.games.find((g) => Number(g.week) === Number(currentWeek));
                if (weekGame) {
                    const formatted = formatGameResultLine(primarySchool, weekGame);
                    return {
                        variant: "SCOREBOARD",
                        kicker: `NO GAME TODAY (${activeDayLabel.toUpperCase()}) · THIS WEEK'S SLATE`,
                        headline: formatted.headline,
                        detail: formatted.subline,
                        ghostText: formatted.isFinal ? `${weekGame.team_score}-${weekGame.opponent_score}` : `WK${currentWeek}`,
                        teamA: formatted.teamA,
                        teamB: formatted.teamB,
                        verifiedSource: `team_schedules_${targetSeason}.json (${primarySchool.v5TeamId})`,
                        actionPills: [
                            { label: "Game Page", type: "ROUTE", route: formatted.route },
                            { label: `${primarySchool.abbrev} Schedule`, type: "ROUTE", route: scheduleRoute },
                            { label: "Schedule Bento", type: "EXPAND_DASHBOARD", targetIntentId: "GAMECENTER_TEAM_SCHEDULES" }
                        ]
                    };
                }

                // Team is on a BYE WEEK in currentWeek!
                const nextGame = teamSched.games.find((g) => Number(g.week) > Number(currentWeek));
                const nextOpp = findSchoolByAnyId(nextGame?.opponent?.team_id || nextGame?.opponent?.name);
                const nextShort = nextOpp?.abbrev || nextGame?.opponent?.name || "TBA";
                return {
                    variant: "FACT",
                    kicker: `WEEK ${currentWeek} STATUS · ${primarySchool.abbrev}`,
                    headline: `${primarySchool.abbrev} — BYE WEEK`,
                    detail: nextGame
                        ? `NEXT: WK ${nextGame.week} ${nextGame.venue_type === "away" ? "@" : "VS"} ${nextShort} (${formatGameDateShort(nextGame.date).toUpperCase()})`
                        : `${targetSeason} RECORD: ${teamSched.record}`,
                    ghostText: "BYE",
                    schoolLogo: primarySchool.logo,
                    primaryColor: primarySchool.colors?.primary,
                    verifiedSource: `team_schedules_${targetSeason}.json (${primarySchool.v5TeamId})`,
                    actionPills: [
                        ...(nextGame?.route ? [{ label: `Wk ${nextGame.week} Game Page`, type: "ROUTE", route: nextGame.route }] : []),
                        { label: `${primarySchool.abbrev} Schedule`, type: "ROUTE", route: scheduleRoute },
                        { label: "Schedule Bento", type: "EXPAND_DASHBOARD", targetIntentId: "GAMECENTER_TEAM_SCHEDULES" }
                    ]
                };
            }

            if (temporalMode === "LAST_WEEK" || (temporalMode === "SEASON_DEFAULT" && activeTags.has("fact:result"))) {
                let targetGame = teamSched.games.find((g) => Number(g.week) === Number(targetWeek));
                if (!targetGame) {
                    const priorGames = teamSched.games.filter((g) => Number(g.week) < Number(currentWeek));
                    targetGame = priorGames[priorGames.length - 1] || teamSched.games[teamSched.games.length - 1];
                }

                if (targetGame) {
                    const formatted = formatGameResultLine(primarySchool, targetGame);
                    return {
                        variant: "SCOREBOARD",
                        kicker: `${targetSeason} WEEK ${targetGame.week} · ${formatted.wlBadge}`,
                        headline: formatted.headline,
                        detail: formatted.subline,
                        ghostText: formatted.isFinal ? `${targetGame.team_score}-${targetGame.opponent_score}` : `WK${targetGame.week}`,
                        teamA: formatted.teamA,
                        teamB: formatted.teamB,
                        verifiedSource: `team_schedules_${targetSeason}.json (${primarySchool.v5TeamId})`,
                        actionPills: [
                            { label: "Game Page", type: "ROUTE", route: formatted.route },
                            { label: `${primarySchool.abbrev} Schedule`, type: "ROUTE", route: scheduleRoute },
                            { label: "Box Score Bento", type: "EXPAND_DASHBOARD", targetIntentId: "GAMECENTER_TEAM_SCHEDULES" }
                        ]
                    };
                }
            }

            if (temporalMode === "NEXT_WEEK") {
                let nextGame = teamSched.games.find((g) => Number(g.week) === Number(targetWeek));
                if (!nextGame) {
                    nextGame = teamSched.games.find((g) => Number(g.week) > Number(currentWeek));
                }

                if (nextGame) {
                    const formatted = formatGameResultLine(primarySchool, nextGame);
                    return {
                        variant: "SCOREBOARD",
                        kicker: `NEXT MATCHUP · WEEK ${nextGame.week}`,
                        headline: formatted.headline,
                        detail: formatted.subline,
                        ghostText: `WK${nextGame.week}`,
                        teamA: formatted.teamA,
                        teamB: formatted.teamB,
                        verifiedSource: `team_schedules_${targetSeason}.json (${primarySchool.v5TeamId})`,
                        actionPills: [
                            { label: "Game Page", type: "ROUTE", route: formatted.route },
                            { label: `${primarySchool.abbrev} Schedule`, type: "ROUTE", route: scheduleRoute },
                            { label: "Schedule Bento", type: "EXPAND_DASHBOARD", targetIntentId: "GAMECENTER_TEAM_SCHEDULES" }
                        ]
                    };
                }
            }

            if (temporalMode === "THIS_WEEK" || temporalMode === "EXPLICIT_WEEK") {
                const weekGame = teamSched.games.find((g) => Number(g.week) === Number(targetWeek));
                if (weekGame) {
                    const formatted = formatGameResultLine(primarySchool, weekGame);
                    return {
                        variant: "SCOREBOARD",
                        kicker: `${targetSeason} WEEK ${targetWeek} · ${formatted.wlBadge}`,
                        headline: formatted.headline,
                        detail: formatted.subline,
                        ghostText: formatted.isFinal ? `${weekGame.team_score}-${weekGame.opponent_score}` : `WK${targetWeek}`,
                        teamA: formatted.teamA,
                        teamB: formatted.teamB,
                        verifiedSource: `team_schedules_${targetSeason}.json (${primarySchool.v5TeamId})`,
                        actionPills: [
                            { label: "Game Page", type: "ROUTE", route: formatted.route },
                            { label: `${primarySchool.abbrev} Schedule`, type: "ROUTE", route: scheduleRoute },
                            { label: "Schedule Bento", type: "EXPAND_DASHBOARD", targetIntentId: "GAMECENTER_TEAM_SCHEDULES" }
                        ]
                    };
                }

                const nextGame = teamSched.games.find((g) => Number(g.week) > Number(targetWeek));
                return {
                    variant: "FACT",
                    kicker: `${targetSeason} WEEK ${targetWeek} · ${primarySchool.abbrev}`,
                    headline: `${primarySchool.abbrev} — BYE WEEK`,
                    detail: nextGame
                        ? `NEXT: WK ${nextGame.week} VS ${nextGame.opponent?.name?.toUpperCase()}`
                        : `RECORD: ${teamSched.record} (${teamSched.conferenceRecord} ${primarySchool.conference})`,
                    ghostText: "BYE",
                    schoolLogo: primarySchool.logo,
                    primaryColor: primarySchool.colors?.primary,
                    verifiedSource: `team_schedules_${targetSeason}.json (${primarySchool.v5TeamId})`,
                    actionPills: [
                        { label: `${primarySchool.abbrev} Schedule`, type: "ROUTE", route: scheduleRoute },
                        { label: "Schedule Bento", type: "EXPAND_DASHBOARD", targetIntentId: "GAMECENTER_TEAM_SCHEDULES" }
                    ]
                };
            }
        }
    }

    // 3. Head-to-Head Matchup Result between Two Schools
    if (primarySchool && secondSchool && (activeTags.has("fact:result") || activeTags.has("hub:schedule"))) {
        const teamSched = getNormalizedTeamSchedule(primarySchool, temporalContext.targetSeason, schedulesBySeason);
        const h2hGame = teamSched?.games?.find(
            (g) =>
                g.opponent?.team_id === secondSchool.v5TeamId ||
                g.opponent?.team_id === secondSchool.exportId ||
                String(g.opponent?.name || "").toLowerCase().includes(secondSchool.name.toLowerCase())
        );
        if (h2hGame) {
            const formatted = formatGameResultLine(primarySchool, h2hGame);
            return {
                variant: "SCOREBOARD",
                kicker: `${temporalContext.targetSeason} WEEK ${h2hGame.week} · ${formatted.wlBadge}`,
                headline: formatted.headline,
                detail: formatted.subline,
                ghostText: formatted.isFinal ? `${h2hGame.team_score}-${h2hGame.opponent_score}` : "VS",
                teamA: formatted.teamA,
                teamB: formatted.teamB,
                verifiedSource: `team_schedules_${temporalContext.targetSeason}.json`,
                actionPills: [
                    { label: "Game Page", type: "ROUTE", route: formatted.route },
                    { label: `${primarySchool.abbrev} Schedule`, type: "ROUTE", route: `/teams/${primarySchool.id}/schedule` },
                    { label: "StatLab Bento", type: "EXPAND_DASHBOARD", targetIntentId: "STATLAB_PASSING_RUSHING" }
                ]
            };
        }
    }

    // 4. Marching Band Quick Fact (e.g., "What is Alcorn's band name?" -> "SOUNDS OF DYN-O-MITE")
    if (primarySchool && activeTags.has("fact:band")) {
        const mb = primarySchool.rawTeam?.wiki?.marching_band || {};
        const bandName = primarySchool.bandName || mb.name || "Marching Band";
        const nick = primarySchool.bandNickname || mb.nickname;
        const song = primarySchool.signatureSong || primarySchool.rawTeam?.wiki?.band?.signatureSelection;
        const danceTeam = mb.auxiliary_units?.dance_team?.name;

        return {
            variant: "FACT",
            kicker: `${primarySchool.abbrev} · MARCHING BAND`,
            headline: bandName.toUpperCase(),
            detail: [
                nick && nick !== bandName ? `"${nick.toUpperCase()}"` : null,
                song ? `FANFARE: ${song.toUpperCase()}` : null,
                danceTeam ? `DANCE: ${danceTeam.toUpperCase()}` : null
            ].filter(Boolean).join(" • "),
            ghostText: nick || primarySchool.abbrev,
            schoolLogo: primarySchool.logo,
            primaryColor: primarySchool.colors?.primary,
            verifiedSource: "src/data/teams.json (wiki.marching_band)",
            actionPills: [
                { label: `${primarySchool.abbrev} Wiki`, type: "ROUTE", route: `/teams/${primarySchool.id}/wiki` },
                { label: `${primarySchool.abbrev} Hub`, type: "ROUTE", route: `/teams/${primarySchool.id}` },
                { label: "Wiki Bento", type: "EXPAND_DASHBOARD", targetIntentId: "SCHOOLS_WIKI_TRADITIONS" }
            ]
        };
    }

    // 5. Stadium & Venue Quick Fact
    if (primarySchool && activeTags.has("fact:stadium") && !activeTags.has("hub:schedule")) {
        const st = primarySchool.rawTeam?.wiki?.stadium || {};
        const cap = st.capacity ? Number(st.capacity).toLocaleString() : "N/A";

        return {
            variant: "FACT",
            kicker: `${primarySchool.abbrev} · HOME STADIUM`,
            headline: (primarySchool.stadium || "STADIUM").toUpperCase(),
            detail: `CAP ${cap} • ${(primarySchool.location || "").toUpperCase()}${st.playing_surface ? ` • ${st.playing_surface.toUpperCase()}` : ""}`,
            ghostText: cap,
            schoolLogo: primarySchool.logo,
            primaryColor: primarySchool.colors?.primary,
            verifiedSource: "src/data/teams.json (wiki.stadium)",
            actionPills: [
                { label: `${primarySchool.abbrev} Wiki`, type: "ROUTE", route: `/teams/${primarySchool.id}/wiki` },
                { label: `${primarySchool.abbrev} Schedule`, type: "ROUTE", route: `/teams/${primarySchool.id}/schedule` },
                { label: "Wiki Bento", type: "EXPAND_DASHBOARD", targetIntentId: "SCHOOLS_WIKI_TRADITIONS" }
            ]
        };
    }

    // 6. Team Overall & Conference Record Quick Fact
    if (primarySchool && activeTags.has("fact:record")) {
        const teamSched = getNormalizedTeamSchedule(primarySchool, temporalContext.targetSeason, schedulesBySeason);
        if (teamSched) {
            return {
                variant: "FACT",
                kicker: `${temporalContext.targetSeason} ${primarySchool.conference} RECORD`,
                headline: `${primarySchool.abbrev} ${teamSched.record} (${teamSched.conferenceRecord} ${primarySchool.conference})`,
                detail: `DIVISION: ${teamSched.divisionRecord} • ${primarySchool.name.toUpperCase()}`,
                ghostText: teamSched.record,
                schoolLogo: primarySchool.logo,
                primaryColor: primarySchool.colors?.primary,
                verifiedSource: `team_schedules_${temporalContext.targetSeason}.json (${primarySchool.v5TeamId})`,
                actionPills: [
                    { label: `${primarySchool.abbrev} Schedule`, type: "ROUTE", route: `/teams/${primarySchool.id}/schedule` },
                    { label: "Standings", type: "ROUTE", route: "/game-center/standings" },
                    { label: "Standings Bento", type: "EXPAND_DASHBOARD", targetIntentId: "GAMECENTER_STANDINGS_RACE" }
                ]
            };
        }
    }

    // 7. School Identity / Motto / Rivalry Quick Fact
    if (primarySchool && (activeTags.has("fact:identity") || /\b(rivals?|rivalry|rivalries)\b/i.test(cleanedText))) {
        const iden = primarySchool.rawTeam?.wiki?.identity || {};
        const hist = primarySchool.rawTeam?.wiki?.history || {};
        const rivalries = primarySchool.rawTeam?.wiki?.athletics?.rivalries || [];
        const rivalryText = rivalries.length > 0
            ? rivalries.map((r) => r.teamName.toUpperCase()).join(" • ")
            : primarySchool.conference;

        return {
            variant: "FACT",
            kicker: `${primarySchool.abbrev} · EST. ${hist.founded || "HBCU"}`,
            headline: `${primarySchool.name.toUpperCase()} ${primarySchool.mascot.toUpperCase()}`,
            detail: iden.motto ? `"${iden.motto.toUpperCase()}" • RIVALS: ${rivalryText}` : `RIVALS: ${rivalryText}`,
            ghostText: String(hist.founded || primarySchool.abbrev),
            schoolLogo: primarySchool.logo,
            primaryColor: primarySchool.colors?.primary,
            verifiedSource: "src/data/teams.json (wiki)",
            actionPills: [
                { label: `${primarySchool.abbrev} Wiki`, type: "ROUTE", route: `/teams/${primarySchool.id}/wiki` },
                { label: `${primarySchool.abbrev} Hub`, type: "ROUTE", route: `/teams/${primarySchool.id}` },
                { label: "Wiki Bento", type: "EXPAND_DASHBOARD", targetIntentId: "SCHOOLS_WIKI_TRADITIONS" }
            ]
        };
    }

    return null;
}

export function resolveIntentAndWeave(
    matchedSchools,
    matchedConcepts,
    tokenInfo,
    options = {}
) {
    const {
        activeClock = DEFAULT_ACTIVE_CLOCK,
        schedulesBySeason = null,
        forceDashboard = false,
        preferredIntentId = null,
        matchedClassic = null,
        matchedPlayers = [],
        matchedCoaches = []
    } = options;

    const activeTags = new Set(matchedConcepts.map((c) => c.tag));
    const hasTeam = matchedSchools.length > 0;
    const isComparison = matchedSchools.length >= 2 || activeTags.has("hub:statlab");

    const temporalContext = resolveTemporalContext(
        tokenInfo.cleanedText,
        matchedConcepts,
        tokenInfo,
        activeClock
    );

    const quickAnswer = buildQuickFactAnswer({
        cleanedText: tokenInfo.cleanedText,
        matchedSchools,
        matchedConcepts,
        matchedClassic,
        matchedPlayers,
        matchedCoaches,
        temporalContext,
        schedulesBySeason,
        forceDashboard
    });

    const scoredBlueprints = INTENT_BLUEPRINTS.map((bp) => {
        let score = 0;
        const matchedRequired = bp.requiredTags.filter((t) => activeTags.has(t));

        score += matchedRequired.length * 30;

        if (bp.boostWithTeam && hasTeam && matchedRequired.length > 0) {
            score += 20;
        }

        if (bp.id === "GAMECENTER_TEAM_SCHEDULES" && (activeTags.has("filter:home") || activeTags.has("filter:away") || activeTags.has("filter:next_prev") || temporalContext.temporalMode !== "SEASON_DEFAULT" || matchedClassic)) {
            score += 45;
        }
        if (bp.id === "PLAYERS_GLORY_SPOTLIGHT" && (matchedPlayers.length > 0 || (activeTags.has("modifier:leaders") && (activeTags.has("stat:passing") || activeTags.has("stat:rushing") || activeTags.has("stat:receiving") || activeTags.has("stat:defense"))))) {
            score += 55;
        }
        if (bp.id === "COACHES_ECOSYSTEM_HUB" && matchedCoaches.length > 0) {
            score += 55;
        }
        if (bp.id === "STATLAB_PASSING_RUSHING" && isComparison) {
            score += 35;
        }
        if (bp.id === "SCHOOLS_WIKI_TRADITIONS" && (activeTags.has("fact:band") || activeTags.has("fact:stadium") || activeTags.has("fact:identity"))) {
            score += 45;
        }
        if (bp.id === "GAMECENTER_STANDINGS_RACE" && activeTags.has("fact:record")) {
            score += 40;
        }
        if (bp.id === "SCHOOLS_TEAM_DIRECTORY" && hasTeam && activeTags.size === 0) {
            score += 50;
        }
        if (bp.id === "GAMECENTER_HUB" && !hasTeam && activeTags.size === 0 && tokenInfo.meaningfulTokens.length > 0) {
            score += 15;
        }

        return {
            ...bp,
            score,
            matchedTags: matchedRequired
        };
    }).sort((a, b) => b.score - a.score);

    const forcedBlueprint = preferredIntentId
        ? INTENT_BLUEPRINTS.find((b) => b.id === preferredIntentId)
        : null;

    const primaryIntent = forcedBlueprint
        || (scoredBlueprints[0]?.score > 0
            ? scoredBlueprints[0]
            : hasTeam
                ? INTENT_BLUEPRINTS.find((b) => b.id === "SCHOOLS_TEAM_DIRECTORY")
                : INTENT_BLUEPRINTS.find((b) => b.id === "GAMECENTER_HUB"));

    const secondaryIntents = scoredBlueprints
        .filter((b) => b.id !== primaryIntent.id && b.score > 0)
        .slice(0, 2);

    const primarySchool = matchedSchools[0] || null;
    const primaryPlayer = matchedPlayers[0] || null;
    const primaryCoach = matchedCoaches[0] || null;
    let resolvedRoute =
        (primaryPlayer ? `/player/${primaryPlayer.person_id}` : null) ||
        (primaryCoach ? `/coaches/${primaryCoach.person_id}` : null) ||
        matchedClassic?.route ||
        matchedClassic?.route2025 ||
        primaryIntent.route;
    if (primarySchool && !matchedClassic && !primaryPlayer && !primaryCoach) {
        if (primaryIntent.id === "SCHOOLS_TEAM_DIRECTORY") {
            resolvedRoute = `/teams/${primarySchool.id}`;
        } else if (primaryIntent.id === "GAMECENTER_TEAM_SCHEDULES") {
            resolvedRoute = `/teams/${primarySchool.id}/schedule`;
        } else if (primaryIntent.id === "SCHOOLS_ROSTER_BREAKDOWN") {
            resolvedRoute = `/teams/${primarySchool.id}/roster`;
        } else if (primaryIntent.id === "SCHOOLS_WIKI_TRADITIONS") {
            resolvedRoute = `/teams/${primarySchool.id}/wiki`;
        } else if (primaryIntent.id === "COACHES_ECOSYSTEM_HUB") {
            resolvedRoute = `/teams/${primarySchool.id}/coaches`;
        }
    }

    const responseMode = quickAnswer && !forceDashboard ? "QUICK_ANSWER" : "FULL_DASHBOARD";

    const followUpPrompts = buildFollowUpWeb(
        primarySchool,
        matchedSchools[1],
        primaryIntent,
        activeTags,
        temporalContext
    );

    const conversationalSummary = quickAnswer
        ? quickAnswer.headline
        : buildConversationalSummary(
            primarySchool,
            matchedSchools,
            matchedConcepts,
            primaryIntent,
            tokenInfo,
            temporalContext
        );

    return {
        responseMode,
        quickAnswer,
        temporalContext,
        matchedClassic,
        primaryIntent: {
            ...primaryIntent,
            resolvedRoute
        },
        secondaryIntents,
        followUpPrompts,
        conversationalSummary
    };
}

function buildFollowUpWeb(primarySchool, secondSchool, primaryIntent, activeTags, temporalContext) {
    const teamName = primarySchool ? primarySchool.name : "Prairie View A&M";
    const rivalName = primarySchool?.rawTeam?.wiki?.athletics?.rivalries?.[0]?.teamName || "Jackson State";

    const suggestions = [];

    if (primarySchool) {
        if (temporalContext?.temporalMode !== "LAST_WEEK") {
            suggestions.push(`Did ${teamName} win last week?`);
        }
        if (temporalContext?.temporalMode !== "NEXT_WEEK") {
            suggestions.push(`Who does ${teamName} play next week?`);
        }
        if (!activeTags.has("fact:band")) {
            suggestions.push(`What is ${teamName}'s band name?`);
        }
        if (!activeTags.has("hub:roster") && !activeTags.has("roster:transfers")) {
            suggestions.push(`Show ${teamName} starting roster, veterans %, and transfer portal rate`);
        }
        suggestions.push(`Compare ${teamName} vs ${secondSchool ? secondSchool.name : rivalName} passing in StatLab`);
    } else {
        suggestions.push("Who won the Bayou Classic?");
        suggestions.push("Did Southern win last week?");
        suggestions.push("What is Alcorn's band name?");
        suggestions.push("Pull up Prairie View A&M dashboard with coach and last 5 games");
    }

    return suggestions.slice(0, 4);
}

function buildConversationalSummary(primarySchool, matchedSchools, matchedConcepts, primaryIntent, tokenInfo, temporalContext) {
    const schoolLabels = matchedSchools.map((s) => `${s.name} (${s.exportId})`).join(" vs. ");
    const conceptLabels = matchedConcepts.map((c) => c.label).join(", ");
    const seasonLabel = temporalContext?.targetSeason || tokenInfo.detectedSeason;

    if (matchedSchools.length >= 2) {
        return `Wove a multi-team comparison between ${schoolLabels} targeting ${conceptLabels || "head-to-head metrics"} in ${primaryIntent.hub} (${seasonLabel} season).`;
    }
    if (primarySchool && matchedConcepts.length > 0) {
        return `Matched ${primarySchool.name} (${primarySchool.conference}${primarySchool.division ? " " + primarySchool.division : ""}) and mapped [${conceptLabels}] → assembling full ${primaryIntent.hub} Bento Blueprint.`;
    }
    if (primarySchool) {
        return `Identified ${primarySchool.name} (${primarySchool.mascot}). Assembling the full ${primarySchool.name} Team Profile Hub overview.`;
    }
    if (matchedConcepts.length > 0) {
        return `Parsed conference-wide query for [${conceptLabels}] (${seasonLabel} season) → mapped to ${primaryIntent.hub} (${primaryIntent.sectionOwner}).`;
    }
    return `No specific school or narrow stat locked—defaulting to the conference-wide Game Center Hub overview. Try mentioning a school, classic, stat, or hub!`;
}

export function parseFauxAiQuery(rawInput, options = {}) {
    const startTime = performance.now();
    const tokenInfo = normalizeAndTokenize(rawInput);
    const { matchedSchools, fuzzyCorrections } = matchSchools(
        tokenInfo.cleanedText,
        tokenInfo.meaningfulTokens
    );
    const { matchedConcepts, conceptCorrections } = matchConceptsAndSynonyms(
        tokenInfo.cleanedText,
        tokenInfo.meaningfulTokens
    );
    const matchedClassic = matchClassics(tokenInfo.cleanedText);
    const { matchedPlayers, matchedCoaches, peopleCorrections } = matchPeopleFuzzy(
        tokenInfo.meaningfulTokens,
        options.players || [],
        options.coaches || []
    );

    // If a player or coach was matched and their school wasn't explicitly typed, attach their school automatically!
    const primaryPerson = matchedPlayers[0] || matchedCoaches[0] || null;
    if (primaryPerson && matchedSchools.length === 0) {
        const cleanTeam = String(primaryPerson.team_id || "").replace(/25$/, "");
        const foundSchool = SCHOOL_WEB.find((s) => s.exportId === cleanTeam || s.v5TeamId === cleanTeam);
        if (foundSchool) {
            matchedSchools.push({
                ...foundSchool,
                matchType: "INFERRED_FROM_PERSON",
                matchedTerm: primaryPerson.full_name,
                confidence: 0.95
            });
        }
    }

    // If a Classic was matched and no school was explicitly matched in text, attach the classic's participating schools
    const classicTeams = matchedClassic?.teamIds || matchedClassic?.teams || [];
    if (matchedClassic && matchedSchools.length === 0 && Array.isArray(classicTeams)) {
        classicTeams.forEach((exportId) => {
            const found = SCHOOL_WEB.find((s) => s.exportId === exportId);
            if (found) {
                matchedSchools.push({
                    ...found,
                    matchType: "CLASSIC_PARTICIPANT",
                    matchedTerm: matchedClassic.matchedAlias,
                    confidence: 0.98
                });
            }
        });
    }

    const resolution = resolveIntentAndWeave(
        matchedSchools,
        matchedConcepts,
        tokenInfo,
        {
            ...options,
            matchedClassic,
            matchedPlayers,
            matchedCoaches
        }
    );

    const elapsedMs = Math.max(1, Math.round((performance.now() - startTime) * 100) / 100);

    return {
        id: options.id || `parse_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: options.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        elapsedMs,
        tokenInfo,
        matchedSchools,
        matchedConcepts,
        matchedClassic,
        matchedPlayers,
        matchedCoaches,
        corrections: [...fuzzyCorrections, ...conceptCorrections, ...peopleCorrections],
        resolution
    };
}
