import { Flex, Image, Box, Text } from "@chakra-ui/react";
import { getTeamLogo, getTeamLabel, getTeamName } from "./scoreboardModel";

// Accepted scoreboard away/home identity and score sections, with their original density rules.

export const ScoreboardAway = ({ isCompact, awayId, getRecordConf, getMascotLocal, getRecordOverall, awayScore, homeScore }) => (<Flex 
            align="center" 
            gap={isCompact ? 4.5 : 8} 
            minW={0} 
            pl={{ base: 2, lg: 6 }} 
            py={2}
          >
            {/* Logo */}
            <Image 
              src={getTeamLogo(awayId)} 
              alt="" 
              h={isCompact ? "clamp(48px, 6.5vw, 62px)" : "clamp(80px, 9vw, 110px)"} 
              objectFit="contain" 
              flexShrink={0} 
            />

            {/* Team Identity Stack */}
            <Box minW={0}>
              {isCompact ? (
                <>
                  <Text 
                    fontSize="clamp(20px, 2.5vw, 28px)" 
                    fontWeight="black" 
                    color="text.primary"
                    textTransform="uppercase"
                    lineHeight={1.05}
                    lineClamp={1}
                  >
                    {getTeamLabel(awayId)}
                  </Text>
                  <Text 
                    fontSize="clamp(12px, 1.4vw, 14px)" 
                    fontWeight="bold" 
                    color="whiteAlpha.600"
                    lineClamp={1}
                  >
                    {getRecordConf(awayId)}
                  </Text>
                </>
              ) : (
                // 3-Row Stacked layout next to the logo for widescreen
                <>
                  <Text 
                    fontSize="clamp(20px, 2.2vw, 32px)" 
                    fontWeight="black" 
                    color="text.primary" 
                    textTransform="uppercase"
                    letterSpacing="0.04em"
                    lineHeight={1.05}
                    lineClamp={1}
                  >
                    {getTeamName(awayId)}
                  </Text>
                  <Text 
                    fontSize="clamp(16px, 1.8vw, 24px)" 
                    fontWeight="black" 
                    color="whiteAlpha.800" 
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    lineHeight={1.15}
                    mt="3px"
                    lineClamp={1}
                  >
                    {getMascotLocal(awayId)}
                  </Text>
                  <Flex align="center" gap={1.5} mt="4px">
                    <Text 
                      fontSize="clamp(13px, 1.3vw, 16px)" 
                      fontWeight="950" 
                      color="white"
                      lineClamp={1}
                    >
                      {getRecordConf(awayId)}
                    </Text>
                    <Text fontSize="11px" color="whiteAlpha.400" fontWeight="normal">*</Text>
                    <Text 
                      fontSize="clamp(13px, 1.3vw, 16px)" 
                      fontWeight="medium" 
                      color="whiteAlpha.600"
                      lineClamp={1}
                    >
                      ({getRecordOverall(awayId)})
                    </Text>
                  </Flex>
                </>
              )}
            </Box>

            {/* Score */}
            <Text 
              fontWeight="950" 
              fontSize={isCompact ? "1.8rem" : "clamp(2.5rem, 5vw, 3.8rem)"}
              fontStyle="italic"
              ml="auto"
              pr={isCompact ? 2 : 4}
              color={awayScore > homeScore ? "white" : "whiteAlpha.600"}
              flexShrink={0}
            >
              {awayScore}
            </Text>
          </Flex>);

export const ScoreboardHome = ({ isCompact, homeId, getRecordConf, getMascotLocal, getRecordOverall, homeScore, awayScore }) => (<Flex 
            align="center" 
            gap={isCompact ? 4.5 : 8} 
            direction="row-reverse" 
            minW={0} 
            pr={{ base: 2, lg: 6 }} 
            py={2}
          >
            {/* Logo */}
            <Image 
              src={getTeamLogo(homeId)} 
              alt="" 
              h={isCompact ? "clamp(48px, 6.5vw, 62px)" : "clamp(80px, 9vw, 110px)"} 
              objectFit="contain" 
              flexShrink={0} 
            />

            {/* Team Identity Stack */}
            <Box minW={0} textAlign="right">
              {isCompact ? (
                <>
                  <Text 
                    fontSize="clamp(20px, 2.5vw, 28px)" 
                    fontWeight="black" 
                    color="text.primary"
                    textTransform="uppercase"
                    lineHeight={1.05}
                    lineClamp={1}
                  >
                    {getTeamLabel(homeId)}
                  </Text>
                  <Text 
                    fontSize="clamp(12px, 1.4vw, 14px)" 
                    fontWeight="bold" 
                    color="whiteAlpha.600"
                    lineClamp={1}
                  >
                    {getRecordConf(homeId)}
                  </Text>
                </>
              ) : (
                // 3-Row Stacked layout next to the logo for widescreen
                <>
                  <Text 
                    fontSize="clamp(20px, 2.2vw, 32px)" 
                    fontWeight="black" 
                    color="text.primary" 
                    textTransform="uppercase"
                    letterSpacing="0.04em"
                    lineHeight={1.05}
                    lineClamp={1}
                  >
                    {getTeamName(homeId)}
                  </Text>
                  <Text 
                    fontSize="clamp(16px, 1.8vw, 24px)" 
                    fontWeight="black" 
                    color="whiteAlpha.800" 
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    lineHeight={1.15}
                    mt="3px"
                    lineClamp={1}
                  >
                    {getMascotLocal(homeId)}
                  </Text>
                  <Flex align="center" gap={1.5} mt="4px" justify="flex-end">
                    <Text 
                      fontSize="clamp(13px, 1.3vw, 16px)" 
                      fontWeight="950" 
                      color="white"
                      lineClamp={1}
                    >
                      {getRecordConf(homeId)}
                    </Text>
                    <Text fontSize="11px" color="whiteAlpha.400" fontWeight="normal">*</Text>
                    <Text 
                      fontSize="clamp(13px, 1.3vw, 16px)" 
                      fontWeight="medium" 
                      color="whiteAlpha.600"
                      lineClamp={1}
                    >
                      ({getRecordOverall(homeId)})
                    </Text>
                  </Flex>
                </>
              )}
            </Box>

            {/* Score */}
            <Text 
              fontWeight="950" 
              fontSize={isCompact ? "1.8rem" : "clamp(2.5rem, 5vw, 3.8rem)"}
              fontStyle="italic"
              mr="auto"
              pl={isCompact ? 2 : 4}
              color={homeScore > awayScore ? "white" : "whiteAlpha.600"}
              flexShrink={0}
            >
              {homeScore}
            </Text>
          </Flex>);
