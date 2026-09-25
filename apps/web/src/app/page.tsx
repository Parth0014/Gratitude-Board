import { ArrowDown, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="page-shell">
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label="Vision Board home">
          <Leaf size={22} aria-hidden="true" />
          vision board
        </Link>
        <span className="quiet-label">A beginning, with intention</span>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Room for possibility</p>
          <h1 id="hero-title">
            A little space for
            <br />
            <em>what matters.</em>
          </h1>
          <p className="intro">
            The places, people, and everyday moments you want to grow toward. A
            vision that feels like you, with room to change.
          </p>
          <a href="#our-approach" className="text-link">
            Start with a little reflection{' '}
            <ArrowDown size={16} aria-hidden="true" />
          </a>
          <p className="start-link">
            <Link href="/boards/new">Create vision board</Link>
          </p>
        </section>
        <section
          id="our-approach"
          className="principles"
          aria-labelledby="approach-title"
        >
          <h2 id="approach-title">Your own kind of becoming.</h2>
          <div className="principle-grid">
            <article>
              <span className="number">01</span>
              <h3>Find your meaning</h3>
              <p>
                Start with how you want life to feel. There is no perfect
                answer.
              </p>
            </article>
            <article>
              <span className="number">02</span>
              <h3>Make room for one step</h3>
              <p>
                A small, possible action can sit beside a big, beautiful idea.
              </p>
            </article>
            <article>
              <span className="number">03</span>
              <h3>Let your vision evolve</h3>
              <p>Keep what feels true. Make space for what changes.</p>
            </article>
          </div>
        </section>
      </main>
      <footer>Made for reflection. Built around you.</footer>
    </div>
  );
}
