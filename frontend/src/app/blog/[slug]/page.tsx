import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchPublic, BlogPost, ApiError } from '@/lib/api';

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetchPublic<{ data: BlogPost }>(`/blog/${slug}`);
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Post not found' };
  }

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `https://abeekey.com/blog/${post.slug}`,
      type: 'article',
      images: post.cover_image_url ? [{ url: post.cover_image_url, width: 1200, height: 630 }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-[72px] min-h-screen bg-bg">
        <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {post.category && (
            <span className="text-blue-primary text-xs font-semibold uppercase tracking-wide">
              {post.category}
            </span>
          )}
          <h1 className="font-heading font-bold text-navy-primary text-3xl sm:text-4xl mt-2 mb-4">
            {post.title}
          </h1>
          <p className="text-text-soft text-sm mb-8">
            {post.published_at && formatDate(post.published_at)}
            {post.author && ` · ${post.author.name}`}
          </p>

          {post.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full rounded-2xl mb-10 object-cover"
            />
          )}

          {/*
            Content is trusted HTML authored by a vetted staff/admin account
            through the admin CMS (see App\Models\BlogPost's docblock) — not
            public/user-submitted input — so rendering it directly here is
            the standard CMS trust model, not an XSS risk.
          */}
          <div
            className="[&_h2]:font-heading [&_h2]:text-navy-primary [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:font-heading [&_h3]:text-navy-primary [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-text-soft [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-blue-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-text-soft [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-text-soft [&_li]:mb-1 [&_img]:rounded-xl [&_img]:my-6 [&_strong]:font-semibold [&_strong]:text-navy-primary [&_blockquote]:border-l-4 [&_blockquote]:border-blue-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-soft"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}