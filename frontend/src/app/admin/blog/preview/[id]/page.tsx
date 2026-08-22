'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi, BlogPost, ApiError } from '@/lib/api';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

const CONTENT_CLASS =
  '[&_h2]:font-heading [&_h2]:text-navy-primary [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 ' +
  '[&_h3]:font-heading [&_h3]:text-navy-primary [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 ' +
  '[&_p]:text-text-soft [&_p]:mb-4 [&_p]:leading-relaxed ' +
  '[&_a]:text-blue-primary [&_a]:underline ' +
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-text-soft [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-text-soft [&_li]:mb-1 ' +
  '[&_img]:rounded-xl [&_img]:my-6 [&_strong]:font-semibold [&_strong]:text-navy-primary ' +
  '[&_blockquote]:border-l-4 [&_blockquote]:border-blue-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-soft';

export default function AdminBlogPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getBlogPost(Number(id))
      .then((res) => setPost(res.data))
      .catch((err) =>
        setError(
          err instanceof ApiError && err.status === 403
            ? "You don't have permission to preview posts."
            : err instanceof Error
              ? err.message
              : 'Failed to load post.'
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.push('/admin/blog')}
        className="text-sm text-blue-primary font-medium hover:underline mb-6"
      >
        ← Back to posts
      </button>

      {loading && <p className="text-text-soft text-sm">Loading preview...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      {post && (
        <article>
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                post.status === 'published' ? 'bg-success/10 text-success' : 'bg-slate-200 text-text-soft'
              }`}
            >
              {post.status === 'published' ? 'Published — this is the live version' : 'Draft — not visible to the public yet'}
            </span>
          </div>

          {post.category && (
            <span className="text-blue-primary text-xs font-semibold uppercase tracking-wide">
              {post.category}
            </span>
          )}
          <h1 className="font-heading font-bold text-navy-primary text-3xl sm:text-4xl mt-2 mb-4">
            {post.title || <span className="text-text-soft italic">Untitled post</span>}
          </h1>
          <p className="text-text-soft text-sm mb-8">
            {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
            {post.author && ` · ${post.author.name}`}
          </p>

          {post.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover_image_url} alt={post.title} className="w-full rounded-2xl mb-10 object-cover" />
          )}

          {post.content.replace(/<[^>]*>/g, '').trim() ? (
            <div className={CONTENT_CLASS} dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p className="text-text-soft italic">Nothing written yet.</p>
          )}
        </article>
      )}
    </div>
  );
}