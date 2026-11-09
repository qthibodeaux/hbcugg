import { Text, Box } from "@chakra-ui/react";
import { tfs, TileMobile, Empty, Body, Rotator, Micro, WideRow, WideNum, Hero, hfs } from "./TilePrimitives";
import { useContext, useMemo, useState } from "react";
import { glossaryEntry } from "../../../../pages/analytics/metricGlossary";

const TILE_TERMS = [
  "Expected Points Added",
  "Success Rate",
  "Havoc Rate",
  "OL Line Yards",
  "Highlight Yards",
  "Stuffed Run",
];

const MathLine = ({ children, size }) => (
  <Text fontSize={tfs(size)} fontWeight="bold" color="rgba(255,255,255,0.9)" lineHeight={1.25} textAlign="center">
    {children}
  </Text>
);

const Formula = ({ math }) => {
  if (!math) return null;
  if (math.expr) return <MathLine size={6.4}>{math.expr}</MathLine>;
  return (
    <Box>
      <MathLine size={5.6}>{math.num}</MathLine>
      <Box h="1px" bg="rgba(255,255,255,0.45)" my="1.6cqmin" />
      <MathLine size={5.6}>{math.den}</MathLine>
    </Box>
  );
};

export const GlossaryBody = () => {
  // Two slides per term — the word, then its math. A term with no math on file
  // simply does not get a second slide. Mobile shows the word only.
  const mobile = useContext(TileMobile);
  const slides = useMemo(
    () =>
      TILE_TERMS.map(glossaryEntry)
        .filter(Boolean)
        .flatMap((t) => (t.math && !mobile ? [{ t, math: false }, { t, math: true }] : [{ t, math: false }])),
    [mobile],
  );
  const [i, setI] = useState(0);
  const slide = slides[i % Math.max(1, slides.length)];
  if (!slide) return <Empty>No glossary</Empty>;
  const { t, math } = slide;
  return (
    <Body
      cycle={i}
      live={slides.length > 1}
      top={<Rotator count={slides.length} onTick={() => setI((v) => (v + 1) % slides.length)} />}
      // On a math slide the footer names the term the formula belongs to, so a
      // glance that lands mid-pair is not looking at an orphan fraction.
      tease={
        mobile ? null : math ? (
          <Micro size={2.8} color="rgba(255,255,255,0.6)">{t.term}</Micro>
        ) : (
          <Micro size={2.2}>{t.family}{t.source === "gop" ? " · GOP" : ""}</Micro>
        )
      }
    >
      {mobile ? (
        <WideRow>
          <WideNum size="1.35rem" textTransform="uppercase" whiteSpace="normal" lineClamp={2} letterSpacing="-0.02em" lineHeight={0.95}>{t.term}</WideNum>
        </WideRow>
      ) : math ? (
        <Formula math={t.math} />
      ) : (
        <Hero size={9.6} fontSize={hfs(9.6, true)} fontStyle="italic" textTransform="uppercase" lineClamp={4} lineHeight={0.9}>
          {t.term}
        </Hero>
      )}
    </Body>
  );
};
