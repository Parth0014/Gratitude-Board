import React from "react";

import type { StudioTab } from "./studioTypes";

const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** Rail tab glyphs (salvaged from the v1 design pass). */
export const TabIcon = ({ tab }: { tab: StudioTab }) => {
  switch (tab) {
    case "templates":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "elements":
      return (
        <svg {...common}>
          <path d="M12 2.5 14.6 9l6.9 3-6.9 3-2.6 6.5L9.4 15l-6.9-3 6.9-3L12 2.5Z" />
        </svg>
      );
    case "text":
      return (
        <svg {...common}>
          <path d="M5 5h14M12 5v14M8 19h8" />
        </svg>
      );
    case "photos":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9" r="1.5" />
          <path d="m4 17 5-5 3 3 3-4 5 6" />
        </svg>
      );
    case "uploads":
      return (
        <svg {...common}>
          <path d="M12 16V3m0 0L7 8m5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
        </svg>
      );
    case "background":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" />
        </svg>
      );
  }
};

export const FitIcon = () => (
  <svg {...common}>
    <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...common}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const PlusIcon = () => (
  <svg {...common}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const DuplicateIcon = () => (
  <svg {...common}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const TrashIcon = () => (
  <svg {...common}>
    <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v6M14 11v6" />
  </svg>
);

export const LayersIcon = () => (
  <svg {...common}>
    <path d="m12 3-9 5 9 5 9-5-9-5Z" />
    <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
  </svg>
);

export const CropIcon = () => (
  <svg {...common}>
    <path d="M6 2v16a2 2 0 0 0 2 2h16M2 6h16a2 2 0 0 1 2 2v16" />
  </svg>
);

export const ShareIcon = () => (
  <svg {...common}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="17" cy="5.5" r="2.5" />
    <circle cx="17" cy="18.5" r="2.5" />
    <path d="m8.2 10.8 6.6-4M8.2 13.2l6.6 4" />
  </svg>
);

export const LogoIcon = () => (
  <svg {...common} strokeWidth={2}>
    <path d="M12 20s-7-4.6-9.3-9.2C1.4 8 3.2 4.9 6.4 4.9c2 0 3.4 1.1 4.3 2.6.3.5 1 .5 1.3 0 .9-1.5 2.3-2.6 4.3-2.6 3.2 0 5 3.1 3.7 5.9C19 15.4 12 20 12 20Z" />
  </svg>
);
