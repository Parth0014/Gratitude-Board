import "./ExcalidrawLogo.scss";

type LogoSize = "xs" | "small" | "normal" | "large" | "custom" | "mobile";

interface LogoProps {
  size?: LogoSize;
  withText?: boolean;
  style?: React.CSSProperties;
  isNotLink?: boolean;
}

// Keep the exported component name for package compatibility while displaying
// the product brand in every editor-owned welcome surface.
export const ExcalidrawLogo = ({
  style,
  size = "small",
  withText,
}: LogoProps) => (
  <div className={`ExcalidrawLogo is-${size}`} style={style}>
    <span className="ExcalidrawLogo-icon" aria-hidden="true">
      ♥
    </span>
    {withText && <span className="ExcalidrawLogo-text">Gratitude Studio</span>}
  </div>
);
