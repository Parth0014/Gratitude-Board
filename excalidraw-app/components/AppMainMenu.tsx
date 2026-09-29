import { MainMenu } from "@excalidraw/excalidraw/index";
import React from "react";

import type { Theme } from "@excalidraw/element/types";

import { LanguageList } from "../app-language/LanguageList";

export const AppMainMenu: React.FC<{
  theme: Theme | "system";
}> = React.memo((props) => (
  <MainMenu>
    <MainMenu.DefaultItems.LoadScene />
    <MainMenu.DefaultItems.SaveToActiveFile />
    <MainMenu.DefaultItems.SaveAsImage />
    <MainMenu.DefaultItems.SearchMenu />
    <MainMenu.DefaultItems.ClearCanvas />
    <MainMenu.Separator />
    <MainMenu.DefaultItems.ToggleTheme allowSystemTheme theme={props.theme} />
    <MainMenu.ItemCustom>
      <LanguageList style={{ width: "100%" }} />
    </MainMenu.ItemCustom>
  </MainMenu>
));
