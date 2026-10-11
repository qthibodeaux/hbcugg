/**
 * TeamScheduleBanner — Variant A
 * Slot:  4x1
 * Date:  2026-04-18
 *
 * Desktop — Left ~58%: team selector pills, rows stretch to fill height.
 * Right ~38%: team identity (no season picker) + 3×2 stats grid.
 * Mobile — separate layout (see MobileTeamScheduleBannerA): full-width logo
 * grid, "All Teams" as a bottom bar instead of a left sidebar, stats shown
 * below only once a team is actually picked instead of reserving a side
 * panel just to show a placeholder sentence. Square corners, edge-to-edge.
 */

import { Box, Flex, Grid, Text, Image } from '@chakra-ui/react';
import teamsData from '../../../data/teams.json';
import { useLayoutDensity } from '../../../hooks/useLayoutDensity';

const TEAM_LIST = teamsData.teams.map(t => ({
  id: t.exportId.replace(/25$/, ''),
  exportId: t.exportId,
  short: t.bannerShort ?? t.shortName,
  label: t.name,
  primary: t.colors.primary,
  secondary: t.colors.secondary,
  conference: t.conference,
  division: t.division,
  logo: t.logo,
})).sort((a, b) => a.label.localeCompare(b.label));

const getStats = (team, seasonGames) => {
  const secondary = team?.colors?.secondary ?? '#FFFFFF';
  const completed   = seasonGames.filter(g => g.result);
  const wins        = completed.filter(g => g.result === 'W').length;
  const losses      = completed.filter(g => g.result === 'L').length;
  const confWins    = completed.filter(g => g.conf_game && g.result === 'W').length;
  const confLosses  = completed.filter(g => g.conf_game && g.result === 'L').length;
  const homeWins    = completed.filter(g => g.home_away === 'home' && g.result === 'W').length;
  const homeLosses  = completed.filter(g => g.home_away === 'home' && g.result === 'L').length;
  const awayWins    = completed.filter(g => g.home_away === 'away' && g.result === 'W').length;
  const awayLosses  = completed.filter(g => g.home_away === 'away' && g.result === 'L').length;
  const pf          = completed.reduce((s, g) => s + Number(g.score_team ?? 0), 0);
  const pa          = completed.reduce((s, g) => s + Number(g.score_opp  ?? 0), 0);

  return [
    { label: 'Overall',     value: `${wins}–${losses}`,         accent: secondary },
    { label: 'Conference',  value: `${confWins}–${confLosses}`                    },
    { label: 'Home',        value: `${homeWins}–${homeLosses}`                    },
    { label: 'Away',        value: `${awayWins}–${awayLosses}`                    },
    { label: 'Pts For',     value: pf > 0 ? pf : '—'                             },
    { label: 'Pts Against', value: pa > 0 ? pa : '—'                             },
  ];
};

const DesktopTeamScheduleBannerA = ({ team, selectedId, onChange, stats }) => (
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

// Mobile — grid first, full width, square edge-to-edge cells (no rounded
// corners, no outer padding). "All Teams" moves to a full-width bar below
// the grid instead of a rotated-text left sidebar (there's no room for a
// vertical sidebar at phone width). No side panel reserved just to show
// "Select a team..." — stats only render, below everything, once a team is
// actually picked; a small hint sits under the All Teams button instead.
const MobileTeamScheduleBannerA = ({ team, selectedId, onChange, stats }) => (
  <Box bg="#0B0B0D">
    <Grid templateColumns="repeat(6, 1fr)" gap="0">
      {TEAM_LIST.map(t => {
        const isSelected = t.id === selectedId;
        return (
          <Box
            key={t.id}
            as="button"
            aria-label={t.label}
            borderRadius="0"
            cursor="pointer"
            aspectRatio="1"
            bg={isSelected ? t.primary : 'rgba(255,255,255,0.07)'}
            border="1px solid"
            borderColor={isSelected ? t.secondary : 'rgba(255,255,255,0.1)'}
            borderBottomWidth="0.2rem"
            borderBottomColor={t.primary}
            onClick={() => onChange(t.id)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="0.4rem"
          >
            <Image src={t.logo} alt={t.label} w="72%" h="72%" objectFit="contain" />
          </Box>
        );
      })}
    </Grid>

    <Box
      as="button"
      type="button"
      w="full"
      borderRadius="0"
      bg={!selectedId ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)'}
      borderTop="1px solid"
      borderColor="rgba(255,255,255,0.1)"
      onClick={() => onChange(null)}
      py="0.6rem"
    >
      <Text fontSize="0.65rem" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" color={!selectedId ? 'white' : 'rgba(255,255,255,0.4)'}>
        All Teams
      </Text>
      {!team && (
        <Text mt="0.15rem" fontSize="0.6rem" color="rgba(255,255,255,0.35)" fontStyle="italic">
          Select a team to view their schedule
        </Text>
      )}
    </Box>

    {team && (
      <Box
        borderTop="1px solid"
        borderColor="rgba(255,255,255,0.1)"
        bg={`linear-gradient(135deg, ${team.colors.primary}66 0%, ${team.colors.primary}24 42%, rgba(0,0,0,0.26) 100%)`}
        px="0.75rem"
        py="0.75rem"
      >
        <Flex align="center" gap="0.5rem" mb="0.5rem">
          {team.logo && <Image src={team.logo} alt="" w="1.8rem" h="1.8rem" objectFit="contain" flexShrink={0} />}
          <Text fontSize="1rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.02em" lineClamp={1}>
            {team.bannerShort ?? team.shortName}
          </Text>
        </Flex>

        <Grid templateColumns="repeat(3, 1fr)" gap="0.4rem">
          {stats.map(s => (
            <Box
              key={s.label}
              px="0.5rem"
              py="0.4rem"
              borderRadius="0"
              bg="rgba(0,0,0,0.28)"
              border="1px solid"
              borderColor="rgba(255,255,255,0.08)"
            >
              <Text fontSize="0.5rem" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em" mb="0.1rem" lineClamp={1}>
                {s.label}
              </Text>
              <Text fontSize="0.85rem" fontWeight="black" lineHeight={1} color={s.accent ?? 'white'}>
                {s.value}
              </Text>
            </Box>
          ))}
        </Grid>
      </Box>
    )}
  </Box>
);

export const TeamScheduleBannerA = ({
  team,
  selectedId,
  onChange,
  seasonGames = [],
}) => {
  const { isMobile } = useLayoutDensity();
  const stats = getStats(team, seasonGames);

  return isMobile
    ? <MobileTeamScheduleBannerA team={team} selectedId={selectedId} onChange={onChange} stats={stats} />
    : <DesktopTeamScheduleBannerA team={team} selectedId={selectedId} onChange={onChange} stats={stats} />;
};
