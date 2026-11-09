import { POSTER_W } from "./PosterChrome";

// PNG helpers shared by the export pages. Posters are fixed-width trees, so the
// capture width is the poster's own width (1100, or 1920 for the 16:9 frame) and any
// page transform is cleared.

// html-to-image paints `backgroundColor` onto the captured node itself, so a
// fixed colour would cover a light poster. Use the node's own background (the
// posters follow the Light / Night switch); fall back to the night page.
export const backgroundOf = (node, fallback = "#0B0B0D") => {
  const bg = node ? window.getComputedStyle(node).backgroundColor : null;
  return bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)" ? bg : fallback;
};

export const toPng = async (node) => {
  const mod = await import("html-to-image");
  return mod.toPng(node, { pixelRatio: 2, backgroundColor: backgroundOf(node), cacheBust: true, width: node?.offsetWidth || POSTER_W, style: { transform: "none" } });
};

export const dataUrlToFile = async (dataUrl, filename) => {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], filename, { type: "image/png" });
};

export const downloadDataUrl = (dataUrl, filename) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
