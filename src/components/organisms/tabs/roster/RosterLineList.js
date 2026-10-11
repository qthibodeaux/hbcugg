import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";

const REDSHIRT_RED = "#E53E3E";

// avatar | last name | class year | position | HT/WT — shared by the mobile
// header and its rows so the two can't drift apart.
const MOBILE_LINE_COLUMNS = "2.5rem minmax(0, 1fr) 2.4rem 2.4rem auto";

const SUFFIX_RE = /^(Jr|Sr|I{2,3}|IV|V)\.?$/i;

const getLastName = (player) => {
  if (player.last_name && !SUFFIX_RE.test(player.last_name.trim())) return player.last_name;
  const full = player.full_name || "Unknown";
  const parts = full.replace(/,/g, " ").trim().split(/\s+/).filter(Boolean);
  while (parts.length > 1 && SUFFIX_RE.test(parts[parts.length - 1])) parts.pop();
  return parts[parts.length - 1] || full;
};
const CLASS_YEAR_LABELS = { 1: "FR", 2: "SO", 3: "JR", 4: "SR", 5: "GR" };

const formatHeightWeight = (player) => {
  const inches = player.height;
  const weight = player.weight;
  const h = Number.isFinite(inches) && inches > 0 ? `${Math.floor(inches / 12)}'${inches % 12}"` : "--";
  const w = Number.isFinite(weight) && weight > 0 ? `${weight} lbs` : "--";
  return `${h} / ${w}`;
};

export const formatClassYear = (classYear) => {
  if (classYear == null || classYear === "") return "--";
  const num = Number(classYear);
  if (Number.isFinite(num) && CLASS_YEAR_LABELS[num]) return CLASS_YEAR_LABELS[num];
  return String(classYear).toUpperCase();
};

// home_city/home_state are clean (e.g. "CA"); the pre-formatted `hometown`
// field is AP-style ("Calif.") and inconsistent, so it's only a last resort.
const formatHometown = (player) => {
  if (player.home_city && player.home_state) return `${player.home_city}, ${player.home_state}`;
  if (player.home_city) return player.home_city;
  if (player.home_state) return player.home_state;
  return player.hometown || "--";
};

const FlagChip = ({ active, activeColor, size = "20px" }) => (
  <Flex
    align="center"
    justify="center"
    w={size}
    h={size}
    borderRadius="sm"
    bg={active ? `${activeColor}26` : "whiteAlpha.50"}
    border="1px solid"
    borderColor={active ? activeColor : "whiteAlpha.100"}
    flexShrink={0}
  >
    {active ? (
      <Check size={12} color={activeColor} strokeWidth={3} />
    ) : (
      <X size={12} color="var(--chakra-colors-whiteAlpha-400)" strokeWidth={3} />
    )}
  </Flex>
);

export const RosterLineList = ({ groupedRoster = [], team }) => {
  const navigate = useNavigate();
  const primary = team?.colors?.primary ?? "#E53E3E";
  const secondary = team?.colors?.secondary ?? "#F56565";

  return (
    <Flex direction="column" gap={5}>
      {groupedRoster.map((group) => (
        <Box key={group.key}>
          {group.label && (
            <Flex align="center" gap={2.5} mb={2}>
              <Box w="3px" h="1.1rem" bg={primary} borderRadius="full" />
              <Text fontSize="sm" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
                {group.label}
              </Text>
              <Text fontSize="xs" color="text.muted">{group.players.length} players</Text>
            </Flex>
          )}

          <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden" bg="bg.secondary">
            <Flex
              display={{ base: "none", lg: "grid" }}
              gridTemplateColumns="80px 1.7fr 140px 90px 130px 80px 70px 70px"
              px={3}
              py={1.5}
              borderBottom="1px solid"
              borderColor="whiteAlpha.100"
              bg="whiteAlpha.50"
            >
              {["Jersey", "Player", "Hometown", "POS", "HT/WT", "CLS", "XFR", "RS"].map((header) => (
                <Text
                  key={header}
                  fontSize="9px"
                  color="text.muted"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  fontWeight="black"
                >
                  {header}
                </Text>
              ))}
            </Flex>

            {/* Mobile header, matching the row columns */}
            <Grid
              display={{ base: "grid", lg: "none" }}
              templateColumns={MOBILE_LINE_COLUMNS}
              gap={2}
              px={2}
              py={1}
              borderBottom="1px solid"
              borderColor="whiteAlpha.100"
              bg="whiteAlpha.50"
            >
              <Box />
              <Text fontSize="0.62rem" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black">
                Player
              </Text>
              <Text fontSize="0.62rem" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black" textAlign="center">
                CLS
              </Text>
              <Text fontSize="0.62rem" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black" textAlign="center">
                POS
              </Text>
              <Text fontSize="0.62rem" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight="black" textAlign="right">
                HT/WT
              </Text>
            </Grid>

            {group.players.map((player, index) => {
              const fullName = player.full_name || "Unknown";
              const jerseyNumber = player.jersey_number;
              const position = player.position || player.position_abbr || "--";
              const classYear = formatClassYear(player.class_year);
              const hometown = formatHometown(player);
              const imageUrl = player.image_url;
              const isTransfer = player.is_transfer ?? false;
              const isRedshirt = player.is_redshirt ?? false;
              const lastName = getLastName(player);

              return (
                <Box
                  key={player.id || player.person_id || `${group.key}-${index}`}
                  borderTop={index === 0 ? "none" : "1px solid"}
                  borderColor="whiteAlpha.100"
                  bg={index % 2 === 0 ? "transparent" : `${primary}14`}
                  cursor="pointer"
                  style={{ transition: "background 0.15s" }}
                  _hover={{ bg: `${primary}26` }}
                  onClick={() => navigate(`/player/${encodeURIComponent(`${fullName}__${player.team_id}`)}`, { state: { player } })}
                >
                  <Flex
                    display={{ base: "none", lg: "grid" }}
                    gridTemplateColumns="80px 1.7fr 140px 90px 130px 80px 70px 70px"
                    align="center"
                    px={3}
                    py={1.5}
                  >
                    <Text fontSize="sm" color="text.primary" fontWeight="black">#{jerseyNumber ?? "--"}</Text>

                    <Flex align="center" gap={3} minW={0}>
                      <Box w="36px" h="36px" borderRadius="md" overflow="hidden" bg="whiteAlpha.100" flexShrink={0}>
                        {imageUrl ? (
                          <Image src={imageUrl} alt={fullName} w="100%" h="100%" objectFit="cover" objectPosition="top" />
                        ) : (
                          <Flex w="100%" h="100%" align="center" justify="center">
                            <Text fontSize="10px" color="text.muted">N/A</Text>
                          </Flex>
                        )}
                      </Box>
                      <Text fontSize="md" color="text.primary" fontWeight="black" lineClamp={1} minW={0}>{fullName}</Text>
                    </Flex>

                    <Text fontSize="sm" color="text.muted" lineClamp={1}>{hometown}</Text>

                    <Text fontSize="sm" color={secondary} fontWeight="black" textTransform="uppercase">{position}</Text>
                    <Text fontSize="sm" color="text.primary" fontWeight="black">{formatHeightWeight(player)}</Text>
                    <Text fontSize="sm" color="text.primary" fontWeight="black" textTransform="uppercase">{classYear}</Text>

                    <FlagChip active={isTransfer} activeColor={secondary} />
                    <FlagChip active={isRedshirt} activeColor={REDSHIRT_RED} />
                  </Flex>

                  {/* Mobile — real columns (avatar, last name, class year,
                      HT/WT) instead of a stacked block per player. Jersey,
                      position, hometown and the transfer/redshirt flags are
                      dropped here; they made every row four lines tall. */}
                  <Grid
                    display={{ base: "grid", lg: "none" }}
                    templateColumns={MOBILE_LINE_COLUMNS}
                    alignItems="center"
                    gap={2}
                    px={2}
                    py={1.5}
                  >
                    <Box w="2.5rem" h="2.5rem" overflow="hidden" bg="whiteAlpha.100" flexShrink={0}>
                      {imageUrl ? (
                        <Image src={imageUrl} alt={fullName} w="100%" h="100%" objectFit="cover" objectPosition="top" />
                      ) : (
                        <Flex w="100%" h="100%" align="center" justify="center">
                          <Text fontSize="0.5rem" color="text.muted">N/A</Text>
                        </Flex>
                      )}
                    </Box>

                    <Text fontSize="1rem" color="text.primary" fontWeight="black" lineClamp={1} minW={0}>
                      {lastName}
                    </Text>

                    <Text fontSize="0.85rem" color="text.secondary" fontWeight="black" textTransform="uppercase" textAlign="center">
                      {classYear}
                    </Text>

                    <Text fontSize="0.85rem" color={secondary} fontWeight="black" textTransform="uppercase" textAlign="center" lineClamp={1}>
                      {position}
                    </Text>

                    <Text fontSize="0.85rem" color="text.secondary" fontWeight="bold" textAlign="right" whiteSpace="nowrap">
                      {formatHeightWeight(player)}
                    </Text>
                  </Grid>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Flex>
  );
};
