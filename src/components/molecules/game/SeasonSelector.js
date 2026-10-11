import { Box, Flex, Text } from "@chakra-ui/react";
import { demoSeasons } from "../../../config/demo";

// Scoped to launch.0 (2026-08-27): every year-dropdown banner in the app
// pulls from this single list. Full data exists further back for some
// domains (roster data to 2010, game data to 2019 minus 2020), but launch.0
// deliberately narrows what's exposed in production to these 7 years —
// this is a product scoping decision, not a data-availability limit.
// The demo build offers the current season only (config/demo.js).
export const GAME_CENTER_SEASONS = demoSeasons([2026, 2025, 2024, 2023, 2022, 2021, 2019]);

// Fallback only — the live season comes from shared/football_current_context.json
// via useFootballCurrentContext. Keep this equal to what the backend reports as
// current so a failed context fetch lands on the same season, not last year's.
export const GAME_CENTER_DEFAULT_SEASON = 2026;

export const SeasonSelector = ({
  season,
  setSeason,
  seasons = GAME_CENTER_SEASONS,
  label = "Season",
  accent = "rgba(255,255,255,0.45)",
  minW = "92px",
}) => (
  <Box minW={minW}>
    {label && (
      <Text
        fontSize="8px"
        fontWeight="black"
        color="rgba(255,255,255,0.38)"
        textTransform="uppercase"
        letterSpacing="0.22em"
        mb={2}
        textAlign="center"
      >
        {label}
      </Text>
    )}
    <Flex
      as="label"
      align="center"
      px={3}
      py={2}
      borderRadius="md"
      border="1px solid"
      borderColor={accent}
      bg="rgba(0,0,0,0.24)"
      cursor="pointer"
    >
      <Box
        as="select"
        value={Number(season)}
        onChange={(event) => setSeason(Number(event.target.value))}
        w="100%"
        bg="transparent"
        color="white"
        border="0"
        outline="0"
        fontSize="12px"
        fontWeight="black"
        cursor="pointer"
        appearance="none"
        textAlign="center"
        sx={{
          option: {
            background: "#141416",
            color: "#F4F4F5",
          },
        }}
      >
        {seasons.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Box>
      <Text ml={2} fontSize="10px" color="rgba(255,255,255,0.55)" fontWeight="black">
        v
      </Text>
    </Flex>
  </Box>
);
