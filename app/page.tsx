'use client'

import { useState, useRef, useCallback } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/landing/Hero'
import UploadZone from '@/components/UploadZone'
import HowItWorks from '@/components/landing/HowItWorks'
import Countries from '@/components/landing/Countries'
import Features from '@/components/landing/Features'
import FAQ from '@/components/landing/FAQ'
import CTABand from '@/components/landing/CTABand'
import Footer from '@/components/landing/Footer'
import Editor from '@/components/editor/Editor'

export default function Home() {
  const [file, setFile]   = useState<File | null>(null)
  const uploadRef         = useRef<HTMLDivElement>(null)

  const scrollToUpload = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handleFile = useCallback((f: File) => {
    setFile(f)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const handleBack = useCallback(() => {
    setFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (file) {
    return (
      <div className="min-h-screen bg-cream">
        <Nav showBack onBack={handleBack} isCompliant />
        <Editor file={file} onBack={handleBack} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Nav onUploadClick={scrollToUpload} />
      <main>
        <Hero onUploadClick={scrollToUpload} />
        <div ref={uploadRef} id="upload-section" className="max-w-[580px] mx-auto px-6 mb-24">
          <UploadZone onFile={handleFile} />
        </div>
        <div className="h-px bg-border max-w-6xl mx-auto" />
        <HowItWorks />
        <div className="h-px bg-border max-w-6xl mx-auto" />
        <Countries onSelect={scrollToUpload} />
        <div className="h-px bg-border max-w-6xl mx-auto" />
        <Features />
        <div className="h-px bg-border max-w-6xl mx-auto" />
        <FAQ />
        <CTABand onUploadClick={scrollToUpload} />
      </main>
      <Footer />
    </div>
  )
}
