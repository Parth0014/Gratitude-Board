import type { SVGProps } from "react";

// A single 24px grid and stroke weight across the studio and editor controls.
const paths = {
  design: "M4 4h7v16H4z M15 4h5v6h-5z M15 14h5v6h-5z",
  elements:
    "M7 3l4 7H3z M15 4h6v6h-6z M4 16a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M16 14h5v7h-5z",
  text: "M4 6V4h16v2 M12 4v16 M8 20h8",
  image: "M4 3h16v18H4z M4 16l5-5 4 4 3-3 4 4 M15 7h.01",
  upload: "M12 16V3 M7 8l5-5 5 5 M4 16v5h16v-5",
  folder: "M3 7V4h6l3 3h9v13H3z",
  tools: "M4 20l1-5L16 4a2.8 2.8 0 0 1 4 4L9 19z M14 6l4 4 M5 15l4 4",
  selection: "M5 3l14 10-7 1-3 7z",
  hand: "M8 12V6a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v7-5a2 2 0 0 1 4 0v9c0 4-3 6-6 6h-2c-2 0-3-1-4-3l-4-5c-1-2 1-4 3-2l1 1",
  rectangle: "M4 4h16v16H4z",
  diamond: "M12 3l9 9-9 9-9-9z",
  ellipse: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0",
  arrow: "M4 20L20 4 M9 4h11v11",
  line: "M4 20L20 4",
  draw: "M3 17c8-19 12-13 5-5s-3 12 5 3 8-1 7 3",
  note: "M4 3h16v12l-6 6H4z M14 21v-6h6 M8 8h8 M8 12h5",
  eraser: "M3 14l10-11 8 8-10 10H9z M8 9l8 8 M11 21h10",
  frame: "M6 2v20 M18 2v20 M2 6h20 M2 18h20",
  embed: "M8 7l-5 5 5 5 M16 7l5 5-5 5 M14 4l-4 16",
  sparkle: "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  laser: "M4 20l10-10 M13 3v3 M18 6l3-3 M18 11h3 M17 15l3 3",
  fill: "M8 3l11 11-8 8L1 12l8-8 M4 15h14 M21 14s-4 4-1 6 4-1 1-6",
  lasso: "M6 17c-8-5-2-14 7-14 12 0 12 14 0 14H8 M8 14c-5 0-6 7-2 7s4-7 2-7",
  undo: "M4 9h10a6 6 0 0 1 0 12 M4 9l5-5 M4 9l5 5",
  redo: "M20 9H10a6 6 0 0 0 0 12 M20 9l-5-5 M20 9l-5 5",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  close: "M6 6l12 12 M18 6L6 18",
  search: "M10 3a7 7 0 1 0 0 14a7 7 0 1 0 0-14 M15 15l6 6",
  settings: "M3 6h18 M3 12h18 M3 18h18 M8 3v6 M16 9v6 M10 15v6",
  chevron: "M9 5l7 7-7 7",
  down: "M5 9l7 7 7-7",
  download: "M12 3v12 M7 10l5 5 5-5 M4 17v4h16v-4",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  more: "M5 12h.01 M12 12h.01 M19 12h.01",
  help: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M9 9a3 3 0 1 1 5 2c-2 1-2 1-2 3 M12 17h.01",
  fit: "M9 3H3v6 M15 3h6v6 M3 15v6h6 M21 15v6h-6",
  lock: "M7 10V7a5 5 0 0 1 10 0v3 M5 10h14v11H5z M12 14v3",
  unlock: "M7 10V7a5 5 0 0 1 9-3 M5 10h14v11H5z M12 14v3",
  copy: "M8 8h13v13H8z M16 8V3H3v13h5",
  trash: "M4 6h16 M9 3h6 M6 6l1 15h10l1-15 M10 10v7 M14 10v7",
  heart: "M12 21C8 17 2 13 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 5-6 9-10 13z",
  palette:
    "M12 3a9 9 0 1 0 0 18c3 0-1-5 3-5h2c6 0 5-13-5-13 M7 8h.01 M12 6h.01 M17 9h.01 M6 13h.01",
  check: "M4 12l5 5L20 6",
  layerUp: "M4 15l8 5 8-5 M4 11l8 5 8-5 M8 6l4-4 4 4 M12 2v9",
  layerDown: "M4 9l8-5 8 5 M4 13l8-5 8 5 M8 18l4 4 4-4 M12 22V11",
  file: "M4 3h10l6 6v12H4z M14 3v6h6 M8 13h8 M8 17h5",
} as const;

export type StudioIconName = keyof typeof paths;

export const StudioIcon = ({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: StudioIconName }) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.65"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d={paths[name]} />
  </svg>
);
