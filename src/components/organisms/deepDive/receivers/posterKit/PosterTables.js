import { logoOf } from "../../deepDiveModel";
import { Image, Box, Flex, Text, Grid } from "@chakra-ui/react";
import { fgOf, caps, tab } from "../../gridPosterKit";
import { teamShortName } from "../../../../game/export/exportData";

export const chg = (pal, from, to, fmt) => {
  const up = Number(to) > Number(from), same = Number(to) === Number(from);
  return (
    <>
      <span style={{ color: `rgba(${pal.fg}, 0.5)` }}>{fmt(from)} → </span>
      <span style={{ color: same ? pal.ink : up ? pal.up : pal.down }}>{fmt(to)}</span>
    </>
  );
};

export const Logo = ({ id, size = 32 }) => (logoOf(id) ? <Image src={logoOf(id)} alt="" w={`${size}px`} h={`${size}px`} objectFit="contain" flexShrink={0} /> : <Box w={`${size}px`} h={`${size}px`} flexShrink={0} />);

export const Who = ({ pal, id, name, size = 34, font = "20px" }) => {
  const fg = fgOf(pal);
  return (
    <Flex align="center" gap="10px" minW={0}>
      <Logo id={id} size={size} />
      <Box minW={0}>
        <Text fontSize={font} fontWeight="900" lineHeight={1.05} textTransform="uppercase" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{name ?? teamShortName(id)}</Text>
        {name && id && <Text fontSize="13px" lineHeight={1.15} color={fg(0.55)} whiteSpace="nowrap" {...caps}>{teamShortName(id)}</Text>}
      </Box>
    </Flex>
  );
};

export const Head = ({ pal, children, align = "right" }) => <Text fontSize="14px" color={fgOf(pal)(0.5)} textAlign={align} whiteSpace="nowrap" {...caps}>{children}</Text>;

export const Board = ({ pal, rows, get, fmt, label, extras = [], name = (r) => r.name, rowH = 52 }) => {
  const fg = fgOf(pal);
  const max = Math.max(...rows.map((r) => Math.abs(get(r))), 0.0001);
  const cols = `44px 330px minmax(0,1fr) 100px ${extras.map((e) => `${e.w ?? 84}px`).join(" ")}`;
  return (
    <Box>
      <Grid templateColumns={cols} columnGap="14px" pb="8px" borderBottom={`1px solid ${fg(0.12)}`}>
        <Box /><Box /><Box />
        <Head pal={pal}>{label}</Head>
        {extras.map((e) => <Head key={e.label} pal={pal}>{e.label}</Head>)}
      </Grid>
      {rows.map((r, i) => (
        <Grid key={i} templateColumns={cols} columnGap="14px" alignItems="center" h={`${rowH}px`} borderBottom={`1px solid ${fg(0.06)}`}>
          <Text fontSize="20px" fontWeight="900" color={fg(0.45)} {...tab}>{i + 1}</Text>
          <Who pal={pal} id={r.id} name={name(r)} />
          <Box h="16px" bg={fg(0.06)}><Box h="100%" bg={pal.brand} style={{ width: `${(Math.abs(get(r)) / max) * 100}%` }} /></Box>
          <Text fontSize="24px" fontWeight="950" textAlign="right" color={pal.orange} {...tab}>{fmt(get(r))}</Text>
          {extras.map((e) => <Text key={e.label} fontSize="19px" fontWeight="800" textAlign="right" {...tab}>{e.get(r)}</Text>)}
        </Grid>
      ))}
    </Box>
  );
};

export const Table = ({ pal, title, rows, cols, name = (r) => r.name, whoW = "minmax(0,1fr)", rowH = 46, who = (r) => <Who pal={pal} id={r.id} name={name(r)} size={28} font="17px" /> }) => {
  const fg = fgOf(pal);
  const template = `${whoW} ${cols.map((c) => `${c.w ?? 62}px`).join(" ")}`;
  return (
    <Box minW={0}>
      {title && <Text fontSize="20px" color={pal.orange} mb="8px" {...caps}>{title}</Text>}
      <Grid templateColumns={template} columnGap="10px" pb="6px" borderBottom={`1px solid ${fg(0.12)}`}>
        <Box />
        {cols.map((c) => <Head key={c.label} pal={pal}>{c.label}</Head>)}
      </Grid>
      {rows.map((r, i) => (
        <Grid key={i} templateColumns={template} columnGap="10px" alignItems="center" minH={`${rowH}px`} borderBottom={`1px solid ${fg(0.06)}`}>
          {who(r)}
          {cols.map((c) => (
            <Text key={c.label} fontSize={c.strong ? "21px" : "17px"} fontWeight={c.strong ? "950" : "800"} color={c.strong ? pal.orange : undefined} textAlign="right" whiteSpace="nowrap" {...tab}>{c.get(r)}</Text>
          ))}
        </Grid>
      ))}
    </Box>
  );
};
