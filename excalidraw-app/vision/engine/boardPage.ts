import {
  newElement,
  newElementWith,
  newFrameElement,
} from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";

export const PAGE_WIDTH = 1200;
export const PAGE_HEIGHT = 960;

export const getBoardPage = (elements: readonly ExcalidrawElement[]) =>
  elements.find(
    (element) =>
      element.type === "frame" &&
      element.customData?.gratitudePage === true &&
      !element.isDeleted,
  );

export const getBoardBackground = (elements: readonly ExcalidrawElement[]) => {
  const page = getBoardPage(elements);
  return elements.find(
    (element) =>
      page &&
      element.type === "rectangle" &&
      element.frameId === page.id &&
      !element.isDeleted &&
      (element.customData?.gratitudeBackground === true ||
        (element.x === page.x &&
          element.y === page.y &&
          element.width === page.width &&
          element.height === page.height)),
  );
};

export const getBoardBackgroundImage = (
  elements: readonly ExcalidrawElement[],
) =>
  elements.find(
    (element) =>
      element.type === "image" &&
      element.customData?.gratitudeBackgroundImage === true &&
      !element.isDeleted,
  );

export const getBoardTextureImage = (elements: readonly ExcalidrawElement[]) =>
  elements.find(
    (element) =>
      element.type === "image" &&
      element.customData?.gratitudeTextureImage === true &&
      !element.isDeleted,
  );

const createBoardBackground = (page: ExcalidrawElement, color = "#ffffff") =>
  newElement({
    type: "rectangle",
    x: page.x,
    y: page.y,
    width: page.width,
    height: page.height,
    frameId: page.id,
    locked: true,
    strokeColor: "transparent",
    backgroundColor: color,
    fillStyle: "solid",
    roughness: 0,
    roundness: null,
    customData: { gratitudeBackground: true },
  });

export const ensureBoardPage = (elements: readonly ExcalidrawElement[]) => {
  const existingPage = getBoardPage(elements);
  if (existingPage) {
    const background = getBoardBackground(elements);
    const backgroundImage = getBoardBackgroundImage(elements);
    const textureImage = getBoardTextureImage(elements);
    const normalized = elements.map((element) => {
      const isBoardLayer =
        element.id === existingPage.id ||
        element.id === background?.id ||
        element.id === backgroundImage?.id ||
        element.id === textureImage?.id;
      const lockedElement =
        isBoardLayer && !element.locked
          ? newElementWith(element, { locked: true })
          : element;
      if (element.id === backgroundImage?.id) {
        const scale = Math.max(
          existingPage.width / lockedElement.width,
          existingPage.height / lockedElement.height,
        );
        const width = lockedElement.width * scale;
        const height = lockedElement.height * scale;
        return newElementWith(lockedElement, {
          x: existingPage.x + (existingPage.width - width) / 2,
          y: existingPage.y + (existingPage.height - height) / 2,
          width,
          height,
        });
      }
      if (element.id === textureImage?.id) {
        return newElementWith(lockedElement, {
          x: existingPage.x,
          y: existingPage.y,
          width: existingPage.width,
          height: existingPage.height,
        });
      }
      return lockedElement;
    });
    if (!background) {
      const deletedBackground = elements.find(
        (element) => element.customData?.gratitudeBackground === true,
      );
      const pageIndex = normalized.findIndex(
        (element) => element.id === existingPage.id,
      );
      normalized.splice(
        pageIndex + 1,
        0,
        createBoardBackground(
          existingPage,
          deletedBackground?.backgroundColor || "#ffffff",
        ),
      );
    }
    return normalized;
  }

  const visible = elements.filter((element) => !element.isDeleted);
  const minX = visible.length
    ? Math.min(...visible.map((element) => element.x))
    : 0;
  const minY = visible.length
    ? Math.min(...visible.map((element) => element.y))
    : 0;
  const maxX = visible.length
    ? Math.max(...visible.map((element) => element.x + element.width))
    : PAGE_WIDTH;
  const maxY = visible.length
    ? Math.max(...visible.map((element) => element.y + element.height))
    : PAGE_HEIGHT;
  const width = visible.length
    ? Math.max(PAGE_WIDTH, maxX - minX + 120)
    : PAGE_WIDTH;
  const height = visible.length
    ? Math.max(PAGE_HEIGHT, maxY - minY + 120)
    : PAGE_HEIGHT;
  const x = visible.length ? (minX + maxX - width) / 2 : 0;
  const y = visible.length ? (minY + maxY - height) / 2 : 0;

  const page = newFrameElement({
    name: "My vision board",
    x,
    y,
    width,
    height,
    locked: true,
    customData: { gratitudePage: true },
  });
  const background = createBoardBackground(page);

  return [
    page,
    background,
    ...elements.map((element) =>
      element.isDeleted || element.frameId || element.type === "frame"
        ? element
        : newElementWith(element, { frameId: page.id }),
    ),
  ];
};
