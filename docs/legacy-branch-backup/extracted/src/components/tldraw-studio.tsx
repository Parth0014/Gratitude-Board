'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  AssetRecordType,
  Tldraw,
  createShapeId,
  toRichText,
  type Editor,
  type TLShapeId,
} from '../../.generated/tldraw-source.mjs';
import '../../.generated/tldraw-source.css';
import { photos, templates } from '@/lib/starter-content';
import { readCanvasDocument } from '@/lib/canvas-document';
import {
  readBoards,
  renameLocalBoard,
  setBoardViewMode,
  type LocalBoard,
} from '@/lib/local-boards';
import { BrandMark } from '@/components/brand-mark';
import {
  ArrowLeft,
  Hand,
  Image as ImageIcon,
  LayoutTemplate,
  MousePointer2,
  Pencil,
  Shapes,
  Type,
  Upload,
  Download,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import './tldraw-studio.css';

type Shelf = 'templates' | 'photos' | 'uploads' | 'elements' | 'text';

export function TldrawStudio({ board }: { board: LocalBoard }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [shelf, setShelf] = useState<Shelf>('templates');
  const [title, setTitle] = useState(board.title);

  async function mountEditor(instance: Editor) {
    setEditor(instance);
    const marker = `gratitude:tldraw-migrated:${board.id}`;
    if (window.localStorage.getItem(marker)) return;
    const document = await readCanvasDocument(board.id);
    if (instance.getCurrentPageShapes().length > 0) {
      window.localStorage.setItem(marker, '1');
      return;
    }
    if (document?.items.length) {
      for (const item of document.items) {
        if (item.kind === 'image' && item.src) {
          const assetId = AssetRecordType.createId();
          instance.createAssets([
            {
              id: assetId,
              type: 'image',
              typeName: 'asset',
              props: {
                name: 'Board image',
                src: item.src,
                w: item.width,
                h: item.height,
                mimeType: 'image/jpeg',
                isAnimated: false,
              },
              meta: {},
            },
          ]);
          instance.createShape({
            id: createShapeId(item.id.slice(6)),
            type: 'image',
            x: item.x,
            y: item.y,
            rotation: (item.angle * Math.PI) / 180,
            props: { assetId, w: item.width, h: item.height },
          });
        } else if (item.kind === 'text') {
          instance.createShape({
            id: createShapeId(item.id.slice(6)),
            type: 'text',
            x: item.x,
            y: item.y,
            rotation: (item.angle * Math.PI) / 180,
            props: { richText: toRichText(item.text ?? '') },
          });
        }
      }
    } else if (board.aspirations.length) {
      board.aspirations.forEach((aspiration, index) => {
        const photo = photos.find((item) => item.id === aspiration.photoId);
        if (photo)
          addPhotoToEditor(
            instance,
            photo,
            {
              x: (index % 2) * 260 - 130,
              y: Math.floor(index / 2) * 190 - 95,
            },
            createShapeId(aspiration.shapeId.slice(6)),
          );
      });
    }
    window.localStorage.setItem(marker, '1');
    if (instance.getCurrentPageShapes().length) instance.zoomToFit();
  }

  function saveTitle() {
    if (!title.trim() || title.trim() === board.title) return;
    const current = readBoards(window.localStorage).find(
      (item) => item.id === board.id,
    );
    if (current) renameLocalBoard(window.localStorage, current, title.trim());
  }

  async function exportPng() {
    if (!editor || !editor.getCurrentPageShapes().length) return;
    const { blob } = await editor.toImage(editor.getCurrentPageShapes(), {
      format: 'png',
      background: true,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.trim() || 'vision-board'}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function addPhoto(photo: (typeof photos)[number], offset = { x: 0, y: 0 }) {
    if (!editor) return;
    addPhotoToEditor(editor, photo, offset);
  }

  function addPhotoToEditor(
    instance: Editor,
    photo: (typeof photos)[number],
    offset = { x: 0, y: 0 },
    shapeId?: TLShapeId,
  ) {
    const assetId = AssetRecordType.createId();
    instance.createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: {
          name: `${photo.id}.jpg`,
          src: photo.src,
          w: photo.width,
          h: photo.height,
          mimeType: 'image/jpeg',
          isAnimated: false,
        },
        meta: {},
      },
    ]);
    const center = instance.getViewportPageBounds().center;
    const width = 240;
    const height = (width * photo.height) / photo.width;
    instance.createShape({
      ...(shapeId ? { id: shapeId } : {}),
      type: 'image',
      x: center.x - width / 2 + offset.x,
      y: center.y - height / 2 + offset.y,
      props: { assetId, w: width, h: height },
    });
    instance.setCurrentTool('select');
  }

  function addTemplate(template: (typeof templates)[number]) {
    template.photoIds.forEach((id, index) => {
      const photo = photos.find((item) => item.id === id);
      if (photo)
        addPhoto(photo, {
          x: (index % 2) * 260 - 130,
          y: Math.floor(index / 2) * 190 - 95,
        });
    });
    setShelf('photos');
  }

  return (
    <main className="preview-studio">
      <header className="preview-topbar">
        <Link
          href="/boards"
          className="preview-back"
          aria-label="Back to boards"
        >
          <ArrowLeft size={20} />
        </Link>
        <BrandMark />
        <span className="preview-brand">Gratitude Studio</span>
        <span className="preview-divider" />
        <input
          aria-label="Board title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={saveTitle}
        />
        <span className="preview-badge">Saved in this browser</span>
        <button
          className="preview-top-action"
          onClick={() =>
            setBoardViewMode(
              window.localStorage,
              readBoards(window.localStorage).find(
                (item) => item.id === board.id,
              ) ?? board,
              'guided',
            )
          }
        >
          Guided view
        </button>
        <button className="preview-top-action" onClick={() => void exportPng()}>
          <Download size={16} /> Export PNG
        </button>
      </header>
      <div className="preview-body">
        <nav className="preview-rail" aria-label="Add to board">
          {(
            [
              ['templates', LayoutTemplate, 'Templates'],
              ['photos', ImageIcon, 'Photos'],
              ['uploads', Upload, 'Uploads'],
              ['elements', Shapes, 'Elements'],
              ['text', Type, 'Text'],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              aria-current={shelf === id ? 'page' : undefined}
              onClick={() => setShelf(id)}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <aside className="preview-shelf">
          <h2>{shelf.charAt(0).toUpperCase() + shelf.slice(1)}</h2>
          <p>
            {shelf === 'templates'
              ? 'Start with a visual direction, then make it yours.'
              : 'Click an item to add it to your board.'}
          </p>
          {shelf === 'templates' && (
            <div className="preview-card-list">
              {templates.map((template) => (
                <button key={template.id} onClick={() => addTemplate(template)}>
                  <span className="preview-template-images">
                    {template.photoIds.slice(0, 3).map((id) => (
                      <Image
                        key={id}
                        src={
                          photos.find((photo) => photo.id === id)?.src ??
                          '/photos/home.jpg'
                        }
                        alt=""
                        width={100}
                        height={78}
                      />
                    ))}
                  </span>
                  <strong>{template.title}</strong>
                  <small>{template.intro}</small>
                </button>
              ))}
            </div>
          )}
          {shelf === 'photos' && (
            <div className="preview-photo-grid">
              {photos.map((photo) => (
                <button key={photo.id} onClick={() => addPhoto(photo)}>
                  <Image src={photo.src} alt="" width={140} height={95} />
                  <span>{photo.title}</span>
                </button>
              ))}
            </div>
          )}
          {shelf === 'uploads' && (
            <label className="preview-upload">
              Upload photos
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(event) => {
                  if (editor && event.target.files)
                    void editor.putExternalContent({
                      type: 'files',
                      files: Array.from(event.target.files),
                      point: editor.getViewportPageBounds().center,
                    });
                  event.target.value = '';
                }}
              />
            </label>
          )}
          {shelf === 'elements' && (
            <div className="preview-action-list">
              <button onClick={() => editor?.setCurrentTool('geo')}>
                Add a shape
              </button>
              <button onClick={() => editor?.setCurrentTool('draw')}>
                Draw freely
              </button>
            </div>
          )}
          {shelf === 'text' && (
            <div className="preview-action-list">
              <button onClick={() => editor?.setCurrentTool('text')}>
                Add text
              </button>
              <p>Click the board to place a text box.</p>
            </div>
          )}
        </aside>
        <section className="preview-workspace" aria-label="Board canvas">
          <div className="preview-canvas">
            <Tldraw
              persistenceKey={`gratitude-board:${board.id}`}
              onMount={(instance) => {
                void mountEditor(instance);
              }}
              components={{
                MenuPanel: null,
                Toolbar: null,
                PageMenu: null,
                NavigationPanel: null,
                HelpMenu: null,
              }}
            />
          </div>
          <div className="preview-bottom-bar" aria-label="Canvas tools">
            <button
              title="Select"
              onClick={() => editor?.setCurrentTool('select')}
            >
              <MousePointer2 size={18} />
            </button>
            <button title="Hand" onClick={() => editor?.setCurrentTool('hand')}>
              <Hand size={18} />
            </button>
            <button title="Draw" onClick={() => editor?.setCurrentTool('draw')}>
              <Pencil size={18} />
            </button>
            <button title="Text" onClick={() => editor?.setCurrentTool('text')}>
              <Type size={18} />
            </button>
            <span />
            <button title="Zoom out" onClick={() => editor?.zoomOut()}>
              <ZoomOut size={18} />
            </button>
            <button title="Zoom in" onClick={() => editor?.zoomIn()}>
              <ZoomIn size={18} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
