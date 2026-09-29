import clsx from "clsx";
import { useState } from "react";
import { KEYS } from "@excalidraw/common";

import { t } from "../i18n";

import { useStylesPanelMode } from "./App";
import { Island } from "./Island";
import Stack from "./Stack";
import DropdownMenu from "./dropdownMenu/DropdownMenu";
import { frameToolIcon, ImageIcon, DotsIcon } from "./icons";
import {
  ArrowToolButton,
  DiamondToolButton,
  EllipseToolButton,
  EraserToolButton,
  FreedrawToolButton,
  HandToolButton,
  isToolButtonDisabled,
  LineToolButton,
  RectangleToolButton,
  SelectionToolButton,
  StickyNoteToolButton,
  TextToolButton,
} from "./Tools";

import type {
  AppClassProperties,
  AppProps,
  AppState,
  UIAppState,
} from "../types";

const ExtraToolsDropdown = ({
  app,
  activeTool,
  setAppState,
  UIOptions,
}: {
  app: AppClassProperties;
  activeTool: UIAppState["activeTool"];
  setAppState: React.Component<any, AppState>["setState"];
  UIOptions: AppProps["UIOptions"];
}) => {
  const [open, setOpen] = useState(false);
  const imageSelected = activeTool.type === "image";
  const frameSelected = activeTool.type === "frame";
  return (
    <DropdownMenu open={open}>
      <DropdownMenu.Trigger
        className={clsx("App-toolbar__extra-tools-trigger", {
          "App-toolbar__extra-tools-trigger--selected":
            imageSelected || frameSelected,
        })}
        onToggle={() => {
          setOpen(!open);
          setAppState({ openMenu: null, openPopup: null });
        }}
        title={t("toolBar.extraTools")}
      >
        {imageSelected ? ImageIcon : frameSelected ? frameToolIcon : DotsIcon}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="App-toolbar__extra-tools-dropdown"
        onClickOutside={() => setOpen(false)}
        onSelect={() => setOpen(false)}
      >
        {UIOptions.tools?.image !== false && (
          <DropdownMenu.Item
            onSelect={() => app.setActiveTool({ type: "image" })}
            icon={ImageIcon}
            shortcut={KEYS["9"]}
            data-testid="toolbar-image"
            selected={imageSelected}
            disabled={isToolButtonDisabled(app, "image")}
          >
            {t("toolBar.image")}
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Item
          onSelect={() => app.setActiveTool({ type: "frame" })}
          icon={frameToolIcon}
          shortcut={KEYS.F.toLocaleUpperCase()}
          data-testid="toolbar-frame"
          selected={frameSelected}
          disabled={isToolButtonDisabled(app, "frame")}
        >
          {t("toolBar.frame")}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const Toolbar = ({
  app,
  appState,
  setAppState,
  UIOptions,
  heading,
}: {
  app: AppClassProperties;
  appState: UIAppState;
  setAppState: React.Component<any, AppState>["setState"];
  UIOptions: AppProps["UIOptions"];
  onPenModeToggle: AppClassProperties["togglePenMode"];
  onLockToggle: () => void;
  heading: React.ReactNode;
}) => {
  const isCompact = useStylesPanelMode() === "compact";
  const toolProps = { app, activeTool: appState.activeTool };
  return (
    <Island
      padding={1}
      className={clsx("App-toolbar", { "App-toolbar--compact": isCompact })}
      data-viewport-ui="top"
    >
      {heading}
      <Stack.Row gap={isCompact ? 0.5 : 1}>
        <HandToolButton {...toolProps} hideKeyBinding />
        <SelectionToolButton {...toolProps} />
        <RectangleToolButton {...toolProps} />
        <DiamondToolButton {...toolProps} />
        <EllipseToolButton {...toolProps} />
        <ArrowToolButton {...toolProps} />
        <LineToolButton {...toolProps} />
        <FreedrawToolButton {...toolProps} />
        <TextToolButton {...toolProps} />
        <StickyNoteToolButton {...toolProps} />
        <EraserToolButton {...toolProps} />
        <ExtraToolsDropdown
          app={app}
          activeTool={appState.activeTool}
          setAppState={setAppState}
          UIOptions={UIOptions}
        />
      </Stack.Row>
    </Island>
  );
};
