import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";

const POSITION_GROUPS = {
  PASS: new Set(["QB", "WR", "TE"]),
  RUN: new Set(["RB", "FB"]),
  DEF: new Set(["DL", "DE", "DT", "EDGE", "LB", "OLB", "ILB", "DB", "CB", "S", "SAF"]),
  OL: new Set(["OL", "OT", "OG", "C", "G", "T"]),
  ST: new Set(["K", "P", "PK", "KO", "LS", "PR", "KR"]),
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const getPosition = (player) =>
  String(player?.position_group ?? player?.position ?? player?.position_abbr ?? "ATH").toUpperCase();

const getComponent = (player, key) => Number(player?.season_components?.[key] ?? 0);

const metric = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits).replace(/\.0$/, "");
};

const formatHeight = (inches) => {
  if (!inches) return "-";
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};

const getStatTape = (player, parScore, gloryRating) => {
  const position = getPosition(player);
  const pass = getComponent(player, "passing_production");
  const rush = getComponent(player, "rushing_production");
  const rec = getComponent(player, "receiving_production");
  const def = getComponent(player, "defensive_production");
  const st = getComponent(player, "special_teams_production");
  const total = Number(player?.total_production ?? pass + rush + rec + def + st);

  const base = [
    { label: "PAR", value: metric(parScore, 1) },
    { label: "GLORY", value: gloryRating },
    { label: "GAMES", value: player?.games_played ?? "-" },
  ];

  if (position === "QB") {
    return [...base, { label: "PASS PROD", value: metric(pass, 1) }, { label: "RUSH PROD", value: metric(rush, 1) }];
  }
  if (POSITION_GROUPS.PASS.has(position)) {
    return [...base, { label: "REC PROD", value: metric(rec, 1) }, { label: "RUSH PROD", value: metric(rush, 1) }];
  }
  if (POSITION_GROUPS.RUN.has(position)) {
    return [...base, { label: "RUSH PROD", value: metric(rush, 1) }, { label: "REC PROD", value: metric(rec, 1) }];
  }
  if (POSITION_GROUPS.DEF.has(position)) {
    return [...base, { label: "HAVOC PROD", value: metric(def || total, 1) }, { label: "TOTAL PROD", value: metric(total, 1) }];
  }
  if (POSITION_GROUPS.ST.has(position)) {
    return [...base, { label: "ST PROD", value: metric(st || total, 1) }, { label: "TOTAL PROD", value: metric(total, 1) }];
  }
  return [...base, { label: "TOTAL PROD", value: metric(total, 1) }, { label: "CLASS", value: player?.class_year ?? "-" }];
};

const BackBlock = ({ onBack, primary }) => (
  <Box
    as="button"
    onClick={onBack}
    h="full"
    w="full"
    textAlign="left"
    position="relative"
    overflow="hidden"
    borderRight="1px solid"
    borderColor="whiteAlpha.100"
    bg={`linear-gradient(135deg, ${primary}99 0%, rgba(10,10,12,0.9) 62%)`}
    p="clamp(0.75rem, 1.2vw, 1rem)"
    _hover={{ filter: "brightness(1.12)" }}
    transition="filter 0.16s ease"
  >
    <Text
      position="absolute"
      right="-0.3rem"
      bottom="-0.45rem"
      fontSize="clamp(2.8rem, 5vw, 4.6rem)"
      fontWeight="black"
      color="rgba(255,255,255,0.08)"
      lineHeight={0.8}
    >
      BACK
    </Text>
    <Flex direction="column" justify="space-between" h="full" position="relative" zIndex={1}>
      <Flex align="center" gap="0.45rem">
        <ArrowLeft size={16} color="white" />
        <Text fontSize="0.68rem" fontWeight="black" color="white" letterSpacing="0.08em">
          BACK
        </Text>
      </Flex>
      <Box>
        <Text fontSize="clamp(1.35rem, 2.2vw, 2.25rem)" fontWeight="black" color="white" lineHeight={0.86}>
          PLAYER
        </Text>
        <Text fontSize="clamp(1.35rem, 2.2vw, 2.25rem)" fontWeight="black" color="white" lineHeight={0.86}>
          FILE
        </Text>
      </Box>
    </Flex>
  </Box>
);

const IdentityPlate = ({ player, teamMeta, classLabel, height, weight, primary }) => {
  const position = getPosition(player);
  const number = player?.jersey_number != null ? `#${player.jersey_number}` : "-";
  const rows = [
    { label: "POS", value: position },
    { label: "NO", value: number },
    { label: "CLASS", value: classLabel ?? player?.class_year ?? "-" },
    { label: "HT", value: formatHeight(height) },
    { label: "WT", value: weight ? `${weight}` : "-" },
  ];

  return (
    <Box h="full" p="clamp(0.65rem, 1vw, 0.9rem)" position="relative" overflow="hidden">
      <Text
        position="absolute"
        right="-0.2rem"
        bottom="-0.42rem"
        fontSize="clamp(3.2rem, 5vw, 4.8rem)"
        fontWeight="black"
        color="rgba(255,255,255,0.045)"
        lineHeight={0.8}
      >
        ID
      </Text>
      <Text fontSize="0.58rem" color={primary} fontWeight="black" letterSpacing="0.12em" mb="0.55rem">
        {teamMeta?.shortName ?? "HBCU"} PLAYER ACCESS
      </Text>
      <Grid templateColumns="repeat(5, minmax(0, 1fr))" gap="0.38rem" position="relative" zIndex={1}>
        {rows.map((row) => (
          <Box key={row.label} minW={0}>
            <Text fontSize="0.48rem" color="rgba(255,255,255,0.45)" fontWeight="black" letterSpacing="0.08em">
              {row.label}
            </Text>
            <Text fontSize="clamp(0.84rem, 1.25vw, 1.15rem)" color="white" fontWeight="black" lineHeight={1.05} lineClamp={1}>
              {row.value}
            </Text>
          </Box>
        ))}
      </Grid>
      <Box mt="0.7rem" h="0.2rem" bg="rgba(255,255,255,0.08)" overflow="hidden">
        <Box h="full" w={`${clamp((Number(player?.par ?? 8) / 28) * 100, 14, 100)}%`} bg={primary} />
      </Box>
    </Box>
  );
};

const StatTicker = ({ items, primary, secondary }) => (
  <Box h="full" overflow="hidden" position="relative" borderX="1px solid" borderColor="whiteAlpha.100">
    <style>{`
      @keyframes playerControlTape {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
      .player-control-tape:hover { animation-play-state: paused; }
    `}</style>
    <Flex
      className="player-control-tape"
      h="full"
      align="center"
      gap="1.25rem"
      whiteSpace="nowrap"
      style={{ animation: "playerControlTape 22s linear infinite" }}
    >
      {[0, 1].map((copy) => (
        <Flex key={copy} align="center" gap="1.25rem" pr="1.25rem">
          {items.map((item) => (
            <Flex key={`${copy}-${item.label}`} align="baseline" gap="0.35rem">
              <Text fontSize="0.52rem" color="rgba(255,255,255,0.48)" fontWeight="black" letterSpacing="0.12em">
                {item.label}
              </Text>
              <Text
                fontSize="clamp(1.25rem, 2vw, 1.85rem)"
                color="white"
                fontWeight="black"
                lineHeight={1}
                textShadow={`0.08rem 0 ${primary}, -0.08rem 0 ${secondary}66`}
              >
                {item.value}
              </Text>
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  </Box>
);

const PassingGridMap = ({ player, primary, secondary }) => {
  const pass = Math.max(0, getComponent(player, "passing_production"));
  const rec = Math.max(0, getComponent(player, "receiving_production"));
  const rush = Math.max(0, getComponent(player, "rushing_production"));
  const values = [
    ["LEFT", 28 + pass * 1.5, rec * 0.7],
    ["MIDDLE", 36 + rec * 2.2 + pass, pass + rec],
    ["RIGHT", 24 + rush * 1.6, rush * 0.8 + rec * 0.4],
  ];

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap="0.35rem" h="full" p="0.55rem">
      {values.map(([label, success, yards]) => (
        <Flex key={label} direction="column" justify="space-between" bg="rgba(255,255,255,0.035)" border="1px solid rgba(255,255,255,0.08)" p="0.35rem">
          <Text fontSize="0.48rem" color="rgba(255,255,255,0.55)" fontWeight="black">{label}</Text>
          <Box>
            <Text fontSize="1rem" color={primary} fontWeight="black" lineHeight={1}>{metric(clamp(success, 12, 100), 0)}%</Text>
            <Text fontSize="0.48rem" color="white" fontWeight="black">SIGNAL</Text>
          </Box>
          <Box h="2.1rem" bg="rgba(255,255,255,0.08)" display="flex" alignItems="flex-end">
            <Box w="50%" h={`${clamp(yards * 3, 12, 100)}%`} bg={secondary} />
            <Box w="50%" h={`${clamp((success / 100) * 92, 12, 100)}%`} bg={primary} />
          </Box>
        </Flex>
      ))}
    </Grid>
  );
};

const RushingLaneMap = ({ player, primary, secondary }) => {
  const rush = Math.max(0, getComponent(player, "rushing_production"));
  const rec = Math.max(0, getComponent(player, "receiving_production"));
  const lanes = [
    { label: "LEFT", value: 36 + rush * 1.1, sub: "EDGE" },
    { label: "MIDDLE", value: 42 + rush * 1.7, sub: "A/B" },
    { label: "RIGHT", value: 30 + rec * 2.3 + rush * 0.8, sub: "CUT" },
  ];
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap="0.35rem" h="full" p="0.55rem">
      {lanes.map((lane) => (
        <Flex key={lane.label} direction="column" justify="flex-end" bg="rgba(255,255,255,0.035)" border="1px solid rgba(255,255,255,0.08)" p="0.35rem" position="relative">
          <Text position="absolute" top="0.35rem" left="0.35rem" fontSize="0.48rem" color="rgba(255,255,255,0.55)" fontWeight="black">{lane.label}</Text>
          <Box h={`${clamp(lane.value, 16, 96)}%`} bg={`linear-gradient(180deg, ${secondary} 0%, ${primary} 56%, #4B0082 100%)`} />
          <Text mt="0.28rem" fontSize="0.5rem" color="white" fontWeight="black">{lane.sub}</Text>
        </Flex>
      ))}
    </Grid>
  );
};

const HavocSpatialMap = ({ player, primary, secondary }) => {
  const total = Math.max(1, Number(player?.total_production ?? player?.par ?? 8));
  const dots = [
    { label: "TFL", x: 18, y: 61, color: secondary },
    { label: "QBH", x: 38, y: 53, color: "#63B3ED" },
    { label: "Sck", x: 49, y: 43, color: primary },
    { label: "FF", x: 61, y: 35, color: "#F56565" },
    { label: "PD", x: 74, y: 58, color: "#4299E1" },
  ];
  return (
    <Box h="full" p="0.55rem" position="relative" overflow="hidden">
      <Text position="absolute" left="0.7rem" top="0.62rem" fontSize="0.62rem" color="white" fontWeight="black">HAVOC SPATIAL LOG</Text>
      <Box position="absolute" inset="1.85rem 0.6rem 0.65rem" bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.07)">
        <Box position="absolute" left="0" right="0" top="50%" h="1px" bg="rgba(255,255,255,0.08)" />
        <Box position="absolute" top="0" bottom="0" left="50%" w="1px" bg="rgba(255,255,255,0.08)" />
        <Text position="absolute" left="0.45rem" top="35%" fontSize="1.6rem" color="rgba(255,255,255,0.035)" fontWeight="black">BACKFIELD</Text>
        {dots.map((dot, index) => (
          <Box key={dot.label} position="absolute" left={`${dot.x}%`} top={`${dot.y - clamp(total, 2, 28) * 0.35 + index}%`} transform="translate(-50%, -50%)">
            <Box w="0.42rem" h="0.42rem" borderRadius="full" bg={dot.color} boxShadow={`0 0 0.9rem ${dot.color}`} />
            <Text mt="-0.1rem" ml="0.35rem" fontSize="0.62rem" color="white" fontWeight="black">{dot.label}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const TeamContextMap = ({ player, primary, secondary }) => (
  <Box h="full" p="0.55rem" position="relative" overflow="hidden">
    <style>{`
      @keyframes playerContextCarousel {
        0%, 44% { transform: translateX(0); }
        50%, 94% { transform: translateX(-50%); }
        100% { transform: translateX(0); }
      }
    `}</style>
    <Flex w="200%" h="full" style={{ animation: "playerContextCarousel 14s ease-in-out infinite" }}>
      {[
        { title: "TEAM RUN CONTEXT", rows: ["LEFT", "MIDDLE", "RIGHT"], base: getComponent(player, "rushing_production") },
        { title: "TEAM PASS CONTEXT", rows: ["SHORT", "MID", "DEEP"], base: getComponent(player, "passing_production") },
      ].map((panel) => (
        <Box key={panel.title} w="50%" pr="0.5rem">
          <Text fontSize="0.58rem" color="white" fontWeight="black" mb="0.45rem">{panel.title}</Text>
          <Flex direction="column" gap="0.35rem">
            {panel.rows.map((row, index) => (
              <Box key={row}>
                <Flex justify="space-between" mb="0.12rem">
                  <Text fontSize="0.48rem" color="rgba(255,255,255,0.58)" fontWeight="black">{row}</Text>
                  <Text fontSize="0.48rem" color="white" fontWeight="black">TEAM</Text>
                </Flex>
                <Box h="0.5rem" bg="rgba(255,255,255,0.09)" overflow="hidden">
                  <Box h="full" w={`${clamp(34 + panel.base * 1.4 + index * 9, 18, 94)}%`} bg={index === 1 ? primary : secondary} />
                </Box>
              </Box>
            ))}
          </Flex>
        </Box>
      ))}
    </Flex>
  </Box>
);

const SpecialTeamsMap = ({ player, primary, secondary }) => {
  const signal = Math.max(0, Number(player?.total_production ?? player?.par ?? 5));
  return (
    <Box h="full" p="0.55rem" position="relative">
      <Text fontSize="0.58rem" color="white" fontWeight="black" mb="0.45rem">SPECIAL TEAMS CONTROL</Text>
      <Box position="relative" h="3.1rem" bg="rgba(255,255,255,0.035)" border="1px solid rgba(255,255,255,0.08)" overflow="hidden">
        {[20, 40, 60, 80].map((mark) => (
          <Box key={mark} position="absolute" top="0" bottom="0" left={`${mark}%`} w="1px" bg="rgba(255,255,255,0.08)" />
        ))}
        <Box position="absolute" left="12%" top="45%" w={`${clamp(38 + signal, 22, 76)}%`} h="0.35rem" bg={`linear-gradient(90deg, ${primary}, ${secondary})`} />
        <Box position="absolute" left={`${clamp(42 + signal * 0.8, 18, 86)}%`} top="34%" w="0.62rem" h="0.62rem" borderRadius="full" bg="white" boxShadow={`0 0 1rem ${primary}`} />
      </Box>
      <Grid templateColumns="repeat(3, 1fr)" gap="0.35rem" mt="0.45rem">
        {[
          ["CONTROL", clamp(40 + signal, 0, 99)],
          ["FIELD POS", clamp(32 + signal * 1.2, 0, 99)],
          ["IMPACT", clamp(28 + signal * 1.5, 0, 99)],
        ].map(([label, value]) => (
          <Box key={label}>
            <Text fontSize="0.45rem" color="rgba(255,255,255,0.5)" fontWeight="black">{label}</Text>
            <Text fontSize="0.9rem" color="white" fontWeight="black">{metric(value, 0)}</Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

const PositionMap = ({ player, primary, secondary }) => {
  const position = getPosition(player);
  if (POSITION_GROUPS.PASS.has(position)) return <PassingGridMap player={player} primary={primary} secondary={secondary} />;
  if (POSITION_GROUPS.RUN.has(position)) return <RushingLaneMap player={player} primary={primary} secondary={secondary} />;
  if (POSITION_GROUPS.DEF.has(position)) return <HavocSpatialMap player={player} primary={primary} secondary={secondary} />;
  if (POSITION_GROUPS.OL.has(position)) return <TeamContextMap player={player} primary={primary} secondary={secondary} />;
  if (POSITION_GROUPS.ST.has(position)) return <SpecialTeamsMap player={player} primary={primary} secondary={secondary} />;
  return <PassingGridMap player={player} primary={primary} secondary={secondary} />;
};

const TabControls = ({ tabs, activeTab, setActiveTab, primary }) => (
  <Flex gap="0.3rem" p="0.45rem" pt={0}>
    {tabs.map((tab) => (
      <Box
        key={tab.id}
        as="button"
        onClick={() => setActiveTab(tab.id)}
        flex="1"
        minW={0}
        py="0.35rem"
        px="0.28rem"
        bg={activeTab === tab.id ? primary : "rgba(255,255,255,0.06)"}
        border="1px solid"
        borderColor={activeTab === tab.id ? primary : "rgba(255,255,255,0.1)"}
        color="white"
        fontSize="0.46rem"
        fontWeight="black"
        letterSpacing="0.05em"
        lineHeight={1.05}
        textTransform="uppercase"
        _hover={{ bg: activeTab === tab.id ? primary : "rgba(255,255,255,0.11)" }}
      >
        {tab.shortLabel ?? tab.label}
      </Box>
    ))}
  </Flex>
);

const PlayerProfileControlStrip = ({
  player,
  teamMeta,
  classLabel,
  height,
  weight,
  parScore,
  gloryRating,
  tabs,
  activeTab,
  setActiveTab,
  onBack,
}) => {
  const primary = teamMeta?.colors?.primary ?? "#E53E3E";
  const secondary = teamMeta?.colors?.secondary ?? "#FFFFFF";
  const tapeItems = getStatTape(player, parScore, gloryRating);

  return (
    <Box
      w="full"
      h="full"
      bg="linear-gradient(180deg, #17171a 0%, #09090b 100%)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
    >
      <Grid
        h="full"
        templateColumns={{
          base: "1fr",
          md: "0.85fr 1.15fr 1.45fr 1.35fr",
        }}
      >
        <BackBlock onBack={onBack} primary={primary} />
        <IdentityPlate player={player} teamMeta={teamMeta} classLabel={classLabel} height={height} weight={weight} primary={primary} />
        <StatTicker items={tapeItems} primary={primary} secondary={secondary} />
        <Flex direction="column" minH={0}>
          <Box flex="1" minH={0}>
            <PositionMap player={player} primary={primary} secondary={secondary} />
          </Box>
          <TabControls tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} primary={primary} />
        </Flex>
      </Grid>
    </Box>
  );
};

export default PlayerProfileControlStrip;
