import { useEffect, useState } from "react";

/**
 * Image with a graceful fallback: when a remote thumbnail fails to load,
 * render a labelled "preview unavailable" tile instead of a broken image.
 */
export const AssetThumbnail = ({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return (
      <span
        className={`gratitude-asset-card__unavailable${
          className ? ` ${className}` : ""
        }`}
        role="img"
        aria-label={`${title} — preview unavailable`}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="9" cy="10" r="1.6" fill="currentColor" />
          <path
            d="M4 17l5-4 4 3 3-2 4 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <strong>{title}</strong>
        <span>Preview unavailable</span>
      </span>
    );
  }
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
};
