import { FE_DOCS_BASE } from "../../../../utils/gameCenterPayloads";

// Existing dictionary copy, responsive sizes and Glory Team query contract.

export const GLORY_TEAM_PATH = `${FE_DOCS_BASE}/game-center/glory-team-of-week/current.json`;

export const SERIF = "Georgia, 'Times New Roman', serif";

export const fetchGloryTeam = async () => {
  const res = await fetch(GLORY_TEAM_PATH);
  if (!res.ok) throw new Error("glory team missing");
  if (!(res.headers.get("content-type") ?? "").includes("json")) throw new Error("glory team missing");
  return res.json();
};

export const KEYFRAMES = "@keyframes gloryReveal { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }";

export const ENTRIES = [
  {
    word: "glory", pos: "noun", syl: "glo·ry", pron: "ˈglȯr-ē",
    forms: { label: "plural", value: "glories" },
    origin: "Middle English glorie, from Anglo-French, from Latin gloria",
    senses: [
      { def: "high honor won by great achievement", example: { before: "the ", word: "glory", after: " of a title earned on the road" } },
      { def: "a performance remembered long after the final whistle", example: { before: "Her ninety-yard run is still talked about as pure ", word: "glory", after: "." } },
    ],
  },
  {
    word: "glorify", pos: "verb", syl: "glo·ri·fy", pron: "ˈglȯr-ə-ˌfī",
    forms: { label: "glorified; glorifying", value: "glorifies" },
    origin: "Middle English glorifien, from Anglo-French glorifier, from Late Latin glorificare",
    senses: [
      { def: "to make glorious by giving great honor", example: { before: "The documentary ", word: "glorifies", after: " the program’s title years." } },
      { def: "to praise or celebrate loudly", example: { before: "The student section ", word: "glorified", after: " the quarterback after the comeback." } },
    ],
  },
  {
    word: "glorification", pos: "noun", syl: "glo·ri·fi·ca·tion", pron: "ˌglȯr-ə-fə-ˈkā-shən",
    forms: { label: "plural", value: "glorifications" },
    origin: "Middle English glorificacioun, from Anglo-French, from Late Latin glorificatio, from glorificare",
    senses: [
      { def: "the act of lifting something up with high praise", example: { before: "the ", word: "glorification", after: " of a team’s greatest season" } },
      { def: "the state of being honored for achievement", example: { before: "The banners in the rafters are a quiet ", word: "glorification", after: " of every title." } },
    ],
  },
  {
    word: "glorified", pos: "adjective", syl: "glo·ri·fied", pron: "ˈglȯr-ə-ˌfīd",
    forms: null,
    origin: "from the past participle of glorify",
    senses: [
      { def: "raised in honor; celebrated", example: { before: "the ", word: "glorified", after: " champions of the Classic" } },
      { def: "made to seem grander than it really is", example: { before: "a ", word: "glorified", after: " scrimmage" } },
    ],
  },
];

export const SIZE = {
  row: { noun: "1.8cqw", syl: "1.15cqw", plural: "0.9cqw", pluralWord: "1.25cqw", origin: "0.9cqw", sense: "1.75cqw", example: "1.35cqw", gap: "1.8cqw", pad: "2.6cqw" },
  stack: { noun: "1.2rem", syl: "0.95rem", plural: "0.78rem", pluralWord: "1rem", origin: "0.8rem", sense: "1.1rem", example: "0.95rem", gap: "1rem", pad: "1.25rem" },
};

export const headSize = (word, row) => {
  const n = word.length;
  return row ? `${Math.min(7, 36 / (n * 0.56))}cqw` : `clamp(2.2rem, ${Math.min(14, 80 / (n * 0.56))}vw, 4.5rem)`;
};

export const nameSize = (name) => (name.length > 18 ? "2.8cqw" : name.length > 12 ? "3.2cqw" : "3.6cqw");
