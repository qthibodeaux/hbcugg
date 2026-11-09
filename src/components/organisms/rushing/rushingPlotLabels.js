export const LABEL_SIZE = 15;

export const placeRushingLabels = (pts, { left, right, labelled, labelText }) => {
  const boxes = pts.map((p) => ({ x0: p.cx - p.r, x1: p.cx + p.r, y0: p.cy - p.r, y1: p.cy + p.r }));
  const hit = (b) => boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  const out = {};
  pts.filter(labelled).sort((a, b) => a.cy - b.cy).forEach((p) => {
    const w = String(labelText(p) ?? "").length * LABEL_SIZE * 0.62;
    const h = LABEL_SIZE * 1.15;
    const gap = p.r + 7;
    const tries = [{ side: 1, dy: 0 }, { side: -1, dy: 0 }, { side: 1, dy: h }, { side: -1, dy: h }, { side: 1, dy: -h }, { side: -1, dy: -h }];
    let pick = null;
    for (const t of tries) {
      const x0 = t.side > 0 ? p.cx + gap : p.cx - gap - w;
      const b = { x0, x1: x0 + w, y0: p.cy + t.dy - h / 2, y1: p.cy + t.dy + h / 2 };
      if (b.x0 >= left && b.x1 <= right && !hit(b)) { boxes.push(b); pick = t; break; }
    }
    out[p.key] = pick ?? (p.cx > right - 140 ? { side: -1, dy: 0 } : { side: 1, dy: 0 });
  });
  return out;
};
