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
import { createPortal } from "react-dom";
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
  newElementWith,
  newImageElement,
} from "@excalidraw/element";
import { isInitializedImageElement } from "@excalidraw/element";
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
  BinaryFileData,
  DataURL,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";
import type { ResolutionType } from "@excalidraw/common/utility-types";
import type { ResolvablePromise } from "@excalidraw/common/utils";

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
import { GratitudeSelectionToolbar } from "./components/GratitudeSelectionToolbar";
import { AppMainMenu } from "./components/AppMainMenu";
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

import { GratitudeShell } from "./components/GratitudeShell";

import { BoardSettings } from "./components/BoardSettings";
import { fetchAsset } from "./assets/registry";
import {
  GRATITUDE_ASSET_DRAG_TYPE,
  isGratitudeAsset,
} from "./assets/contracts";
import { svgToPng } from "./assets/sanitizeSvg";
import { createCanvasAdapter } from "./vision/canvasAdapter";
import { EMPTY_VISION_SELECTION } from "./vision/contracts";
import { VisionDocumentRepository } from "./vision/repository";

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

import type { VisionSelection } from "./vision/contracts";

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
      localDataState?.appState || { viewBackgroundColor: "#f8edf2" },
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
  const [rightOpen, setRightOpen] = useState(false);
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
  const [footerTarget, setFooterTarget] = useState<HTMLDivElement | null>(null);
  const editorRootRef = useRef<HTMLDivElement>(null);
  const hasFittedPageRef = useRef(false);
  const lastGoodBoardSceneRef = useRef<readonly OrderedExcalidrawElement[]>([]);
  const allowBoardLayerReplacementRef = useRef(false);
  const sceneRepairAttemptsRef = useRef(0);
  const lastInspectorKey = useRef("");
  const canvasAdapter = useMemo(
    () => (excalidrawAPI ? createCanvasAdapter(excalidrawAPI) : null),
    [excalidrawAPI],
  );
  const fitBoardPage = useCallback(() => {
    canvasAdapter?.fitBoard();
  }, [canvasAdapter]);

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
    const backgroundImage = getBoardBackgroundImage(elements);
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
        // Scale positions per-axis but sizes uniformly so photos, circles and
        // stickers are never stretched; text keeps its size (its box is
        // derived from the font, so resizing it directly corrupts it).
        const uniform = Math.min(scaleX, scaleY);
        const nextWidth =
          element.type === "text" ? element.width : element.width * uniform;
        const nextHeight =
          element.type === "text" ? element.height : element.height * uniform;
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
    blob: Blob | null,
    kind: "photo" | "texture",
    textureName: BoardTexture = "none",
  ) => {
    if (!excalidrawAPI) {
      return;
    }
    const elements = excalidrawAPI.getSceneElements();
    const page = getBoardPage(elements);
    const background = getBoardBackground(elements);
    const previous =
      kind === "photo"
        ? getBoardBackgroundImage(elements)
        : getBoardTextureImage(elements);
    if (!page || !background) {
      return;
    }
    let image = null;
    if (blob) {
      const ownerWindow = editorRootRef.current?.ownerDocument.defaultView;
      if (!ownerWindow) {
        return;
      }
      const dataURL = await new Promise<DataURL>((resolve, reject) => {
        const reader = new ownerWindow.FileReader();
        reader.onload = () => resolve(reader.result as DataURL);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      const bitmap = await ownerWindow.createImageBitmap(blob);
      const ratio =
        kind === "photo"
          ? Math.max(page.width / bitmap.width, page.height / bitmap.height)
          : 1;
      const imageWidth = kind === "photo" ? bitmap.width * ratio : page.width;
      const imageHeight =
        kind === "photo" ? bitmap.height * ratio : page.height;
      bitmap.close();
      const fileId = ownerWindow.crypto.randomUUID() as FileId;
      excalidrawAPI.addFiles([
        {
          id: fileId,
          dataURL,
          mimeType: blob.type as BinaryFileData["mimeType"],
          created: Date.now(),
        },
      ]);
      image = newImageElement({
        type: "image",
        x: page.x + (page.width - imageWidth) / 2,
        y: page.y + (page.height - imageHeight) / 2,
        width: imageWidth,
        height: imageHeight,
        frameId: page.id,
        fileId,
        status: "saved",
        locked: true,
        customData:
          kind === "photo"
            ? { gratitudeBackgroundImage: true }
            : { gratitudeTextureImage: true },
      });
    }
    const remaining: ExcalidrawElement[] = elements.filter(
      (element) => element.id !== previous?.id,
    );
    const insertAt =
      kind === "photo"
        ? remaining.findIndex((element) => element.id === background.id) + 1
        : Math.max(
            remaining.findIndex((element) => element.id === background.id),
            remaining.findIndex(
              (element) =>
                element.id === getBoardBackgroundImage(remaining)?.id,
            ),
          ) + 1;
    if (image) {
      remaining.splice(insertAt, 0, image);
    }
    if (previous) {
      allowBoardLayerReplacementRef.current = true;
    }
    excalidrawAPI.updateScene({
      elements: remaining.map((element) =>
        element.id === page.id
          ? newElementWith(element, {
              customData: {
                ...element.customData,
                gratitudeTexture:
                  kind === "texture"
                    ? textureName
                    : element.customData?.gratitudeTexture,
              },
            })
          : element,
      ),
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
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
    canvas.toBlob((blob) => {
      if (blob) {
        void setBackgroundImage(blob, "texture", texture);
      }
    }, "image/png");
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
        const fileIds =
          data.scene.elements?.reduce((acc, element) => {
            if (isInitializedImageElement(element)) {
              return acc.concat(element.fileId);
            }
            return acc;
          }, [] as FileId[]) || [];

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
                viewBackgroundColor: "#f8edf2",
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
                viewBackgroundColor: "#f8edf2",
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
          const fileIds =
            elements?.reduce((acc, element) => {
              if (
                isInitializedImageElement(element) &&
                // only load and update images that aren't already loaded
                !currFiles[element.fileId]
              ) {
                return acc.concat(element.fileId);
              }
              return acc;
            }, [] as FileId[]) || [];
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
    const allowBoardLayerReplacement = allowBoardLayerReplacementRef.current;
    allowBoardLayerReplacementRef.current = false;
    const previousBoardScene = lastGoodBoardSceneRef.current;
    const boardInspection = inspectBoardScene({
      elements,
      appState,
      previousElements: previousBoardScene,
      allowBoardLayerReplacement,
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
    if (!hasFittedPageRef.current && boardInspection.page) {
      hasFittedPageRef.current = true;
      editorRootRef.current?.ownerDocument.defaultView?.requestAnimationFrame(
        fitBoardPage,
      );
    }
    const page = boardInspection.page;
    const background = boardInspection.background;
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
    const selected = elements.filter(
      (element) => appState.selectedElementIds[element.id],
    );
    if (canvasAdapter) {
      const nextSelection = canvasAdapter.getSelection();
      setVisionSelection((previous) =>
        JSON.stringify(previous) === JSON.stringify(nextSelection)
          ? previous
          : nextSelection,
      );
    }
    const inspectorKey =
      selected.map((element) => element.id).join(",") ||
      (appState.activeTool.type === "selection"
        ? ""
        : appState.activeTool.type);
    if (inspectorKey !== lastInspectorKey.current) {
      lastInspectorKey.current = inspectorKey;
      if (inspectorKey) {
        setBoardSettingsOpen(false);
        setRightOpen(false);
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
        <h1>I'm not a pretzel!</h1>
      </div>
    );
  }

  return (
    <GratitudeShell
      adapter={canvasAdapter}
      name={boardTitle}
      onNameChange={changeBoardTitle}
      theme={editorTheme}
      onPlaceAsset={placeAsset}
      onReplaceAsset={async (asset, ownerDocument) => {
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
          await canvasAdapter?.replaceSelectedImage(image, ownerWindow, asset);
        } catch {
          excalidrawAPI.setToast({
            message: "That photo could not replace the selection. Try again.",
          });
        }
      }}
      onUploadAsset={async (file: File, ownerDocument: Document) => {
        const ownerWindow = ownerDocument.defaultView;
        if (!excalidrawAPI || !ownerWindow) {
          return;
        }
        try {
          const asset: GratitudeAsset = {
            id: `upload:${ownerWindow.crypto.randomUUID()}`,
            provider: "upload",
            type: "photo",
            title: file.name,
            tags: [],
            previewUrl: "",
            assetUrl: "",
            mimeType: file.type,
            license: {
              tier: "A",
              id: "user-provided",
              label: "User provided",
              attributionRequired: false,
            },
            editable: { crop: true, filters: true },
          };
          await canvasAdapter?.createImage(file, ownerWindow, asset);
        } catch {
          excalidrawAPI.setToast({
            message: "That photo could not be added. Use PNG, JPEG, or WebP.",
          });
        }
      }}
      rightOpen={rightOpen}
      boardSettingsOpen={boardSettingsOpen}
      onBoardSettingsOpen={() => {
        excalidrawAPI?.updateScene({ appState: { selectedElementIds: {} } });
        setBoardSettingsOpen(true);
        setRightOpen(true);
      }}
      boardSettings={
        <BoardSettings
          {...boardState}
          onSizeChange={changeBoardSize}
          onColorChange={changeBoardColor}
          onTextureChange={changeBoardTexture}
          onImageChange={(file) => {
            if (
              !["image/png", "image/jpeg", "image/webp"].includes(file.type)
            ) {
              excalidrawAPI?.setToast({
                message: "Use a PNG, JPEG, or WebP image.",
              });
              return;
            }
            void setBackgroundImage(file, "photo").catch(() =>
              excalidrawAPI?.setToast({
                message: "That image could not be added.",
              }),
            );
          }}
          onImageRemove={() => void setBackgroundImage(null, "photo")}
        />
      }
      onRightToggle={() => setRightOpen((open) => !open)}
      footerRef={setFooterTarget}
      selectionToolbar={
        <GratitudeSelectionToolbar
          adapter={canvasAdapter}
          selection={visionSelection}
        />
      }
      hasBoardContent={hasBoardContent}
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
          renderEditorUI={(slots) => (
            <>
              {footerTarget &&
                createPortal(
                  <div className="gratitude-board-controls">
                    {slots.history}
                    {slots.zoom}
                    <button
                      type="button"
                      role="switch"
                      className={`gratitude-snap-toggle${
                        keepInsideBoard ? " is-active" : ""
                      }`}
                      aria-label="Keep inside board"
                      aria-checked={keepInsideBoard}
                      title="Keep every movable item inside the board"
                      onClick={() => setKeepInsideBoard((enabled) => !enabled)}
                    >
                      <span>Keep inside board</span>
                      <span
                        className="gratitude-snap-toggle__track"
                        aria-hidden="true"
                      />
                      <span
                        className="gratitude-snap-toggle__state"
                        aria-hidden="true"
                      >
                        {keepInsideBoard ? "On" : "Off"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="gratitude-fit-page"
                      onClick={fitBoardPage}
                    >
                      Fit page
                    </button>
                  </div>,
                  footerTarget,
                )}
            </>
          )}
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
          <AppMainMenu theme={appTheme} />
          <OverwriteConfirmDialog>
            <OverwriteConfirmDialog.Actions.ExportToImage />
            <OverwriteConfirmDialog.Actions.SaveToDisk />
          </OverwriteConfirmDialog>
          <AppFooter onChange={() => excalidrawAPI?.refresh()} />
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
      </div>
    </GratitudeShell>
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
