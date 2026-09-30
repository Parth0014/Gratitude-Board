import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import { newElementWith, newImageElement } from "@excalidraw/element";

import type { ExcalidrawElement, FileId } from "@excalidraw/element/types";
import type {
  BinaryFileData,
  DataURL,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";

import {
  getBoardBackground,
  getBoardBackgroundImage,
  getBoardPage,
  getBoardTextureImage,
} from "./boardPage";

/** Commit only the latest background intent, against the current board scene. */
export const createBackgroundImageUpdater = (api: ExcalidrawImperativeAPI) => {
  const generations = { photo: 0, texture: 0 };

  return async (
    input: Blob | null | Promise<Blob | null>,
    kind: "photo" | "texture",
    ownerDocument: Document,
    textureName = "none",
  ) => {
    const generation = ++generations[kind];
    const ownerWindow = ownerDocument.defaultView;
    const initial = api.getSceneElements();
    const initialPage = getBoardPage(initial);
    const getLayer = kind === "photo" ? getBoardBackgroundImage : getBoardTextureImage;
    const initialLayer = getLayer(initial);
    const initialLayerId = initialLayer?.id;
    const initialLayerVersion = initialLayer?.version;
    if (!ownerWindow || !initialPage) {
      return;
    }
    const boardId = initialPage.id;
    const isCurrent = () => {
      const scene = api.getSceneElements();
      const layer = getLayer(scene);
      return (
        generations[kind] === generation &&
        getBoardPage(scene)?.id === boardId &&
        layer?.id === initialLayerId &&
        layer?.version === initialLayerVersion
      );
    };

    let prepared: { file: BinaryFileData; width: number; height: number } | null = null;
    const blob = await input;
    if (!isCurrent()) {
      return;
    }
    if (blob) {
      const dataURL = await new Promise<DataURL>((resolve, reject) => {
        const reader = new ownerWindow.FileReader();
        reader.onload = () => resolve(reader.result as DataURL);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      if (!isCurrent()) {
        return;
      }
      const bitmap = await ownerWindow.createImageBitmap(blob);
      try {
        prepared = {
          file: {
            id: ownerWindow.crypto.randomUUID() as FileId,
            dataURL,
            mimeType: blob.type as BinaryFileData["mimeType"],
            created: Date.now(),
          },
          width: bitmap.width,
          height: bitmap.height,
        };
      } finally {
        bitmap.close();
      }
    }
    if (!isCurrent()) {
      return;
    }
    const scene = api.getSceneElements();
    const page = getBoardPage(scene);
    const background = getBoardBackground(scene);
    if (!page || !background) {
      return;
    }
    const previous = getLayer(scene);
    const remaining: ExcalidrawElement[] = scene.filter(
      (element) => element.id !== previous?.id,
    );
    if (prepared) {
      const ratio = Math.max(page.width / prepared.width, page.height / prepared.height);
      const width = kind === "photo" ? prepared.width * ratio : page.width;
      const height = kind === "photo" ? prepared.height * ratio : page.height;
      const image = newImageElement({
        type: "image",
        x: page.x + (page.width - width) / 2,
        y: page.y + (page.height - height) / 2,
        width,
        height,
        frameId: page.id,
        fileId: prepared.file.id,
        status: "saved",
        locked: true,
        customData: kind === "photo"
          ? { gratitudeBackgroundImage: true }
          : { gratitudeTextureImage: true },
      });
      const insertAt = Math.max(
        remaining.findIndex((element) => element.id === background.id),
        kind === "texture"
          ? remaining.findIndex((element) => element.id === getBoardBackgroundImage(remaining)?.id)
          : -1,
      ) + 1;
      remaining.splice(insertAt, 0, image);
      api.addFiles([prepared.file]);
    }
    api.updateScene({
      elements: remaining.map((element) =>
        element.id === page.id && kind === "texture"
          ? newElementWith(element, {
              customData: { ...element.customData, gratitudeTexture: textureName },
            })
          : element,
      ),
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
  };
};
