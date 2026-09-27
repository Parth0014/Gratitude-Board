'use client';

import type { LocalBoard } from '@/lib/local-boards';
import { TldrawStudio } from './tldraw-studio';

export default function TldrawBoardEditor({ board }: { board: LocalBoard }) {
  return <TldrawStudio board={board} />;
}
