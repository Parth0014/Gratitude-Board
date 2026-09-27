import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="page-shell hero">
      <h1>Page not found.</h1>
      <p className="intro">This space does not exist yet.</p>
      <Link href="/">Return home</Link>
    </main>
  );
}
