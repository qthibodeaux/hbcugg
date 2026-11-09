import teamsData from "../../../data/teams.json";

/**
 * Pure Dictionary, Classics Registry, Temporal Rules & Keyword Web
 * for the HBCU GridIron Glory Faux AI Engine.
 * Maps natural user language, slang, typos, football concepts, relative dates,
 * classics, and team aliases to canonical hubs, routes, data contracts,
 * Quick Punchy Answers, and Full Dashboard Bento blueprints.
 */

// 1. STOP WORDS (ignored during intent scoring, preserved in raw tokens & cleanedText)
export const STOP_WORDS = new Set([
    "i", "want", "to", "see", "the", "show", "me", "what", "are", "is", "who",
    "how", "many", "can", "you", "give", "find", "lookup", "pull", "up", "tell",
    "about", "for", "in", "on", "at", "of", "and", "or", "with", "a", "an",
    "please", "hey", "yo", "let", "lets", "get", "check", "out", "their", "his",
    "they", "them", "have", "has", "did", "does", "do", "was", "were", "be"
]);

// 2. ACTIVE CLOCK / WEEK SIMULATOR PRESETS (For testing "today", "this week", "last week", "next week", Bye Weeks)
export const ACTIVE_CLOCK_PRESETS = [
    {
        id: "2025-w8-wed",
        shortLabel: "Wk 8 · Wed Oct 15 (Mid-Week)",
        label: "2025 Season · Week 8 (Wed, Oct 15, 2025 — Mid-Week)",
        season: 2025,
        week: 8,
        date: "2025-10-15",
        dayLabel: "Wed, Oct 15, 2025"
    },
    {
        id: "2025-w8-sat",
        shortLabel: "Wk 8 · Sat Oct 18 (Game Day)",
        label: "2025 Season · Week 8 (Sat, Oct 18, 2025 — Game Day)",
        season: 2025,
        week: 8,
        date: "2025-10-18",
        dayLabel: "Sat, Oct 18, 2025"
    },
    {
        id: "2025-w6-sat",
        shortLabel: "Wk 6 · Sat Oct 4 (SU Bye Week)",
        label: "2025 Season · Week 6 (Sat, Oct 4, 2025 — Southern Bye Week)",
        season: 2025,
        week: 6,
        date: "2025-10-04",
        dayLabel: "Sat, Oct 4, 2025"
    },
    {
        id: "2025-w14-sat",
        shortLabel: "Wk 14 · Sat Nov 29 (Bayou Classic)",
        label: "2025 Season · Week 14 (Sat, Nov 29, 2025 — Bayou Classic)",
        season: 2025,
        week: 14,
        date: "2025-11-29",
        dayLabel: "Sat, Nov 29, 2025"
    },
    {
        id: "2025-w15-sat",
        shortLabel: "Wk 15 · Sat Dec 6 (SWAC Title)",
        label: "2025 Season · Week 15 (Sat, Dec 6, 2025 — SWAC Championship)",
        season: 2025,
        week: 15,
        date: "2025-12-06",
        dayLabel: "Sat, Dec 6, 2025"
    },
    {
        id: "2026-w1-wed",
        shortLabel: "2026 Wk 1 · Wed Sep 2",
        label: "2026 Season · Week 1 (Wed, Sep 2, 2026 — Upcoming Slate)",
        season: 2026,
        week: 1,
        date: "2026-09-02",
        dayLabel: "Wed, Sep 2, 2026"
    }
];

export const DEFAULT_ACTIVE_CLOCK = ACTIVE_CLOCK_PRESETS[0];

// 3. HBCU CLASSICS, RIVALRIES & TITLE GAMES REGISTRY (Backed by real 2025 schedule facts)
export const CLASSICS_CATALOG = [
    {
        id: "labor-day-classic",
        name: "Labor Day Classic",
        aliases: ["labor day classic", "labor day game", "pvamu vs tsu", "tsu vs pvamu"],
        teamIds: ["swacpvamu", "swactsu"],
        week2025: 1,
        date2025: "2025-08-30",
        venue: "Shell Energy Stadium (Houston, TX)",
        route2025: "/game/W1pvamutsu",
        winnerExportId: "swacpvamu",
        winnerName: "Prairie View A&M",
        loserName: "Texas Southern",
        winnerScore: 22,
        loserScore: 21,
        summaryNote: "Prairie View A&M edged Texas Southern 22–21 at Shell Energy Stadium in Houston to open the 2025 SWAC West slate."
    },
    {
        id: "bayou-classic",
        name: "Bayou Classic",
        aliases: ["bayou classic", "the bayou classic", "southern vs grambling", "grambling vs southern"],
        teamIds: ["swacsu", "swacgsu"],
        week2025: 14,
        date2025: "2025-11-29",
        venue: "Caesars Superdome (New Orleans, LA)",
        route2025: "/game/W14sugsu",
        winnerExportId: "swacsu",
        winnerName: "Southern",
        loserName: "Grambling State",
        winnerScore: 28,
        loserScore: 27,
        summaryNote: "Southern defeated Grambling State 28–27 in a one-point thriller inside the Caesars Superdome in Week 14."
    },
    {
        id: "magic-city-classic",
        name: "Magic City Classic",
        aliases: ["magic city classic", "magic city", "asu vs aamu", "aamu vs asu", "bama state vs aamu"],
        teamIds: ["swacasu", "swacaamu"],
        week2025: 9,
        date2025: "2025-10-25",
        venue: "Legion Field (Birmingham, AL)",
        route2025: "/game/W9aamuasu",
        winnerExportId: "swacasu",
        winnerName: "Alabama State",
        loserName: "Alabama A&M",
        winnerScore: 56,
        loserScore: 13,
        summaryNote: "Alabama State rolled past Alabama A&M 56–13 at Legion Field in Birmingham for its 4th consecutive Magic City Classic victory."
    },
    {
        id: "soul-bowl",
        name: "The Soul Bowl (Capital City Classic)",
        aliases: ["soul bowl", "the soul bowl", "capital city classic", "alcorn vs jsu", "jsu vs alcorn", "alcorn vs jackson state"],
        teamIds: ["swacjsu", "swacalc"],
        week2025: 13,
        date2025: "2025-11-22",
        venue: "Veterans Memorial Stadium (Jackson, MS)",
        route2025: "/game/alcjsu25",
        winnerExportId: "swacjsu",
        winnerName: "Jackson State",
        loserName: "Alcorn State",
        winnerScore: 27,
        loserScore: 21,
        summaryNote: "Jackson State held off Alcorn State 27–21 at Veterans Memorial Stadium in Week 13."
    },
    {
        id: "florida-classic",
        name: "Florida Blue Florida Classic",
        aliases: ["florida classic", "the florida classic", "famu vs bcu", "bcu vs famu", "famu vs bethune"],
        teamIds: ["swacbcu", "swacfamu"],
        week2025: 13,
        date2025: "2025-11-22",
        venue: "Camping World Stadium (Orlando, FL)",
        route2025: "/game/W13famubcu",
        winnerExportId: "swacbcu",
        winnerName: "Bethune-Cookman",
        loserName: "Florida A&M",
        winnerScore: 38,
        loserScore: 34,
        summaryNote: "Bethune-Cookman defeated rival Florida A&M 38–34 at Camping World Stadium in Orlando."
    },
    {
        id: "state-fair-classic",
        name: "State Fair Classic",
        aliases: ["state fair classic", "cotton bowl classic", "pvamu vs grambling", "grambling vs pvamu"],
        teamIds: ["swacpvamu", "swacgsu"],
        week2025: 5,
        date2025: "2025-09-27",
        venue: "Cotton Bowl / Dallas, TX",
        route2025: "/game/W5gsupvamu",
        winnerExportId: "swacpvamu",
        winnerName: "Prairie View A&M",
        loserName: "Grambling State",
        winnerScore: 28,
        loserScore: 13,
        summaryNote: "Prairie View A&M defeated Grambling State 28–13 in Dallas during Week 5."
    },
    {
        id: "orange-blossom-classic",
        name: "Orange Blossom Classic",
        aliases: ["orange blossom classic", "obc", "howard vs famu", "famu vs howard"],
        teamIds: ["meachu", "swacfamu"],
        week2025: 1,
        date2025: "2025-08-30",
        venue: "Hard Rock Stadium (Miami Gardens, FL)",
        route2025: "/game/W0hufamu",
        winnerExportId: "meachu",
        winnerName: "Howard",
        loserName: "Florida A&M",
        winnerScore: 10,
        loserScore: 9,
        summaryNote: "Howard edged Florida A&M 10–9 at Hard Rock Stadium in Miami Gardens in Week 1."
    },
    {
        id: "southern-heritage-classic",
        name: "Southern Heritage Classic",
        aliases: ["southern heritage classic", "memphis classic", "alcorn vs uapb", "uapb vs alcorn"],
        teamIds: ["swacuapb", "swacalc"],
        week2025: 5,
        date2025: "2025-09-27",
        venue: "Simmons Bank Liberty Stadium (Memphis, TN)",
        route2025: "/game/alcuapb25",
        winnerExportId: "swacuapb",
        winnerName: "Arkansas-Pine Bluff",
        loserName: "Alcorn State",
        winnerScore: 24,
        loserScore: 20,
        summaryNote: "Arkansas-Pine Bluff topped Alcorn State 24–20 at Simmons Bank Liberty Stadium in Memphis."
    },
    {
        id: "gulf-coast-challenge",
        name: "Gulf Coast Challenge",
        aliases: ["gulf coast challenge", "mobile classic", "jsu vs aamu", "aamu vs jsu"],
        teamIds: ["swacjsu", "swacaamu"],
        week2025: 6,
        date2025: "2025-10-04",
        venue: "Ladd-Peebles Stadium (Mobile, AL)",
        route2025: "/game/W6jsuaamu",
        winnerExportId: "swacjsu",
        winnerName: "Jackson State",
        loserName: "Alabama A&M",
        winnerScore: 57,
        loserScore: 24,
        summaryNote: "Jackson State defeated Alabama A&M 57–24 at Ladd-Peebles Stadium in Mobile."
    },
    {
        id: "morgan-howard-classic",
        name: "Morgan–Howard Classic",
        aliases: ["morgan howard classic", "morgan-howard classic", "howard vs morgan", "morgan vs howard"],
        teamIds: ["meachu", "meacmsu"],
        week2025: 9,
        date2025: "2025-10-25",
        venue: "Greene Stadium (Washington, DC)",
        route2025: "/game/W9msuhu",
        winnerExportId: "meachu",
        winnerName: "Howard",
        loserName: "Morgan State",
        winnerScore: 33,
        loserScore: 27,
        summaryNote: "Howard defeated rival Morgan State 33–27 at Greene Stadium in Week 9."
    },
    {
        id: "turkey-day-classic",
        name: "Turkey Day Classic",
        aliases: ["turkey day classic", "asu vs tuskegee", "tuskegee classic"],
        teamIds: ["swacasu"],
        week2025: 14,
        date2025: "2024-11-28",
        venue: "ASU Stadium (Montgomery, AL)",
        route2025: "/teams/alabama-state/wiki",
        winnerExportId: "swacasu",
        winnerName: "Alabama State",
        loserName: "Tuskegee",
        winnerScore: 34,
        loserScore: 6,
        summaryNote: "The Turkey Day Classic (first played in 1924) is the nation's oldest Black college football classic; ASU defeated Tuskegee 34–6 in the 100th milestone edition."
    },
    {
        id: "swac-championship",
        name: "2025 SWAC Championship Game",
        aliases: ["swac championship", "swac title game", "swac champ game", "who won the swac", "swac champion"],
        teamIds: ["swacpvamu", "swacjsu"],
        week2025: 15,
        date2025: "2025-12-06",
        venue: "Veterans Memorial Stadium (Jackson, MS)",
        route2025: "/game/W15pvamujsu",
        winnerExportId: "swacpvamu",
        winnerName: "Prairie View A&M",
        loserName: "Jackson State",
        winnerScore: 23,
        loserScore: 21,
        summaryNote: "Prairie View A&M upset Jackson State 23–21 on the road in Jackson to capture the 2025 SWAC Championship."
    },
    {
        id: "celebration-bowl",
        name: "Celebration Bowl (HBCU National Championship)",
        aliases: ["celebration bowl", "hbcu national championship", "national championship", "scsu vs pvamu", "pvamu vs scsu"],
        teamIds: ["meacscsu", "swacpvamu"],
        week2025: 16,
        date2025: "2025-12-13",
        venue: "Mercedes-Benz Stadium (Atlanta, GA)",
        route2025: "/game/W16scsupvamu",
        winnerExportId: "meacscsu",
        winnerName: "South Carolina State",
        loserName: "Prairie View A&M",
        winnerScore: 40,
        loserScore: 38,
        summaryNote: "South Carolina State outlasted Prairie View A&M in a 4OT thriller (38–38 end of regulation / 4OT classic) at Mercedes-Benz Stadium in Atlanta to claim the 2025 HBCU National Title."
    }
];

// 4. EXTRA SCHOOL ALIASES & SLANG (Merged with teams.json fields)
const CUSTOM_TEAM_ALIASES = {
    alcorn: [
        "alcorn", "alcorn state", "alcorns", "alcn", "swacalc", "swacalc25", "braves", "lorman",
        "the hill", "sounds of dyn-o-mite", "dynomite", "sod", "spinks", "casem", "mcnair"
    ],
    "alabama-am": [
        "aamu", "alabama a&m", "alabama am", "bama a&m", "bama am", "swacaamu", "swacaamu25", "normal",
        "louis crews", "marching maroon", "mmw", "stallworth", "mathis", "aqeel glass"
    ],
    "alabama-state": [
        "alabama state", "bama state", "bama st", "swacasu", "swacasu25", "hornets", "montgomery",
        "mighty marching hornets", "mmh", "hornet stadium"
    ],
    "bethune-cookman": [
        "bcu", "bethune", "bethune cookman", "bethune-cookman", "cookman", "swacbcu", "swacbcu25",
        "wildcats", "daytona", "marching wildcats", "the pride"
    ],
    "florida-am": [
        "famu", "florida a&m", "florida am", "swacfamu", "swacfamu25", "rattlers", "tallahassee",
        "bragg", "marching 100", "the 100", "orange and green"
    ],
    "jackson-state": [
        "jsu", "jackson state", "jackson st", "jackson", "j-state", "jstate", "swacjsu", "swacjsu25",
        "jkst", "thee", "sonic boom", "veterans memorial", "vet"
    ],
    mvsu: [
        "mvsu", "mississippi valley", "valley", "valley state", "delta devils", "swacmvsu", "swacmvsu25",
        "itta bena", "rice-totten", "mean green", "jerry rice"
    ],
    pvam: [
        "pvamu", "pvam", "pv", "prairie view", "prairie view a&m", "prairie view am", "swacpvamu", "swacpvamu25",
        "panthers", "marching storm", "panther stadium", "blackshear", "swacpvam"
    ],
    pvamu: [
        "pvamu", "pvam", "pv", "prairie view", "prairie view a&m", "prairie view am", "swacpvamu", "swacpvamu25",
        "panthers", "marching storm", "panther stadium", "blackshear", "swacpvam"
    ],
    southern: [
        "southern", "southern university", "southerns", "su", "swacsu", "swacsu25", "jaguars", "jags",
        "baton rouge", "mumford", "human jukebox", "jukebox", "dancing dolls"
    ],
    "texas-southern": [
        "tsu", "texas southern", "txso", "swactsu", "swactsu25", "houston", "ocean of soul", "shell energy"
    ],
    uapb: [
        "uapb", "pine bluff", "arkansas pine bluff", "arkansas-pine bluff", "swacuapb", "swacuapb25",
        "golden lions", "lions", "m4", "simmons bank"
    ],
    grambling: [
        "gsu", "grambling", "grambling state", "gram", "g-men", "gmen", "swacgsu", "swacgsu25",
        "eddie robinson", "world famed"
    ],
    "delaware-state": [
        "dsu", "delaware state", "delaware st", "del state", "meacdsu", "meacdsu25", "dover", "approaching storm"
    ],
    howard: [
        "hu", "howard", "bison", "meachu", "meachu25", "greene stadium", "showtime", "the mecca", "mecca"
    ],
    "morgan-state": [
        "msu", "morgan", "morgan state", "morgan st", "bears", "meacmsu", "meacmsu25", "baltimore",
        "hughes stadium", "magnificent marching machine", "the den"
    ],
    nccu: [
        "nccu", "nc central", "north carolina central", "central", "eagles", "meacnccu", "meacnccu25",
        "durham", "soundmachine", "okelly-riddick", "riddick"
    ],
    "norfolk-state": [
        "nsu", "norfolk", "norfolk state", "norfolk st", "spartans", "meacnsu", "meacnsu25",
        "dick price", "spartan legion"
    ],
    "sc-state": [
        "scsu", "sc state", "south carolina state", "south carolina st", "carolina state",
        "meacscsu", "meacscsu25", "orangeburg", "dawson stadium", "marching 101", "the 101", "deacon jones"
    ]
};

// Build canonical school lookup web from teams.json + custom aliases
export const SCHOOL_WEB = teamsData.teams.map((team) => {
    const custom = CUSTOM_TEAM_ALIASES[team.id] || [];
    const cleanExportId = (team.exportId || "").replace(/25$/, "");
    const autoAliases = [
        team.id,
        team.exportId,
        cleanExportId,
        team.name,
        team.shortName,
        team.displayName,
        team.bannerShort,
        team.teamAbbrev,
        team.mascot,
        team.city,
        team.stadium,
        team.wiki?.band?.name,
        team.wiki?.marching_band?.bandName,
        team.wiki?.marching_band?.bandNickname
    ]
        .filter(Boolean)
        .map((s) => s.toLowerCase().trim());

    const baseAliases = Array.from(new Set([...autoAliases, ...custom]));
    // Expand plural/possessive-stripped forms ("south carolina states", "alabama states", "jackson states")
    const expandedAliases = [...baseAliases];
    baseAliases.forEach((a) => {
        if (a.endsWith(" state")) {
            expandedAliases.push(`${a}s`);
        }
    });
    const allAliases = Array.from(new Set(expandedAliases));

    return {
        exportId: cleanExportId || team.exportId,
        v5TeamId: cleanExportId || team.exportId,
        id: team.id,
        name: team.name,
        shortName: team.displayName || team.shortName || team.name,
        abbrev: team.bannerShort || team.shortName || team.teamAbbrev,
        mascot: team.mascot,
        conference: team.conference,
        division: team.division,
        city: team.city,
        state: team.state,
        location: team.location,
        founded: team.founded,
        enrollment: team.enrollment,
        colors: team.colors,
        logo: team.logo,
        stadium: team.stadium,
        stadiumCapacity: team.stadiumCapacity,
        bandName: team.wiki?.marching_band?.bandName || team.wiki?.band?.name || "Marching Band",
        bandNickname: team.wiki?.marching_band?.bandNickname || team.wiki?.band?.nickname || null,
        signatureSong: team.wiki?.marching_band?.signatureSelection || team.wiki?.band?.signatureSelection || null,
        aliases: allAliases,
        rawTeam: team
    };
});

// 5. FOOTBALL, TEMPORAL & SITE SYNONYM ENGINE (Maps natural phrases/words -> canonical tags)
export const CONCEPT_SYNONYMS = [
    // Relative Temporal Tags
    {
        tag: "temporal:today",
        category: "Relative Time",
        label: "Today / Tonight",
        terms: ["today", "tonight", "play today", "playing today", "game today", "games today"]
    },
    {
        tag: "temporal:this_week",
        category: "Relative Time",
        label: "This Week / Weekend",
        terms: ["this week", "this weekend", "this saturday", "current week", "play this week"]
    },
    {
        tag: "temporal:last_week",
        category: "Relative Time",
        label: "Last Week / Previous Game",
        terms: [
            "last week", "last weekend", "previous game", "last game", "who did they just play",
            "just play", "just played", "most recent game", "win last week", "won last week",
            "score last week", "play last week"
        ]
    },
    {
        tag: "temporal:next_week",
        category: "Relative Time",
        label: "Next Week / Next Opponent",
        terms: [
            "next week", "next weekend", "next game", "who do they play next", "play next",
            "next opponent", "upcoming game", "who is next"
        ]
    },
    // Narrow Quick-Fact Tags
    {
        tag: "fact:result",
        category: "Quick Fact Inquiry",
        label: "Game Winner / Final Score",
        terms: [
            "who won", "did they win", "did .* win", "win", "won", "beat", "defeat", "defeated",
            "final score", "what was the score", "score of", "winner"
        ]
    },
    {
        tag: "fact:band",
        category: "Quick Fact Inquiry",
        label: "Marching Band Fact",
        terms: [
            "band", "band name", "marching band", "halftime", "fifth quarter", "5th quarter",
            "drum major", "dancers", "dance team", "flag line", "signature song", "fanfare",
            "human jukebox", "sonic boom", "marching 100", "marching storm", "ocean of soul",
            "sounds of dyn-o-mite", "dynomite", "world famed", "marching 101", "approaching storm",
            "showtime", "magnificent marching machine", "soundmachine", "spartan legion", "m4"
        ]
    },
    {
        tag: "fact:stadium",
        category: "Quick Fact Inquiry",
        label: "Stadium & Venue Fact",
        terms: [
            "stadium", "stadium name", "where do they play", "home field", "capacity",
            "stadium capacity", "how many seats", "surface", "turf", "grass", "mumford",
            "bragg", "veterans memorial", "spinks", "blackshear", "panther stadium", "shell energy",
            "louis crews", "eddie robinson stadium", "dawson stadium", "dick price", "greene stadium"
        ]
    },
    {
        tag: "fact:record",
        category: "Quick Fact Inquiry",
        label: "Season Record Fact",
        terms: [
            "record", "overall record", "conference record", "what was their record",
            "how many wins", "win loss", "season record"
        ]
    },
    {
        tag: "fact:identity",
        category: "Quick Fact Inquiry",
        label: "School Motto, Founding & Traditions",
        terms: [
            "mascot", "motto", "founded", "when was", "colors", "school colors",
            "fight song", "chant", "chants", "team walk", "tailgate", "enrollment"
        ]
    },
    // Broad Football / Hub Concepts
    {
        tag: "stat:passing",
        category: "Football Concept",
        label: "Passing Offense",
        terms: [
            "passing", "passer", "passers", "pass", "qb", "quarterback", "quarterbacks",
            "throw", "throwing", "air", "air yards", "comp", "completion", "completions",
            "completion pct", "comp%", "ypa", "yards per attempt", "interceptions", "picks",
            "pass td", "passing touchdowns", "pocket", "dropback", "dropbacks", "3x3", "pass grid"
        ]
    },
    {
        tag: "stat:rushing",
        category: "Football Concept",
        label: "Rushing Offense",
        terms: [
            "rushing", "rusher", "rushers", "rush", "run", "running", "ground",
            "rb", "running back", "backs", "carries", "ypc", "yards per carry",
            "rush yards", "rushing yards", "rush td", "rushing touchdowns"
        ]
    },
    {
        tag: "stat:receiving",
        category: "Football Concept",
        label: "Receiving & Targets",
        terms: [
            "receiving", "receiver", "receivers", "wr", "wide receiver", "wideout",
            "tight end", "te", "catches", "receptions", "targets", "receiving yards"
        ]
    },
    {
        tag: "stat:defense",
        category: "Football Concept",
        label: "Defense, Havoc & Pressure",
        terms: [
            "defense", "defensive", "tackles", "tackler", "tfl", "tackles for loss",
            "sack", "sacks", "pass rush", "pressure", "hurries", "havoc", "disruption",
            "bend dont break", "db", "defensive back", "linebacker", "lb", "dl", "defensive line",
            "forced fumbles", "pbu", "pass breakup"
        ]
    },
    {
        tag: "stat:situational",
        category: "Contextual Engine",
        label: "Situational & Advanced EPA",
        terms: [
            "epa", "expected points", "success rate", "efficiency", "3rd down", "third down",
            "4th down", "fourth down", "red zone", "redzone", "short yardage", "hidden yardage",
            "field position", "turnovers", "turnover", "turnover swing", "takeaways", "giveaways",
            "special teams", "punt", "kickoff", "field goal", "explosive", "heat map", "heatmap"
        ]
    },
    {
        tag: "engine:glory",
        category: "Contextual Engine",
        label: "Why & Glory Rating Engine",
        terms: [
            "glory", "qb glory", "why engine", "par", "par rank", "rating", "grade",
            "production score", "execution", "impact", "consistency", "star impact"
        ]
    },
    {
        tag: "modifier:leaders",
        category: "Modifier",
        label: "Leaderboard / Top Ranked",
        terms: [
            "leading", "leader", "leaders", "top", "best", "most", "highest", "number one",
            "#1", "first", "rankings", "ranked", "leaderboard", "who leads", "stat leaders"
        ]
    },
    {
        tag: "hub:roster",
        category: "Schools / Roster Hub",
        label: "Team Roster & Depth",
        terms: [
            "roster", "rosters", "starting", "starters", "starter", "depth", "depth chart",
            "lineup", "players", "squad", "unit", "position group", "composition", "active players"
        ]
    },
    {
        tag: "roster:transfers",
        category: "Schools / Roster Hub",
        label: "Transfer Portal Intelligence",
        terms: [
            "transfer", "transfers", "portal", "transfer rate", "newcomers", "juco",
            "p4", "g5", "fcs transfer", "previous school", "incoming", "transfer impact"
        ]
    },
    {
        tag: "roster:experience",
        category: "Schools / Roster Hub",
        label: "Experience & Class Balance",
        terms: [
            "experience", "veterans", "veteran", "upperclass", "upperclassmen", "underclassmen",
            "freshman", "freshmen", "sophomore", "junior", "senior", "seniors", "graduate",
            "grad", "redshirt", "class year", "class pyramid", "class timeline", "continuity"
        ]
    },
    {
        tag: "roster:geography",
        category: "Schools / Roster Hub",
        label: "Geographic Recruiting Pipeline",
        terms: [
            "geography", "geographic", "hometown", "home state", "in-state", "in state",
            "out of state", "out-of-state", "pipeline", "recruiting", "hotspots",
            "distance", "miles", "local", "regional", "national", "where are they from", "map"
        ]
    },
    {
        tag: "roster:physical",
        category: "Schools / Roster Hub",
        label: "Physical Profile & Size Z-Scores",
        terms: [
            "physical", "size", "height", "weight", "tallest", "shortest", "heaviest",
            "lightest", "bmi", "body type", "z-score", "comparatives", "outliers", "biggest", "how big"
        ]
    },
    {
        tag: "hub:schedule",
        category: "Game Center",
        label: "Schedule & Slate",
        terms: [
            "schedule", "schedules", "games", "game", "slate", "calendar", "matchups",
            "matchup", "opponents", "opponent", "play", "playing", "when do they play"
        ]
    },
    {
        tag: "filter:home",
        category: "Schedule Filter",
        label: "Home Venue Filter",
        terms: ["home", "home games", "at home", "hosting", "host"]
    },
    {
        tag: "filter:away",
        category: "Schedule Filter",
        label: "Away / Road Venue Filter",
        terms: ["away", "away games", "road", "road games", "travel", "visiting"]
    },
    {
        tag: "filter:next_prev",
        category: "Schedule Filter",
        label: "Next / Previous / Last 5 Window",
        terms: ["next", "next game", "upcoming", "look ahead", "previous", "last", "last 5", "recent", "results", "final"]
    },
    {
        tag: "hub:standings",
        category: "Game Center",
        label: "Standings & Title Race",
        terms: [
            "standings", "standing", "title race", "division", "swac east", "swac west",
            "meac", "swac", "win pct", "tiebreaker", "games back", "1st place", "first place"
        ]
    },
    {
        tag: "hub:week_central",
        category: "Game Center",
        label: "Week Central & Weekly Slate",
        terms: [
            "week central", "week 0", "week 1", "week 2", "week 3", "week 4", "week 5",
            "week 6", "week 7", "week 8", "week 9", "week 10", "week 11", "week 12",
            "week 13", "week 14", "week 15", "week 16", "weekly", "schedule board", "conference slate"
        ]
    },
    {
        tag: "hub:wiki",
        category: "Schools / Wiki Hub",
        label: "School Wiki, Bands, Rivals & Traditions",
        terms: [
            "wiki", "history", "founded", "motto", "tradition", "traditions", "band",
            "marching band", "halftime", "fifth quarter", "5th quarter", "drum major",
            "dancers", "dance team", "flag line", "chant", "chants", "fight song",
            "tailgate", "team walk", "stadium", "capacity", "attendance", "turf", "grass",
            "rivalry", "rivalries", "rival", "rivals", "classic", "classics", "soul bowl",
            "magic city classic", "bayou classic", "turkey day classic", "labor day classic",
            "celebration bowl", "championship", "championships", "alumni", "hall of fame", "retired numbers"
        ]
    },
    {
        tag: "hub:coaches",
        category: "People / Coaches Hub",
        label: "Coaches Ecosystem & Staff Context",
        terms: [
            "coach", "coaches", "head coach", "hc", "staff", "coordinator", "coaching tree",
            "stability", "movement", "hires", "departures", "carousel", "tenure",
            "position production context", "style", "tremaine jackson", "chennis berry",
            "eddie robinson", "marino casem"
        ]
    },
    {
        tag: "hub:officials",
        category: "People / Officials Hub",
        label: "Officials, Crews & Penalty Leverage",
        terms: [
            "official", "officials", "referee", "referees", "refs", "umpire", "crew",
            "crews", "line judge", "back judge", "flags", "penalties", "penalty"
        ]
    },
    {
        tag: "hub:statlab",
        category: "Stat Lab",
        label: "Stat Lab & Custom Chart Builder",
        terms: [
            "stat lab", "statlab", "chart", "plot", "graph", "scatter", "compare",
            "comparison", "vs", "versus", "custom", "build a chart", "correlation", "analytics"
        ]
    },
    {
        tag: "mode:dashboard",
        category: "Response Mode Trigger",
        label: "Explicit Full Dashboard Request",
        terms: [
            "dashboard", "full schedule", "full roster", "starting roster", "depth chart",
            "breakdown", "compare", "comparison", "stat lab", "statlab", "leaderboard",
            "standings", "title race", "heat map", "3x3", "transfer portal rate", "all home games",
            "home games"
        ]
    }
];

// 6. CANONICAL HUB & INTENT BLUEPRINTS (Aligned with hbcugg1 routes!)
export const INTENT_BLUEPRINTS = [
    {
        id: "GAMECENTER_TEAM_SCHEDULES",
        hub: "Game Center · Team Schedules",
        sectionOwner: "TeamSchedulePage / TeamIndividualSchedulePage",
        route: "/game-center/team",
        requiredTags: ["hub:schedule", "temporal:today", "temporal:this_week", "temporal:last_week", "temporal:next_week", "fact:result"],
        boostWithTeam: true,
        dataContracts: [
            "/data/1-game center/current_exports/team_schedules/team_schedules_2025.json",
            "/data/1-game center/current_exports/team_schedules/team_schedules_2026.json"
        ],
        bentoPreview: [
            "SchoolBanner (Oversized Editorial Headline + Ghost Word)",
            "TeamScheduleSlateCard (Filtered by Home / Away / Conf / Next / Last 5)",
            "ConferenceRecordLast5Card",
            "NextGameLookAheadCard"
        ],
        tangentialHubs: ["GAMECENTER_STANDINGS_RACE", "SCHOOLS_WIKI_TRADITIONS", "GAMECENTER_WEEK_CENTRAL"]
    },
    {
        id: "GAMECENTER_STANDINGS_RACE",
        hub: "Game Center · Standings Race",
        sectionOwner: "StandingsPage / GameCenterMicroHubPage",
        route: "/game-center/standings",
        requiredTags: ["hub:standings", "fact:record"],
        boostWithTeam: false,
        dataContracts: [
            "/data/1-game center/current_exports/standings_race/standings_race_2025.json",
            "/data/1-game center/current_exports/hub/game_center_hub_2025.json"
        ],
        bentoPreview: [
            "GameCenterBanner (STANDINGS RACE)",
            "DivisionLeaderCard (SWAC East, SWAC West, MEAC Top 3)",
            "TitleRaceProgressCard (With Tiebreaker Trace)",
            "TurnoverSwingCard"
        ],
        tangentialHubs: ["GAMECENTER_WEEK_CENTRAL", "GAMECENTER_TEAM_SCHEDULES", "GAMECENTER_HUB"]
    },
    {
        id: "GAMECENTER_WEEK_CENTRAL",
        hub: "Game Center · Week Central",
        sectionOwner: "WeekCentralPage / ConferenceSlatePage",
        route: "/game-center/week",
        requiredTags: ["hub:week_central"],
        boostWithTeam: false,
        dataContracts: [
            "/data/1-game center/current_exports/week_central/week_central_2025.json",
            "/data/1-game center/current_exports/schedule_board/season_schedule_board_2025.json"
        ],
        bentoPreview: [
            "WeekCentralBanner",
            "FeaturedGameStrip (Final / Preview Tiles)",
            "WeeklyKpiSummaryStrip",
            "GameOfTheWeekSpotlight"
        ],
        tangentialHubs: ["GAMECENTER_STANDINGS_RACE", "GAMECENTER_HUB", "STATLAB_PASSING_RUSHING"]
    },
    {
        id: "SCHOOLS_ROSTER_BREAKDOWN",
        hub: "Schools · Roster Intelligence Hub",
        sectionOwner: "RostersPage & TeamRosterHubPage",
        route: "/rosters",
        requiredTags: ["hub:roster", "roster:transfers", "roster:experience", "roster:geography", "roster:physical"],
        boostWithTeam: true,
        dataContracts: [
            "/data/2-schools/roster_hub_2025.json",
            "/data/3-players/player_seasons_2025.json",
            "/data/3-players/players_hub_2025.json"
        ],
        bentoPreview: [
            "SchoolBanner (Roster Identity)",
            "FourBlockKpiStrip (AVG PAR · Active Roster · Transfer Rate % · Veterans %)",
            "ClassTimelinePyramidCard (Fr / So / Jr / Sr / Gr)",
            "GeographicPipelineMapCard (In-State vs Out-of-State + Hotspots)",
            "StarImpactPlayerCard"
        ],
        tangentialHubs: ["PLAYERS_GLORY_SPOTLIGHT", "COACHES_ECOSYSTEM_HUB", "SCHOOLS_TEAM_DIRECTORY"]
    },
    {
        id: "PLAYERS_GLORY_SPOTLIGHT",
        hub: "Players & Glory Rating Engine",
        sectionOwner: "PlayersPage & GloryPage",
        route: "/players",
        requiredTags: ["engine:glory", "modifier:leaders", "stat:passing", "stat:rushing", "stat:receiving", "stat:defense"],
        boostWithTeam: false,
        dataContracts: [
            "/data/3-players/players_hub_2025.json",
            "/data/7-glory/qb_glory_2025.json",
            "/data/7-glory/why_glory_2025.json",
            "/data/6-stat lab/counting/season_stats.json"
        ],
        bentoPreview: [
            "PlayerHeroBanner (With PAR Rank Gauge)",
            "StarImpactCard (Player Avy + Stat Line + PAR/G)",
            "PassingOrRushingProductionBars (Comp %, Yds/Gm, TD/Gm, Rank of 18)",
            "HavocSpatialOrPassHeatMap (3x3 Direction Grid)"
        ],
        tangentialHubs: ["STATLAB_PASSING_RUSHING", "SCHOOLS_ROSTER_BREAKDOWN", "GAMECENTER_TEAM_SCHEDULES"]
    },
    {
        id: "SCHOOLS_WIKI_TRADITIONS",
        hub: "Schools · Conference & Program Wiki",
        sectionOwner: "SchoolsWikiPage & SchoolWikiDetailPage",
        route: "/schools/wiki",
        requiredTags: ["hub:wiki", "fact:band", "fact:stadium", "fact:identity"],
        boostWithTeam: true,
        dataContracts: [
            "src/data/teams.json (wiki, marching_band, gameday, athletics, history)"
        ],
        bentoPreview: [
            "SchoolBanner (Motto & Founding)",
            "MarchingBandSpotlightCard (Band Name, Style, Signature Selection, Audio)",
            "StadiumAndGamedayTraditionCard (Team Walk, Tailgate Food, Chants)",
            "RivalriesAndClassicsSeriesCard (Head-to-Head Record & Last Result)"
        ],
        tangentialHubs: ["SCHOOLS_TEAM_DIRECTORY", "GAMECENTER_TEAM_SCHEDULES", "SCHOOLS_ROSTER_BREAKDOWN"]
    },
    {
        id: "COACHES_ECOSYSTEM_HUB",
        hub: "Coaches Ecosystem Hub",
        sectionOwner: "CoachesPage & TeamCoachesPage",
        route: "/coaches",
        requiredTags: ["hub:coaches"],
        boostWithTeam: true,
        dataContracts: [
            "/data/4-coaches/coaches_hub_payload_2025.json",
            "/data/4-coaches/coach_position_impact_by_school_season.json"
        ],
        bentoPreview: [
            "HeadCoachSpotlightCard (Name, Tenure, Net EPA YoY)",
            "StaffStabilityAndMovementCard",
            "PositionProductionContextCard (Labeled: Contextual Staff Season · Non-Causal)",
            "TeamStyleTendenciesCard (Run/Pass Rates, 4th Down Go Rate)"
        ],
        tangentialHubs: ["SCHOOLS_ROSTER_BREAKDOWN", "STATLAB_PASSING_RUSHING", "SCHOOLS_TEAM_DIRECTORY"]
    },
    {
        id: "STATLAB_PASSING_RUSHING",
        hub: "Stats Hub & Stat Lab",
        sectionOwner: "StatsPage & StatLabPage",
        route: "/stats",
        requiredTags: ["hub:statlab", "stat:situational", "stat:passing", "stat:rushing", "stat:defense"],
        boostWithTeam: false,
        dataContracts: [
            "/data/6-stat lab/counting/team_stats.json",
            "/data/6-stat lab/counting/season_stats.json",
            "/data/1-game center/current_exports/games/2025/{game_path_id}.json"
        ],
        bentoPreview: [
            "PassingProductionCard (Comp %, YPA, Pressure Breakdown, Red Zone)",
            "Pass3x3HeatMapGrid / Rush1x3ZoneGrid",
            "SituationalEfficiencyCard (3rd Down Conversion, 4th Down Go, Hidden Yardage)",
            "InteractiveComparisonChartBuilder"
        ],
        tangentialHubs: ["PLAYERS_GLORY_SPOTLIGHT", "GAMECENTER_STANDINGS_RACE", "COACHES_ECOSYSTEM_HUB"]
    },
    {
        id: "SCHOOLS_TEAM_DIRECTORY",
        hub: "Schools · Team Profile Hub",
        sectionOwner: "TeamProfilePage",
        route: "/teams",
        requiredTags: [],
        boostWithTeam: true,
        dataContracts: [
            "src/data/teams.json",
            "/data/2-schools/roster_hub_2025.json",
            "/data/1-game center/current_exports/team_schedules/team_schedules_2025.json"
        ],
        bentoPreview: [
            "SchoolBanner (PRAIRIE VIEW A&M Style Full Header)",
            "FourBlockKpiStrip (AVG PAR · ROSTER · TRANSFER RATE · VETERANS)",
            "ConferenceRecordAndLast5Card",
            "PreviousAndNextGameCards",
            "StarImpactPlayerCard + HeadCoachCard + PassingProductionCard"
        ],
        tangentialHubs: ["SCHOOLS_ROSTER_BREAKDOWN", "GAMECENTER_TEAM_SCHEDULES", "SCHOOLS_WIKI_TRADITIONS"]
    },
    {
        id: "GAMECENTER_HUB",
        hub: "Game Center Hub",
        sectionOwner: "GameCenterPage",
        route: "/game-center",
        requiredTags: [],
        boostWithTeam: false,
        dataContracts: [
            "/data/1-game center/current_exports/hub/game_center_hub_2025.json"
        ],
        bentoPreview: [
            "GameCenterBanner (GAME CENTER)",
            "TopFeaturedGameTiles (4-Card Strip: Final & Preview)",
            "LatestGameResultsRail",
            "DivisionLeadersTrio (SWAC West · SWAC East · MEAC)",
            "GameOfTheWeek + LookAhead + TitleRace + BiggestMover + TurnoverSwing"
        ],
        tangentialHubs: ["GAMECENTER_STANDINGS_RACE", "GAMECENTER_WEEK_CENTRAL", "PLAYERS_GLORY_SPOTLIGHT"]
    }
];

export const QUICK_TEST_PROMPTS = [
    {
        category: "⚡ Player Typo ('jauylon toblert')",
        prompt: "jauylon toblert"
    },
    {
        category: "⚡ Classic Winner (Quick Fact)",
        prompt: "Who won the Labor Day Classic?"
    },
    {
        category: "⚡ Band Fact (Quick Fact)",
        prompt: "What is Alcorn's band name?"
    },
    {
        category: "⚡ Relative: Last Week",
        prompt: "Did Southern win last week?"
    },
    {
        category: "⚡ Relative: Play Today?",
        prompt: "Who does Southern play today?"
    },
    {
        category: "⚡ Relative: Next Week",
        prompt: "Who does Jackson State play next week?"
    },
    {
        category: "📊 Roster Hub + Typo (Full Bento)",
        prompt: "show me alcorns starting roster and transfer portal rate"
    },
    {
        category: "📊 Team Dashboard (Full Bento)",
        prompt: "pull up prairie view a&m dashboard with coach, last 5, and passing production"
    },
    {
        category: "📊 StatLab Compare (Full Bento)",
        prompt: "compare scsu vs pvamu 3rd down efficiency, pressure rate, and pass heat map"
    }
];
