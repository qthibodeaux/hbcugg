import { Box, Flex, Text, Grid, Image } from "@chakra-ui/react";

// Desktop team selector rail/grid and detail panel; JSX retained from the original picker.

export const DesktopTeamProfilePicker = ({ teamId, onChange, teams, team, primary, season, row, stats }) => (<Box h="100%" w="100%" containerType="size">
      <Flex
        h="100%"
        align="stretch"
        overflow="hidden"
        borderRadius="2xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        bg="#0B0B0D"
      >
        {/* ── Rail: All Teams (clears the selection) ── */}
        <Box
          as="button"
          type="button"
          w="9cqmin"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg={!teamId ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)"}
          borderRight="1px solid"
          borderColor="rgba(255,255,255,0.1)"
          onClick={() => onChange(null)}
          transition="all 0.15s"
          _hover={{ bg: !teamId ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.07)" }}
        >
          <Text
            fontSize="2.4cqmin"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.18em"
            color={!teamId ? "white" : "rgba(255,255,255,0.25)"}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            All Teams
          </Text>
        </Box>

        {/* ── Pills: 6 x 3 ── */}
        <Grid
          flex={1}
          minW={0}
          templateColumns="repeat(6, minmax(0, 1fr))"
          templateRows="repeat(3, minmax(0, 1fr))"
          gap="2cqmin"
          px="4cqmin"
          py="4cqmin"
        >
          {teams.map((t) => {
            const isSelected = t.id === teamId;
            return (
              <Box
                key={t.id}
                as="button"
                type="button"
                aria-label={t.name}
                aria-pressed={isSelected}
                borderRadius="md"
                cursor="pointer"
                minW={0}
                minH={0}
                bg={isSelected ? t.primary : "rgba(255,255,255,0.07)"}
                border="1px solid"
                borderColor={isSelected ? t.secondary : "rgba(255,255,255,0.1)"}
                onClick={() => onChange(isSelected ? null : t.id)}
                display="flex"
                alignItems="center"
                justifyContent="center"
                px="1.5cqmin"
                transition="all 0.15s"
                _hover={{ bg: isSelected ? t.primary : "rgba(255,255,255,0.12)", borderColor: isSelected ? t.secondary : "rgba(255,255,255,0.25)" }}
              >
                <Text
                  fontSize="2.8cqmin"
                  fontWeight="black"
                  textTransform="uppercase"
                  letterSpacing="0.03em"
                  color={isSelected ? "white" : "rgba(255,255,255,0.7)"}
                  lineHeight={1.05}
                  lineClamp={2}
                  textAlign="center"
                >
                  {t.name}
                </Text>
              </Box>
            );
          })}
        </Grid>

        {/* Hairline */}
        <Box w="1px" bg="rgba(255,255,255,0.12)" my="4cqmin" flexShrink={0} />

        {/* ── Detail: identity + headline stats, or the prompt ── */}
        <Flex
          w="34%"
          flexShrink={0}
          direction="column"
          justify="center"
          px="4cqmin"
          py="4cqmin"
          gap="2.5cqmin"
          minW={0}
          bg={team ? "#141416" : undefined}
          borderLeft={team ? "0.8cqmin solid" : undefined}
          borderLeftColor={team ? primary : undefined}
        >
          {!team ? (
            <Flex align="center" justify="center" h="100%">
              <Text fontSize="4cqmin" color="rgba(255,255,255,0.3)" textAlign="center" fontStyle="italic">
                Select a team to view their profile
              </Text>
            </Flex>
          ) : (
            <>
              <Flex align="center" gap="2.5cqmin" minW={0} flexShrink={0}>
                <Box minW={0} flex={1}>
                  <Text
                    fontSize="6cqmin"
                    fontWeight="black"
                    color="white"
                    textTransform="uppercase"
                    letterSpacing="-0.01em"
                    lineHeight={0.95}
                    lineClamp={2}
                    wordBreak="normal"
                    style={{ overflowWrap: "normal", hyphens: "none" }}
                  >
                    {team.identity.name}
                  </Text>
                  <Text fontSize="2.4cqmin" fontWeight="black" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.16em" mt="1.2cqmin">
                    {team.identity.conference} {team.identity.division} · {season}
                  </Text>
                </Box>
                {team.identity.logo && (
                  <Box w="12cqmin" h="12cqmin" flexShrink={0}>
                    <Image src={team.identity.logo} alt="" w="100%" h="100%" objectFit="contain" onError={(e) => { e.target.style.display = "none"; }} />
                  </Box>
                )}
              </Flex>

              {row ? (
                <Grid templateColumns="repeat(3, minmax(0, 1fr))" templateRows="repeat(2, minmax(0, 1fr))" gap="1.2cqmin" flex={1} minH={0}>
                  {stats.map((s) => (
                    <Flex
                      key={s.label}
                      direction="column"
                      justify="center"
                      minW={0}
                      minH={0}
                      px="2cqmin"
                      py="1.2cqmin"
                      borderRadius="sm"
                      bg={s.fill}
                    >
                      <Text fontSize="2.2cqmin" fontWeight="black" color="rgba(255,255,255,0.75)" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1} mb="0.8cqmin">
                        {s.label}
                      </Text>
                      <Flex align="baseline" gap="1.2cqmin" minW={0}>
                        <Text fontSize="5.4cqmin" fontWeight="black" lineHeight={1} color="white" fontVariantNumeric="tabular-nums" lineClamp={1}>
                          {s.value}
                        </Text>
                        {s.sub && (
                          <Text fontSize="2.4cqmin" color="rgba(255,255,255,0.8)" fontWeight="black" letterSpacing="0.06em" lineClamp={1} fontVariantNumeric="tabular-nums">
                            {s.sub}
                          </Text>
                        )}
                      </Flex>
                    </Flex>
                  ))}
                </Grid>
              ) : (
                <Text fontSize="3.6cqmin" color="rgba(255,255,255,0.4)" fontStyle="italic">
                  No {season} season on file.
                </Text>
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Box>);
