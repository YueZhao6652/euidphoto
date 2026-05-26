'use client'

import { PASSPORT_TEMPLATES } from '@/config/passport-templates'

interface CountriesProps {
  onSelect: (code: string) => void
}

export default function Countries({ onSelect }: CountriesProps) {
  return (
    <section id="countries" className="py-24 px-6 max-w-6xl mx-auto">
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
          Country templates
        </p>
        <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] tracking-tight text-ink mb-4">
          Official specs for 8 countries
        </h2>
        <p className="text-base text-ink-3 font-light max-w-md leading-relaxed">
          Every country has unique requirements. We handle them all — exact dimensions,
          head size percentages, and background color regulations.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Object.values(PASSPORT_TEMPLATES).map((tmpl) => (
          <button
            key={tmpl.code}
            onClick={() => onSelect(tmpl.code)}
            className="group bg-white border border-border rounded-2xl p-5 text-center hover:border-accent hover:bg-accent-light hover:-translate-y-1 hover:shadow-card transition-all duration-200"
          >
            <div className="text-3xl mb-2.5">{tmpl.flag}</div>
            <div className="text-sm font-semibold text-ink group-hover:text-accent mb-1">
              {tmpl.name}
            </div>
            <div className="text-xs text-ink-4">
              {tmpl.widthMm}×{tmpl.heightMm}mm
            </div>
            <div className="text-[10px] text-ink-4 mt-0.5">{tmpl.note}</div>
          </button>
        ))}
      </div>

      {/* Requirements callout */}
      <div className="mt-10 bg-white border border-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-sm font-semibold text-ink mb-2">
              What we check for each country
            </h3>
            <p className="text-sm text-ink-3 leading-relaxed">
              Each template encodes the official specification — dimensions, resolution,
              head height range, eye line position, and background color requirements.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              '✓ Exact mm dimensions',
              '✓ DPI (print resolution)',
              '✓ Head height %',
              '✓ Eye line position',
              '✓ Background color',
              '✓ ICAO compliance',
            ].map((item) => (
              <span
                key={item}
                className="text-xs font-medium text-ink-2 bg-border/60 px-3 py-1.5 rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
