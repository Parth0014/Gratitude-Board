import { useState, useEffect } from "react";
import clsx from "clsx";

import { KEYS, capitalizeString } from "@excalidraw/common";

import { t } from "../i18n";

import DropdownMenu from "./dropdownMenu/DropdownMenu";
import { ToolPopover } from "./ToolPopover";
import {
  EraserToolButton,
  FrameToolButton,
  FreedrawToolButton,
  HandToolButton,
  ImageToolButton,
  isToolButtonDisabled,
  SelectionToolButton,
  TextToolButton,
  TOOLS,
} from "./Tools";

import {
  TextIcon,
  ImageIcon,
  DotsIcon,
  frameToolIcon,
  stickyNoteToolIcon,
} from "./icons";

import "./ToolIcon.scss";
import "./MobileToolbar.scss";

import type { AppClassProperties, UIAppState } from "../types";

type MobileToolbarProps = {
  app: AppClassProperties;
  setAppState: React.Component<any, UIAppState>["setState"];
};

export const MobileToolbar = ({ app, setAppState }: MobileToolbarProps) => {
  const activeTool = app.state.activeTool;
  const [isOtherShapesMenuOpen, setIsOtherShapesMenuOpen] = useState(false);
  const [lastActiveGenericShape, setLastActiveGenericShape] = useState<
    "rectangle" | "diamond" | "ellipse"
  >("rectangle");
  const [lastActiveLinearElement, setLastActiveLinearElement] = useState<
    "arrow" | "line"
  >("arrow");

  // keep lastActiveGenericShape in sync with active tool if user switches via other UI
  useEffect(() => {
    if (
      activeTool.type === "rectangle" ||
      activeTool.type === "diamond" ||
      activeTool.type === "ellipse"
    ) {
      setLastActiveGenericShape(activeTool.type);
    }
  }, [activeTool.type]);

  // keep lastActiveLinearElement in sync with active tool if user switches via other UI
  useEffect(() => {
    if (activeTool.type === "arrow" || activeTool.type === "line") {
      setLastActiveLinearElement(activeTool.type);
    }
  }, [activeTool.type]);

  const frameToolSelected = activeTool.type === "frame";
  const stickyNoteToolSelected = activeTool.type === "stickynote";

  const SHAPE_TOOLS = (["rectangle", "diamond", "ellipse"] as const).map(
    (type) => ({
      type,
      icon: TOOLS[type].icon,
      title: capitalizeString(t(`toolBar.${type}`)),
      fillable: TOOLS[type].fillable,
    }),
  );

  const LINEAR_ELEMENT_TOOLS = (["arrow", "line"] as const).map((type) => ({
    type,
    icon: TOOLS[type].icon,
    title: capitalizeString(t(`toolBar.${type}`)),
    fillable: TOOLS[type].fillable,
  }));

  const [toolbarWidth, setToolbarWidth] = useState(0);

  const WIDTH = 36;
  const GAP = 4;

  // hand, selection, freedraw, eraser, rectangle, arrow, others
  const MIN_TOOLS = 7;
  const MIN_WIDTH = MIN_TOOLS * WIDTH + (MIN_TOOLS - 1) * GAP;
  const ADDITIONAL_WIDTH = WIDTH + GAP;

  const showTextToolOutside = toolbarWidth >= MIN_WIDTH + 1 * ADDITIONAL_WIDTH;
  const showImageToolOutside = toolbarWidth >= MIN_WIDTH + 2 * ADDITIONAL_WIDTH;
  const showFrameToolOutside = toolbarWidth >= MIN_WIDTH + 3 * ADDITIONAL_WIDTH;

  const extraTools: readonly typeof activeTool.type[] = (
    ["text", "stickynote", "frame"] as const
  ).filter((tool) => {
    if (showTextToolOutside && tool === "text") {
      return false;
    }
    if (showFrameToolOutside && tool === "frame") {
      return false;
    }
    return true;
  });
  const extraToolSelected = extraTools.includes(activeTool.type);
  const extraIcon = extraToolSelected
    ? activeTool.type === "text"
      ? TextIcon
      : activeTool.type === "image"
      ? ImageIcon
      : activeTool.type === "frame"
      ? frameToolIcon
      : activeTool.type === "stickynote"
      ? stickyNoteToolIcon
      : DotsIcon
    : DotsIcon;

  const toolProps = { app, activeTool };

  return (
    <div
      className="mobile-toolbar"
      ref={(div) => {
        if (div) {
          setToolbarWidth(div.getBoundingClientRect().width);
        }
      }}
    >
      {/* Hand Tool */}
      <HandToolButton {...toolProps} hideKeyBinding />

      {/* Selection Tool */}
      <SelectionToolButton {...toolProps} hideKeyBinding />

      {/* Free Draw */}
      <FreedrawToolButton {...toolProps} hideKeyBinding />

      {/* Eraser */}
      <EraserToolButton {...toolProps} hideShortcut />

      {/* Rectangle/Diamond/Ellipse */}
      <ToolPopover
        app={app}
        options={SHAPE_TOOLS}
        activeTool={activeTool}
        defaultOption={lastActiveGenericShape}
        data-testid="toolbar-rectangle"
        onToolChange={(type: string) => {
          if (
            type === "rectangle" ||
            type === "diamond" ||
            type === "ellipse"
          ) {
            setLastActiveGenericShape(type);
            app.setActiveTool({ type });
          }
        }}
        displayedOption={
          SHAPE_TOOLS.find((tool) => tool.type === lastActiveGenericShape) ||
          SHAPE_TOOLS[0]
        }
      />

      {/* Arrow/Line */}
      <ToolPopover
        app={app}
        options={LINEAR_ELEMENT_TOOLS}
        activeTool={activeTool}
        defaultOption={lastActiveLinearElement}
        data-testid="toolbar-arrow"
        onToolChange={(type: string) => {
          if (type === "arrow" || type === "line") {
            setLastActiveLinearElement(type);
            app.setActiveTool({ type });
          }
        }}
        displayedOption={
          LINEAR_ELEMENT_TOOLS.find(
            (tool) => tool.type === lastActiveLinearElement,
          ) || LINEAR_ELEMENT_TOOLS[0]
        }
      />

      {/* Text Tool */}
      {showTextToolOutside && <TextToolButton {...toolProps} hideShortcut />}

      {/* Image */}
      {showImageToolOutside && <ImageToolButton {...toolProps} hideShortcut />}

      {/* Frame Tool */}
      {showFrameToolOutside && <FrameToolButton {...toolProps} hideShortcut />}

      {/* Other Shapes */}
      <DropdownMenu open={isOtherShapesMenuOpen}>
        <DropdownMenu.Trigger
          className={clsx(
            "App-toolbar__extra-tools-trigger App-toolbar__extra-tools-trigger--mobile",
            {
              "App-toolbar__extra-tools-trigger--selected":
                extraToolSelected || isOtherShapesMenuOpen,
            },
          )}
          onToggle={() => {
            setIsOtherShapesMenuOpen(!isOtherShapesMenuOpen);
            setAppState({ openMenu: null, openPopup: null });
          }}
          title={t("toolBar.extraTools")}
          style={{
            width: WIDTH,
            height: WIDTH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {extraIcon}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          onClickOutside={() => setIsOtherShapesMenuOpen(false)}
          onSelect={() => setIsOtherShapesMenuOpen(false)}
          className="App-toolbar__extra-tools-dropdown"
          align="start"
        >
          {!showTextToolOutside && (
            <DropdownMenu.Item
              onSelect={() => app.setActiveTool({ type: "text" })}
              icon={TextIcon}
              shortcut={KEYS.T.toLocaleUpperCase()}
              data-testid="toolbar-text"
              selected={activeTool.type === "text"}
              disabled={isToolButtonDisabled(app, "text")}
            >
              {t("toolBar.text")}
            </DropdownMenu.Item>
          )}

          {!showImageToolOutside && (
            <DropdownMenu.Item
              onSelect={() => app.setActiveTool({ type: "image" })}
              icon={ImageIcon}
              data-testid="toolbar-image"
              selected={activeTool.type === "image"}
              disabled={isToolButtonDisabled(app, "image")}
            >
              {t("toolBar.image")}
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            onSelect={() => app.setActiveTool({ type: "stickynote" })}
            icon={stickyNoteToolIcon}
            shortcut={KEYS.N.toLocaleUpperCase()}
            data-testid="toolbar-stickynote"
            selected={stickyNoteToolSelected}
            disabled={isToolButtonDisabled(app, "stickynote")}
          >
            {t("toolBar.stickynote")}
          </DropdownMenu.Item>

          {!showFrameToolOutside && (
            <DropdownMenu.Item
              onSelect={() => app.setActiveTool({ type: "frame" })}
              icon={frameToolIcon}
              shortcut={KEYS.F.toLocaleUpperCase()}
              data-testid="toolbar-frame"
              selected={frameToolSelected}
              disabled={isToolButtonDisabled(app, "frame")}
            >
              {t("toolBar.frame")}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};
