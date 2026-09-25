'use client';

import Link from 'next/link';
import { useLocalBoards } from '@/lib/use-local-boards';

export default function BoardsPage() {
  const { boards, error } = useLocalBoards();
  return (
    <main id="main" className="workspace-page">
      <header className="workspace-header">
        <Link href="/" className="wordmark">
          vision board
        </Link>
        <span>Saved in this browser</span>
      </header>
      <div className="workspace-intro">
        <p className="eyebrow">Your space</p>
        <h1>Your boards</h1>
        <p>Return to an idea whenever it feels right.</p>
        <Link className="primary-action" href="/boards/new">
          Create vision board
        </Link>
      </div>
      {error ? (
        <p role="alert" className="error-banner">
          {error}
        </p>
      ) : (
        <section aria-label="Saved boards" className="saved-boards">
          <h2>Continue a board</h2>
          {boards.length === 0 ? (
            <p>No boards yet. Create one when you are ready.</p>
          ) : (
            <ul>
              {boards.map((board) => (
                <li key={board.id}>
                  <Link href={`/boards/${board.id}`}>
                    <strong>{board.title}</strong>
                    <span>
                      {board.aspirations.length} pieces · Edited{' '}
                      {new Date(board.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
