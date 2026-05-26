'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Upload, Camera, Image as ImageIcon } from 'lucide-react'

interface UploadZoneProps {
  onFile: (file: File) => void
}

export default function UploadZone({ onFile }: UploadZoneProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const handleFile = useCallback((file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, HEIC, WebP).')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('File is too large. Please upload an image under 20MB.')
      return
    }
    onFile(file)
  }, [onFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  // Paste support
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find(i =>
        i.type.startsWith('image/')
      )
      if (item) handleFile(item.getAsFile())
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [handleFile])

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer
        transition-all duration-200 bg-white group
        ${drag
          ? 'border-accent bg-accent-light scale-[1.01]'
          : 'border-border-2 hover:border-accent hover:bg-accent-light'
        }
      `}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
      aria-label="Upload photo"
    >
      {/* Icon */}
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors
        ${drag ? 'bg-accent text-white' : 'bg-border text-ink-3 group-hover:bg-accent group-hover:text-white'}
      `}>
        <Upload size={24} strokeWidth={1.5} />
      </div>

      <h3 className="text-base font-semibold text-ink mb-1.5">
        Drop your photo here
      </h3>
      <p className="text-sm text-ink-3 mb-6">
        Works with phone photos, portraits, or printed passport photos
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 justify-center" onClick={e => e.stopPropagation()}>
        <button
          className="flex items-center gap-2 bg-white border border-border-2 text-ink-2 text-sm font-medium px-4 py-2.5 rounded-full hover:border-accent hover:text-accent transition-colors"
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.removeAttribute('capture')
              fileRef.current.click()
            }
          }}
        >
          <ImageIcon size={15} strokeWidth={1.5} />
          Choose file
        </button>
        <button
          className="flex items-center gap-2 bg-white border border-border-2 text-ink-2 text-sm font-medium px-4 py-2.5 rounded-full hover:border-accent hover:text-accent transition-colors"
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.setAttribute('capture', 'environment')
              fileRef.current.click()
            }
          }}
        >
          <Camera size={15} strokeWidth={1.5} />
          Take photo
        </button>
      </div>

      <p className="mt-5 text-xs text-ink-4">
        JPG, PNG, HEIC, WebP · Max 20MB · Paste with Ctrl+V
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,image/heic"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0] ?? null)}
        aria-hidden
      />
    </div>
  )
}
