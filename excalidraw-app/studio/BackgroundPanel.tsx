import type { BoardTexture } from "../components/BoardSettings";

export interface BackgroundPanelProps {
  boardColor: string;
  onBoardColor: (color: string) => void;
  boardTexture: BoardTexture;
  onBoardTexture: (texture: BoardTexture) => void;
}

const BOARD_COLORS = [
  "#ffffff",
  "#fffaf6",
  "#fdf1f5",
  "#f4f0f7",
  "#eff8f4",
  "#fff8e8",
  "#eef4fb",
  "#f3efe7",
];

const TEXTURES: { id: BoardTexture; label: string }[] = [
  { id: "none", label: "Plain" },
  { id: "paper", label: "Paper" },
  { id: "dots", label: "Dots" },
  { id: "grid", label: "Grid" },
];

/**
 * Module 4 background panel: board color swatches + paper textures, wired to
 * the existing changeBoardColor / changeBoardTexture engine paths.
 */
export const BackgroundPanel = ({
  boardColor,
  onBoardColor,
  boardTexture,
  onBoardTexture,
}: BackgroundPanelProps) => (
  <div className="background-panel">
    <h3 className="background-panel__heading">Board color</h3>
    <ul className="background-panel__swatches">
      {BOARD_COLORS.map((color) => (
        <li key={color}>
          <button
            type="button"
            className={`background-panel__swatch${
              boardColor.toLowerCase() === color ? " is-active" : ""
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Board color ${color}`}
            aria-pressed={boardColor.toLowerCase() === color}
            onClick={() => onBoardColor(color)}
          />
        </li>
      ))}
    </ul>
    <h3 className="background-panel__heading">Texture</h3>
    <ul className="background-panel__textures">
      {TEXTURES.map((texture) => (
        <li key={texture.id}>
          <button
            type="button"
            className={`background-panel__texture${
              boardTexture === texture.id ? " is-active" : ""
            }`}
            aria-pressed={boardTexture === texture.id}
            onClick={() => onBoardTexture(texture.id)}
          >
            <span
              className={`background-panel__texture-demo background-panel__texture-demo--${texture.id}`}
              aria-hidden="true"
            />
            {texture.label}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
