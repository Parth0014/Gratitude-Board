'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Tldraw,
  createShapeId,
  toRichText,
  type Editor,
  type TLShapeId,
} from 'tldraw';
import 'tldraw/tldraw.css';
import {
  addAspiration,
  saveAspiration,
  type LocalAspiration,
  type LocalBoard,
} from '@/lib/local-boards';

const licenseKey = process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY;
const sceneIcons: Record<string, string> = {
  'A slow morning': '☀️',
  'A table together': '🍊',
  'The open road': '🌄',
  'A place of my own': '🏡',
  'Making something': '🎨',
  'A moment outdoors': '🌲',
};
function shapeLabel(item: LocalAspiration, title = item.title) {
  const icon = item.meaning.futureScene
    ? sceneIcons[item.meaning.futureScene]
    : undefined;
  return icon ? `${icon}\n${title}` : title;
}

function MeaningEditor({
  board,
  aspiration,
  onSaved,
}: {
  board: LocalBoard;
  aspiration: LocalAspiration;
  onSaved: (title: string) => void;
}) {
  const [title, setTitle] = useState(aspiration.title);
  const [meaning, setMeaning] = useState(aspiration.meaning.meaning ?? '');
  const [nextStep, setNextStep] = useState(aspiration.meaning.nextStep ?? '');
  const [status, setStatus] = useState(aspiration.status);
  const [error, setError] = useState<string | null>(null);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      saveAspiration(window.localStorage, board, aspiration.id, {
        title,
        status,
        meaning: { meaning, nextStep },
      });
      setError(null);
      onSaved(title.trim());
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not save this aspiration.',
      );
    }
  }

  return (
    <form className="meaning-form" onSubmit={save}>
      <h3>What this means to you</h3>
      <label htmlFor="aspiration-title">Aspiration</label>
      <input
        id="aspiration-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={160}
        required
      />
      <label htmlFor="aspiration-meaning">
        Why this matters <span>(optional)</span>
      </label>
      <textarea
        id="aspiration-meaning"
        value={meaning}
        onChange={(event) => setMeaning(event.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="What does this represent in your life?"
      />
      <label htmlFor="aspiration-step">
        One small next step <span>(optional)</span>
      </label>
      <textarea
        id="aspiration-step"
        value={nextStep}
        onChange={(event) => setNextStep(event.target.value)}
        maxLength={500}
        rows={2}
      />
      <label htmlFor="aspiration-status">Where it stands</label>
      <select
        id="aspiration-status"
        value={status}
        onChange={(event) =>
          setStatus(event.target.value as LocalAspiration['status'])
        }
      >
        <option value="exploring">Exploring</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="evolving">Evolving</option>
        <option value="completed">Completed</option>
        <option value="released">Released</option>
      </select>
      <button type="submit">Save meaning</button>
      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}
    </form>
  );
}

export default function BoardEditor({ board }: { board: LocalBoard }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const licensedOrLocal =
    Boolean(licenseKey) ||
    ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

  useEffect(() => {
    if (!editor) return;
    const updateSelection = () =>
      setSelectedShapeId(editor.getSelectedShapeIds()[0] ?? null);
    return editor.store.listen(updateSelection, { scope: 'session' });
  }, [editor]);

  const onMount = useCallback(
    (instance: Editor) => {
      board.aspirations.forEach((item, index) => {
        const id = item.shapeId as TLShapeId;
        if (!instance.getShape(id))
          instance.createShape({
            id,
            type: 'geo',
            x: index * 250,
            y: 0,
            props: {
              geo: 'rectangle',
              w: 220,
              h: 130,
              fill: 'semi',
              color: 'light-blue',
              richText: toRichText(shapeLabel(item)),
            },
          });
      });
      setEditor(instance);
      setSelectedShapeId(instance.getSelectedShapeIds()[0] ?? null);
    },
    [board.aspirations],
  );
  const selected = board.aspirations.find(
    (item) => item.shapeId === selectedShapeId,
  );

  function add() {
    if (!editor) return;
    const shapeId = createShapeId();
    const camera = editor.getViewportPageBounds();
    editor.createShape({
      id: shapeId,
      type: 'geo',
      x: camera.midX - 110,
      y: camera.midY - 65,
      props: {
        geo: 'rectangle',
        w: 220,
        h: 130,
        fill: 'semi',
        color: 'light-blue',
        richText: toRichText('New aspiration'),
      },
    });
    editor.select(shapeId);
    try {
      addAspiration(window.localStorage, board, shapeId);
      setError(null);
      setNotice('Aspiration added. Add a few words when you are ready.');
    } catch (cause) {
      editor.deleteShapes([shapeId]);
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not save the aspiration.',
      );
    }
  }

  function select(item: LocalAspiration) {
    if (editor?.getShape(item.shapeId as TLShapeId)) {
      editor.select(item.shapeId as TLShapeId);
      editor.zoomToSelection();
      setError(null);
    } else {
      setSelectedShapeId(item.shapeId);
      setError(
        'This aspiration is no longer on the canvas. Its meaning is still saved below.',
      );
    }
  }

  if (!licensedOrLocal)
    return (
      <div className="editor-loading" role="alert">
        A tldraw license key is required to use the editor on this host.
      </div>
    );

  return (
    <div className="editor-layout">
      <section className="canvas-panel" aria-label="Vision board canvas">
        <Tldraw
          persistenceKey={`vision-board:${board.id}`}
          {...(licenseKey ? { licenseKey } : {})}
          onMount={onMount}
        />
      </section>
      <aside className="editor-sidebar" aria-label="Board aspirations">
        <p className="eyebrow">Your direction</p>
        <h2>Make it yours</h2>
        <p>
          Move things around on the canvas. Add an aspiration when an image or
          idea means something more.
        </p>
        <details className="canvas-help">
          <summary>How do I use this canvas?</summary>
          <p>
            Click Add aspiration to place an idea. Drag it to move it. Click a
            tool in the left toolbar to draw or add text. Select an aspiration
            here to edit its meaning. Your work saves automatically in this
            browser.
          </p>
        </details>
        <button
          type="button"
          className="primary-action"
          onClick={add}
          disabled={!editor}
        >
          Add aspiration
        </button>
        <p className="storage-note">
          Canvas and notes stay in this browser. They are not synced or backed
          up yet.
        </p>
        {error && (
          <p role="alert" className="error-banner">
            {error}
          </p>
        )}
        {notice && <p role="status">{notice}</p>}
        <section aria-label="Aspiration list" className="aspiration-list">
          <h3>Aspirations</h3>
          {board.aspirations.length === 0 ? (
            <p>No aspirations yet. You can also sketch freely.</p>
          ) : (
            <ul>
              {board.aspirations.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={selected?.id === item.id}
                    onClick={() => select(item)}
                  >
                    {item.title}
                    <small>{item.status}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        {selected && (
          <MeaningEditor
            key={selected.id}
            board={board}
            aspiration={selected}
            onSaved={(title) => {
              if (editor)
                editor.updateShape({
                  id: selected.shapeId as TLShapeId,
                  type: 'geo',
                  props: { richText: toRichText(shapeLabel(selected, title)) },
                });
              setNotice('Meaning saved in this browser.');
            }}
          />
        )}
      </aside>
    </div>
  );
}
