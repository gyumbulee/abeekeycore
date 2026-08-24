'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { adminApi, PortfolioProject, CreatePortfolioProjectPayload } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Mirrors the backend's httpUrlRule() (Admin\PortfolioController) so a bad
// URL is caught the moment the admin leaves the field, not after a
// round-trip to the server. `new URL()` only checks shape — it accepts
// "https://asdf" with no real domain — so a second check requires the
// host to end in a dot followed by a letters-only label of 2+ characters
// (.com, .co.uk, etc.), the same rule the backend enforces.
function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    const validProtocol = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    const hasTld = /\.[a-zA-Z]{2,}$/.test(parsed.hostname);
    return validProtocol && hasTld;
  } catch {
    return false;
  }
}

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<PortfolioProject | 'new' | null>(null);

  function reload() {
    setLoading(true);
    adminApi
      .getPortfolioProjects()
      .then((res) => setProjects(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load projects.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  async function handleDelete(id: number) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const previous = projects;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await adminApi.deletePortfolioProject(id);
    } catch (err) {
      setProjects(previous);
      setError(err instanceof Error ? err.message : 'Failed to delete project.');
    }
  }

  if (editing) {
    return (
      <ProjectEditor
        project={editing === 'new' ? null : editing}
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
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Portfolio</h1>
          <p className="text-text-soft">Manage case studies shown on the public portfolio page.</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
        >
          + New Project
        </button>
      </div>

      {loading && <p className="text-text-soft text-sm">Loading projects...</p>}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="text-text-soft text-sm">No projects yet.</p>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-slate-200 rounded-[20px] p-6 flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-navy-primary">{project.title}</p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    project.status === 'published'
                      ? 'bg-success/10 text-success'
                      : 'bg-slate-200 text-text-soft'
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-text-soft text-xs">
                {project.industry && `${project.industry} · `}
                {project.client_name && `${project.client_name} · `}
                {project.published_at ? `Published ${formatDate(project.published_at)}` : `Created ${formatDate(project.created_at)}`}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {project.status === 'published' && (
                <Link
                  href={`/portfolio/${project.slug}`}
                  target="_blank"
                  className="text-sm font-medium text-navy-secondary hover:underline"
                >
                  View
                </Link>
              )}
              <button
                onClick={() => setEditing(project)}
                className="text-sm font-medium text-blue-primary hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(project.id)}
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

function ProjectEditor({
  project,
  onSaved,
  onCancel,
}: {
  project: PortfolioProject | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(project?.title ?? '');
  const [clientName, setClientName] = useState(project?.client_name ?? '');
  const [industry, setIndustry] = useState(project?.industry ?? '');
  const [summary, setSummary] = useState(project?.summary ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(project?.cover_image_url ?? '');
  const [galleryImages, setGalleryImages] = useState<string[]>(project?.gallery_images ?? []);
  const [technologies, setTechnologies] = useState((project?.technologies ?? []).join(', '));
  const [projectUrl, setProjectUrl] = useState(project?.project_url ?? '');
  const [completedAt, setCompletedAt] = useState(project?.completed_at?.slice(0, 10) ?? '');
  const [status, setStatus] = useState<'draft' | 'published'>(project?.status ?? 'draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [projectUrlError, setProjectUrlError] = useState('');
  const [coverImageUrlError, setCoverImageUrlError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  async function handleCoverFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingCover(true);
    setError('');
    try {
      const res = await adminApi.uploadImage(file, 'portfolio-uploads');
      setCoverImageUrl(res.data.url);
      setCoverImageUrlError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cover image upload failed.');
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleGalleryFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadingGallery(true);
    setError('');
    try {
      const uploaded: string[] = [];
      // Uploaded one at a time rather than in parallel — the admin
      // throttle on this endpoint is per-window, not per-request-batch,
      // so a handful of sequential requests stays well clear of it.
      for (const file of files) {
        const res = await adminApi.uploadImage(file, 'portfolio-uploads');
        uploaded.push(res.data.url);
      }
      setGalleryImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gallery image upload failed.');
    } finally {
      setUploadingGallery(false);
    }
  }

  function removeGalleryImage(url: string) {
    setGalleryImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // TipTap's "empty" output is "<p></p>", not an empty string, so a
    // native `required` attribute (which we can't put on a non-input
    // editor anyway) wouldn't catch this — check for real text content.
    const hasRealContent = description.replace(/<[^>]*>/g, '').trim().length > 0;
    if (!hasRealContent) {
      setError('Please write something in the description field.');
      return;
    }

    // Re-validate on submit too, not just on blur — a field can be filled
    // in without ever losing focus (e.g. paste-and-submit via Enter).
    const projectUrlValid = !projectUrl || isValidHttpUrl(projectUrl);
    const coverUrlValid = !coverImageUrl || isValidHttpUrl(coverImageUrl);
    setProjectUrlError(projectUrlValid ? '' : 'Enter a full URL with a valid domain, e.g. https://example.com');
    setCoverImageUrlError(coverUrlValid ? '' : 'Enter a full URL with a valid domain, e.g. https://example.com');
    if (!projectUrlValid || !coverUrlValid) {
      setError('Please fix the highlighted URL field before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload: CreatePortfolioProjectPayload = {
        title,
        client_name: clientName || undefined,
        industry: industry || undefined,
        summary: summary || undefined,
        description,
        cover_image_url: coverImageUrl || undefined,
        gallery_images: galleryImages.length > 0 ? galleryImages : undefined,
        technologies: technologies.trim()
          ? technologies.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
        project_url: projectUrl || undefined,
        completed_at: completedAt || undefined,
        status,
      };
      if (project) {
        await adminApi.updatePortfolioProject(project.id, payload);
      } else {
        await adminApi.createPortfolioProject(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <button onClick={onCancel} className="text-sm text-blue-primary font-medium hover:underline mb-6">
        ← Back to portfolio
      </button>

      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-6">
        {project ? 'Edit Project' : 'New Project'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title"
          className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client name (optional)"
            className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Industry (optional, e.g. Education)"
            className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <input
              value={projectUrl}
              onChange={(e) => {
                setProjectUrl(e.target.value);
                if (projectUrlError) setProjectUrlError('');
              }}
              onBlur={() => {
                if (projectUrl && !isValidHttpUrl(projectUrl)) {
                  setProjectUrlError('Enter a full URL with a valid domain, e.g. https://example.com');
                }
              }}
              placeholder="Live project URL (optional)"
              className={`w-full border rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                projectUrlError
                  ? 'border-danger focus:ring-danger'
                  : 'border-slate-300 focus:ring-blue-accent'
              }`}
            />
            {projectUrlError && <p className="text-danger text-xs mt-1">{projectUrlError}</p>}
          </div>
          <input
            type="date"
            value={completedAt}
            onChange={(e) => setCompletedAt(e.target.value)}
            className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
        </div>

        <input
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          placeholder="Technologies, comma-separated (e.g. Laravel, Next.js, Flutterwave)"
          className="w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />

        <div className="flex gap-2">
          <input
            value={coverImageUrl}
            onChange={(e) => {
              setCoverImageUrl(e.target.value);
              if (coverImageUrlError) setCoverImageUrlError('');
            }}
            onBlur={() => {
              if (coverImageUrl && !isValidHttpUrl(coverImageUrl)) {
                setCoverImageUrlError('Enter a full URL with a valid domain, e.g. https://example.com');
              }
            }}
            placeholder="Cover image URL (optional)"
            className={`flex-1 min-w-0 border rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
              coverImageUrlError
                ? 'border-danger focus:ring-danger'
                : 'border-slate-300 focus:ring-blue-accent'
            }`}
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
        {coverImageUrlError && <p className="text-danger text-xs -mt-2">{coverImageUrlError}</p>}

        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImageUrl} alt="Cover preview" className="w-full max-h-48 object-cover rounded-lg" />
        )}

        <div>
          <label className="text-text-soft text-xs mb-1.5 block">Gallery images (optional)</label>
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              {galleryImages.map((url) => (
                <div key={url} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Gallery image" className="w-full aspect-square object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-navy-primary/80 text-white text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            disabled={uploadingGallery}
            onClick={() => galleryFileInputRef.current?.click()}
            className="px-3 py-2 rounded-sm text-sm font-medium text-navy-primary border border-slate-300 hover:border-blue-accent disabled:opacity-50"
          >
            {uploadingGallery ? 'Uploading…' : '+ Add gallery images'}
          </button>
          <input
            ref={galleryFileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            multiple
            onChange={handleGalleryFilesSelected}
            className="hidden"
          />
        </div>

        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="Summary — short blurb shown on the portfolio listing (optional)"
          className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />

        <div>
          <label className="text-text-soft text-xs mb-1 block">Description</label>
          <RichTextEditor value={description} onChange={setDescription} placeholder="Describe the project, the challenge, and the outcome…" />
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
