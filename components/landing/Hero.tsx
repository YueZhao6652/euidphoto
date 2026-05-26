'use client'

import { Upload, Star } from 'lucide-react'

interface HeroProps {
  onUploadClick: () => void
}

export default function Hero({ onUploadClick }: HeroProps) {
  return (
    <section className="pt-36 pb-20 px-6 text-center max-w-3xl mx-auto">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-accent-light border border-accent-dim text-accent text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 animate-fade-up">
        <Star size={12} strokeWidth={2} />
        Free · No account needed · ICAO compliant
      </div>

      {/* Headline */}
      <h1
        className="font-display text-[clamp(2.5rem,6vw,4.2rem)] leading-[1.08] tracking-[-0.03em] text-ink mb-5 animate-fade-up"
        style={{ animationDelay: '80ms' }}
      >
        Create{' '}
        <em className="text-accent not-italic">EU-Compliant</em>
        <br />
        Passport Photos Online
      </h1>

      {/* Subheadline */}
      <p
        className="text-lg text-ink-3 font-light leading-relaxed max-w-lg mx-auto mb-10 animate-fade-up"
        style={{ animationDelay: '160ms' }}
      >
        Turn any photo or printed passport picture into official biometric ID
        photos in seconds — for free.
      </p>

      {/* CTA */}
      <div
        className="flex flex-col items-center gap-3 animate-fade-up"
        style={{ animationDelay: '240ms' }}
      >
        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-2.5 bg-ink text-white text-base font-medium px-7 py-3.5 rounded-full hover:bg-accent transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,99,235,.35)]"
        >
          <Upload size={18} strokeWidth={1.75} />
          Upload Photo
        </button>
        <span className="text-xs text-ink-4">
          No sign-up · Instant download · 100% free
        </span>
      </div>

      {/* Trust row */}
      <div
        className="flex flex-wrap items-center justify-center gap-6 mt-14 animate-fade-up"
        style={{ animationDelay: '320ms' }}
      >
        {[
          { label: '8 countries', sub: 'Official templates' },
          { label: 'ICAO 9303', sub: 'International standard' },
          { label: '< 10 seconds', sub: 'Average processing time' },
          { label: '300 DPI', sub: 'Print-ready quality' },
        ].map(({ label, sub }) => (
          <div key={label} className="text-center">
            <div className="text-sm font-semibold text-ink">{label}</div>
            <div className="text-xs text-ink-4">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
