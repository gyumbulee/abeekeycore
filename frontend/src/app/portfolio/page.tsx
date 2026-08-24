'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, PortfolioProject, BlogPaginationMeta } from '@/lib/api';

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [meta, setMeta] = useState<BlogPaginationMeta | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPortfolioIndustries().then((res) => setIndustries(res.data)).catch(() => {});
  }, []);

  // Changing industry always starts back at page 1 — a stale page number
  // from a previous filter could otherwise land past the new filter's
  // last page and render nothing.
  function selectIndustry(ind: string | null) {
    setActiveIndustry(ind);
    setPage(1);
  }

  useEffect(() => {
    setLoading(true);
    api
      .getPortfolioProjects(activeIndustry ?? undefined, page)
      .then((res) => {
        setProjects(res.data);
        setMeta(res.meta);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load projects.'))
      .finally(() => setLoading(false));
  }, [activeIndustry, page]);

  // The large "featured" card treatment only makes sense as an entry point
  // on page 1 — repeating it on later pages would look like a duplicate,
  // disconnected highlight rather than what it actually is (just the next
  // project in the list).
  const featured = page === 1 ? projects[0] : undefined;
  const rest = page === 1 ? projects.slice(1) : projects;

  return (
    <>
      <Navbar />
      <main className="pt-[72px] min-h-screen bg-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-blue-primary font-semibold text-sm tracking-wide uppercase mb-2">Our Work</p>
          <h1 className="font-heading font-bold text-navy-primary text-4xl sm:text-5xl mb-4">
            Recent work
          </h1>
          <p className="text-text-soft text-lg max-w-2xl mb-10">
            A look at some of the programmes and systems we&apos;ve delivered for clients across Nigeria.
          </p>

          {industries.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => selectIndustry(null)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  activeIndustry === null
                    ? 'bg-navy-primary text-white'
                    : 'bg-slate-100 text-text-soft hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => selectIndustry(ind)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    activeIndustry === ind
                      ? 'bg-navy-primary text-white'
                      : 'bg-slate-100 text-text-soft hover:bg-slate-200'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          )}

          {loading && <p className="text-text-soft text-sm">Loading projects...</p>}
          {error && <p className="text-danger text-sm">{error}</p>}
          {!loading && !error && projects.length === 0 && (
            <p className="text-text-soft text-sm">No case studies published yet — check back soon.</p>
          )}

          {featured && (
            <Link
              href={`/portfolio/${featured.slug}`}
              className="group grid sm:grid-cols-2 gap-6 bg-white border border-slate-200 rounded-[24px] overflow-hidden mb-10 hover:border-blue-accent transition-colors"
            >
              <div
                className="aspect-[16/10] sm:aspect-auto bg-navy-primary bg-cover bg-center"
                style={featured.cover_image_url ? { backgroundImage: `url(${featured.cover_image_url})` } : undefined}
              />
              <div className="p-8 flex flex-col justify-center">
                {featured.industry && (
                  <span className="text-blue-primary text-xs font-semibold uppercase tracking-wide mb-3">
                    {featured.industry}
                  </span>
                )}
                <h2 className="font-heading font-bold text-navy-primary text-2xl mb-3 group-hover:text-blue-primary transition-colors">
                  {featured.title}
                </h2>
                {featured.summary && <p className="text-text-soft mb-4">{featured.summary}</p>}
                <p className="text-text-soft text-xs">{featured.client_name}</p>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((project) => (
                <Link
                  key={project.id}
                  href={`/portfolio/${project.slug}`}
                  className="group bg-white border border-slate-200 rounded-[20px] overflow-hidden hover:border-blue-accent transition-colors"
                >
                  <div
                    className="aspect-[16/10] bg-navy-secondary bg-cover bg-center"
                    style={project.cover_image_url ? { backgroundImage: `url(${project.cover_image_url})` } : undefined}
                  />
                  <div className="p-5">
                    {project.industry && (
                      <span className="text-blue-primary text-xs font-semibold uppercase tracking-wide">
                        {project.industry}
                      </span>
                    )}
                    <h3 className="font-heading font-bold text-navy-primary text-lg mt-1.5 mb-2 group-hover:text-blue-primary transition-colors">
                      {project.title}
                    </h3>
                    {project.summary && <p className="text-text-soft text-sm line-clamp-2">{project.summary}</p>}
                    {project.client_name && <p className="text-text-soft text-xs mt-3">{project.client_name}</p>}
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
