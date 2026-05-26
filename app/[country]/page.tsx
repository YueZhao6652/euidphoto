import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PASSPORT_TEMPLATES, COUNTRY_SLUGS } from '@/config/passport-templates'

// Build reverse slug→code map
const SLUG_TO_CODE: Record<string, string> = Object.entries(COUNTRY_SLUGS).reduce(
  (acc, [code, slug]) => ({ ...acc, [slug]: code }),
  {},
)

interface Props {
  params: Promise<{ country: string }>
}

export async function generateStaticParams() {
  return Object.values(COUNTRY_SLUGS).map((slug) => ({ country: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: slug } = await params
  const code = SLUG_TO_CODE[slug]
  const tmpl = code ? PASSPORT_TEMPLATES[code] : null
  if (!tmpl) return { title: 'Not Found' }

  return {
    title: `${tmpl.name} Passport Photo Online – Free & Compliant | EUIDPhoto`,
    description: `Create a compliant ${tmpl.name} passport photo online for free. Official ${tmpl.widthMm}×${tmpl.heightMm}mm format, ${tmpl.dpi}dpi, ${tmpl.note}. Instant download.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}-passport-photo`,
    },
    openGraph: {
      title: `${tmpl.name} Passport Photo Online – Free`,
      description: `Official ${tmpl.widthMm}×${tmpl.heightMm}mm biometric passport photo for ${tmpl.name}. Free, instant, no sign-up.`,
    },
  }
}

export default async function CountryPage({ params }: Props) {
  const { country: slug } = await params
  // Strip trailing "-passport-photo" if present (for clean routing)
  const cleanSlug = slug.replace(/-passport-photo$/, '')
  const code = SLUG_TO_CODE[cleanSlug] || SLUG_TO_CODE[slug]
  const tmpl = code ? PASSPORT_TEMPLATES[code] : null

  if (!tmpl) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${tmpl.name} Passport Photo – EUIDPhoto`,
    description: `Create a compliant ${tmpl.name} biometric passport photo online for free.`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_APP_URL },
        { '@type': 'ListItem', position: 2, name: `${tmpl.name} Passport Photo` },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-cream">
        {/* Nav */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-cream/85 backdrop-blur-lg border-b border-border h-[60px] flex items-center px-6">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <a href="/" className="font-display text-xl tracking-tight text-ink">
              EUID<span className="text-accent">Photo</span>
            </a>
            <a
              href="/"
              className="flex items-center gap-2 bg-ink text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-accent transition-colors"
            >
              Create Photo →
            </a>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
          {/* Hero */}
          <div className="mb-14 text-center">
            <div className="text-5xl mb-4">{tmpl.flag}</div>
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] tracking-tight text-ink mb-4">
              {tmpl.name} Passport Photo
            </h1>
            <p className="text-lg text-ink-3 font-light max-w-xl mx-auto leading-relaxed mb-8">
              Create a compliant {tmpl.name} biometric passport photo online — free, instant, and ready to print.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-ink text-white text-base font-medium px-7 py-3.5 rounded-full hover:bg-accent transition-all hover:-translate-y-0.5"
            >
              Create {tmpl.name} Passport Photo →
            </a>
          </div>

          {/* Spec table */}
          <div className="bg-white border border-border rounded-3xl overflow-hidden mb-10">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-base font-semibold text-ink">
                Official {tmpl.name} Passport Photo Requirements
              </h2>
            </div>
            <div className="divide-y divide-border">
              {[
                ['Photo size', `${tmpl.widthMm} × ${tmpl.heightMm} mm`],
                ['Resolution', `${tmpl.widthPx} × ${tmpl.heightPx} pixels`],
                ['Print DPI', `${tmpl.dpi} dpi`],
                ['Head height', `${Math.round(tmpl.headHeightMin * 100)}–${Math.round(tmpl.headHeightMax * 100)}% of photo height`],
                ['Background', tmpl.background === 'white' ? 'Plain white' : tmpl.background === 'light-gray' ? 'Light gray / cream' : 'Light blue'],
                ['Standard', tmpl.note],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm text-ink-3">{k}</span>
                  <span className="text-sm font-semibold text-ink">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements list */}
          <div className="bg-white border border-border rounded-3xl p-6 mb-10">
            <h2 className="text-base font-semibold text-ink mb-4">
              {tmpl.name} Photo ID Requirements
            </h2>
            <ul className="space-y-2.5">
              {tmpl.requirements.map((req) => (
                <li key={req} className="flex items-start gap-2.5 text-sm text-ink-3">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center bg-ink rounded-3xl py-12 px-8">
            <h2 className="font-display text-2xl text-white mb-3">
              Create your {tmpl.name} passport photo now
            </h2>
            <p className="text-white/50 text-sm mb-6 font-light">
              Free, instant, no account needed.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-white text-ink font-semibold text-sm px-6 py-3 rounded-full hover:bg-accent hover:text-white transition-all"
            >
              Start for free →
            </a>
          </div>
        </main>

        <footer className="border-t border-border">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4">
            <a href="/" className="font-display text-lg text-ink">
              EUID<span className="text-accent">Photo</span>
            </a>
            <p className="text-xs text-ink-4">© {new Date().getFullYear()} EUIDPhoto</p>
          </div>
        </footer>
      </div>
    </>
  )
}
