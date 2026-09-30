import type { ImageCrop } from "@excalidraw/element/types";

/** Preserve the normalized crop when switching between original and derivative pixels. */
export const rescaleImageCrop = (
  crop: ImageCrop | null,
  width: number,
  height: number,
): ImageCrop | null => {
  if (!crop) {
    return null;
  }
  if (crop.naturalWidth <= 0 || crop.naturalHeight <= 0) {
    return null;
  }
  const scaleX = width / crop.naturalWidth;
  const scaleY = height / crop.naturalHeight;
  return {
    x: crop.x * scaleX,
    y: crop.y * scaleY,
    width: crop.width * scaleX,
    height: crop.height * scaleY,
    naturalWidth: width,
    naturalHeight: height,
  };
};
