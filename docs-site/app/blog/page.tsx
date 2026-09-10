import Link from 'next/link';

export const metadata = {
  title: 'Writing',
  description: 'Notes, experiments, and things learned while building.',
};

export default function BlogPage() {
  return (
    <main className="blog-shell">
      <div className="eyebrow"><span className="status-dot" /> writing / soon</div>
      <h1>Things I’m figuring out.</h1>
      <p className="blog-shell__lede">
        A place for build notes, experiments, and the occasional opinion about software that should have been simpler.
      </p>
      <div className="blog-placeholder">
        <span className="blog-placeholder__index">01</span>
        <div>
          <p className="blog-placeholder__title">The first post is still compiling.</p>
          <p className="blog-placeholder__copy">For now, the product docs are the best window into what I’m building.</p>
        </div>
        <Link href="/docs" aria-label="Go to docs">→</Link>
      </div>
      <Link href="/" className="back-link">← back to yash0.in</Link>
    </main>
  );
}
