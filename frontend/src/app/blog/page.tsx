'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, BlogPost, BlogPaginationMeta } from '@/lib/api';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState<BlogPaginationMeta | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getBlogCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // Changing category always starts back at page 1 — a stale page number
  // from a previous filter could otherwise land past the new filter's
  // last page and render nothing.
  function selectCategory(cat: string | null) {
    setActiveCategory(cat);
    setPage(1);
  }

  useEffect(() => {
    setLoading(true);
    api
      .getBlogPosts(activeCategory ?? undefined, page)
      .then((res) => {
        setPosts(res.data);
        setMeta(res.meta);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load posts.'))
      .finally(() => setLoading(false));
  }, [activeCategory, page]);

  // The large "featured" card treatment only makes sense as an entry point
  // on page 1 — repeating it on later pages would look like a duplicate,
  // disconnected highlight rather than what it actually is (just the next
  // post in the list).
  const featured = page === 1 ? posts[0] : undefined;
  const rest = page === 1 ? posts.slice(1) : posts;

  return (
    <>
      <Navbar />
      <main className="pt-[72px] min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-blue-primary font-semibold text-sm tracking-wide uppercase mb-2">Abeekey Journal</p>
        <h1 className="font-heading font-bold text-navy-primary text-4xl sm:text-5xl mb-4">
          Notes from the build
        </h1>
        <p className="text-text-soft text-lg max-w-2xl mb-10">
          Product updates, engineering notes, and field reports from delivering technology across Nigeria.
        </p>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => selectCategory(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                activeCategory === null
                  ? 'bg-navy-primary text-white'
                  : 'bg-slate-100 text-text-soft hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  activeCategory === cat
                    ? 'bg-navy-primary text-white'
                    : 'bg-slate-100 text-text-soft hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="text-text-soft text-sm">Loading posts...</p>}
        {error && <p className="text-danger text-sm">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="text-text-soft text-sm">No posts published yet — check back soon.</p>
        )}

        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid sm:grid-cols-2 gap-6 bg-white border border-slate-200 rounded-[24px] overflow-hidden mb-10 hover:border-blue-accent transition-colors"
          >
            <div
              className="aspect-[16/10] sm:aspect-auto bg-navy-primary bg-cover bg-center"
              style={featured.cover_image_url ? { backgroundImage: `url(${featured.cover_image_url})` } : undefined}
            />
            <div className="p-8 flex flex-col justify-center">
              {featured.category && (
                <span className="text-blue-primary text-xs font-semibold uppercase tracking-wide mb-3">
                  {featured.category}
                </span>
              )}
              <h2 className="font-heading font-bold text-navy-primary text-2xl mb-3 group-hover:text-blue-primary transition-colors">
                {featured.title}
              </h2>
              {featured.excerpt && <p className="text-text-soft mb-4">{featured.excerpt}</p>}
              <p className="text-text-soft text-xs">
                {featured.published_at && formatDate(featured.published_at)}
                {featured.author && ` · ${featured.author.name}`}
              </p>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white border border-slate-200 rounded-[20px] overflow-hidden hover:border-blue-accent transition-colors"
              >
                <div
                  className="aspect-[16/10] bg-navy-secondary bg-cover bg-center"
                  style={post.cover_image_url ? { backgroundImage: `url(${post.cover_image_url})` } : undefined}
                />
                <div className="p-5">
                  {post.category && (
                    <span className="text-blue-primary text-xs font-semibold uppercase tracking-wide">
                      {post.category}
                    </span>
                  )}
                  <h3 className="font-heading font-bold text-navy-primary text-lg mt-1.5 mb-2 group-hover:text-blue-primary transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && <p className="text-text-soft text-sm line-clamp-2">{post.excerpt}</p>}
                  <p className="text-text-soft text-xs mt-3">
                    {post.published_at && formatDate(post.published_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-sm text-sm font-semibold text-navy-primary border border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-accent transition-colors"
            >
              ← Previous
            </button>
            <span className="text-text-soft text-sm">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              className="px-4 py-2 rounded-sm text-sm font-semibold text-navy-primary border border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-accent transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
      </main>
      <Footer />
    </>
  );
}