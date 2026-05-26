'use client'

import {
  useState, useEffect, useRef, useCallback,
} from 'react'
import {
  CheckCircle, Download, Eraser, Undo2, RotateCw, RotateCcw,
  Sun, Contrast, ZoomIn, Upload, Shield, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react'
import { PASSPORT_TEMPLATES, BG_HEX } from '@/config/passport-templates'

// ─── Output formats ───────────────────────────────────────────────────────────
const FORMATS = [
  {
    id: 'passport',
    label: 'Passport Photo',
    badge: '🛂',
    w: 413, h: 531,
    widthMm: 35, heightMm: 45,
    dpi: 300,
    desc: 'EU Standard · 35×45mm · 300dpi',
    headRatio: 0.76,
    eyeRatio:  0.45,
    shoulderRatio: 0.30,
  },
  {
    id: 'visa',
    label: 'Visa Photo',
    badge: '✈️',
    w: 600, h: 600,
    widthMm: 51, heightMm: 51,
    dpi: 300,
    desc: 'US/International · 51×51mm · 300dpi',
    headRatio: 0.62,
    eyeRatio:  0.42,
    shoulderRatio: 0.40,
  },
  {
    id: 'portrait',
    label: 'CV Portrait',
    badge: '💼',
    w: 600, h: 750,
    widthMm: 60, heightMm: 75,
    dpi: 300,
    desc: 'LinkedIn / CV · Professional',
    headRatio: 0.52,
    eyeRatio:  0.36,
    shoulderRatio: 0.55,
  },
] as const

type FormatId = typeof FORMATS[number]['id']
type BgColor  = 'white' | 'lightgray' | 'lightblue'

// Face box in 0-1 fractions of image dimensions
interface FaceBox { x: number; y: number; w: number; h: number }

const PROCESS_STEPS = [
  'Loading image',
  'Detecting face',
  'Removing background',
  'Generating output',
]

const BG_OPTIONS: { id: BgColor; label: string; hex: string; border: string }[] = [
  { id: 'white',     label: 'White',      hex: '#FFFFFF', border: '#E5E7EB' },
  { id: 'lightgray', label: 'Light Gray', hex: '#F3F4F6', border: '#D1D5DB' },
  { id: 'lightblue', label: 'Light Blue', hex: '#DBEAFE', border: '#BFDBFE' },
]

// ─── helpers ──────────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

function dataUrlToBlob(url: string): Blob {
  const [h, b] = url.split(',')
  const mime    = h.match(/:(.*?);/)![1]
  const raw     = atob(b)
  const u8      = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i)
  return new Blob([u8], { type: mime })
}

function trigger(url: string, name: string) {
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
}

function toJpeg(canvas: HTMLCanvasElement, q = 0.95): string {
  const c   = document.createElement('canvas')
  c.width   = canvas.width; c.height = canvas.height
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(canvas, 0, 0)
  return c.toDataURL('image/jpeg', q)
}

/** Resize image to max edge, returns base64 string without header */
function resizeToBase64(img: HTMLImageElement, maxEdge = 1024): string {
  const scale  = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight))
  const c      = document.createElement('canvas')
  c.width      = Math.round(img.naturalWidth * scale)
  c.height     = Math.round(img.naturalHeight * scale)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.9).split(',')[1]
}

/** Render one format from transparent source image */
function renderFormat(
  transparentImg: HTMLImageElement,
  face: FaceBox,                // 0-1 fractions of transparent image
  fmt: typeof FORMATS[number],
  bgHex: string,
  rotation: number,
  brightness: number,
  contrast: number,
  zoom: number,
): string {
  const { w: outW, h: outH } = fmt
  const srcW = transparentImg.naturalWidth
  const srcH = transparentImg.naturalHeight

  // Biometric crop calculation
  const faceHeightPx = face.h * srcH
  const headHeightPx = faceHeightPx * 1.40              // add hair overhead
  const cropH        = headHeightPx / fmt.headRatio
  const cropW        = cropH * (outW / outH)

  const faceCenterX  = (face.x + face.w / 2) * srcW
  const faceEyeY     = (face.y + face.h * 0.38) * srcH  // approximate eye line

  let sx = faceCenterX - cropW / 2
  let sy = faceEyeY   - cropH * fmt.eyeRatio

  // Add shoulder padding below
  sy -= cropH * fmt.shoulderRatio * 0.2

  sx = clamp(sx, 0, srcW - cropW)
  sy = clamp(sy, 0, srcH - cropH)

  const c   = document.createElement('canvas')
  c.width   = outW; c.height = outH
  const ctx = c.getContext('2d')!

  // Background
  ctx.fillStyle = bgHex
  ctx.fillRect(0, 0, outW, outH)

  // Image adjustments
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
  ctx.save()
  ctx.translate(outW / 2, outH / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.scale(zoom / 100, zoom / 100)

  const drawW = Math.min(cropW, srcW) || srcW
  const drawH = Math.min(cropH, srcH) || srcH
  ctx.drawImage(transparentImg, sx, sy, drawW, drawH, -outW / 2, -outH / 2, outW, outH)
  ctx.restore()

  return c.toDataURL('image/png', 1.0)
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props { file: File; onBack: () => void }

export default function Editor({ file, onBack }: Props) {
  const [step,  setStep]  = useState(0)
  const [phase, setPhase] = useState<'processing' | 'done' | 'error'>('processing')
  const [errMsg, setErrMsg] = useState('')

  // Core assets
  const [originalSrc,    setOriginalSrc]    = useState<string | null>(null)
  const [transparentSrc, setTransparentSrc] = useState<string | null>(null)
  const [face,           setFace]           = useState<FaceBox | null>(null)

  // Per-format results
  const [results, setResults] = useState<Partial<Record<FormatId, string>>>({})

  // Settings
  const [bgColor,     setBgColor]     = useState<BgColor>('white')
  const [rotation,    setRotation]    = useState(0)
  const [brightness,  setBrightness]  = useState(100)
  const [contrast,    setContrast]    = useState(100)
  const [zoom,        setZoom]        = useState(100)
  const [showTune,    setShowTune]    = useState(false)
  const [showEraser,  setShowEraser]  = useState(false)
  const [activeErase, setActiveErase] = useState<FormatId | null>(null)

  // Eraser
  const eraserCanvasRef   = useRef<HTMLCanvasElement>(null)
  const historyRef        = useRef<ImageData[]>([])
  const [eraserOn,     setEraserOn]    = useState(false)
  const [brushSize,    setBrushSize]   = useState(30)
  const [isErasing,    setIsErasing]   = useState(false)

  const [exporting, setExporting] = useState<FormatId | null>(null)
  const [toast,     setToast]     = useState<string | null>(null)

  const bgHex = BG_HEX[bgColor] || '#ffffff'

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2800) }

  // ── Master processing pipeline ──────────────────────────────────────────────
  useEffect(() => {
    if (!file) return
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  async function run() {
    try {
      setPhase('processing'); setStep(0); setResults({})
      historyRef.current = []

      // 1. Load image
      const src = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = e => res(e.target!.result as string)
        r.onerror = rej
        r.readAsDataURL(file)
      })
      setOriginalSrc(src)

      const img = await loadImg(src)
      setStep(1)

      // 2. Face detection — try Claude → face-api CDN → center fallback
      const detectedFace = await detectFace(img)
      setFace(detectedFace)
      setStep(2)

      // 3. Background removal — try remove.bg → canvas threshold fallback
      const transparent = await removeBg(src)
      setTransparentSrc(transparent)
      setStep(3)

      // 4. Render all formats
      const transpImg = await loadImg(transparent)
      const faceBox   = detectedFace ?? centerFace(img.naturalWidth, img.naturalHeight)
      const res: Partial<Record<FormatId, string>> = {}

      for (const fmt of FORMATS) {
        res[fmt.id] = renderFormat(
          transpImg, faceBox, fmt, bgHex, rotation, brightness, contrast, zoom,
        )
      }

      setResults(res)
      setPhase('done')
    } catch (err) {
      console.error('Processing error:', err)
      setErrMsg('处理失败，请重新上传照片。')
      setPhase('error')
    }
  }

  // Re-render when settings change
  useEffect(() => {
    if (phase !== 'done' || !transparentSrc || !face) return
    void rerender()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgColor, rotation, brightness, contrast, zoom])

  async function rerender() {
    if (!transparentSrc || !face) return
    const transpImg = await loadImg(transparentSrc)
    const res: Partial<Record<FormatId, string>> = {}
    for (const fmt of FORMATS) {
      res[fmt.id] = renderFormat(transpImg, face, fmt, bgHex, rotation, brightness, contrast, zoom)
    }
    setResults(res)
    // Re-init active eraser canvas if open
    if (activeErase) {
      const fmtData = FORMATS.find(f => f.id === activeErase)
      if (fmtData && res[activeErase]) initEraserCanvas(res[activeErase]!, fmtData.w, fmtData.h)
    }
  }

  // ── Face detection chain ────────────────────────────────────────────────────
  async function detectFace(img: HTMLImageElement): Promise<FaceBox | null> {
    // Try Claude Vision API first
    try {
      const b64 = resizeToBase64(img, 1024)
      const res = await fetch('/api/process-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64, mediaType: 'image/jpeg' }),
      })
      const data = await res.json() as { found: boolean; x?: number; y?: number; w?: number; h?: number }
      if (data.found && data.x !== undefined) {
        return { x: data.x, y: data.y!, w: data.w!, h: data.h! }
      }
    } catch { /* fall through */ }

    // Try face-api.js from CDN
    try {
      const { loadFaceDetection, detectFace: dfApi } = await import('@/lib/face-detection')
      await loadFaceDetection()
      const box = await dfApi(img)
      if (box) {
        return {
          x: box.x / img.naturalWidth,
          y: box.y / img.naturalHeight,
          w: box.width  / img.naturalWidth,
          h: box.height / img.naturalHeight,
        }
      }
    } catch { /* fall through */ }

    // Final fallback: center of image
    return centerFace(img.naturalWidth, img.naturalHeight)
  }

  function centerFace(iw: number, ih: number): FaceBox {
    // Assume face is in center-upper third
    return { x: 0.2, y: 0.05, w: 0.6, h: 0.55 }
  }

  // ── Background removal chain ────────────────────────────────────────────────
  async function removeBg(src: string): Promise<string> {
    try {
      const blob = dataUrlToBlob(src)
      const fd   = new FormData()
      fd.append('image', blob)
      const res  = await fetch('/api/remove-bg', { method: 'POST', body: fd })

      if (!res.ok) throw new Error('api-err')
      const ct = res.headers.get('content-type') || ''

      if (ct.includes('image/')) {
        const buf = await res.arrayBuffer()
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
        return `data:image/png;base64,${b64}`
      }
      // Fallback signal received
    } catch { /* fall through */ }

    // Client-side threshold fallback
    return canvasRemoveWhite(src, 235)
  }

  async function canvasRemoveWhite(src: string, thresh: number): Promise<string> {
    const img = await loadImg(src)
    const c   = document.createElement('canvas')
    c.width   = img.naturalWidth; c.height = img.naturalHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const d = ctx.getImageData(0, 0, c.width, c.height)
    for (let i = 0; i < d.data.length; i += 4) {
      if (d.data[i] > thresh && d.data[i+1] > thresh && d.data[i+2] > thresh)
        d.data[i+3] = 0
    }
    ctx.putImageData(d, 0, 0)
    return c.toDataURL('image/png', 1.0)
  }

  // ── Eraser ──────────────────────────────────────────────────────────────────
  function initEraserCanvas(dataUrl: string, w: number, h: number) {
    const canvas = eraserCanvasRef.current
    if (!canvas) return
    canvas.width = w; canvas.height = h
    const ctx    = canvas.getContext('2d')!
    ctx.clearRect(0, 0, w, h)
    loadImg(dataUrl).then(img => {
      ctx.drawImage(img, 0, 0, w, h)
      historyRef.current = []
      // Update result live from canvas
      setResults(r => ({ ...r, [activeErase!]: canvas.toDataURL('image/png', 1.0) }))
    })
  }

  function openEraser(fmtId: FormatId) {
    setActiveErase(fmtId)
    setShowEraser(true)
    const fmt = FORMATS.find(f => f.id === fmtId)!
    const src = results[fmtId]
    if (src) initEraserCanvas(src, fmt.w, fmt.h)
  }

  function closeEraser() {
    // Flush canvas back to result
    const canvas = eraserCanvasRef.current
    if (canvas && activeErase) {
      setResults(r => ({ ...r, [activeErase]: canvas.toDataURL('image/png', 1.0) }))
    }
    setShowEraser(false)
    setActiveErase(null)
    setEraserOn(false)
  }

  const doErase = useCallback((cx: number, cy: number) => {
    const canvas = eraserCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const sx   = canvas.width  / rect.width
    const sy   = canvas.height / rect.height
    const x    = (cx - rect.left) * sx
    const y    = (cy - rect.top)  * sy
    const ctx  = canvas.getContext('2d')!
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, (brushSize * sx) / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    // Live preview
    setResults(r => ({ ...r, [activeErase!]: canvas.toDataURL('image/png', 0.8) }))
  }, [brushSize, activeErase])

  const onEraserDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!eraserOn) return
    e.preventDefault()
    setIsErasing(true)
    const canvas = eraserCanvasRef.current!
    const snap   = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height)
    historyRef.current = [...historyRef.current.slice(-9), snap]
    doErase(e.clientX, e.clientY)
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }, [eraserOn, doErase])

  const onEraserMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isErasing || !eraserOn) return
    e.preventDefault()
    doErase(e.clientX, e.clientY)
  }, [isErasing, eraserOn, doErase])

  const onEraserUp = useCallback(() => setIsErasing(false), [])

  const undoErase = useCallback(() => {
    if (!historyRef.current.length) return
    const canvas = eraserCanvasRef.current!
    const ctx    = canvas.getContext('2d')!
    const prev   = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    ctx.putImageData(prev, 0, 0)
    setResults(r => ({ ...r, [activeErase!]: canvas.toDataURL('image/png', 1.0) }))
  }, [activeErase])

  // ── Export ──────────────────────────────────────────────────────────────────
  async function exportFormat(fmtId: FormatId) {
    const src = results[fmtId]
    if (!src || exporting) return
    setExporting(fmtId)
    try {
      const fmt  = FORMATS.find(f => f.id === fmtId)!
      const img  = await loadImg(src)
      const c    = document.createElement('canvas')
      c.width    = fmt.w; c.height = fmt.h
      const ctx  = c.getContext('2d')!
      ctx.fillStyle = bgHex
      ctx.fillRect(0, 0, fmt.w, fmt.h)
      ctx.drawImage(img, 0, 0, fmt.w, fmt.h)
      const jpg  = toJpeg(c, 0.96)
      trigger(jpg, `${fmtId}-photo-${fmt.widthMm}x${fmt.heightMm}mm.jpg`)
      showToast(`✓ ${fmt.label} downloaded`)
    } catch { showToast('Download failed, please try again.') }
    finally { setExporting(null) }
  }

  async function exportPdf(fmtId: FormatId) {
    const src = results[fmtId]
    if (!src) return
    setExporting(fmtId)
    try {
      const { jsPDF } = await import('jspdf')
      const fmt     = FORMATS.find(f => f.id === fmtId)!
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const [pw, ph, mg, gx, gy] = [210, 297, 10, 5, 5]
      const cols    = Math.floor((pw - mg * 2 + gx) / (fmt.widthMm + gx))
      const img     = await loadImg(src)
      const c       = document.createElement('canvas')
      c.width = fmt.w; c.height = fmt.h
      const ctx     = c.getContext('2d')!
      ctx.fillStyle = bgHex; ctx.fillRect(0, 0, fmt.w, fmt.h)
      ctx.drawImage(img, 0, 0, fmt.w, fmt.h)
      const data    = toJpeg(c, 0.95).split(',')[1]

      let col = 0, row = 0
      for (let i = 0; i < 6; i++) {
        const x = mg + col * (fmt.widthMm + gx)
        const y = mg + row * (fmt.heightMm + gy)
        pdf.addImage(data, 'JPEG', x, y, fmt.widthMm, fmt.heightMm)
        pdf.setDrawColor(200, 200, 200); pdf.setLineWidth(0.1)
        for (const [cx, cy] of [[x,y],[x+fmt.widthMm,y],[x,y+fmt.heightMm],[x+fmt.widthMm,y+fmt.heightMm]] as [number,number][]) {
          pdf.line(cx-2,cy,cx-.5,cy); pdf.line(cx+.5,cy,cx+2,cy)
          pdf.line(cx,cy-2,cx,cy-.5); pdf.line(cx,cy+.5,cx,cy+2)
        }
        col++; if (col >= cols) { col = 0; row++ }
      }
      pdf.setFontSize(6); pdf.setTextColor(160,160,160)
      pdf.text(`EUIDPhoto.com · ${fmt.label} · ${fmt.widthMm}×${fmt.heightMm}mm · ${fmt.dpi}dpi`, pw/2, ph-4, { align: 'center' })
      pdf.save(`${fmtId}-print-sheet.pdf`)
      showToast(`✓ ${fmt.label} PDF downloaded`)
    } catch { showToast('PDF export failed.') }
    finally { setExporting(null) }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (phase === 'error') return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <div className="text-5xl mb-5">⚠️</div>
        <p className="text-ink-2 mb-6">{errMsg}</p>
        <button onClick={onBack}
          className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-accent transition-colors">
          <Upload size={16}/> Upload Another Photo
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pt-20 pb-20">

      {/* ── Processing ── */}
      {phase === 'processing' && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
          <div className="text-center">
            <div className="font-display text-3xl text-ink mb-2">Processing your photo</div>
            <p className="text-sm text-ink-4 font-light">This takes just a moment</p>
          </div>

          {/* Animated spinner */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-[3px] border-border" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-accent animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              {step === 0 ? '🖼️' : step === 1 ? '👤' : step === 2 ? '✂️' : '✨'}
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3 w-56">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s} className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                step > i ? 'text-green-600' : step === i ? 'text-accent font-medium' : 'text-ink-4'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-all ${
                  step > i ? 'bg-green-100 text-green-600' :
                  step === i ? 'bg-accent text-white' : 'bg-border'
                }`}>
                  {step > i ? '✓' : i + 1}
                </span>
                {s}
                {step === i && <span className="w-1 h-1 rounded-full bg-accent animate-pulse-dot ml-auto" />}
              </div>
            ))}
          </div>

          {/* Privacy notice during processing */}
          <div className="flex items-center gap-2 text-xs text-ink-4 bg-white border border-border px-4 py-2.5 rounded-full">
            <Shield size={13} className="text-green-600" />
            Your photo is processed securely and never stored
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {phase === 'done' && !showEraser && (
        <div className="animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <CheckCircle size={12} strokeWidth={2.5}/> Processed successfully
                </span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl tracking-tight text-ink">
                Your Passport Photos
              </h1>
            </div>
            <button onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-ink-3 border border-border px-4 py-2 rounded-full hover:border-ink hover:text-ink transition-colors">
              <Upload size={15}/> Upload another photo
            </button>
          </div>

          {/* ── Three format cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {FORMATS.map(fmt => {
              const src     = results[fmt.id]
              const previewW = 200
              const previewH = Math.round(previewW * fmt.h / fmt.w)
              const isExp   = exporting === fmt.id

              return (
                <div key={fmt.id}
                  className="bg-white border border-border rounded-3xl overflow-hidden flex flex-col">
                  {/* Card header */}
                  <div className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{fmt.badge}</span>
                      <div>
                        <div className="text-sm font-semibold text-ink">{fmt.label}</div>
                        <div className="text-xs text-ink-4">{fmt.desc}</div>
                      </div>
                    </div>
                  </div>

                  {/* Photo */}
                  <div className="flex-1 flex flex-col items-center py-6 px-4"
                    style={{ background: bgHex }}>
                    {src ? (
                      <div className="rounded-xl overflow-hidden shadow-lg"
                        style={{ width: previewW, height: previewH }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={fmt.label}
                          className="w-full h-full object-cover block" />
                      </div>
                    ) : (
                      <div className="rounded-xl bg-border animate-pulse"
                        style={{ width: previewW, height: previewH }}/>
                    )}
                  </div>

                  {/* ── Download button directly below photo ── */}
                  <div className="px-4 pb-4 pt-1 space-y-2">
                    <button
                      onClick={() => void exportFormat(fmt.id)}
                      disabled={!src || isExp}
                      className="w-full flex items-center justify-center gap-2.5 bg-ink text-white text-sm font-semibold py-3 rounded-2xl hover:bg-accent transition-all hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExp ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow"/>
                          Downloading…
                        </span>
                      ) : (
                        <>
                          <Download size={16} strokeWidth={2}/>
                          Download Image
                        </>
                      )}
                    </button>

                    {/* Secondary: PDF + Eraser */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => void exportPdf(fmt.id)}
                        disabled={!src}
                        className="flex-1 text-xs font-medium text-ink-3 border border-border py-2 rounded-xl hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
                      >
                        PDF Sheet
                      </button>
                      <button
                        onClick={() => openEraser(fmt.id)}
                        disabled={!src}
                        className="flex items-center gap-1 text-xs font-medium text-ink-3 border border-border px-3 py-2 rounded-xl hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
                        title="Touch up with eraser"
                      >
                        <Eraser size={13}/> Touch up
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Fine-tune panel ── */}
          <div className="bg-white border border-border rounded-3xl overflow-hidden mb-6">
            <button
              onClick={() => setShowTune(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-cream transition-colors"
            >
              <span className="text-sm font-semibold text-ink flex items-center gap-2">
                ✏️ Fine-tune
                <span className="text-xs font-normal text-ink-4">
                  — adjust rotation, brightness, background
                </span>
              </span>
              {showTune
                ? <ChevronUp size={16} className="text-ink-4"/>
                : <ChevronDown size={16} className="text-ink-4"/>}
            </button>

            {showTune && (
              <div className="border-t border-border px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-up">
                {/* Background */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink-3 mb-3">
                    Background Color
                  </p>
                  <div className="flex gap-3">
                    {BG_OPTIONS.map(bg => (
                      <div key={bg.id} className="flex flex-col items-center gap-1.5">
                        <button onClick={() => setBgColor(bg.id)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${bgColor === bg.id ? 'ring-2 ring-accent ring-offset-2' : ''}`}
                          style={{ background: bg.hex, border: `2px solid ${bg.border}` }}>
                          {bgColor === bg.id && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="rgba(0,0,0,.5)" strokeWidth="2.5">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                          )}
                        </button>
                        <span className="text-[10px] text-ink-4">{bg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-4">
                  {([
                    { label: '↻ Rotation', icon: RotateCw, min: -30, max: 30,  val: rotation,   set: setRotation,   reset: 0,   unit: '°' },
                    { label: '☀ Brightness', icon: Sun,     min: 60,  max: 160, val: brightness, set: setBrightness, reset: 100, unit: '%' },
                    { label: '◑ Contrast',   icon: Contrast, min: 60, max: 160, val: contrast,   set: setContrast,   reset: 100, unit: '%' },
                    { label: '⊕ Zoom',       icon: ZoomIn,  min: 80,  max: 130, val: zoom,       set: setZoom,       reset: 100, unit: '%' },
                  ] as const).map(({ label, min, max, val, set, reset, unit }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-ink-3">{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink tabular-nums w-10 text-right">
                            {val}{unit}
                          </span>
                          <button onClick={() => (set as (v: number) => void)(reset)}>
                            <RotateCcw size={11} className="text-ink-4 hover:text-accent"/>
                          </button>
                        </div>
                      </div>
                      <input type="range" min={min} max={max} value={val}
                        onChange={e => (set as (v: number) => void)(+e.target.value)}/>
                    </div>
                  ))}
                </div>

                {/* Quick rotate buttons */}
                <div className="flex items-center gap-3 md:col-span-2">
                  <span className="text-xs text-ink-4">Quick rotate:</span>
                  {([-90, -45, 45, 90] as const).map(d => (
                    <button key={d} onClick={() => setRotation(r => r + d)}
                      className="text-xs bg-border text-ink-3 px-2.5 py-1 rounded-lg hover:bg-border-2 transition-colors font-medium">
                      {d > 0 ? '+' : ''}{d}°
                    </button>
                  ))}
                  <button onClick={() => { setRotation(0); setBrightness(100); setContrast(100); setZoom(100) }}
                    className="ml-auto flex items-center gap-1.5 text-xs text-ink-4 hover:text-accent transition-colors">
                    <RefreshCw size={12}/> Reset all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy notice */}
          <div className="flex items-start gap-3 bg-white border border-border rounded-2xl px-5 py-4">
            <Shield size={16} className="text-green-600 mt-0.5 flex-shrink-0"/>
            <p className="text-xs text-ink-4 leading-relaxed">
              <span className="font-semibold text-ink-3">Your privacy is protected.</span>{' '}
              All image processing happens securely. Your photos are never stored on our servers,
              never shared with third parties, and are permanently deleted immediately after processing.
            </p>
          </div>
        </div>
      )}

      {/* ── Eraser overlay ── */}
      {phase === 'done' && showEraser && (
        <div className="animate-fade-up">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">Touch Up</p>
              <h2 className="font-display text-2xl text-ink">
                Eraser — {FORMATS.find(f => f.id === activeErase)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={undoErase} disabled={!historyRef.current.length}
                className="flex items-center gap-1.5 text-sm text-ink-3 border border-border px-3 py-2 rounded-full hover:text-accent hover:border-accent disabled:opacity-30 transition-colors">
                <Undo2 size={14}/> Undo
              </button>
              <button onClick={closeEraser}
                className="flex items-center gap-2 bg-ink text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-accent transition-colors">
                ✓ Done
              </button>
            </div>
          </div>

          <div className="bg-white border border-border rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setEraserOn(v => !v)}
                  className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${
                    eraserOn ? 'bg-ink text-white shadow' : 'bg-border text-ink-2 hover:bg-border-2'
                  }`}>
                  <Eraser size={15}/>
                  {eraserOn ? 'Eraser ON' : 'Enable Eraser'}
                </button>
                {eraserOn && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-4">Brush</span>
                    <input type="range" min={8} max={80} value={brushSize}
                      onChange={e => setBrushSize(+e.target.value)}
                      className="w-24"/>
                    <span className="text-xs font-bold text-ink w-6">{brushSize}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-ink-4">
                {eraserOn ? 'Click or drag to erase background' : 'Enable eraser then paint over background areas'}
              </span>
            </div>

            {/* Eraser canvas */}
            <div className="p-6 flex justify-center" style={{ background: bgHex }}>
              <canvas
                ref={eraserCanvasRef}
                className="rounded-xl shadow-lg block max-w-full max-h-[500px]"
                style={{
                  cursor: eraserOn
                    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${brushSize}' height='${brushSize}' viewBox='0 0 ${brushSize} ${brushSize}'%3E%3Ccircle cx='${brushSize/2}' cy='${brushSize/2}' r='${brushSize/2-1}' fill='rgba(255,255,255,.4)' stroke='%23555' stroke-width='1.5'/%3E%3C/svg%3E") ${brushSize/2} ${brushSize/2}, crosshair`
                    : 'default',
                }}
                onPointerDown={onEraserDown}
                onPointerMove={onEraserMove}
                onPointerUp={onEraserUp}
              />
            </div>

            <div className="px-5 py-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-ink-4">
                Erase remaining background artifacts. Changes update the photo automatically.
              </p>
              <button onClick={() => void exportFormat(activeErase!)}
                className="flex items-center gap-2 bg-ink text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-accent transition-all">
                <Download size={15}/> Download Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-lg animate-fade-up z-50 flex items-center gap-2 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
