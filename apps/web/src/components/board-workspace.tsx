'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { setBoardViewMode } from '@/lib/local-boards';
import { useLocalBoards } from '@/lib/use-local-boards';
import GuidedBoard from './guided-board';

const BoardEditor = dynamic(() => import('./board-editor'), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading canvas…</div>,
});

export default function BoardWorkspace({ boardId }: { boardId: string }) {
  const { boards, error } = useLocalBoards();
  const [modeError, setModeError] = useState<string | null>(null);
  const board = boards.find((item) => item.id === boardId);
  if (error)
    return (
      <main id="main" className="workspace-page">
        <p role="alert" className="error-banner">
          {error}
        </p>
        <Link href="/boards">Back to boards</Link>
      </main>
    );
  if (!board)
    return (
      <main id="main" className="workspace-page">
        <h1>Board not found</h1>
        <p>This board is not saved in this browser.</p>
        <Link href="/boards">Back to boards</Link>
      </main>
    );
  const viewMode =
    board.viewMode ?? (board.entryMode === 'reflect' ? 'guided' : 'canvas');
  function changeMode(nextMode: 'guided' | 'canvas') {
    if (!board) return;
    try {
      setBoardViewMode(window.localStorage, board, nextMode);
      setModeError(null);
    } catch (cause) {
      setModeError(
        cause instanceof Error ? cause.message : 'Could not change mode.',
      );
    }
  }
  return (
    <main id="main" className="board-workspace">
      <header className="board-header">
        <Link href="/boards">← All boards</Link>
        <div>
          <h1>{board.title}</h1>
          <span>Saved in this browser</span>
        </div>
      </header>
      <nav className="mode-switch" aria-label="Board mode">
        <button
          type="button"
          aria-current={viewMode === 'guided' ? 'page' : undefined}
          onClick={() => changeMode('guided')}
          title="Step-by-step prompts without canvas tools"
        >
          Guided mode
        </button>
        <button
          type="button"
          aria-current={viewMode === 'canvas' ? 'page' : undefined}
          onClick={() => changeMode('canvas')}
          title="Full drawing and layout tools"
        >
          Canvas mode
        </button>
      </nav>
      {modeError && (
        <p role="alert" className="error-banner">
          {modeError}
        </p>
      )}
      {viewMode === 'guided' ? (
        <GuidedBoard board={board} onOpenCanvas={() => changeMode('canvas')} />
      ) : (
        <BoardEditor key={board.id} board={board} />
      )}
    </main>
  );
}
