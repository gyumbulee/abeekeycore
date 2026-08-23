import { fetchPublic, BlogPost } from '@/lib/api';

const baseUrl = 'https://abeekey.com';
const MAX_ITEMS = 30;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Plain-text summary for the feed <description> — strips HTML tags rather
 * than including raw markup, since not all feed readers render HTML
 * safely, and falls back to a short excerpt of the content itself if no
 * excerpt was set on the post.
 */
function plainSummary(post: BlogPost): string {
  if (post.excerpt) return post.excerpt;
  const text = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 300 ? `${text.slice(0, 300)}…` : text;
}

async function getRecentPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const res = await fetchPublic<{ data: BlogPost[]; meta: { last_page: number } }>(
      `/blog?page=${page}`,
      3600
    );
    posts.push(...res.data);
    lastPage = res.meta.last_page;
    page++;
  } while (page <= lastPage && posts.length < MAX_ITEMS);

  return posts.slice(0, MAX_ITEMS);
}

export async function GET() {
  let posts: BlogPost[] = [];
  try {
    posts = await getRecentPosts();
  } catch {
    posts = [];
  }

  const items = posts
    .map((post) => {
      const url = `${baseUrl}/blog/${post.slug}`;
      const pubDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
      <description>${escapeXml(plainSummary(post))}</description>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Abeekey Journal</title>
    <link>${baseUrl}/blog</link>
    <description>Product updates, engineering notes, and field reports from delivering technology across Nigeria.</description>
    <language>en-ng</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}