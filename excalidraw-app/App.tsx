import {
  Excalidraw,
  CaptureUpdateAction,
  reconcileElements,
  ExcalidrawAPIProvider,
  useExcalidrawAPI,
} from "@excalidraw/excalidraw";
import { ErrorDialog } from "@excalidraw/excalidraw/components/ErrorDialog";
import { OverwriteConfirmDialog } from "@excalidraw/excalidraw/components/OverwriteConfirm/OverwriteConfirm";
import { openConfirmModal } from "@excalidraw/excalidraw/components/OverwriteConfirm/OverwriteConfirmState";
import Trans from "@excalidraw/excalidraw/components/Trans";
import {
  APP_NAME,
  EVENT,
  debounce,
  isTestEnv,
  preventUnload,
  resolvablePromise,
  isDevEnv,
} from "@excalidraw/common";
import polyfill from "@excalidraw/excalidraw/polyfill";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadFromBlob } from "@excalidraw/excalidraw/data/blob";
import { t } from "@excalidraw/excalidraw/i18n";

import { isElementLink } from "@excalidraw/element";
import {
  bumpElementVersions,
  restoreAppState,
  restoreElements,
} from "@excalidraw/excalidraw/data/restore";
import {
  getCommonBounds,
  collectReferencedFileIds,
  newElementWith,
} from "@excalidraw/element";
import clsx from "clsx";
import {
  parseLibraryTokensFromUrl,
  useHandleLibrary,
} from "@excalidraw/excalidraw/data/library";

import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile";
import type { RestoredDataState } from "@excalidraw/excalidraw/data/restore";
import type {
  FileId,
  ExcalidrawElement,
  OrderedExcalidrawElement,
} from "@excalidraw/element/types";
import type {
  AppState,
  ExcalidrawImperativeAPI,
  BinaryFiles,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";
import type { ResolutionType } from "@excalidraw/common/utility-types";
import type { ResolvablePromise } from "@excalidraw/common/utils";
import type { Radians } from "@excalidraw/math";

import {
  Provider,
  useAtom,
  useAtomValue,
  useAtomWithInitialValue,
  appJotaiStore,
} from "./app-jotai";
import {
  FIREBASE_STORAGE_PREFIXES,
  STORAGE_KEYS,
  SYNC_BROWSER_TABS_TIMEOUT,
} from "./app_constants";
import {
  collabAPIAtom,
  isCollaboratingAtom,
  isOfflineAtom,
  userToFollowAtom,
} from "./collab/Collab";
import { AppFooter } from "./components/AppFooter";
import { TopErrorBoundary } from "./components/TopErrorBoundary";

import {
  getCollaborationLinkData,
  importFromBackend,
  isCollaborationLink,
} from "./data";

import { updateStaleImageStatuses } from "./data/FileManager";
import { FileStatusStore } from "./data/fileStatusStore";
import {
  importFromLocalStorage,
  importUsernameFromLocalStorage,
} from "./data/localStorage";

import { loadFilesFromFirebase } from "./data/firebase";
import {
  LibraryIndexedDBAdapter,
  LibraryLocalStorageMigrationAdapter,
  LocalData,
  localStorageQuotaExceededAtom,
} from "./data/LocalData";
import { isBrowserStorageStateNewer } from "./data/tabSync";
import { useHandleAppTheme } from "./useHandleAppTheme";
import { getPreferredLanguage } from "./app-language/language-detector";
import { useAppLangCode } from "./app-language/language-state";
import DebugCanvas, {
  debugRenderer,
  isVisualDebuggerEnabled,
  loadSavedDebugState,
} from "./components/DebugCanvas";

import "./index.scss";

import "./studio/studio.scss";

import { StudioShell } from "./studio/StudioShell";
import { SelectionPill } from "./studio/SelectionPill";

import { BoardSettings } from "./components/BoardSettings";
import { fetchAsset, resolveAsset } from "./assets/registry";
import {
  GRATITUDE_ASSET_DRAG_TYPE,
  isGratitudeAsset,
} from "./assets/contracts";
import { svgToPng } from "./assets/sanitizeSvg";
import { createCanvasAdapter } from "./vision/canvasAdapter";
import { EMPTY_VISION_SELECTION } from "./vision/contracts";
import { VisionDocumentRepository } from "./vision/repository";
import { getLayoutSlotBounds, VISION_LAYOUTS } from "./vision/layouts";
import type { VisionTemplate } from "./vision/templates";
import { openverseProvider } from "./assets/providers/openverse";
import { LEGACY_VISION_TEMPLATE_STYLES } from "./vision/templates";

import {
  ensureBoardPage,
  getBoardBackground,
  getBoardBackgroundImage,
  getBoardPage,
  getBoardTextureImage,
  PAGE_WIDTH,
  PAGE_HEIGHT,
} from "./vision/engine/boardPage";
import { inspectBoardScene } from "./vision/engine/sceneGuard";
import { createBackgroundImageUpdater } from "./vision/engine/backgroundImage";

import type { VisionSelection, VisionTextPreset } from "./vision/contracts";

import type { BoardTexture } from "./components/BoardSettings";
import type { GratitudeAsset } from "./assets/contracts";

import type { CollabAPI } from "./collab/Collab";

polyfill();

window.EXCALIDRAW_THROTTLE_RENDER = true;

let isSelfEmbedding = false;

if (window.self !== window.top) {
  try {
    const parentUrl = new URL(document.referrer);
    const currentUrl = new URL(window.location.href);
    if (parentUrl.origin === currentUrl.origin) {
      isSelfEmbedding = true;
    }
  } catch (error) {
    // ignore
  }
}

const shareableLinkConfirmDialog = {
  title: t("overwriteConfirm.modal.shareableLink.title"),
  description: (
    <Trans
      i18nKey="overwriteConfirm.modal.shareableLink.description"
      bold={(text) => <strong>{text}</strong>}
      br={() => <br />}
    />
  ),
  actionLabel: t("overwriteConfirm.modal.shareableLink.button"),
  color: "danger",
} as const;

const initializeScene = async (opts: {
  collabAPI: CollabAPI | null;
  excalidrawAPI: ExcalidrawImperativeAPI;
}): Promise<
  { scene: ExcalidrawInitialDataState | null } & (
    | { isExternalScene: true; id: string; key: string }
    | { isExternalScene: false; id?: null; key?: null }
  )
> => {
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");
  const jsonBackendMatch = window.location.hash.match(
    /^#json=([a-zA-Z0-9_-]+),([a-zA-Z0-9_-]+)$/,
  );
  const externalUrlMatch = window.location.hash.match(/^#url=(.*)$/);

  const localDataState = importFromLocalStorage();

  let scene: Omit<
    RestoredDataState,
    // we're not storing files in the scene database/localStorage, and instead
    // fetch them async from a different store
    "files"
  > & {
    scrollToContent?: boolean;
  } = {
    elements: restoreElements(localDataState?.elements, null, {
      repairBindings: true,
      deleteInvisibleElements: true,
    }),
    appState: restoreAppState(
      localDataState?.appState || { viewBackgroundColor: "transparent" },
      null,
    ),
  };

  let roomLinkData = getCollaborationLinkData(window.location.href);
  const isExternalScene = !!(id || jsonBackendMatch || roomLinkData);
  if (isExternalScene) {
    if (
      // don't prompt if scene is empty
      !scene.elements.length ||
      // don't prompt for collab scenes because we don't override local storage
      roomLinkData ||
      // otherwise, prompt whether user wants to override current scene
      (await openConfirmModal(shareableLinkConfirmDialog))
    ) {
      if (jsonBackendMatch) {
        const imported = await importFromBackend(
          jsonBackendMatch[1],
          jsonBackendMatch[2],
        );

        scene = {
          elements: bumpElementVersions(
            restoreElements(imported.elements, null, {
              repairBindings: true,
              deleteInvisibleElements: true,
            }),
            localDataState?.elements,
          ),
          appState: restoreAppState(
            imported.appState,
            // local appState when importing from backend to ensure we restore
            // localStorage user settings which we do not persist on server.
            localDataState?.appState,
          ),
        };
      }
      scene.scrollToContent = true;
      if (!roomLinkData) {
        window.history.replaceState({}, APP_NAME, window.location.origin);
      }
    } else {
      // https://github.com/excalidraw/excalidraw/issues/1919
      if (document.hidden) {
        return new Promise((resolve, reject) => {
          window.addEventListener(
            "focus",
            () => initializeScene(opts).then(resolve).catch(reject),
            {
              once: true,
            },
          );
        });
      }

      roomLinkData = null;
      window.history.replaceState({}, APP_NAME, window.location.origin);
    }
  } else if (externalUrlMatch) {
    window.history.replaceState({}, APP_NAME, window.location.origin);

    const url = externalUrlMatch[1];
    try {
      const request = await fetch(window.decodeURIComponent(url));
      const data = await loadFromBlob(await request.blob(), null, null);
      if (
        !scene.elements.length ||
        (await openConfirmModal(shareableLinkConfirmDialog))
      ) {
        return { scene: data, isExternalScene };
      }
    } catch (error: any) {
      return {
        scene: {
          appState: {
            errorMessage: t("alerts.invalidSceneUrl"),
          },
        },
        isExternalScene,
      };
    }
  }

  if (roomLinkData && opts.collabAPI) {
    const { excalidrawAPI } = opts;

    const scene = await opts.collabAPI.startCollaboration(roomLinkData);

    return {
      // when collaborating, the state may have already been updated at this
      // point (we may have received updates from other clients), so reconcile
      // elements and appState with existing state
      scene: {
        ...scene,
        appState: {
          ...restoreAppState(
            {
              ...scene?.appState,
              theme: localDataState?.appState?.theme || scene?.appState?.theme,
            },
            excalidrawAPI.getAppState(),
          ),
          // necessary if we're invoking from a hashchange handler which doesn't
          // go through App.initializeScene() that resets this flag
          isLoading: false,
        },
        elements: reconcileElements(
          scene?.elements || [],
          excalidrawAPI.getSceneElementsIncludingDeleted() as RemoteExcalidrawElement[],
          excalidrawAPI.getAppState(),
        ),
      },
      isExternalScene: true,
      id: roomLinkData.roomId,
      key: roomLinkData.roomKey,
    };
  } else if (scene) {
    return isExternalScene && jsonBackendMatch
      ? {
          scene,
          isExternalScene,
          id: jsonBackendMatch[1],
          key: jsonBackendMatch[2],
        }
      : { scene, isExternalScene: false };
  }
  return { scene: null, isExternalScene: false };
};

const ExcalidrawWrapper = () => {
  const excalidrawAPI = useExcalidrawAPI();
  const [boardSettingsOpen, setBoardSettingsOpen] = useState(false);
  const [keepInsideBoard, setKeepInsideBoard] = useState(true);
  const [boardTitle, setBoardTitle] = useState("My vision board");
  const [boardState, setBoardState] = useState({
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: "#ffffff",
    texture: "none" as BoardTexture,
    hasImage: false,
  });
  const [visionSelection, setVisionSelection] = useState<VisionSelection>(
    EMPTY_VISION_SELECTION,
  );
  const [hasBoardContent, setHasBoardContent] = useState(false);
  const editorRootRef = useRef<HTMLDivElement>(null);
  const hasFittedPageRef = useRef(false);
  const lastGoodBoardSceneRef = useRef<readonly OrderedExcalidrawElement[]>([]);
  const sceneRepairAttemptsRef = useRef(0);
  const canvasAdapter = useMemo(
    () => (excalidrawAPI ? createCanvasAdapter(excalidrawAPI) : null),
    [excalidrawAPI],
  );
  const updateBackgroundImage = useMemo(
    () => excalidrawAPI ? createBackgroundImageUpdater(excalidrawAPI) : null,
    [excalidrawAPI],
  );
  const fitBoardPage = useCallback(() => {
    canvasAdapter?.fitBoard();
  }, [canvasAdapter]);

  const newBoard = useCallback(() => {
    canvasAdapter?.clearBoard();
  }, [canvasAdapter]);

  const applyTemplate = useCallback(
    (template: VisionTemplate) => {
      canvasAdapter?.applyTemplate(template);
    },
    [canvasAdapter],
  );

  // Asset browser: insertion resolves the asset's own provider from the
  // registry, so every category (stickers, doodles, frames, patterns,
  // photos) inserts through the same path.

  const getOwnerWindow = useCallback(
    () =>
      editorRootRef.current?.ownerDocument.defaultView as
        | (Window & typeof globalThis)
        | null
        | undefined,
    [],
  );

  const insertAsset = useCallback(
    async (asset: GratitudeAsset) => {
      const ownerWindow = getOwnerWindow();
      const ownerDocument = editorRootRef.current?.ownerDocument;
      if (!ownerWindow || !ownerDocument || !canvasAdapter) {
        throw new Error("Board is not ready.");
      }
      const resolved = await resolveAsset(asset.provider, asset.id, ownerWindow);
      const blob = await fetchAsset(resolved, ownerWindow);
      // The engine only accepts raster images; vector assets are
      // sanitized and rasterized before insertion.
      const raster =
        blob.type === "image/svg+xml"
          ? await svgToPng(blob, ownerDocument)
          : blob;
      await canvasAdapter.createImage(raster, ownerWindow, resolved);
    },
    [canvasAdapter, getOwnerWindow],
  );

  const insertTextPreset = useCallback(
    (preset: VisionTextPreset) => {
      canvasAdapter?.createTextPreset(preset);
    },
    [canvasAdapter],
  );

  const searchPhotos = useCallback(
    async (query: string) => {
      const ownerWindow = getOwnerWindow();
      if (!ownerWindow) {
        throw new Error("Board is not ready.");
      }
      const page = await openverseProvider.search(
        { search: query, type: "photo", limit: 24 },
        ownerWindow,
      );
      return page.items;
    },
    [getOwnerWindow],
  );

  const insertPhoto = useCallback(
    (asset: GratitudeAsset) => insertAsset(asset),
    [insertAsset],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const ownerWindow = getOwnerWindow();
      if (!ownerWindow || !canvasAdapter) {
        throw new Error("Board is not ready.");
      }
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        await canvasAdapter.createImage(file, ownerWindow);
      }
    },
    [canvasAdapter, getOwnerWindow],
  );

  // Module 6: share dialog state.
  const [shareOpen, setShareOpen] = useState(false);
  const openShare = useCallback(() => setShareOpen(true), []);
  const closeShare = useCallback(() => setShareOpen(false), []);

  useEffect(() => {
    const storage =
      editorRootRef.current?.ownerDocument.defaultView?.localStorage;
    if (!storage) {
      return;
    }
    const saved = new VisionDocumentRepository(storage).load();
    if (saved?.title.trim()) {
      setBoardTitle(saved.title);
    }
  }, []);

  const changeBoardTitle = (title: string) => {
    const next = title.slice(0, 80);
    setBoardTitle(next);
    const storage =
      editorRootRef.current?.ownerDocument.defaultView?.localStorage;
    if (!storage) {
      return;
    }
    const repository = new VisionDocumentRepository(storage);
    const saved = repository.load();
    if (saved) {
      repository.save({ ...saved, title: next || "My vision board" });
    }
  };

  const keepSelectionInsideBoard = useCallback(() => {
    if (!excalidrawAPI || !keepInsideBoard) {
      return;
    }
    const elements = excalidrawAPI.getSceneElements();
    const page = getBoardPage(elements);
    if (!page) {
      return;
    }
    const selectedIds = excalidrawAPI.getAppState().selectedElementIds;
    const protectedIds = new Set(
      [
        page.id,
        getBoardBackground(elements)?.id,
        getBoardBackgroundImage(elements)?.id,
        getBoardTextureImage(elements)?.id,
      ].filter((id): id is string => !!id),
    );
    const targets = elements.filter(
      (element) =>
        !element.isDeleted &&
        !protectedIds.has(element.id) &&
        element.type !== "frame" &&
        selectedIds[element.id] &&
        !element.locked,
    );
    if (!targets.length) {
      return;
    }
    const [left, top, right, bottom] = getCommonBounds(targets);
    const threshold = 12 / excalidrawAPI.getAppState().zoom.value;
    const snapOffset = (
      min: number,
      max: number,
      boardMin: number,
      boardMax: number,
    ) => {
      if (max - min > boardMax - boardMin) {
        return 0;
      }
      if (min < boardMin || Math.abs(min - boardMin) <= threshold) {
        return boardMin - min;
      }
      if (max > boardMax || Math.abs(max - boardMax) <= threshold) {
        return boardMax - max;
      }
      return 0;
    };
    const offsetX = snapOffset(left, right, page.x, page.x + page.width);
    const offsetY = snapOffset(top, bottom, page.y, page.y + page.height);
    const targetIds = new Set(targets.map((element) => element.id));
    if (
      offsetX ||
      offsetY ||
      targets.some((element) => element.frameId !== page.id)
    ) {
      excalidrawAPI.updateScene({
        elements: elements.map((element) =>
          targetIds.has(element.id)
            ? newElementWith(element, {
                x: element.x + offsetX,
                y: element.y + offsetY,
                frameId: page.id,
              })
            : element,
        ),
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
    }
  }, [excalidrawAPI, keepInsideBoard]);

  useEffect(() => {
    const ownerWindow = editorRootRef.current?.ownerDocument.defaultView;
    if (!ownerWindow || !excalidrawAPI) {
      return;
    }
    let pendingSnap: number | undefined;
    let positionsBeforeDrag = new Map<string, { x: number; y: number }>();
    const unsubscribePointerDown = excalidrawAPI.onPointerDown(() => {
      const selectedIds = excalidrawAPI.getAppState().selectedElementIds;
      positionsBeforeDrag = new Map(
        excalidrawAPI
          .getSceneElements()
          .filter((element) => selectedIds[element.id])
          .map((element) => [element.id, { x: element.x, y: element.y }]),
      );
    });
    const unsubscribePointerUp = excalidrawAPI.onPointerUp(() => {
      const moved = excalidrawAPI.getSceneElements().some((element) => {
        const before = positionsBeforeDrag.get(element.id);
        return before && (before.x !== element.x || before.y !== element.y);
      });
      positionsBeforeDrag.clear();
      if (!moved) {
        return;
      }
      ownerWindow.clearTimeout(pendingSnap);
      pendingSnap = ownerWindow.setTimeout(keepSelectionInsideBoard, 0);
    });
    return () => {
      unsubscribePointerDown();
      unsubscribePointerUp();
      ownerWindow.clearTimeout(pendingSnap);
    };
  }, [excalidrawAPI, keepSelectionInsideBoard]);

  useEffect(() => {
    const root = editorRootRef.current;
    const ownerWindow = root?.ownerDocument.defaultView;
    if (!root || !ownerWindow?.ResizeObserver || !excalidrawAPI) {
      return;
    }
    let pendingFit: number | undefined;
    let pointerIsDown = false;
    let fitAfterPointerUp = false;
    const scheduleFit = () => {
      ownerWindow.clearTimeout(pendingFit);
      pendingFit = ownerWindow.setTimeout(fitBoardPage, 100);
    };
    const unsubscribePointerDown = excalidrawAPI.onPointerDown(() => {
      pointerIsDown = true;
      ownerWindow.clearTimeout(pendingFit);
    });
    const unsubscribePointerUp = excalidrawAPI.onPointerUp(() => {
      pointerIsDown = false;
      if (fitAfterPointerUp) {
        fitAfterPointerUp = false;
        scheduleFit();
      }
    });
    const observer = new ownerWindow.ResizeObserver(() => {
      if (hasFittedPageRef.current) {
        if (pointerIsDown) {
          fitAfterPointerUp = true;
        } else {
          scheduleFit();
        }
      }
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
      unsubscribePointerDown();
      unsubscribePointerUp();
      ownerWindow.clearTimeout(pendingFit);
    };
  }, [excalidrawAPI, fitBoardPage]);

  const changeBoardSize = (width: number, height: number) => {
    if (!excalidrawAPI) {
      return;
    }
    const elements = excalidrawAPI.getSceneElements();
    const page = getBoardPage(elements);
    if (!page || (page.width === width && page.height === height)) {
      return;
    }
    const scaleX = width / page.width;
    const scaleY = height / page.height;
    const background = getBoardBackground(elements);
    const backgroundImage = getBoardBackgroundImage(elements);
    const textureImage = getBoardTextureImage(elements);
    const texture = (page.customData?.gratitudeTexture ||
      "none") as BoardTexture;
    excalidrawAPI.updateScene({
      elements: elements.map((element) => {
        if (element.id === page.id) {
          return newElementWith(element, { width, height });
        }
        if (element.frameId !== page.id) {
          return element;
        }
        if (element.id === backgroundImage?.id) {
          const cover = Math.max(
            width / element.width,
            height / element.height,
          );
          const imageWidth = element.width * cover;
          const imageHeight = element.height * cover;
          return newElementWith(element, {
            x: page.x + (width - imageWidth) / 2,
            y: page.y + (height - imageHeight) / 2,
            width: imageWidth,
            height: imageHeight,
          });
        }
        if (element.id === background?.id || element.id === textureImage?.id) {
          return newElementWith(element, {
            x: page.x,
            y: page.y,
            width,
            height,
          });
        }
        // Scale positions per-axis but sizes uniformly so photos, circles and
        // stickers are never stretched; text keeps its size (its box is
        // derived from the font, so resizing it directly corrupts it).
        const uniform = Math.min(scaleX, scaleY);
        const scalesWithBoard =
          element.type === "image" ||
          element.type === "rectangle" ||
          element.type === "ellipse" ||
          element.type === "diamond";
        const nextWidth = scalesWithBoard
          ? element.width * uniform
          : element.width;
        const nextHeight = scalesWithBoard
          ? element.height * uniform
          : element.height;
        const centerX =
          page.x + (element.x + element.width / 2 - page.x) * scaleX;
        const centerY =
          page.y + (element.y + element.height / 2 - page.y) * scaleY;
        return newElementWith(element, {
          x: centerX - nextWidth / 2,
          y: centerY - nextHeight / 2,
          width: nextWidth,
          height: nextHeight,
        });
      }),
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
    editorRootRef.current?.ownerDocument.defaultView?.requestAnimationFrame(
      () => {
        fitBoardPage();
        if (texture !== "none") {
          changeBoardTexture(texture);
        }
      },
    );
  };

  const changeBoardColor = (color: string) => {
    if (!excalidrawAPI) {
      return;
    }
    const elements = excalidrawAPI.getSceneElements();
    const background = getBoardBackground(elements);
    if (!background) {
      return;
    }
    excalidrawAPI.updateScene({
      elements: elements.map((element) =>
        element.id === background.id
          ? newElementWith(element, { backgroundColor: color })
          : element,
      ),
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
  };

  const setBackgroundImage = async (
    blob: Blob | null | Promise<Blob | null>,
    kind: "photo" | "texture",
    textureName: BoardTexture = "none",
  ) => {
    const ownerDocument = editorRootRef.current?.ownerDocument;
    if (ownerDocument) {
      await updateBackgroundImage?.(blob, kind, ownerDocument, textureName);
    }
  };

  const changeBoardTexture = (texture: BoardTexture) => {
    if (texture === "none") {
      void setBackgroundImage(null, "texture", texture);
      return;
    }
    const ownerDocument = editorRootRef.current?.ownerDocument;
    const page =
      excalidrawAPI && getBoardPage(excalidrawAPI.getSceneElements());
    if (!ownerDocument || !page) {
      return;
    }
    const canvas = ownerDocument.createElement("canvas");
    canvas.width = Math.round(page.width);
    canvas.height = Math.round(page.height);
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.strokeStyle = "rgba(96, 75, 71, 0.16)";
    context.fillStyle = "rgba(96, 75, 71, 0.16)";
    if (texture === "grid") {
      for (let x = 0; x < canvas.width; x += 32) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
      for (let y = 0; y < canvas.height; y += 32) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }
    } else if (texture === "dots") {
      for (let x = 16; x < canvas.width; x += 32) {
        for (let y = 16; y < canvas.height; y += 32) {
          context.beginPath();
          context.arc(x, y, 1.5, 0, Math.PI * 2);
          context.fill();
        }
      }
    } else {
      for (let y = 0; y < canvas.height; y += 4) {
        context.globalAlpha = y % 12 === 0 ? 0.5 : 0.2;
        context.fillRect(0, y, canvas.width, 1);
      }
      context.globalAlpha = 1;
    }
    const blob = new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((value) => value
        ? resolve(value)
        : reject(new Error("Texture could not be rendered")), "image/png"),
    );
    void setBackgroundImage(blob, "texture", texture).catch(() =>
      excalidrawAPI?.setToast({ message: "That texture could not be added." }),
    );
  };

  const [errorMessage, setErrorMessage] = useState("");
  const isCollabDisabled = true;

  const { editorTheme, appTheme, setAppTheme } = useHandleAppTheme();

  const [langCode, setLangCode] = useAppLangCode();

  // initial state
  // ---------------------------------------------------------------------------

  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  const [collabAPI] = useAtom(collabAPIAtom);
  const [isCollaborating] = useAtomWithInitialValue(isCollaboratingAtom, () => {
    return isCollaborationLink(window.location.href);
  });
  const userToFollow = useAtomValue(userToFollowAtom);

  const viewportStatusFrame = useMemo(
    () =>
      userToFollow
        ? {
            border: "var(--color-primary-hover)",
            label: {
              label: (
                <>
                  Following{" "}
                  <span
                    style={{
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 100,
                    }}
                    title={userToFollow.username}
                  >
                    {userToFollow.username}
                  </span>
                </>
              ),
              onClose: () => collabAPI?.setUserToFollow(null),
            },
          }
        : null,
    [userToFollow, collabAPI],
  );

  useHandleLibrary({
    excalidrawAPI,
    adapter: LibraryIndexedDBAdapter,
    // TODO maybe remove this in several months (shipped: 24-03-11)
    migrationAdapter: LibraryLocalStorageMigrationAdapter,
  });

  const [, forceRefresh] = useState(false);

  useEffect(() => {
    if (isDevEnv()) {
      const debugState = loadSavedDebugState();

      if (debugState.enabled && !window.visualDebug) {
        window.visualDebug = {
          data: [],
        };
      } else {
        delete window.visualDebug;
      }
      forceRefresh((prev) => !prev);
    }
  }, [excalidrawAPI]);

  // ---------------------------------------------------------------------------
  // Hoisted loadImages
  // ---------------------------------------------------------------------------
  const loadImages = useCallback(
    (data: ResolutionType<typeof initializeScene>, isInitialLoad = false) => {
      if (!data.scene || !excalidrawAPI) {
        return;
      }

      if (collabAPI?.isCollaborating()) {
        if (data.scene.elements) {
          collabAPI
            .fetchImageFilesFromFirebase({
              elements: data.scene.elements,
              forceFetchFiles: true,
            })
            .then(({ loadedFiles, erroredFiles }) => {
              excalidrawAPI.addFiles(loadedFiles);
              updateStaleImageStatuses({
                excalidrawAPI,
                erroredFiles,
                elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
              });
            });
        }
      } else {
        const fileIds = collectReferencedFileIds(data.scene.elements || []);

        if (data.isExternalScene) {
          if (fileIds.length) {
            // Direct Firebase call (not through FileManager), so track manually
            FileStatusStore.updateStatuses(
              fileIds.map((id) => [id, "loading"]),
            );
          }
          loadFilesFromFirebase(
            `${FIREBASE_STORAGE_PREFIXES.shareLinkFiles}/${data.id}`,
            data.key,
            fileIds,
          ).then(({ loadedFiles, erroredFiles }) => {
            excalidrawAPI.addFiles(loadedFiles);
            updateStaleImageStatuses({
              excalidrawAPI,
              erroredFiles,
              elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
            });
            FileStatusStore.updateStatuses([
              ...loadedFiles.map((f) => [f.id, "loaded"] as [FileId, "loaded"]),
              ...[...erroredFiles.keys()].map(
                (id) => [id, "error"] as [FileId, "error"],
              ),
            ]);
          });
        } else if (isInitialLoad) {
          if (fileIds.length) {
            LocalData.fileStorage
              .getFiles(fileIds)
              .then(async ({ loadedFiles, erroredFiles }) => {
                if (loadedFiles.length) {
                  excalidrawAPI.addFiles(loadedFiles);
                }
                updateStaleImageStatuses({
                  excalidrawAPI,
                  erroredFiles,
                  elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
                });
              });
          }
          // on fresh load, clear unused files from IDB (from previous
          // session)
          LocalData.fileStorage.clearObsoleteFiles({
            currentFileIds: fileIds,
          });
        }
      }
    },
    [collabAPI, excalidrawAPI],
  );

  useEffect(() => {
    if (!excalidrawAPI || (!isCollabDisabled && !collabAPI)) {
      return;
    }

    initializeScene({ collabAPI, excalidrawAPI }).then(async (data) => {
      loadImages(data, /* isInitialLoad */ true);
      initialStatePromiseRef.current.promise.resolve(
        data.scene
          ? {
              ...data.scene,
              elements: ensureBoardPage(data.scene.elements || []),
              appState: {
                ...data.scene.appState,
                selectedElementIds: {},
                boxSelectionMode: "overlap",
                viewBackgroundColor: "transparent",
                frameRendering: {
                  enabled: true,
                  clip: true,
                  name: false,
                  outline: false,
                },
              },
            }
          : data.scene,
      );
    });

    const onHashChange = async (event: HashChangeEvent) => {
      event.preventDefault();
      const libraryUrlTokens = parseLibraryTokensFromUrl();
      if (!libraryUrlTokens) {
        if (
          collabAPI?.isCollaborating() &&
          !isCollaborationLink(window.location.href)
        ) {
          collabAPI.stopCollaboration(false);
        }
        excalidrawAPI.updateScene({ appState: { isLoading: true } });

        initializeScene({ collabAPI, excalidrawAPI }).then((data) => {
          loadImages(data);
          if (data.scene) {
            lastGoodBoardSceneRef.current = [];
            excalidrawAPI.updateScene({
              elements: ensureBoardPage(
                restoreElements(data.scene.elements, null, {
                  repairBindings: true,
                }),
              ),
              appState: {
                ...restoreAppState(data.scene.appState, null),
                selectedElementIds: {},
                boxSelectionMode: "overlap",
                viewBackgroundColor: "transparent",
                frameRendering: {
                  enabled: true,
                  clip: true,
                  name: false,
                  outline: false,
                },
              },
              captureUpdate: CaptureUpdateAction.IMMEDIATELY,
            });
          }
        });
      }
    };

    const syncData = debounce(() => {
      if (isTestEnv()) {
        return;
      }
      if (
        !document.hidden &&
        ((collabAPI && !collabAPI.isCollaborating()) || isCollabDisabled)
      ) {
        // don't sync if local state is newer or identical to browser state
        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_DATA_STATE)) {
          const localDataState = importFromLocalStorage();
          const username = importUsernameFromLocalStorage();
          setLangCode(getPreferredLanguage());
          excalidrawAPI.updateScene({
            ...localDataState,
            captureUpdate: CaptureUpdateAction.NEVER,
          });
          LibraryIndexedDBAdapter.load().then((data) => {
            if (data) {
              excalidrawAPI.updateLibrary({
                libraryItems: data.libraryItems,
              });
            }
          });
          collabAPI?.setUsername(username || "");
        }

        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_FILES)) {
          const elements = excalidrawAPI.getSceneElementsIncludingDeleted();
          const currFiles = excalidrawAPI.getFiles();
          const fileIds = collectReferencedFileIds(elements).filter(
            (id) => !currFiles[id],
          );
          if (fileIds.length) {
            LocalData.fileStorage
              .getFiles(fileIds)
              .then(({ loadedFiles, erroredFiles }) => {
                if (loadedFiles.length) {
                  excalidrawAPI.addFiles(loadedFiles);
                }
                updateStaleImageStatuses({
                  excalidrawAPI,
                  erroredFiles,
                  elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
                });
              });
          }
        }
      }
    }, SYNC_BROWSER_TABS_TIMEOUT);

    const visibilityChange = (event: FocusEvent | Event) => {
      if (event.type === EVENT.BLUR || document.hidden) {
        LocalData.flushSave();
      }
      if (
        event.type === EVENT.VISIBILITY_CHANGE ||
        event.type === EVENT.FOCUS
      ) {
        syncData();
      }
    };

    window.addEventListener(EVENT.HASHCHANGE, onHashChange, false);
    window.addEventListener(EVENT.BLUR, visibilityChange, false);
    document.addEventListener(EVENT.VISIBILITY_CHANGE, visibilityChange, false);
    window.addEventListener(EVENT.FOCUS, visibilityChange, false);
    return () => {
      window.removeEventListener(EVENT.HASHCHANGE, onHashChange, false);
      window.removeEventListener(EVENT.BLUR, visibilityChange, false);
      window.removeEventListener(EVENT.FOCUS, visibilityChange, false);
      document.removeEventListener(
        EVENT.VISIBILITY_CHANGE,
        visibilityChange,
        false,
      );
    };
  }, [
    isCollabDisabled,
    collabAPI,
    excalidrawAPI,
    setLangCode,
    loadImages,
    fitBoardPage,
  ]);

  useEffect(() => {
    const unloadHandler = (event: BeforeUnloadEvent) => {
      LocalData.flushSave();

      if (
        excalidrawAPI &&
        LocalData.fileStorage.shouldPreventUnload(
          excalidrawAPI.getSceneElements(),
        )
      ) {
        if (import.meta.env.VITE_APP_DISABLE_PREVENT_UNLOAD !== "true") {
          preventUnload(event);
        } else {
          console.warn(
            "preventing unload disabled (VITE_APP_DISABLE_PREVENT_UNLOAD)",
          );
        }
      }
    };
    window.addEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
    return () => {
      window.removeEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
    };
  }, [excalidrawAPI]);

  const onChange = (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    const gridHost = editorRootRef.current;
    if (gridHost) {
      const zoom = appState.zoom.value;
      let dotSpacing = 24 * zoom;
      while (dotSpacing < 12) {
        dotSpacing *= 2;
      }
      while (dotSpacing > 48) {
        dotSpacing /= 2;
      }
      gridHost.style.setProperty("--studio-dot-spacing", `${dotSpacing}px`);
      gridHost.style.setProperty(
        "--studio-dot-x",
        `${(appState.scrollX * zoom) % dotSpacing}px`,
      );
      gridHost.style.setProperty(
        "--studio-dot-y",
        `${(appState.scrollY * zoom) % dotSpacing}px`,
      );
    }
    const repairScene = (repair: () => void) => {
      if (sceneRepairAttemptsRef.current >= 8) {
        if (sceneRepairAttemptsRef.current === 8) {
          console.error(
            "Stopped repeated board scene repairs to keep the editor open.",
          );
          excalidrawAPI?.setToast({
            message:
              "This saved board needs repair. Your data has not been cleared.",
          });
        }
        sceneRepairAttemptsRef.current += 1;
        return false;
      }
      sceneRepairAttemptsRef.current += 1;
      repair();
      return true;
    };
    const previousBoardScene = lastGoodBoardSceneRef.current;
    const boardInspection = inspectBoardScene({
      elements,
      appState,
      previousElements: previousBoardScene,
      allowBoardLayerReplacement: false,
    });
    const boardRepair = boardInspection.repair;
    if (excalidrawAPI && boardRepair) {
      const repaired = repairScene(() => {
        switch (boardRepair.type) {
          case "set-overlap-selection":
            excalidrawAPI.updateScene({
              appState: { boxSelectionMode: "overlap" },
              captureUpdate: CaptureUpdateAction.NEVER,
            });
            break;
          case "restore-protected-layers":
          case "create-board-layers":
            excalidrawAPI.updateScene({
              elements: boardRepair.elements,
              appState: { selectedElementIds: {} },
              captureUpdate: CaptureUpdateAction.NEVER,
            });
            break;
          case "protect-board-layers":
            excalidrawAPI.updateScene({
              elements: boardRepair.elements,
              appState: boardRepair.selectedElementIds
                ? { selectedElementIds: boardRepair.selectedElementIds }
                : undefined,
              captureUpdate: CaptureUpdateAction.NEVER,
            });
            break;
        }
      });
      if (repaired) {
        if (boardRepair.type === "restore-protected-layers") {
          excalidrawAPI.setToast({
            message: "Use Board setup to change the board background.",
          });
        }
        return;
      }
    }
    if (!boardRepair) {
      sceneRepairAttemptsRef.current = 0;
    }
    if (!hasFittedPageRef.current && boardInspection.page) {
      hasFittedPageRef.current = true;
      editorRootRef.current?.ownerDocument.defaultView?.requestAnimationFrame(
        fitBoardPage,
      );
    }
    const page = boardInspection.page;
    const background = boardInspection.background;
    const activeTemplateId = elements.find(
      (element) => element.customData?.gratitudeTemplateId,
    )?.customData?.gratitudeTemplateId as string | undefined;
    const legacyTemplateStyle = activeTemplateId
      ? LEGACY_VISION_TEMPLATE_STYLES[activeTemplateId]
      : undefined;
    const hasOutdatedLayoutGuides = elements.some(
      (element) =>
        element.customData?.gratitudeLayoutSlot === true &&
        (element.opacity !== 100 ||
          element.backgroundColor !== "#f6f1f3" ||
          element.strokeColor !== "#d4c7cd" ||
          element.strokeStyle !== "solid"),
    );
    const hasLegacyTemplateColors =
      !!legacyTemplateStyle &&
      (background?.backgroundColor === legacyTemplateStyle.background[0] ||
        elements.some(
          (element) =>
            element.customData?.gratitudeTemplateId === activeTemplateId &&
            element.strokeColor === legacyTemplateStyle.accent[0],
        ));
    if (excalidrawAPI && (hasOutdatedLayoutGuides || hasLegacyTemplateColors)) {
      excalidrawAPI.updateScene({
        elements: elements.map((element) => {
          if (element.customData?.gratitudeLayoutSlot === true) {
            if (!hasOutdatedLayoutGuides) {
              return element;
            }
            const layout = VISION_LAYOUTS.find(
              (candidate) =>
                candidate.id === element.customData?.gratitudeLayoutId,
            );
            const layoutSlot = layout?.slots.find(
              (candidate) =>
                candidate.id === element.customData?.gratitudeSlotId,
            );
            const bounds = layoutSlot
              ? getLayoutSlotBounds(
                  layoutSlot,
                  Boolean(element.customData?.gratitudeTemplateId),
                )
              : null;
            return newElementWith(element, {
              ...(page && bounds
                ? {
                    x: page.x + page.width * bounds.x,
                    y: page.y + page.height * bounds.y,
                    width: page.width * bounds.width,
                    height: page.height * bounds.height,
                    angle: (((layoutSlot?.rotation || 0) * Math.PI) /
                      180) as Radians,
                  }
                : {}),
              opacity: 100,
              backgroundColor: "#f6f1f3",
              strokeColor: "#d4c7cd",
              strokeStyle: "solid",
            });
          }
          if (
            legacyTemplateStyle &&
            element.customData?.gratitudeTemplateId === activeTemplateId &&
            element.strokeColor === legacyTemplateStyle.accent[0]
          ) {
            return newElementWith(element, {
              strokeColor: legacyTemplateStyle.accent[1],
            });
          }
          if (
            legacyTemplateStyle &&
            element.id === background?.id &&
            element.backgroundColor === legacyTemplateStyle.background[0]
          ) {
            return newElementWith(element, {
              backgroundColor: legacyTemplateStyle.background[1],
            });
          }
          return element;
        }),
        captureUpdate: CaptureUpdateAction.NEVER,
      });
      return;
    }
    setHasBoardContent(
      elements.some(
        (element) =>
          !element.isDeleted && !boardInspection.protectedIds.has(element.id),
      ),
    );
    if (sceneRepairAttemptsRef.current > 8) {
      return;
    }
    sceneRepairAttemptsRef.current = 0;
    lastGoodBoardSceneRef.current = [...elements];
    if (page && background) {
      const nextBoardState = {
        width: Math.round(page.width),
        height: Math.round(page.height),
        color: background.backgroundColor,
        texture: (page.customData?.gratitudeTexture || "none") as BoardTexture,
        hasImage: !!getBoardBackgroundImage(elements),
      };
      setBoardState((previous) =>
        previous.width === nextBoardState.width &&
        previous.height === nextBoardState.height &&
        previous.color === nextBoardState.color &&
        previous.texture === nextBoardState.texture &&
        previous.hasImage === nextBoardState.hasImage
          ? previous
          : nextBoardState,
      );
    }
    if (canvasAdapter) {
      const nextSelection = canvasAdapter.getSelection();
      setVisionSelection((previous) =>
        JSON.stringify(previous) === JSON.stringify(nextSelection)
          ? previous
          : nextSelection,
      );
      if (nextSelection.count > 0 && boardSettingsOpen) {
        setBoardSettingsOpen(false);
      }
    }
    if (collabAPI?.isCollaborating()) {
      collabAPI.syncElements(elements);
    }

    // this check is redundant, but since this is a hot path, it's best
    // not to evaludate the nested expression every time
    if (!LocalData.isSavePaused()) {
      const ownerWindow = editorRootRef.current?.ownerDocument.defaultView;
      let visionStorage: { storage: Storage; title: string } | undefined;
      try {
        if (ownerWindow) {
          visionStorage = {
            storage: ownerWindow.localStorage,
            title: boardTitle || "My vision board",
          };
        }
      } catch {
        // The existing scene save remains available if browser storage is blocked.
      }
      LocalData.save(
        elements,
        appState,
        files,
        () => {
          if (excalidrawAPI) {
            let didChange = false;

            const elements = excalidrawAPI
              .getSceneElementsIncludingDeleted()
              .map((element) => {
                if (
                  LocalData.fileStorage.shouldUpdateImageElementStatus(element)
                ) {
                  const newElement = newElementWith(element, {
                    status: "saved",
                  });
                  if (newElement !== element) {
                    didChange = true;
                  }
                  return newElement;
                }
                return element;
              });

            if (didChange) {
              excalidrawAPI.updateScene({
                elements,
                captureUpdate: CaptureUpdateAction.NEVER,
              });
            }
          }
        },
        visionStorage,
      );
    }

    // Render the debug scene if the debug canvas is available
    if (debugCanvasRef.current && excalidrawAPI) {
      debugRenderer(
        debugCanvasRef.current,
        appState,
        elements,
        window.devicePixelRatio,
      );
    }
  };

  const isOffline = useAtomValue(isOfflineAtom);

  const localStorageQuotaExceeded = useAtomValue(localStorageQuotaExceededAtom);

  // ---------------------------------------------------------------------------
  // onExport — intercepts file save to wait for pending image loads
  // ---------------------------------------------------------------------------
  const onExport: Required<ExcalidrawProps>["onExport"] = useCallback(
    async function* () {
      let snapshot = FileStatusStore.getSnapshot();
      const failed = [...snapshot.value.values()].filter(
        (status) => status === "error",
      ).length;
      if (failed) {
        throw new Error(
          `${failed} board image${
            failed === 1 ? " is" : "s are"
          } unavailable. Retry the missing image before exporting.`,
        );
      }
      const { pending, total } = FileStatusStore.getPendingCount(
        snapshot.value,
      );
      if (pending === 0) {
        return;
      }

      // Yield initial progress
      yield {
        type: "progress",
        progress: (total - pending) / total,
        message: `Loading images (${total - pending}/${total})...`,
      };

      // Wait for all pending images to finish
      while (true) {
        snapshot = await FileStatusStore.pull(snapshot.version);
        const nowFailed = [...snapshot.value.values()].filter(
          (status) => status === "error",
        ).length;
        if (nowFailed) {
          throw new Error(
            `${nowFailed} board image${
              nowFailed === 1 ? " is" : "s are"
            } unavailable. Retry the missing image before exporting.`,
          );
        }
        const { pending: nowPending, total: nowTotal } =
          FileStatusStore.getPendingCount(snapshot.value);

        yield {
          type: "progress",
          progress: (nowTotal - nowPending) / nowTotal,
          message: `Loading images (${nowTotal - nowPending}/${nowTotal})...`,
        };

        if (nowPending === 0) {
          await new Promise((r) => setTimeout(r, 500));
          yield {
            type: "progress",
            message: `Preparing export...`,
          };
          return;
        }
      }
    },
    [],
  );

  // const onExport = () => {
  //   return new Promise((r) => setTimeout(r, 2500));
  //   // console.log("onExport");
  // };

  // browsers generally prevent infinite self-embedding, there are
  // cases where it still happens, and while we disallow self-embedding
  // by not whitelisting our own origin, this serves as an additional guard
  const placeAsset = async (
    asset: GratitudeAsset,
    ownerDocument: Document,
    position?: { x: number; y: number },
  ) => {
    const ownerWindow = ownerDocument.defaultView;
    if (!excalidrawAPI || !ownerWindow) {
      return;
    }
    try {
      const downloaded = await fetchAsset(asset, ownerWindow);
      const image =
        asset.mimeType === "image/svg+xml"
          ? await svgToPng(
              downloaded,
              ownerDocument,
              asset.customization?.color,
            )
          : downloaded;
      await canvasAdapter?.createImage(
        image,
        ownerWindow,
        asset,
        position
          ? { ...position, constrainToBoard: keepInsideBoard }
          : undefined,
      );
    } catch {
      excalidrawAPI.setToast({
        message: "That asset could not be added. Please try again.",
      });
    }
  };

  if (isSelfEmbedding) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "100%",
        }}
      >
        <h1>This board can&apos;t be embedded here.</h1>
      </div>
    );
  }

  return (
    <StudioShell
      boardName={boardTitle}
      onNameChange={changeBoardTitle}
      onNewBoard={newBoard}
      hasBoardContent={hasBoardContent}
      onApplyTemplate={applyTemplate}
      onInsertAsset={insertAsset}
      onInsertText={insertTextPreset}
      onSearchPhotos={searchPhotos}
      onInsertPhoto={insertPhoto}
      onUploadFiles={uploadFiles}
      boardColor={boardState.color}
      onBoardColor={changeBoardColor}
      boardTexture={boardState.texture}
      onBoardTexture={changeBoardTexture}
      shareOpen={shareOpen}
      onOpenShare={openShare}
      onCloseShare={closeShare}
      canvasAdapter={canvasAdapter}
      theme={editorTheme}
      onFitBoard={fitBoardPage}
      hasSelection={visionSelection.count > 0}
    >
      <div
        ref={editorRootRef}
        className={clsx("excalidraw-app", {
          "is-collaborating": isCollaborating,
        })}
        onDragOverCapture={(event) => {
          if (
            Array.from(event.dataTransfer.types).includes(
              GRATITUDE_ASSET_DRAG_TYPE,
            )
          ) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }
        }}
        onDropCapture={(event) => {
          const serialized = event.dataTransfer.getData(
            GRATITUDE_ASSET_DRAG_TYPE,
          );
          if (!serialized || !excalidrawAPI) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          try {
            const asset: unknown = JSON.parse(serialized);
            if (!isGratitudeAsset(asset)) {
              throw new Error("Invalid asset data");
            }
            const state = excalidrawAPI.getAppState();
            const position = {
              x:
                (event.clientX - state.offsetLeft) / state.zoom.value -
                state.scrollX,
              y:
                (event.clientY - state.offsetTop) / state.zoom.value -
                state.scrollY,
            };
            void placeAsset(asset, event.currentTarget.ownerDocument, position);
          } catch {
            excalidrawAPI.setToast({
              message: "That asset could not be dropped on the board.",
            });
          }
        }}
      >
        <Excalidraw
          name={boardTitle || "My vision board"}
          snapToBoard={keepInsideBoard}
          ui={false}
          viewportStatusFrame={viewportStatusFrame}
          userToFollow={userToFollow}
          onChange={onChange}
          onExport={onExport}
          initialData={initialStatePromiseRef.current.promise}
          isCollaborating={isCollaborating}
          onPointerUpdate={collabAPI?.onPointerUpdate}
          UIOptions={{
            disabledActions: [
              "gridMode",
              "objectsSnapMode",
              "arrowBinding",
              "midpointSnapping",
              "zenMode",
              "viewMode",
              "stats",
              "addToLibrary",
              "hyperlink",
              "copyElementLink",
              "linkToElement",
              "toggleShapeSwitch",
              "changeFillStyle",
              "changeSloppiness",
              "changeRoundness",
              "changeFreedrawMode",
              "changeArrowProperties",
              "changeArrowhead",
              "changeArrowType",
            ],
            canvasActions: {
              toggleTheme: false,
              export: false,
            },
            tools: {
              image: true,
              laser: false,
              embeddable: false,
              autoshape: false,
              bucketfill: false,
              magicframe: false,
              lasso: false,
            },
          }}
          langCode={langCode}
          detectScroll={false}
          handleKeyboardGlobally={true}
          autoFocus={true}
          theme={editorTheme}
          onThemeChange={setAppTheme}
          onLinkOpen={(element, event) => {
            if (element.link && isElementLink(element.link)) {
              event.preventDefault();
              excalidrawAPI?.setViewport({
                target: element.link,
                fit: "scale-down",
                animation: true,
              });
            }
          }}
        >
          <OverwriteConfirmDialog>
            <OverwriteConfirmDialog.Actions.ExportToImage />
            <OverwriteConfirmDialog.Actions.SaveToDisk />
          </OverwriteConfirmDialog>
          {isCollaborating && isOffline && (
            <div className="alert alert--warning">
              {t("alerts.collabOfflineWarning")}
            </div>
          )}
          {localStorageQuotaExceeded && (
            <div className="alert alert--danger">
              {t("alerts.localStorageQuotaExceeded")}
            </div>
          )}
          {errorMessage && (
            <ErrorDialog onClose={() => setErrorMessage("")}>
              {errorMessage}
            </ErrorDialog>
          )}
          {isVisualDebuggerEnabled() && excalidrawAPI && (
            <DebugCanvas
              appState={excalidrawAPI.getAppState()}
              scale={window.devicePixelRatio}
              ref={debugCanvasRef}
            />
          )}
        </Excalidraw>
        {canvasAdapter && visionSelection.count > 0 && (
          <SelectionPill adapter={canvasAdapter} selection={visionSelection} />
        )}
      </div>
    </StudioShell>
  );
};

const ExcalidrawApp = () => {
  return (
    <TopErrorBoundary>
      <Provider store={appJotaiStore}>
        <ExcalidrawAPIProvider>
          <ExcalidrawWrapper />
        </ExcalidrawAPIProvider>
      </Provider>
    </TopErrorBoundary>
  );
};

export default ExcalidrawApp;
