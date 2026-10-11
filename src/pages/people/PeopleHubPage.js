import { useMemo } from "react";
import { Box, Flex } from "@chakra-ui/react";
import PageShell from "../../components/layouts/PageShell";
import { BannerPeopleHub } from "../../components/organisms/test/BannerPages";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { usePeopleHubCards } from "../../hooks/useSWACData";
import { buildDeck, HeroCarousel } from "../../components/organisms/people/PeopleHubCardDeck";

// Matches PageShell's own row unit — mobile has no grid to inherit sizing
// from, so each stacked card needs its height spelled out explicitly (same
// fix as every other mobile branch that stacks PageShell-shaped cards).
const ROW_UNIT = "clamp(160px, 20vw, 260px)";
const rowUnitHeight = (rows = 1) => (rows === 1 ? ROW_UNIT : `calc(${rows} * ${ROW_UNIT} + ${(rows - 1) * 0.25}rem)`);

const PeopleHubMobile = ({ heroes, deck }) => (
  <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
    <BannerPeopleHub />
    <Flex direction="column" gap="0.75rem" p="0.75rem">
      {heroes.length > 0 && (
        <Box h={rowUnitHeight(2)}>
          <HeroCarousel cards={heroes} />
        </Box>
      )}
      {deck.map(({ card, rows, Component }) => (
        <Box key={card.card_id} h={rowUnitHeight(rows)}>
          <Component card={card} />
        </Box>
      ))}
    </Flex>
  </Box>
);

const PeopleHubPage = () => {
  const { isMobile } = useLayoutDensity();
  const { cards: peopleHubCards } = usePeopleHubCards(2025);
  const { heroes, deck } = useMemo(() => buildDeck(peopleHubCards ?? []), [peopleHubCards]);

  if (isMobile) {
    return <PeopleHubMobile heroes={heroes} deck={deck} />;
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <BannerPeopleHub />
      </PageShell.Slot>

      {heroes.length > 0 && (
        <PageShell.Slot cols={4} rows={2}>
          <HeroCarousel cards={heroes} />
        </PageShell.Slot>
      )}

      {deck.map(({ card, cols, rows, Component }) => (
        <PageShell.Slot key={card.card_id} cols={cols} rows={rows}>
          <Component card={card} />
        </PageShell.Slot>
      ))}
    </PageShell>
  );
};

export default PeopleHubPage;
