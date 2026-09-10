import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="docs-home">
      <div className="docs-home__glow" aria-hidden="true" />
      <div className="docs-home__inner">
        <div className="eyebrow"><span className="status-dot" /> yashas / docs</div>
        <h1>Small tools.<br /><em>Useful notes.</em></h1>
        <p className="docs-home__lede">
          The practical bits behind the things I build when software starts getting on my nerves.
          Quick starts, internals, self-hosting notes, and the rough edges included.
        </p>
        <div className="docs-home__actions">
          <Link href="/docs" className="button button--primary">Browse the toolbox <span>→</span></Link>
          <Link href="/blog" className="button button--quiet">Read the writing <span>↗</span></Link>
        </div>
        <div className="docs-home__rule" />
        <div className="docs-home__meta">
          <span>LOCAL-FIRST / OPEN-SOURCE / PERSONAL</span>
          <span>v0.0.17</span>
        </div>
      </div>
    </main>
  );
}
