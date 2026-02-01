import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/dashboard/',
          '/welcome/',
          '/delete-account/',
          '/forgot-password/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/dashboard/',
          '/welcome/',
          '/delete-account/',
          '/forgot-password/',
        ],
      },
    ],
    sitemap: 'https://never-break-the-chain.vercel.app/sitemap.xml',
    host: 'https://never-break-the-chain.vercel.app',
  }
}