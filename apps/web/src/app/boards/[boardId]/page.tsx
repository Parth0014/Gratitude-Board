import type { Metadata } from 'next';
import BoardWorkspace from '@/components/board-workspace';

export const metadata: Metadata = {
  title: 'Your board',
  robots: { index: false, follow: false },
};

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  return <BoardWorkspace boardId={boardId} />;
}
