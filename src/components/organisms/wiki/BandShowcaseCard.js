import React, { useState, useRef } from 'react';
import { Box, Flex, Grid, HStack, Text, VStack } from '@chakra-ui/react';
import { WikiCtx } from './WikiCtx';

const barAnims = ['wikibar1','wikibar2','wikibar3','wikibar4','wikibar5','wikibar6'];
const barHeights = [20, 14, 28, 10, 18, 24, 16, 12, 22, 8, 18, 26, 10, 20, 14, 28];

const PLACEHOLDER_TRACK = {
  title: 'Signature Track',
  url: '/assets/audio/swamp-2014.mp3',
  year: '—',
  event: 'Coming Soon',
};

const BandShowcaseCard = () => {
  const wikiData = React.useContext(WikiCtx);
  const audioRef = useRef(null);
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const rawTracks = wikiData.marching_band?.tracks || [];
  const tracks = rawTracks.length > 0 ? rawTracks : [PLACEHOLDER_TRACK];
  const track = tracks[trackIdx] || tracks[0];

  const selectTrack = (i) => {
    if (i === trackIdx) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setTrackIdx(i);
  };
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(p => !p);
  };
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const ct = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(ct);
    setProgress(dur > 0 ? (ct / dur) * 100 : 0);
  };
  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const handleEnded = () => setIsPlaying(false);
  const handleScrub = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
  };
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  return (
    <Box h="full" bg="#0d0618" position="relative" overflow="hidden">
      <audio
        key={track.src + trackIdx}
        ref={audioRef}
        src={track.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      {/* ghost SOD watermark */}
      <Text
        position="absolute" bottom="-20px" left="50%" transform="translateX(-50%)"
        fontSize="clamp(120px,18vw,240px)" fontWeight="black"
        color={`${wikiData.colors.primary}22`} lineHeight="1" letterSpacing="-0.06em"
        userSelect="none" zIndex={0}
      >
        {wikiData.marching_band?.bandNickname || "BAND"}
      </Text>
      <Grid templateColumns={{ base: "1fr auto 1fr 1fr 1fr", xl: "1fr 0.55fr auto 1fr 1fr 1fr" }} h="full" position="relative" zIndex={1}>

        {/* COL 1: Band identity */}
        <Flex direction="column" justify="space-between" p={{ base: 5, lg: 8 }} borderRight={`1px solid ${wikiData.colors.primary}33`}>
          <VStack align="start" gap={0}>
            <Text fontSize="8px" fontWeight="black" letterSpacing="0.4em" color={wikiData.colors.secondary} mb={3}>
              MARCHING BAND
            </Text>
            <Text fontSize="clamp(26px,3.8vw,52px)" fontWeight="black" letterSpacing="-0.04em" lineHeight="0.88" color="#F4F4F5" textTransform="uppercase" whiteSpace="nowrap">
              {wikiData.marching_band?.bandName?.includes("SOUNDS OF") ? "SOUNDS OF" : wikiData.marching_band?.bandNickname || "MARCHING BAND"}
            </Text>
            <Text fontSize="clamp(26px,3.8vw,52px)" fontWeight="black" letterSpacing="-0.04em" lineHeight="0.88" color="#F4F4F5" textTransform="uppercase" whiteSpace="nowrap">
              {wikiData.marching_band?.bandName?.includes("SOUNDS OF") ? "DYN-O-MITE" : wikiData.marching_band?.bandName?.split(" ").pop() || "POWER"}
            </Text>
            <HStack gap={2} mt={3}>
              <Box w="20px" h="2px" bg={wikiData.colors.secondary} />
              <Text fontSize="9px" fontWeight="black" color={wikiData.colors.secondary} letterSpacing="0.2em">
                {(wikiData.marching_band?.specialEntrance || 'THE ENTRANCE').toUpperCase()}
              </Text>
            </HStack>
          </VStack>
          <Text fontSize="xs" color="rgba(255,255,255,0.4)" lineHeight="1.7">
            {wikiData.marching_band.philosophy}
          </Text>
        </Flex>

        {/* COL 2: Band stats — hidden at narrow */}
        <VStack gap={0} align="stretch" justify="center" p={6} borderRight={`1px solid ${wikiData.colors.primary}33`} display={{ base: "none", xl: "flex" }}>
          {[
            { label: "FOUNDED",    value: wikiData.marching_band.founded },
            { label: "BAND SIZE",  value: `${wikiData.marching_band.size} MEMBERS` },
            { label: "DANCE TEAM", value: wikiData.marching_band.danceTeamName },
            { label: "FLAG LINE",  value: wikiData.marching_band.flagLineName },
            { label: "DRUM MAJOR", value: wikiData.marching_band.drumMajorStyle },
          ].map((s, i) => (
            <Box key={i} py={3} borderBottom={`1px solid ${wikiData.colors.primary}22`}>
              <Text fontSize="7px" fontWeight="black" color="rgba(255,255,255,0.3)" letterSpacing="0.3em">{s.label}</Text>
              <Text fontSize="sm" fontWeight="black" color="#F4F4F5" letterSpacing="-0.01em" lineHeight="1.3">{s.value}</Text>
            </Box>
          ))}
        </VStack>

        {/* COL 3: Big play / pause button + scrub */}
        <Flex direction="column" align="center" justify="center" gap={4} px={{ base: 4, lg: 7 }}
          bg={wikiData.colors.primary}
          borderRight="1px solid rgba(255,255,255,0.1)"
        >
          {/* equalizer bars above button */}
          <HStack gap="3px" align="flex-end" h="32px">
            {barHeights.slice(0, 10).map((bh, i) => (
              <Box key={i} w="5px" borderRadius="1px"
                bg={isPlaying ? wikiData.colors.secondary : 'rgba(255,255,255,0.2)'}
                style={{
                  height: `${bh}px`,
                  animation: isPlaying ? `${barAnims[i % 6]} ${1.1 + i * 0.09}s ease-in-out infinite` : 'none',
                  animationDelay: `${i * 0.08}s`,
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </HStack>
          {/* circular play/pause */}
          <Box
            as="button" onClick={togglePlay}
            w="72px" h="72px" borderRadius="full"
            bg={wikiData.colors.secondary} color="#000"
            display="flex" alignItems="center" justifyContent="center"
            border="4px solid rgba(255,255,255,0.15)"
            cursor="pointer" style={{ transition: 'opacity 0.15s, transform 0.1s' }}
          >
            <Text fontSize="2xl" lineHeight="1">{isPlaying ? '\u23F8' : '\u25B6'}</Text>
          </Box>
          {/* scrub + time */}
          <Box w="80px">
            <Box h="3px" bg="rgba(255,255,255,0.2)" cursor="pointer" borderRadius="2px" mb={1} onClick={handleScrub}>
              <Box h="full" borderRadius="2px" bg={wikiData.colors.secondary} w={`${progress}%`} transition="width 0.1s linear" />
            </Box>
            <HStack justify="space-between">
              <Text fontSize="7px" color="rgba(255,255,255,0.4)" fontFamily="mono">{fmt(currentTime)}</Text>
              <Text fontSize="7px" color="rgba(255,255,255,0.4)" fontFamily="mono">{fmt(duration)}</Text>
            </HStack>
          </Box>
        </Flex>

        {/* COLS 4+: Track cards — horizontal, each selectable */}
        {tracks.map((t, i) => {
          const isActive = i === trackIdx;
          const isThisPlaying = isActive && isPlaying;
          return (
            <Flex
              key={i} direction="column" justify="space-between"
              p={{ base: 4, lg: 7 }} cursor="pointer"
              bg={isActive ? `${wikiData.colors.primary}55` : 'transparent'}
              borderRight={i < tracks.length - 1 ? "1px solid rgba(255,255,255,0.06)" : 'none'}
              borderLeft={`3px solid ${isActive ? wikiData.colors.secondary : 'transparent'}`}
              onClick={() => selectTrack(i)}
              style={{ transition: 'background 0.2s' }}
            >
              <Box>
                <Text fontSize="7px" fontWeight="black" letterSpacing="0.35em" mb={2}
                  color={isActive ? wikiData.colors.secondary : 'rgba(255,255,255,0.3)'}>
                  {t.label}
                </Text>
                <Text fontSize="clamp(14px,1.6vw,20px)" fontWeight="black" letterSpacing="-0.02em" lineHeight="1.1"
                  color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}>
                  {t.title}
                </Text>
              </Box>
              {/* status indicator */}
              <HStack gap={2} mt={3}>
                {isThisPlaying ? (
                  <>
                    <HStack gap="2px" align="flex-end" h="12px">
                      {[8,5,10,4,7].map((bh, bi) => (
                        <Box key={bi} w="3px" borderRadius="1px" bg={wikiData.colors.secondary}
                          style={{ height: `${bh}px`, animation: `${barAnims[bi % 6]} ${0.9 + bi * 0.1}s ease-in-out infinite` }}
                        />
                      ))}
                    </HStack>
                    <Text fontSize="7px" fontWeight="black" letterSpacing="0.3em" color={wikiData.colors.secondary}>NOW PLAYING</Text>
                  </>
                ) : (
                  <Text fontSize="7px" fontWeight="black" letterSpacing="0.25em"
                    color={isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}>
                    {isActive ? 'SELECTED  \u2192' : 'SELECT  \u2192'}
                  </Text>
                )}
              </HStack>
            </Flex>
          );
        })}

      </Grid>
    </Box>
  );
};

export default BandShowcaseCard;
