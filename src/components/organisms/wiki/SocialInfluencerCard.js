import React, { useState } from 'react';
import { Box, Flex, Grid, HStack, Icon, Image, Text } from '@chakra-ui/react';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { WikiCtx } from './WikiCtx';

const TikTokIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
  </svg>
);

const SOCIAL_MOCK = {
  teamHandles: {
    instagram: { handle: '@AlcornStateFB', followers: '12.4K' },
    twitter:   { handle: '@AlcornSports',  followers: '8.2K'  },
    facebook:  { handle: 'AlcornStateFB',  followers: '15.1K' },
    tiktok:    { handle: '@alcornstatefb', followers: '3.8K'  },
    youtube:   { handle: 'Alcorn Athletics', followers: '2.1K' },
  },
  influencers: {
    instagram: [
      { name: 'DeShawn Carter',  handle: '@deshawn_braves',  followers: '28.7K', initials: 'DC' },
      { name: 'Coach L. Willis', handle: '@coachwillis_alc', followers: '18.2K', initials: 'LW' },
      { name: 'Alcorn Cheer',    handle: '@alcorncheer',     followers: '14.9K', initials: 'AC' },
      { name: 'Marcus Webb',     handle: '@marcuswebb_fb',   followers: '9.3K',  initials: 'MW' },
    ],
    twitter: [
      { name: 'Tyler James',   handle: '@tjames_braves9', followers: '22.1K', initials: 'TJ' },
      { name: 'HBCU Football', handle: '@hbcufootball',   followers: '41.5K', initials: 'HF' },
      { name: 'Sam D.',        handle: '@samdgameday',    followers: '6.8K',  initials: 'SD' },
    ],
    facebook: [
      { name: 'Brave Nation Fans',  handle: 'BraveNationFans', followers: '31.2K', initials: 'BN' },
      { name: 'SWAC Football News', handle: 'SWACFootball',     followers: '18.7K', initials: 'SF' },
    ],
    tiktok: [
      { name: 'Jordan G.',    handle: '@jordangoesbraves', followers: '54.2K', initials: 'JG' },
      { name: 'Alcorn Hype', handle: '@alcornhype',        followers: '12.4K', initials: 'AH' },
    ],
    youtube: [
      { name: 'SWAC Highlights', handle: 'SWACHighlights', followers: '89.3K', initials: 'SH' },
      { name: 'Brave Recap',     handle: 'BraveRecap',     followers: '4.2K',  initials: 'BR' },
    ],
  },
};

const SocialInfluencerCard = () => {
  const wikiData = React.useContext(WikiCtx);
  const socialData = wikiData.social?.teamHandles?.instagram ? wikiData.social : SOCIAL_MOCK;
  const [activePlatform, setActivePlatform] = useState('instagram');
  const platforms = [
    { id: 'instagram', icon: Instagram,  color: '#E1306C', isSvg: false },
    { id: 'twitter',   icon: Twitter,    color: '#1DA1F2', isSvg: false },
    { id: 'facebook',  icon: Facebook,   color: '#1877F2', isSvg: false },
    { id: 'tiktok',    icon: TikTokIcon, color: '#69C9D0', isSvg: true  },
    { id: 'youtube',   icon: Youtube,    color: '#FF0000', isSvg: false },
  ];
  const teamHandle = socialData.teamHandles?.[activePlatform] || {};
  const influencers = socialData.influencers?.[activePlatform] || [];
  const activeP = platforms.find(p => p.id === activePlatform);

  return (
    <Grid h="full" templateColumns="48px 1fr" overflow="hidden">
      {/* LEFT: vertical platform icon strip */}
      <Flex
        direction="column" align="center" justify="space-evenly" h="full"
        bg="#050505" borderRight="1px solid rgba(255,255,255,0.07)" flexShrink={0}
      >
        {platforms.map(p => {
          const isActive = p.id === activePlatform;
          return (
            <Flex
              key={p.id}
              direction="column" align="center" justify="center"
              w="full" py={2} cursor="pointer" position="relative"
              onClick={() => setActivePlatform(p.id)}
              style={{ transition: 'all 0.2s' }}
            >
              {isActive && (
                <Box
                  position="absolute" left={0} top="50%" transform="translateY(-50%)"
                  w="3px" h="24px" bg={p.color} borderRightRadius="2px"
                />
              )}
              <Box color={isActive ? p.color : 'rgba(255,255,255,0.25)'} style={{ transition: 'color 0.2s' }}>
                {p.isSvg
                  ? <p.icon size={16} />
                  : <Icon as={p.icon} boxSize={4} />
                }
              </Box>
            </Flex>
          );
        })}
      </Flex>

      {/* RIGHT: content */}
      <Flex direction="column" h="full" bg="#080808" overflow="hidden">
        {/* Header */}
        <Box px={4} pt={3} pb={2} flexShrink={0} borderBottom="1px solid rgba(255,255,255,0.06)">
          <Text fontSize="7px" fontWeight="black" letterSpacing="0.45em" color="rgba(255,255,255,0.35)">
            FOLLOW THE PRIDE
          </Text>
          <Text fontSize="11px" fontWeight="black" letterSpacing="0.25em" color={activeP.color} mt={0.5}>
            {activePlatform.toUpperCase()}
          </Text>
        </Box>

        {/* Team handle (pinned, non-scrollable) */}
        <HStack
          px={4} py={2.5} gap={3} flexShrink={0}
          bg="rgba(255,255,255,0.03)" borderBottom="1px solid rgba(255,255,255,0.06)"
        >
          <Box
            w="32px" h="32px" borderRadius="full" flexShrink={0} overflow="hidden"
            border={`2px solid ${activeP.color}55`}
          >
            <Image src={wikiData.logo} w="full" h="full" objectFit="contain" p={1} />
          </Box>
          <Box flex={1} minW={0}>
            <HStack gap={1}>
              <Text fontSize="10px" fontWeight="black" color="#F4F4F5" lineClamp={1}>{teamHandle.handle}</Text>
              <Box w="10px" h="10px" borderRadius="full" bg={activeP.color} flexShrink={0}>
                <Text fontSize="6px" color="#fff" textAlign="center" lineHeight="10px">✓</Text>
              </Box>
            </HStack>
            <Text fontSize="8px" color="rgba(255,255,255,0.4)">{teamHandle.followers} followers</Text>
          </Box>
          <Box
            px={2.5} py={1} borderRadius="3px" flexShrink={0} cursor="pointer"
            border={`1px solid ${activeP.color}66`}
          >
            <Text fontSize="7px" fontWeight="black" color={activeP.color} letterSpacing="0.2em">FOLLOW</Text>
          </Box>
        </HStack>

        {/* Top influencers label */}
        <Box px={4} pt={2.5} pb={1} flexShrink={0}>
          <Text fontSize="7px" fontWeight="black" letterSpacing="0.35em" color="rgba(255,255,255,0.25)">
            TOP INFLUENCERS
          </Text>
        </Box>

        {/* Scrollable influencer list */}
        <Box flex={1} overflowY="auto" px={2} pb={2}>
          {influencers.map((inf, i) => (
            <HStack key={i} px={2} py={2} gap={3}
              borderBottom={i < influencers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'}
            >
              <Flex
                w="30px" h="30px" borderRadius="full" flexShrink={0}
                bg={`${activeP.color}22`} border={`1px solid ${activeP.color}44`}
                align="center" justify="center"
              >
                <Text fontSize="8px" fontWeight="black" color={activeP.color}>{inf.initials}</Text>
              </Flex>
              <Box flex={1} minW={0}>
                <Text fontSize="10px" fontWeight="bold" color="#F4F4F5" lineClamp={1}>{inf.name}</Text>
                <Text fontSize="8px" color="rgba(255,255,255,0.35)" lineClamp={1}>{inf.handle}</Text>
              </Box>
              <Text fontSize="8px" fontWeight="black" color="rgba(255,255,255,0.5)" flexShrink={0}>
                {inf.followers}
              </Text>
            </HStack>
          ))}
        </Box>
      </Flex>
    </Grid>
  );
};

export default SocialInfluencerCard;
