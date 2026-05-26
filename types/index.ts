// ─── Passport Template ────────────────────────────────────────────────────────
export interface PassportTemplate {
  code: string
  name: string
  flag: string
  widthMm: number
  heightMm: number
  widthPx: number
  heightPx: number
  dpi: number
  headHeightMin: number   // fraction of total height
  headHeightMax: number
  eyeLineRatio: number    // eye line from top as fraction
  background: 'white' | 'light-gray' | 'light-blue'
  note: string
  requirements: string[]
}

// ─── App State ────────────────────────────────────────────────────────────────
export type AppView = 'landing' | 'editor'
export type BgColor = 'white' | 'lightgray' | 'lightblue'
export type ExportFormat = 'jpg' | 'png' | 'pdf'

export interface FaceBox {
  x: number
  y: number
  width: number
  height: number
}

export interface ProcessingState {
  status: 'idle' | 'detecting' | 'cropping' | 'removing-bg' | 'done' | 'error'
  step: number
  error?: string
}

export interface EditorState {
  originalImage: string | null
  processedImage: string | null
  zoom: number
  rotate: number
  offsetX: number
  offsetY: number
  bgColor: BgColor
  selectedCountry: string
  faceBox: FaceBox | null
  processing: ProcessingState
  showOverlay: boolean
  showPrintSheet: boolean
}

export interface BgOption {
  id: BgColor
  label: string
  hex: string
  border: string
}
