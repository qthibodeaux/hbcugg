import { Box, Flex, Text, Grid, Image } from "@chakra-ui/react";
import { TEAM_LIST } from "./bannerModel";

// Production desktop/compact selector and identity panel; original media rules are retained.

export const DesktopTeamScheduleBannerA = ({ team, selectedId, onChange, stats }) => (
  <Box
    h="100%"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="#0B0B0D"
  >
    <style>{`
      @media (min-width: 641px) and (max-width: 900px) {
        .team-schedule-selector-grid {
          gap: 0.45rem;
          padding-left: 0.85rem;
          padding-right: 0.85rem;
        }
        .team-schedule-pill {
          padding-left: 0.35rem;
          padding-right: 0.35rem;
        }
        /* Panel widened from 24% — at 24% a full name like "TEXAS SOUTHERN"
           had less horizontal room than the word itself and broke mid-word
           ("TEXAS SOUT / HERN"). The stat cards below shrink to pay for the
           extra width rather than the name being cut or abbreviated. */
        .team-schedule-detail-panel {
          width: 32%;
          padding: 0.45rem 0.6rem;
          gap: 0.3rem;
        }
        .team-schedule-detail-logo {
          display: none;
        }
        .team-schedule-detail-name {
          font-size: clamp(0.8rem, 1.7vw, 1.05rem);
        }
        .team-schedule-stat-grid {
          gap: 0.25rem;
        }
        .team-schedule-stat-card {
          padding: 0.3rem 0.4rem;
          border-radius: 0.35rem;
        }
        .team-schedule-stat-label {
          font-size: 0.36rem;
          margin-bottom: 0.05rem;
        }
        .team-schedule-stat-value {
          font-size: clamp(0.7rem, 1.5vw, 0.9rem);
          line-height: 0.95;
        }
      }
    `}</style>
    <Flex h="100%" align="stretch">

      {/* ── Col 1: tall neutral reset button ── */}
      <Box
        as="button"
        w="48px"
        flexShrink={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={!selectedId ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)'}
        borderRight="1px solid"
        borderColor="rgba(255,255,255,0.1)"
        onClick={() => onChange(null)}
        style={{ transition: 'all 0.15s' }}
        _hover={{ bg: !selectedId ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)' }}
      >
        <Text
          fontSize="8px"
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="0.18em"
          color={!selectedId ? 'white' : 'rgba(255,255,255,0.25)'}
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          All Teams
        </Text>
      </Box>

      {/* ── Col 2: team selector pills ── */}
      <Grid
        className="team-schedule-selector-grid"
        flex={1}
        templateColumns="repeat(6, 1fr)"
        templateRows="repeat(3, 1fr)"
        gap={2}
        px={5}
        py={4}
      >
        {TEAM_LIST.map(t => {
          const isSelected = t.id === selectedId;
          return (
            <Box
              className="team-schedule-pill"
              key={t.id}
              as="button"
              aria-label={t.label}
              borderRadius="md"
              cursor="pointer"
              bg={isSelected ? t.primary : 'rgba(255,255,255,0.07)'}
              border="1px solid"
              borderColor={isSelected ? t.secondary : 'rgba(255,255,255,0.1)'}
              onClick={() => onChange(t.id)}
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={2}
              style={{ transition: 'all 0.15s' }}
            >
              <Text
                fontSize="xs"
                fontWeight="black"
                textTransform="uppercase"
                letterSpacing="0.03em"
                color={isSelected ? 'white' : 'rgba(255,255,255,0.7)'}
                lineClamp={1}
              >
                {t.short}
              </Text>
            </Box>
          );
        })}
      </Grid>

      {/* Hairline */}
      <Box w="1px" bg="rgba(255,255,255,0.12)" my={4} flexShrink={0} />

      {/* ── Col 3: team identity + stats, or placeholder ── */}
      <Flex
        className="team-schedule-detail-panel"
        w="34%"
        flexShrink={0}
        direction="column"
        justify="center"
        px={5}
        py={4}
        gap={2}
        bg={team ? `linear-gradient(135deg, ${team.colors.primary}66 0%, ${team.colors.primary}24 42%, rgba(0,0,0,0.26) 100%)` : undefined}
      >

        {!team ? (
          <Flex align="center" justify="center" h="100%">
            <Text
              fontSize="sm"
              color="rgba(255,255,255,0.25)"
              textAlign="center"
              fontStyle="italic"
            >
              Select a team to view their schedule
            </Text>
          </Flex>
        ) : (
          <>
            {/* Team identity — one full name, never abbreviated or cut. The
                old full/short text pair toggled by a CSS media query wasn't
                actually swapping, so both rendered at once and collided.
                wordBreak/overflowWrap normal keeps long names breaking only
                at spaces ("TEXAS / SOUTHERN"), never mid-word; the compact
                media query widens this panel and shrinks the stat cards so
                there's real room for the name to do that. */}
            <Flex align="center" gap={3}>
              {team.logo && (
                <Box className="team-schedule-detail-logo" w="40px" h="40px" flexShrink={0}>
                  <Image src={team.logo} w="40px" h="40px" objectFit="contain"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                </Box>
              )}
              <Text
                className="team-schedule-detail-name"
                fontSize="clamp(1rem, 2.2vw, 1.5rem)"
                fontWeight="black"
                color="white"
                textTransform="uppercase"
                letterSpacing="0.02em"
                lineHeight={1}
                flex={1}
                minW={0}
                wordBreak="normal"
                style={{ overflowWrap: 'normal', hyphens: 'none' }}
              >
                {team.name}
              </Text>
            </Flex>

            {/* 3×2 stats grid */}
            <Grid className="team-schedule-stat-grid" templateColumns="1fr 1fr" templateRows="repeat(3, 1fr)" gap={2} flex={1}>
              {stats.map(s => (
                <Box
                  className="team-schedule-stat-card"
                  key={s.label}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  bg="rgba(0,0,0,0.28)"
                  border="1px solid"
                  borderColor="rgba(255,255,255,0.08)"
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                >
                  <Text
                    className="team-schedule-stat-label"
                    fontSize="7px"
                    color="rgba(255,255,255,0.38)"
                    textTransform="uppercase"
                    letterSpacing="0.12em"
                    mb="2px"
                  >
                    {s.label}
                  </Text>
                  <Text
                    className="team-schedule-stat-value"
                    fontSize="lg"
                    fontWeight="black"
                    lineHeight={1}
                    color={s.accent ?? 'white'}
                  >
                    {s.value}
                  </Text>
                </Box>
              ))}
            </Grid>
          </>
        )}

      </Flex>
    </Flex>
  </Box>
);
