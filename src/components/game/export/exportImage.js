import { POSTER_W } from "./PosterChrome";

// PNG helpers shared by the export pages. Posters are fixed-width trees, so the
// capture width is the poster width and any page transform is cleared.

export const toPng = async (node) => {
  const mod = await import("html-to-image");
  return mod.toPng(node, { pixelRatio: 2, backgroundColor: "#0B0B0D", cacheBust: true, width: POSTER_W, style: { transform: "none" } });
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
