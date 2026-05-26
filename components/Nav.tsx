'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'

interface NavProps {
  onUploadClick?: () => void
  showBack?: boolean
  onBack?: () => void
  isCompliant?: boolean
}

export default function Nav({ onUploadClick, showBack, onBack, isCompliant }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/85 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="font-display text-xl tracking-tight text-ink">
          EUID<span className="text-accent">Photo</span>
        </a>

        {/* Desktop nav */}
        {!showBack && (
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'How it works', id: 'how' },
              { label: 'Countries', id: 'countries' },
              { label: 'FAQ', id: 'faq' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm font-medium text-ink-3 hover:text-ink hover:bg-border px-3 py-1.5 rounded-lg transition-colors"
              >
                {label}
              </button>
            ))}
            <button
              onClick={onUploadClick}
              className="ml-2 flex items-center gap-2 bg-ink text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-accent transition-all hover:-translate-y-px"
            >
              <Upload size={14} strokeWidth={2} />
              Upload Photo
            </button>
          </nav>
        )}

        {/* Editor nav */}
        {showBack && (
          <div className="flex items-center gap-3">
            {isCompliant && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Compliant
              </span>
            )}
            <button
              onClick={onBack}
              className="text-sm font-medium text-ink-3 hover:text-ink hover:bg-border px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Mobile menu button */}
        {!showBack && (
          <button
            className="md:hidden p-2 rounded-lg hover:bg-border transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white animate-fade-down px-6 py-4 flex flex-col gap-2">
          {[
            { label: 'How it works', id: 'how' },
            { label: 'Countries', id: 'countries' },
            { label: 'FAQ', id: 'faq' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm font-medium text-ink-2 text-left py-2 border-b border-border last:border-0"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => { onUploadClick?.(); setMenuOpen(false) }}
            className="mt-2 flex items-center justify-center gap-2 bg-ink text-white text-sm font-medium px-4 py-3 rounded-xl"
          >
            <Upload size={15} />
            Upload Photo
          </button>
        </div>
      )}
    </header>
  )
}
