import { newElementWith } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";

import {
  ensureBoardPage,
  getBoardBackground,
  getBoardBackgroundImage,
  getBoardPage,
  getBoardTextureImage,
} from "./boardPage";

export type BoardSceneRepair =
  | { type: "set-overlap-selection" }
  | { type: "restore-protected-layers"; elements: ExcalidrawElement[] }
  | { type: "create-board-layers"; elements: ExcalidrawElement[] }
  | {
      type: "protect-board-layers";
      elements: ExcalidrawElement[];
      selectedElementIds?: AppState["selectedElementIds"];
    };

export type BoardSceneInspection = {
  page: ExcalidrawElement | undefined;
  background: ExcalidrawElement | undefined;
  protectedIds: ReadonlySet<string>;
  repair: BoardSceneRepair | null;
};

const getProtectedIds = (elements: readonly ExcalidrawElement[]) => {
  const page = getBoardPage(elements);
  return new Set(
    [
      page?.id,
      getBoardBackground(elements)?.id,
      getBoardBackgroundImage(elements)?.id,
      getBoardTextureImage(elements)?.id,
    ].filter((id): id is string => Boolean(id)),
  );
};

/**
 * Keeps the product board invariant separate from React and the editor host.
 * The host applies at most one returned repair per editor change.
 */
export const inspectBoardScene = ({
  elements,
  appState,
  previousElements,
  allowBoardLayerReplacement,
}: {
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  previousElements: readonly ExcalidrawElement[];
  allowBoardLayerReplacement: boolean;
}): BoardSceneInspection => {
  const page = getBoardPage(elements);
  const background = getBoardBackground(elements);
  const protectedIds = getProtectedIds(elements);

  if (!appState.isLoading && appState.boxSelectionMode !== "overlap") {
    return {
      page,
      background,
      protectedIds,
      repair: { type: "set-overlap-selection" },
    };
  }

  const previousPage = getBoardPage(previousElements);
  if (previousPage && !allowBoardLayerReplacement) {
    // Optional photo/texture layers may legitimately disappear during undo.
    // Only the permanent page and base background must be restored.
    const previousProtectedIds = new Set(
      [previousPage.id, getBoardBackground(previousElements)?.id].filter(
        (id): id is string => Boolean(id),
      ),
    );
    const deletedProtectedLayer = [...previousProtectedIds].some(
      (id) =>
        !elements.some((element) => element.id === id && !element.isDeleted),
    );
    if (deletedProtectedLayer) {
      const currentById = new Map(
        elements.map((element) => [element.id, element]),
      );
      const previousIds = new Set(
        previousElements.map((element) => element.id),
      );
      const restoredElements = previousElements.flatMap((element) => {
        if (previousProtectedIds.has(element.id)) {
          return [
            element.locked
              ? element
              : newElementWith(element, { locked: true }),
          ];
        }
        const current = currentById.get(element.id);
        return current ? [current] : [];
      });
      restoredElements.push(
        ...elements.filter((element) => !previousIds.has(element.id)),
      );
      return {
        page,
        background,
        protectedIds,
        repair: {
          type: "restore-protected-layers",
          elements: restoredElements,
        },
      };
    }
  }

  if (!appState.isLoading && (!page || !background)) {
    return {
      page,
      background,
      protectedIds,
      repair: {
        type: "create-board-layers",
        elements: ensureBoardPage(elements),
      },
    };
  }

  const unlockedLayer = elements.some(
    (element) => protectedIds.has(element.id) && !element.locked,
  );
  const selectedLayer =
    appState.openDialog?.name !== "imageExport" &&
    [...protectedIds].some((id) => appState.selectedElementIds[id]);

  if (unlockedLayer || selectedLayer) {
    return {
      page,
      background,
      protectedIds,
      repair: {
        type: "protect-board-layers",
        elements: unlockedLayer
          ? elements.map((element) => {
              if (!protectedIds.has(element.id) || element.locked) {
                return element;
              }
              return (
                previousElements.find(
                  (candidate) =>
                    candidate.id === element.id && candidate.locked,
                ) || newElementWith(element, { locked: true })
              );
            })
          : [...elements],
        selectedElementIds: selectedLayer
          ? Object.fromEntries(
              Object.entries(appState.selectedElementIds).filter(
                ([id]) => !protectedIds.has(id),
              ),
            )
          : undefined,
      },
    };
  }

  return { page, background, protectedIds, repair: null };
};
