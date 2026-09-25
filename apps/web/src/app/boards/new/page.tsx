'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createLocalBoard } from '@/lib/local-boards';

export default function ChooseModePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function begin(entryMode: 'reflect' | 'visual') {
    try {
      const board = createLocalBoard(window.localStorage, {
        title: 'My vision board',
        entryMode,
        themes: [],
      });
      router.push(`/boards/${board.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not create your board.',
      );
    }
  }

  return (
    <main id="main" className="choice-page">
      <p className="eyebrow">A space for what matters</p>
      <h1>How would you like to begin?</h1>
      <p>
        There is no right way to make a vision board. Pick the space that feels
        comfortable today.
      </p>
      <div className="mode-choices">
        <button type="button" onClick={() => begin('reflect')}>
          <span className="mode-icon" aria-hidden="true">
            🌱
          </span>
          <strong>Beginner mode</strong>
          <span>
            A thoughtful, guided start. Find a feeling, choose a scene, and
            watch your board take shape.
          </span>
          <em>Guide me in</em>
        </button>
        <button type="button" onClick={() => begin('visual')}>
          <span className="mode-icon" aria-hidden="true">
            🎨
          </span>
          <strong>Reflector · direct canvas</strong>
          <span>
            Open the creative canvas now. Arrange, draw, and add your own images
            and words.
          </span>
          <em>Open canvas</em>
        </button>
      </div>
      <p className="field-help">
        You can switch modes later. Your work stays with your board.
      </p>
      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}
    </main>
  );
}
