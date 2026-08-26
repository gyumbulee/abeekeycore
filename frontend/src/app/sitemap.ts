import type { MetadataRoute } from 'next';
import { fetchPublic, BlogPost, PortfolioProject } from '@/lib/api';

const baseUrl = 'https://abeekey.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '/',
    '/about',
    '/services',
    '/hosting',
    '/industries',
    '/portfolio',
    '/training',
    '/contact',
    '/blog',
    '/privacy',
    '/terms',
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : route === '/blog' ? 'daily' : 'monthly',
    priority:
      route === '/'
        ? 1
        : ['/services', '/hosting', '/portfolio', '/contact', '/blog'].includes(route)
          ? 0.8
          : 0.6,
  }));

  // Blog posts are fetched at sitemap build/request time — if this call
  // fails for any reason, fall back to the static routes alone rather than
  // breaking the whole sitemap. Walks every page since the public /blog
  // endpoint paginates at 9 posts — a sitemap covering only page 1 would
  // silently miss everything published after the first 9 posts.
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const allPosts: BlogPost[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await fetchPublic<{ data: BlogPost[]; meta: { last_page: number } }>(
        `/blog?page=${page}`,
        3600
      );
      allPosts.push(...res.data);
      lastPage = res.meta.last_page;
      page++;
    } while (page <= lastPage);

    postEntries = allPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch {
    postEntries = [];
  }

  // Same reasoning as the blog walk above: the public /portfolio endpoint
  // paginates at 9 projects too, so this has to walk every page or a
  // sitemap covering only page 1 would silently miss projects published
  // after the first 9.
  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    const allProjects: PortfolioProject[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await fetchPublic<{ data: PortfolioProject[]; meta: { last_page: number } }>(
        `/portfolio?page=${page}`,
        3600
      );
      allProjects.push(...res.data);
      lastPage = res.meta.last_page;
      page++;
    } while (page <= lastPage);

    projectEntries = allProjects.map((project) => ({
      url: `${baseUrl}/portfolio/${project.slug}`,
      lastModified: project.published_at ? new Date(project.published_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch {
    projectEntries = [];
  }

  return [...staticEntries, ...postEntries, ...projectEntries];
}