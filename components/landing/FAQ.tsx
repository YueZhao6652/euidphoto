'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

const FAQS = [
  {
    q: 'Is EUIDPhoto completely free?',
    a: 'Yes, completely free. Upload, process, and download your compliant passport photo at no cost. No subscription, no hidden fees, no account required.',
  },
  {
    q: 'How accurate are the biometric measurements?',
    a: 'Our system follows ICAO 9303 international standards and each country\'s specific guidelines. Head size, eye position, and dimensions are automatically verified against official specifications. The compliance badge appears only when all requirements are met.',
  },
  {
    q: 'Can I use a photo taken with my smartphone?',
    a: 'Absolutely. EUIDPhoto is designed for phone photos — including photos of printed passport photos placed on a flat surface. We automatically correct the crop, resize, and replace the background.',
  },
  {
    q: 'Which countries are supported?',
    a: 'Version 1 supports Germany, France, Netherlands, Belgium, Spain, Italy, United Kingdom, and the United States. More countries are added regularly.',
  },
  {
    q: 'What file formats can I download?',
    a: 'You can download your photo as JPG (best for photo labs), PNG (with optional transparency), or a print-ready PDF sheet with 6 copies and crop marks on A4 paper.',
  },
  {
    q: 'Is my photo stored on your servers?',
    a: 'No. All image processing happens in your browser using WebAssembly and Canvas APIs. When background removal requires our server, the image is immediately discarded after processing. We never store, log, or share your photos.',
  },
  {
    q: 'What if my photo is rejected by the authorities?',
    a: 'Our tool follows all published official guidelines, but final acceptance depends on the issuing authority. We recommend having your photo verified by a professional photographer if you have concerns. EUIDPhoto cannot guarantee acceptance in every case.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. EUIDPhoto runs entirely in your browser. No app, no plugin, no software installation required. Works on any modern phone, tablet, or computer.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
          Common questions
        </p>
        <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] tracking-tight text-ink">
          FAQ
        </h2>
      </div>

      <div>
        {FAQS.map(({ q, a }, i) => (
          <div
            key={i}
            className="border-b border-border last:border-b-0"
          >
            <button
              className="w-full flex items-center justify-between gap-6 py-5 text-left"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="text-sm font-medium text-ink">{q}</span>
              <Plus
                size={18}
                strokeWidth={1.75}
                className={`flex-shrink-0 text-ink-4 transition-transform duration-200 ${
                  open === i ? 'rotate-45 text-accent' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-200 ${
                open === i ? 'max-h-60 pb-5' : 'max-h-0'
              }`}
            >
              <p className="text-sm text-ink-3 leading-relaxed">{a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
