'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Post = { slug: string; title: string; excerpt: string; content: string; published_at: string };

function isPost(value: unknown): value is Post {
  return typeof value === 'object' && value !== null
    && 'slug' in value && typeof value.slug === 'string'
    && 'title' in value && typeof value.title === 'string'
    && 'excerpt' in value && typeof value.excerpt === 'string'
    && 'content' in value && typeof value.content === 'string'
    && 'published_at' in value && typeof value.published_at === 'string';
}

function postsFrom(value: unknown): Post[] {
  if (typeof value !== 'object' || value === null || !('posts' in value) || !Array.isArray(value.posts)) return [];
  return value.posts.filter(isPost);
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    fetch('https://api.yash0.in/posts')
      .then(async (response): Promise<unknown> => response.ok ? response.json() : { posts: [] })
      .then((data) => { if (live) { setPosts(postsFrom(data)); setLoading(false); } })
      .catch(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);
  return (
    <main className="blog-shell">
      <div className="eyebrow"><span className="status-dot" /> writing / soon</div>
      <h1>Things I’m figuring out.</h1>
      <p className="blog-shell__lede">
        A place for build notes, experiments, and the occasional opinion about software that should have been simpler.
      </p>
      {loading ? (
        <div className="blog-placeholder">
          <span className="blog-placeholder__index">··</span>
          <div><p className="blog-placeholder__title">Loading posts…</p></div>
        </div>
      ) : posts.length ? (
        <div className="blog-posts">
          {posts.map((post, index) => (
            <article className="blog-post" key={post.slug}>
              <span className="blog-placeholder__index">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <div className="blog-post__content" dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
              <span className="blog-post__date">
                {post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <div className="blog-placeholder">
          <span className="blog-placeholder__index">01</span>
          <div>
            <p className="blog-placeholder__title">The first post is still compiling.</p>
            <p className="blog-placeholder__copy">For now, the product docs are the best window into what I’m building.</p>
          </div>
          <Link href="/docs" aria-label="Go to docs">→</Link>
        </div>
      )}
      <Link href="/" className="back-link">← back to yash0.in</Link>
    </main>
  );
}
