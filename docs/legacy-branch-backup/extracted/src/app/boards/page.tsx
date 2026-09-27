'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent } from 'react';
import { restoreLocalBoard } from '@/lib/local-boards';
import { useLocalBoards } from '@/lib/use-local-boards';
import { BrandMark } from '@/components/brand-mark';

export default function BoardsPage() {
  const router = useRouter();
  const [importError, setImportError] = useState<string | null>(null);
  const { boards, error } = useLocalBoards();
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 25_000_000)
        throw new Error('This backup is too large to import here.');
      const payload: unknown = JSON.parse(await file.text());
      if (
        !payload ||
        typeof payload !== 'object' ||
        !('format' in payload) ||
        payload.format !== 'vision-board-backup' ||
        !('version' in payload) ||
        (payload.version !== 1 && payload.version !== 2) ||
        !('board' in payload) ||
        !('snapshot' in payload)
      )
        throw new Error('This is not a supported board backup.');
      const restored = restoreLocalBoard(window.localStorage, payload.board);
      window.sessionStorage.setItem(
        `vision-board:restore:${restored.id}`,
        JSON.stringify(payload.snapshot),
      );
      router.push(`/boards/${restored.id}`);
    } catch (cause) {
      setImportError(
        cause instanceof Error
          ? cause.message
          : 'Could not import this backup.',
      );
    } finally {
      event.target.value = '';
    }
  }
  return (
    <main id="main" className="workspace-page">
      <header className="workspace-header">
        <Link href="/" className="wordmark">
          <BrandMark className="brand-mark" />
          vision board
        </Link>
        <span>Saved in this browser</span>
      </header>
      <div className="workspace-intro">
        <p className="eyebrow">Your space</p>
        <h1>Your boards</h1>
        <p>Return to an idea whenever it feels right.</p>
        {boards.length > 0 ? (
          <Link className="primary-action" href={`/boards/${boards[0]!.id}`}>
            Continue where you left off
          </Link>
        ) : (
          <Link className="primary-action" href="/boards/new">
            Create vision board
          </Link>
        )}
      </div>
      {error ? (
        <p role="alert" className="error-banner">
          {error}
        </p>
      ) : (
        <section aria-label="Saved boards" className="saved-boards">
          <h2>Continue a board</h2>
          {boards.length === 0 ? (
            <Link href="/boards/new" className="sample-board">
              <span className="template-collage" aria-hidden="true">
                <Image src="/photos/home.jpg" alt="" width={180} height={120} />
                <Image
                  src="/photos/garden.jpg"
                  alt=""
                  width={180}
                  height={120}
                />
                <Image
                  src="/photos/people.jpg"
                  alt=""
                  width={180}
                  height={120}
                />
                <Image
                  src="/photos/mountain.jpg"
                  alt=""
                  width={180}
                  height={120}
                />
              </span>
              <strong>See what your first board could look like</strong>
              <span>Start with an example and make every piece your own.</span>
            </Link>
          ) : (
            <>
              <Link href="/boards/new" className="new-board-link">
                Create another board
              </Link>
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
            </>
          )}
        </section>
      )}
      <div className="import-backup">
        <label htmlFor="backup-file">Have a board backup?</label>
        <input
          id="backup-file"
          type="file"
          accept="application/json,.json"
          onChange={(event) => void importBackup(event)}
        />
        <p>
          Importing creates a separate restored board. Your current boards stay
          here.
        </p>
        {importError && (
          <p role="alert" className="error-banner">
            {importError}
          </p>
        )}
      </div>
    </main>
  );
}
