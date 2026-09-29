import { describe, expect, it } from "vitest";

import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";

import { ensureBoardPage } from "./boardPage";
import { inspectBoardScene } from "./sceneGuard";

const appState = (overrides: Partial<AppState> = {}) =>
  ({
    isLoading: false,
    boxSelectionMode: "overlap",
    selectedElementIds: {},
    openDialog: null,
    ...overrides,
  } as AppState);

describe("board scene guard", () => {
  it("creates the required board layers for an empty scene", () => {
    const result = inspectBoardScene({
      elements: [],
      previousElements: [],
      appState: appState(),
      allowBoardLayerReplacement: false,
    });

    expect(result.repair?.type).toBe("create-board-layers");
    if (result.repair?.type === "create-board-layers") {
      expect(result.repair.elements.map((element) => element.type)).toEqual([
        "frame",
        "rectangle",
      ]);
    }
  });

  it("restores a protected board layer deleted by editor input", () => {
    const previous = ensureBoardPage([]);
    const pageOnly = previous.filter(
      (element) => element.customData?.gratitudeBackground !== true,
    );
    const result = inspectBoardScene({
      elements: pageOnly,
      previousElements: previous,
      appState: appState(),
      allowBoardLayerReplacement: false,
    });

    expect(result.repair?.type).toBe("restore-protected-layers");
  });

  it("removes protected layers from mixed user selections", () => {
    const board = ensureBoardPage([]);
    const page = board[0];
    const userElement = {
      id: "photo",
      type: "image",
      frameId: page.id,
      locked: false,
      isDeleted: false,
    } as unknown as ExcalidrawElement;
    const elements = [...board, userElement];
    const result = inspectBoardScene({
      elements,
      previousElements: elements,
      appState: appState({
        selectedElementIds: { [page.id]: true, [userElement.id]: true },
      }),
      allowBoardLayerReplacement: false,
    });

    expect(result.repair).toMatchObject({
      type: "protect-board-layers",
      selectedElementIds: { photo: true },
    });
  });

  it("allows an intentional Board setup replacement", () => {
    const previous = ensureBoardPage([]);
    const result = inspectBoardScene({
      elements: [],
      previousElements: previous,
      appState: appState({ isLoading: true }),
      allowBoardLayerReplacement: true,
    });

    expect(result.repair).toBeNull();
  });
});
