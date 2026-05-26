'use client'

import { PassportTemplate } from '@/types'
import { downloadDataUrl, pngToJpg } from './image-processing'

/**
 * Download the passport photo as a JPG file.
 */
export async function downloadJpg(dataUrl: string, template: PassportTemplate) {
  const jpg = await pngToJpg(dataUrl, 0.95)
  const filename = `passport-photo-${template.code.toLowerCase()}-${template.widthMm}x${template.heightMm}mm.jpg`
  downloadDataUrl(jpg, filename)
}

/**
 * Download the passport photo as a PNG file.
 */
export function downloadPng(dataUrl: string, template: PassportTemplate) {
  const filename = `passport-photo-${template.code.toLowerCase()}-${template.widthMm}x${template.heightMm}mm.png`
  downloadDataUrl(dataUrl, filename)
}

/**
 * Generate a print-ready PDF with multiple passport photos on an A4 sheet.
 * Uses jsPDF (loaded dynamically to avoid SSR issues).
 *
 * Layout: 3 columns × N rows on A4 (210×297mm), with 5mm margins and gutters.
 */
export async function downloadPrintSheetPdf(
  dataUrl: string,
  template: PassportTemplate,
  copies = 6,
) {
  const { jsPDF } = await import('jspdf')

  // A4 page in mm
  const pageW = 210
  const pageH = 297
  const margin = 10
  const gutterX = 5
  const gutterY = 5

  const cols = Math.floor((pageW - margin * 2 + gutterX) / (template.widthMm + gutterX))
  const rows = Math.ceil(copies / cols)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Convert data URL to base64 image data (strip header)
  const jpgUrl = await pngToJpg(dataUrl, 0.95)
  const imgData = jpgUrl.split(',')[1]

  let col = 0
  let row = 0

  for (let i = 0; i < copies; i++) {
    const x = margin + col * (template.widthMm + gutterX)
    const y = margin + row * (template.heightMm + gutterY)

    pdf.addImage(imgData, 'JPEG', x, y, template.widthMm, template.heightMm)

    col++
    if (col >= cols) {
      col = 0
      row++
    }
  }

  // Add subtle crop marks
  pdf.setDrawColor(180, 180, 180)
  pdf.setLineWidth(0.1)

  col = 0
  row = 0
  for (let i = 0; i < copies; i++) {
    const x = margin + col * (template.widthMm + gutterX)
    const y = margin + row * (template.heightMm + gutterY)
    const markLen = 2

    // Corner crop marks
    const corners = [
      [x, y],
      [x + template.widthMm, y],
      [x, y + template.heightMm],
      [x + template.widthMm, y + template.heightMm],
    ]
    for (const [cx, cy] of corners) {
      pdf.line(cx - markLen, cy, cx - 1, cy)
      pdf.line(cx + 1, cy, cx + markLen, cy)
      pdf.line(cx, cy - markLen, cx, cy - 1)
      pdf.line(cx, cy + 1, cx, cy + markLen)
    }

    col++
    if (col >= cols) { col = 0; row++ }
  }

  // Footer note
  pdf.setFontSize(7)
  pdf.setTextColor(160, 160, 160)
  pdf.text(
    `EUIDPhoto.com · ${template.name} passport photo · ${template.widthMm}×${template.heightMm}mm · ${template.dpi}dpi · ${template.note}`,
    pageW / 2,
    pageH - 5,
    { align: 'center' },
  )

  const filename = `passport-photos-${template.code.toLowerCase()}-print-sheet.pdf`
  pdf.save(filename)
}
