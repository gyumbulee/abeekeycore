import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchPublic, PortfolioProject, ApiError } from '@/lib/api';

async function getProject(slug: string): Promise<PortfolioProject | null> {
  try {
    const res = await fetchPublic<{ data: PortfolioProject }>(`/portfolio/${slug}`);
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: 'Project not found' };
  }

  return {
    title: project.title,
    description: project.summary ?? undefined,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary ?? undefined,
      url: `https://abeekey.com/portfolio/${project.slug}`,
      type: 'article',
      images: project.cover_image_url ? [{ url: project.cover_image_url, width: 1200, height: 630 }] : undefined,
    },
  };
}

export default async function PortfolioProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-[72px] min-h-screen bg-bg">
        <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {project.industry && (
            <span className="text-blue-primary text-xs font-semibold uppercase tracking-wide">
              {project.industry}
            </span>
          )}
          <h1 className="font-heading font-bold text-navy-primary text-3xl sm:text-4xl mt-2 mb-4">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-text-soft text-sm mb-8">
            {project.client_name && <span>{project.client_name}</span>}
            {project.completed_at && <span>Completed {formatDate(project.completed_at)}</span>}
            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-primary font-medium hover:underline"
              >
                Visit project ↗
              </a>
            )}
          </div>

          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-text-soft"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {project.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full rounded-2xl mb-10 object-cover"
            />
          )}

          {/*
            Content is trusted HTML authored by a vetted staff/admin account
            through the admin CMS (see App\Models\PortfolioProject's
            docblock) — not public/user-submitted input — so rendering it
            directly here is the standard CMS trust model, not an XSS risk.
          */}
          <div
            className="[&_h2]:font-heading [&_h2]:text-navy-primary [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:font-heading [&_h3]:text-navy-primary [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-text-soft [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-blue-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-text-soft [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-text-soft [&_li]:mb-1 [&_img]:rounded-xl [&_img]:my-6 [&_strong]:font-semibold [&_strong]:text-navy-primary [&_blockquote]:border-l-4 [&_blockquote]:border-blue-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-soft"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />

          {project.gallery_images && project.gallery_images.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4 mt-10">
              {project.gallery_images.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt={project.title} className="w-full rounded-xl object-cover" />
              ))}
            </div>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
