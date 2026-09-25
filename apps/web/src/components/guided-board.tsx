'use client';

import { useState } from 'react';
import {
  addAspiration,
  saveAspiration,
  updateLocalBoard,
  type LocalBoard,
} from '@/lib/local-boards';

const feelings = [
  { name: 'Calm', icon: '🌿', hint: 'More room to breathe' },
  { name: 'Connection', icon: '🤝', hint: 'Closer to my people' },
  { name: 'Adventure', icon: '⛰️', hint: 'More of the unknown' },
  { name: 'Growth', icon: '🌱', hint: 'Becoming someone new' },
  { name: 'Joy', icon: '☀️', hint: 'Noticing the good' },
  { name: 'Freedom', icon: '🕊️', hint: 'Living on my own terms' },
] as const;

const scenes = [
  {
    title: 'A slow morning',
    icon: '☀️',
    detail: 'A quiet start with time to think',
    tone: 'sunrise',
  },
  {
    title: 'A table together',
    icon: '🍊',
    detail: 'The people I love, gathered close',
    tone: 'gather',
  },
  {
    title: 'The open road',
    icon: '🌄',
    detail: 'Space to explore somewhere new',
    tone: 'open',
  },
  {
    title: 'A place of my own',
    icon: '🏡',
    detail: 'A home that feels like me',
    tone: 'home',
  },
  {
    title: 'Making something',
    icon: '🎨',
    detail: 'Time and courage to create',
    tone: 'create',
  },
  {
    title: 'A moment outdoors',
    icon: '🌲',
    detail: 'Feeling grounded in nature',
    tone: 'nature',
  },
] as const;

export default function GuidedBoard({
  board,
  onOpenCanvas,
}: {
  board: LocalBoard;
  onOpenCanvas: () => void;
}) {
  const [stage, setStage] = useState(() => (board.aspirations.length ? 3 : 0));
  const [feeling, setFeeling] = useState(board.themes[0] ?? '');
  const [sceneIndex, setSceneIndex] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [meaning, setMeaning] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scene = sceneIndex === null ? null : scenes[sceneIndex];

  function chooseFeeling() {
    if (!feeling) {
      setError('Choose a feeling to begin.');
      return;
    }
    try {
      if (board.themes[0] !== feeling)
        updateLocalBoard(
          window.localStorage,
          board.id,
          board.revision,
          (current) => ({ ...current, themes: [feeling] }),
        );
      setError(null);
      setStage(1);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not save your choice.',
      );
    }
  }

  function placeTile() {
    if (!title.trim()) {
      setError('Give your first tile a name.');
      return;
    }
    try {
      const withItem = editingId
        ? board
        : addAspiration(
            window.localStorage,
            board,
            `shape:${crypto.randomUUID()}`,
          );
      const item = editingId
        ? board.aspirations.find((aspiration) => aspiration.id === editingId)
        : withItem.aspirations.at(-1);
      if (!item)
        throw new Error(
          'This piece is no longer on your board. Reload and try again.',
        );
      saveAspiration(window.localStorage, withItem, item.id, {
        title: title.trim(),
        status: item.status,
        meaning: {
          desiredFeeling: feeling,
          futureScene: scene?.title,
          meaning,
        },
      });
      setError(null);
      setEditingId(null);
      setStage(3);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not save your board.',
      );
    }
  }

  function anotherTile() {
    setEditingId(null);
    setSceneIndex(null);
    setTitle('');
    setMeaning('');
    setError(null);
    setStage(1);
  }

  function editTile(id: string) {
    const item = board.aspirations.find((aspiration) => aspiration.id === id);
    if (!item) return;
    setEditingId(id);
    setFeeling(item.meaning.desiredFeeling ?? board.themes[0] ?? '');
    const index = scenes.findIndex(
      (scene) => scene.title === item.meaning.futureScene,
    );
    setSceneIndex(index >= 0 ? index : null);
    setTitle(item.title);
    setMeaning(item.meaning.meaning ?? '');
    setError(null);
    setStage(2);
  }

  return (
    <section className="journey" aria-label="Guided vision board creation">
      {stage < 3 && (
        <div className="journey-top">
          <span>YOUR FIRST VISION BOARD</span>
          <span>{stage + 1} of 3</span>
        </div>
      )}
      {stage === 0 && (
        <div className="journey-stage">
          <p className="eyebrow">Begin with a feeling</p>
          <h2>What do you want more of?</h2>
          <p className="journey-lead">
            A vision board is a picture of the life you want to move toward. You
            do not need a perfect plan. Notice what pulls at you today.
          </p>
          <div
            className="feeling-grid"
            role="group"
            aria-label="Choose a feeling"
          >
            {feelings.map((item) => (
              <button
                type="button"
                key={item.name}
                className="feeling-card"
                aria-pressed={feeling === item.name}
                onClick={() => {
                  setFeeling(item.name);
                  setError(null);
                }}
              >
                <span aria-hidden="true">{item.icon}</span>
                <strong>{item.name}</strong>
                <small>{item.hint}</small>
              </button>
            ))}
          </div>
          <p className="journey-reassurance">
            This is a starting point, not a promise. You can change direction
            later.
          </p>
          {error && (
            <p role="alert" className="error-banner">
              {error}
            </p>
          )}
          <button
            type="button"
            className="primary-action"
            onClick={chooseFeeling}
          >
            Continue with {feeling || 'a feeling'}
          </button>
        </div>
      )}
      {stage === 1 && (
        <div className="journey-stage">
          <p className="eyebrow">Give it a picture</p>
          <h2>Imagine one moment of {feeling.toLowerCase()}.</h2>
          <p className="journey-lead">
            Choose a scene that feels close to your life. It is only a starting
            image; you can replace it with your own photos and words on the
            canvas.
          </p>
          <div className="scene-grid" role="group" aria-label="Choose a scene">
            {scenes.map((item, index) => (
              <button
                type="button"
                key={item.title}
                className={`scene-card scene-${item.tone}`}
                aria-pressed={sceneIndex === index}
                onClick={() => {
                  setSceneIndex(index);
                  setTitle(item.title);
                  setError(null);
                }}
              >
                <span className="scene-art" aria-hidden="true">
                  {item.icon}
                </span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </button>
            ))}
          </div>
          {error && (
            <p role="alert" className="error-banner">
              {error}
            </p>
          )}
          <div className="journey-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={() => setStage(0)}
            >
              Back
            </button>
            <button
              type="button"
              className="primary-action"
              onClick={() => {
                if (sceneIndex === null) {
                  setError('Choose one scene to place on your board.');
                  return;
                }
                setStage(2);
              }}
            >
              Use this moment
            </button>
          </div>
        </div>
      )}
      {stage === 2 && (
        <div className="journey-stage journey-compose">
          <div>
            <p className="eyebrow">Make it yours</p>
            <h2>
              {editingId
                ? 'Make this piece yours again.'
                : 'This is your first piece.'}
            </h2>
            <p className="journey-lead">
              A vision board becomes personal when a picture means something to
              you. Name this moment in your own words. Add a note only if you
              want to.
            </p>
            <label htmlFor="tile-title">Name this piece</label>
            <input
              id="tile-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              placeholder="The feeling I want to remember"
            />
            <label htmlFor="tile-meaning">
              What does it mean to you? <span>(optional)</span>
            </label>
            <textarea
              id="tile-meaning"
              value={meaning}
              onChange={(event) => setMeaning(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="A small thought, a memory, or why it matters"
            />
            <p className="field-help">
              Your note stays private in this browser. You can return to it
              later.
            </p>
            {error && (
              <p role="alert" className="error-banner">
                {error}
              </p>
            )}
            <div className="journey-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => setStage(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="primary-action"
                onClick={placeTile}
              >
                {editingId ? 'Save changes' : 'Place on my board'}
              </button>
            </div>
          </div>
          <div
            className={`tile-preview scene-${scene?.tone ?? 'sunrise'}`}
            aria-label="Preview of your first board piece"
          >
            <span aria-hidden="true">{scene?.icon}</span>
            <p>{feeling}</p>
            <strong>{title || scene?.title}</strong>
            <small>{scene?.detail}</small>
          </div>
        </div>
      )}
      {stage === 3 && (
        <div className="journey-stage">
          <p className="eyebrow">Your board is taking shape</p>
          <h2>Here is what you have started.</h2>
          <p className="journey-lead">
            These are your first visual reminders. A board grows by collecting
            moments that feel true to you; you do not have to finish it today.
          </p>
          <div className="board-gallery">
            {board.aspirations.map((item) => (
              <article
                className={`gallery-tile scene-${scenes.find((scene) => scene.title === item.meaning.futureScene)?.tone ?? 'sunrise'}`}
                key={item.id}
              >
                <span aria-hidden="true">
                  {scenes.find(
                    (scene) => scene.title === item.meaning.futureScene,
                  )?.icon ?? '✨'}
                </span>
                <small>{item.meaning.desiredFeeling}</small>
                <h3>{item.title}</h3>
                {item.meaning.meaning && <p>{item.meaning.meaning}</p>}
                <button
                  type="button"
                  className="edit-idea"
                  onClick={() => editTile(item.id)}
                >
                  Edit this piece
                </button>
              </article>
            ))}
          </div>
          <div className="next-guide">
            <strong>Ready to make it visual?</strong>
            <p>
              Open the canvas to move your pieces, add your own images or text,
              and arrange what matters. Your ideas and notes come with you.
            </p>
          </div>
          <div className="journey-actions">
            <button
              type="button"
              className="primary-action"
              onClick={onOpenCanvas}
            >
              Open my canvas
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={anotherTile}
            >
              Add another moment
            </button>
          </div>
          <p className="storage-note">
            Saved in this browser only. There is no account or backup yet.
          </p>
        </div>
      )}
    </section>
  );
}
