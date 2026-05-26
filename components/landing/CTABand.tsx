'use client'

import { Upload } from 'lucide-react'

interface CTABandProps {
  onUploadClick: () => void
}

export default function CTABand({ onUploadClick }: CTABandProps) {
  return (
    <section className="px-6 py-8 max-w-6xl mx-auto">
      <div className="bg-ink rounded-3xl px-8 md:px-16 py-14 text-center">
        <h2 className="font-display text-[clamp(1.6rem,4vw,2.6rem)] tracking-tight text-white mb-4">
          Ready to create your passport photo?
        </h2>
        <p className="text-base text-white/50 font-light mb-8 max-w-md mx-auto">
          Free, instant, and fully compliant. No account required.
        </p>
        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-2.5 bg-white text-ink text-base font-semibold px-8 py-3.5 rounded-full hover:bg-accent hover:text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(37,99,235,.5)]"
        >
          <Upload size={18} strokeWidth={2} />
          Upload Photo — it&apos;s free
        </button>
      </div>
    </section>
  )
}
