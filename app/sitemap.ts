import { MetadataRoute } from 'next'
import { COUNTRY_SLUGS } from '@/config/passport-templates'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://euidphoto.com'

  const countryPages = Object.values(COUNTRY_SLUGS).map((slug) => ({
    url: `${baseUrl}/${slug}-passport-photo`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...countryPages,
  ]
}
