import Image from 'next/image';
import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';

export default function Home() {
  return (
    <div className="page-shell">
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label="Vision Board home">
          <BrandMark className="brand-mark" />
          vision board
        </Link>
        <span className="quiet-label">A beginning, with intention</span>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Room for possibility</p>
            <h1 id="hero-title">
              A little space for
              <br />
              <em>what matters.</em>
            </h1>
            <p className="intro">
              The places, people, and everyday moments you want to grow toward.
              A vision that feels like you, with room to change.
            </p>
            <p className="start-link">
              <Link href="/boards/new">Create vision board</Link>
            </p>
            <p className="hero-reassurance">
              Start with a spark. Change anything later.
            </p>
          </div>
          <div className="hero-preview" aria-hidden="true">
            <div className="hero-preview-heading">
              <BrandMark className="hero-preview-mark" />
              <span>A board for becoming</span>
            </div>
            <div className="hero-preview-grid">
              <div className="hero-preview-photo hero-preview-photo-main">
                <Image src="/photos/garden.jpg" alt="" fill sizes="240px" />
              </div>
              <div className="hero-preview-note">
                More of what makes me feel alive.
              </div>
              <div className="hero-preview-photo hero-preview-photo-small">
                <Image src="/photos/people.jpg" alt="" fill sizes="180px" />
              </div>
            </div>
            <span className="hero-preview-footer">
              a vision can begin softly ✦
            </span>
          </div>
        </section>
        <section
          id="our-approach"
          className="principles"
          aria-labelledby="approach-title"
        >
          <h2 id="approach-title">Your own kind of becoming.</h2>
          <p>
            Start with a little reflection. Your board can change as you do.
          </p>
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
