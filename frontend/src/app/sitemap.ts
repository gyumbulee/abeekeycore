import type { MetadataRoute } from 'next';

const baseUrl = 'https://abeekey.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '/',
    '/about',
    '/services',
    '/industries',
    '/portfolio',
    '/training',
    '/contact',
    '/privacy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority:
      route === '/'
        ? 1
        : ['/services', '/portfolio', '/contact'].includes(route)
          ? 0.8
          : 0.6,
  }));
}