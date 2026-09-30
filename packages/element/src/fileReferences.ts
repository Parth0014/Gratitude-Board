import type { ExcalidrawElement, FileId } from "./types";

/** All binary dependencies needed to reopen and edit an image, not just render it. */
export const collectReferencedFileIds = (
  elements: readonly ExcalidrawElement[],
  { includeDeleted = false }: { includeDeleted?: boolean } = {},
): FileId[] => {
  const ids = new Set<FileId>();
  for (const element of elements) {
    if (element.type !== "image" || (element.isDeleted && !includeDeleted)) {
      continue;
    }
    // Compatibility with the existing photo-edit metadata stored in scenes.
    const edits = element.customData?.gratitudeImageEdits;
    const references =
      edits && typeof edits === "object"
        ? (edits as { originalFileId?: unknown; derivativeFileId?: unknown })
        : undefined;
    for (const id of [
      element.fileId,
      references?.originalFileId,
      references?.derivativeFileId,
    ]) {
      if (typeof id === "string" && id.length > 0) {
        ids.add(id as FileId);
      }
    }
  }
  return [...ids];
};
