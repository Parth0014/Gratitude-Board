import {
  readVisionBoardDocument,
  VISION_DOCUMENT_STORAGE_KEY,
} from "./document";

import type { VisionBoardDocument } from "./model";

/** Storage boundary for the canonical product document. */
export class VisionDocumentRepository {
  constructor(private readonly storage: Storage) {}

  load(): VisionBoardDocument | null {
    try {
      return readVisionBoardDocument(
        this.storage.getItem(VISION_DOCUMENT_STORAGE_KEY),
      );
    } catch {
      return null;
    }
  }

  save(document: VisionBoardDocument): boolean {
    try {
      this.storage.setItem(
        VISION_DOCUMENT_STORAGE_KEY,
        JSON.stringify(document),
      );
      return true;
    } catch {
      return false;
    }
  }
}
