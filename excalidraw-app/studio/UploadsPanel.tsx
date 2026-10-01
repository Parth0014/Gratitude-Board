import React from "react";

export interface UploadsPanelProps {
  onUploadFiles: (files: File[]) => Promise<void>;
}

/**
 * Module 4 uploads panel: pick files or drop them here. Images are inserted
 * at the board center (or into the selected layout slot) via createImage.
 */
export const UploadsPanel = ({ onUploadFiles }: UploadsPanelProps) => {
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const upload = async (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (!images.length) {
      setError("Please choose image files.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await onUploadFiles(images);
    } catch {
      setError("Upload failed. Try again with a smaller image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="uploads-panel">
      <button
        type="button"
        className={`uploads-panel__drop${dragging ? " is-dragging" : ""}`}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload([...event.dataTransfer.files]);
        }}
      >
        <span className="uploads-panel__drop-icon" aria-hidden="true">
          ↑
        </span>
        <span>
          {uploading
            ? "Adding your photos…"
            : "Drop images here, or click to browse"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-label="Upload images"
        onChange={(event) => {
          void upload([...(event.target.files ?? [])]);
          event.target.value = "";
        }}
      />
      {error && (
        <p className="studio-panel__error" role="alert">
          {error}
        </p>
      )}
      <p className="studio-panel__hint">
        Your photos stay on your device — nothing is uploaded anywhere.
      </p>
    </div>
  );
};
