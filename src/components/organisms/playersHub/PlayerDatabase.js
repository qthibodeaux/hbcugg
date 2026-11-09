import { YEARS, POSITION_GROUPS, CLASS_YEARS } from "../../../utils/playersHubPresentation";
import { Box, Flex, Text, Spinner, Grid } from "@chakra-ui/react";
import SearchInput from "../../atoms/interactive/SearchInput";
import { Zap, TrendingUp, Award, ArrowRightLeft, Calendar } from "lucide-react";
import FilterChip from "../../atoms/interactive/FilterChip";
import { LeaderboardsView } from "./PlayerLeaderboardsView";
import { TransfersView } from "./PlayerTransfersView";
import { StatPlayerCard, RosterPlayerCard, HistoricalPlayerCard } from "./PlayerDiscoveryCards";

// Player database controls/results. Filter state is owned by the page.
export const PlayerDatabase = ({ search, setSearch, setPage, setView, view, setYear, year, conf, setFilter, setConf, pos, setPos, cls, setCls, isLoading, filtered, leaderboards, analyticsLoading, navigate, transferAnalytics, paginated, hasMore }) => <>
        {/* Search + filters */}
        <Box pt={6}>
          <Flex gap={3} align="center" maxW="680px" flexWrap="wrap">
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="SEARCH ATHLETE BY NAME, POSITION, OR SCHOOL..."
            />
            <Box
              as="button"
              px={5}
              py={3}
              bg="brand.500"
              color="white"
              borderRadius="md"
              fontSize="11px"
              fontWeight="bold"
              letterSpacing="0.08em"
              textTransform="uppercase"
              _hover={{ bg: "brand.600" }}
              transition="all 0.15s"
              whiteSpace="nowrap"
              display="flex"
              alignItems="center"
              gap={2}
            >
              Comparison Tool <Zap size={12} />
            </Box>
          </Flex>
        </Box>

        {/* The discovery boards that used to live here now render as real
            PageShell slots above (see the return) — this section is the
            searchable database only. */}

        {/* Divider */}
        <Box borderTop="1px solid" borderColor="whiteAlpha.100" mb={8} pt={8}>
          <Flex align="center" gap={3} mb={6}>
            <Box w="4px" h="20px" bg="brand.500" borderRadius="full" />
            <Text
              fontSize="sm"
              fontWeight="black"
              color="white"
              textTransform="uppercase"
              letterSpacing="0.1em"
            >
              Player Database
            </Text>
          </Flex>
        </Box>

        {/* View toggle */}
        <Flex
          gap={1}
          mb={6}
          bg="bg.secondary"
          borderRadius="lg"
          p={1}
          display="inline-flex"
          flexWrap="wrap"
        >
          {[
            {
              id: "stats",
              label: (
                <Flex align="center" gap={1}>
                  <TrendingUp size={11} /> Production
                </Flex>
              ),
            },
            {
              id: "leaderboards",
              label: (
                <Flex align="center" gap={1}>
                  <Award size={11} /> Leaderboards
                </Flex>
              ),
            },
            {
              id: "transfers",
              label: (
                <Flex align="center" gap={1}>
                  <ArrowRightLeft size={11} /> Transfers
                </Flex>
              ),
            },
            { id: "roster", label: "Full Roster" },
            {
              id: "history",
              label: (
                <Flex align="center" gap={1}>
                  <Calendar size={11} /> By Year
                </Flex>
              ),
            },
          ].map(({ id, label }) => (
            <Box
              key={id}
              as="button"
              onClick={() => {
                setView(id);
                setPage(1);
              }}
              px={4}
              py={2}
              borderRadius="md"
              fontSize="sm"
              fontWeight="medium"
              bg={view === id ? "brand.500" : "transparent"}
              color={view === id ? "white" : "text.muted"}
              _hover={{ color: view === id ? "white" : "text.primary" }}
              transition="all 0.15s"
            >
              {label}
            </Box>
          ))}
        </Flex>

        {/* Year selector */}
        {view === "history" && (
          <Flex
            gap={1}
            mb={6}
            bg="bg.secondary"
            borderRadius="lg"
            p={1}
            display="inline-flex"
          >
            {YEARS.map((y) => (
              <Box
                key={y}
                as="button"
                onClick={() => {
                  setYear(y);
                  setPage(1);
                }}
                px={4}
                py="6px"
                borderRadius="md"
                fontSize="sm"
                fontWeight={year === y ? "bold" : "medium"}
                bg={year === y ? "brand.500" : "transparent"}
                color={year === y ? "white" : "text.muted"}
                _hover={{ color: year === y ? "white" : "text.primary" }}
                transition="all 0.15s"
              >
                {y}
              </Box>
            ))}
          </Flex>
        )}

        {/* Filters */}
        {(view === "stats" || view === "roster" || view === "history") && (
          <Box mb={6}>
            <Text
              fontSize="xs"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="widest"
              mb={2}
            >
              Conference
            </Text>
            <Flex gap={2} mb={4} flexWrap="wrap">
              {["all", "swac", "meac"].map((c) => (
                <FilterChip
                  key={c}
                  active={conf === c}
                  onClick={() => setFilter(setConf)(c)}
                >
                  {c === "all" ? "All" : c.toUpperCase()}
                </FilterChip>
              ))}
            </Flex>
            <Text
              fontSize="xs"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="widest"
              mb={2}
            >
              Position
            </Text>
            <Flex gap={2} mb={4} flexWrap="wrap">
              <FilterChip
                active={pos === "all"}
                onClick={() => setFilter(setPos)("all")}
              >
                All
              </FilterChip>
              {POSITION_GROUPS.map((p) => (
                <FilterChip
                  key={p}
                  active={pos === p}
                  onClick={() => setFilter(setPos)(p)}
                >
                  {p}
                </FilterChip>
              ))}
            </Flex>
            <Text
              fontSize="xs"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="widest"
              mb={2}
            >
              Class
            </Text>
            <Flex gap={2} flexWrap="wrap">
              <FilterChip
                active={cls === "all"}
                onClick={() => setFilter(setCls)("all")}
              >
                All
              </FilterChip>
              {CLASS_YEARS.map((c) => (
                <FilterChip
                  key={c}
                  active={cls === c}
                  onClick={() => setFilter(setCls)(c)}
                >
                  {c}
                </FilterChip>
              ))}
            </Flex>
          </Box>
        )}

        {!isLoading &&
          (view === "stats" || view === "roster" || view === "history") && (
            <Text fontSize="xs" color="text.muted" mb={4}>
              {filtered.length.toLocaleString()} players
            </Text>
          )}

        {isLoading && (
          <Flex justify="center" py={16}>
            <Spinner color="brand.500" size="lg" />
          </Flex>
        )}

        {!isLoading && view === "leaderboards" && (
          <LeaderboardsView
            leaderboards={leaderboards}
            isLoading={analyticsLoading}
            navigate={navigate}
          />
        )}
        {!isLoading && view === "transfers" && (
          <TransfersView
            transferAnalytics={transferAnalytics}
            isLoading={analyticsLoading}
            navigate={navigate}
          />
        )}

        {!isLoading &&
          (view === "stats" || view === "roster" || view === "history") && (
            <>
              <Grid
                templateColumns={
                  view === "history"
                    ? {
                        base: "repeat(2,1fr)",
                        sm: "repeat(3,1fr)",
                        md: "repeat(5,1fr)",
                        lg: "repeat(7,1fr)",
                      }
                    : {
                        base: "repeat(2,1fr)",
                        sm: "repeat(3,1fr)",
                        md: "repeat(4,1fr)",
                        lg: "repeat(6,1fr)",
                      }
                }
                gap={3}
              >
                {paginated.map((p, i) => {
                  if (view === "stats")
                    return (
                      <StatPlayerCard
                        key={p.player_key ?? i}
                        player={p}
                        navigate={navigate}
                      />
                    );
                  if (view === "roster")
                    return (
                      <RosterPlayerCard
                        key={p.id ?? i}
                        player={p}
                        navigate={navigate}
                      />
                    );
                  return (
                    <HistoricalPlayerCard key={p.person_id ?? i} player={p} />
                  );
                })}
              </Grid>

              {hasMore && (
                <Flex justify="center" mt={8} pb={12}>
                  <Box
                    as="button"
                    onClick={() => setPage((n) => n + 1)}
                    px={6}
                    py={3}
                    bg="whiteAlpha.100"
                    color="text.secondary"
                    borderRadius="lg"
                    fontSize="sm"
                    fontWeight="medium"
                    _hover={{ bg: "whiteAlpha.200", color: "text.primary" }}
                    transition="all 0.15s"
                  >
                    Load more · {filtered.length - paginated.length} remaining
                  </Box>
                </Flex>
              )}
            </>
          )}
    </>;
