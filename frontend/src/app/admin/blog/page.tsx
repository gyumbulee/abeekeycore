'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { adminApi, BlogPost, CreateBlogPostPayload } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<BlogPost | 'new' | null>(null);

  function reload() {
    setLoading(true);
    adminApi
      .getBlogPosts()
      .then((res) => setPosts(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load posts.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  async function handleDelete(id: number) {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const previous = posts;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    try {
      await adminApi.deleteBlogPost(id);
    } catch (err) {
      setPosts(previous);
      setError(err instanceof Error ? err.message : 'Failed to delete post.');
    }
  }

  if (editing) {
    return (
      <PostEditor
        post={editing === 'new' ? null : editing}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Blog</h1>
          <p className="text-text-soft">Manage posts published to the public site.</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
        >
          + New Post
        </button>
      </div>

      {loading && <p className="text-text-soft text-sm">Loading posts...</p>}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-text-soft text-sm">No posts yet.</p>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-slate-200 rounded-[20px] p-6 flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-navy-primary">{post.title}</p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    post.status === 'published'
                      ? 'bg-success/10 text-success'
                      : 'bg-slate-200 text-text-soft'
                  }`}
                >
                  {post.status}
                </span>
              </div>
              <p className="text-text-soft text-xs">
                {post.category && `${post.category} · `}
                {post.author?.name && `${post.author.name} · `}
                {post.published_at ? `Published ${formatDate(post.published_at)}` : `Created ${formatDate(post.created_at)}`}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href={`/admin/blog/preview/${post.id}`}
                className="text-sm font-medium text-navy-secondary hover:underline"
              >
                Preview
              </Link>
              <button
                onClick={() => setEditing(post)}
                className="text-sm font-medium text-blue-primary hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="text-sm font-medium text-danger hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostEditor({
  post,
  onSaved,
  onCancel,
}: {
  post: BlogPost | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(post?.title ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? '');
  const [category, setCategory] = useState(post?.category ?? '');
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status ?? 'draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  async function handleCoverFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingCover(true);
    setError('');
    try {
      const res = await adminApi.uploadImage(file);
      setCoverImageUrl(res.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cover image upload failed.');
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // TipTap's "empty" output is "<p></p>", not an empty string, so a
    // native `required` attribute (which we can't put on a non-input
    // editor anyway) wouldn't catch this — check for real text content
    // instead.
    const hasRealContent = content.replace(/<[^>]*>/g, '').trim().length > 0;
    if (!hasRealContent) {
      setError('Please write something in the content field.');
      return;
    }

    setSaving(true);
    try {
      const payload: CreateBlogPostPayload = {
        title,
        excerpt: excerpt || undefined,
        content,
        cover_image_url: coverImageUrl || undefined,
        category: category || undefined,
        status,
      };
      if (post) {
        await adminApi.updateBlogPost(post.id, payload);
      } else {
        await adminApi.createBlogPost(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <button onClick={onCancel} className="text-sm text-blue-primary font-medium hover:underline mb-6">
        ← Back to posts
      </button>

      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-6">
        {post ? 'Edit Post' : 'New Post'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional)"
            className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
          <div className="flex gap-2">
            <input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="Cover image URL (optional)"
              className="flex-1 min-w-0 border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
            <button
              type="button"
              disabled={uploadingCover}
              onClick={() => coverFileInputRef.current?.click()}
              className="shrink-0 px-3 py-2.5 rounded-sm text-sm font-medium text-navy-primary border border-slate-300 hover:border-blue-accent disabled:opacity-50"
            >
              {uploadingCover ? 'Uploading…' : 'Upload'}
            </button>
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleCoverFileSelected}
              className="hidden"
            />
          </div>
        </div>

        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImageUrl} alt="Cover preview" className="w-full max-h-48 object-cover rounded-lg" />
        )}

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="Excerpt — short summary shown on the blog listing (optional)"
          className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />

        <div>
          <label className="text-text-soft text-xs mb-1 block">Content</label>
          <RichTextEditor value={content} onChange={setContent} placeholder="Write your post…" />
        </div>

        <div className="flex items-center justify-between">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="border border-slate-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
          >
            <option value="draft">Save as Draft</option>
            <option value="published">Publish</option>
          </select>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
          >
            {saving ? 'Saving...' : status === 'published' ? 'Publish' : 'Save Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}