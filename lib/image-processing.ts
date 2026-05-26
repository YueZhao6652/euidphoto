'use client'

import { BgColor } from '@/types'
import { BG_HEX } from '@/config/passport-templates'

/**
 * Load an image from a data URL or object URL into an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Crop an image using a canvas.
 * @returns data URL of the cropped image
 */
export function cropImage(
  img: HTMLImageElement,
  sx: number, sy: number, sw: number, sh: number,
  outW: number, outH: number,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)
  return canvas.toDataURL('image/png', 1.0)
}

/**
 * Apply a solid background color to an image (replaces transparency / white bg).
 * If the image has transparency (PNG), fills behind it.
 * For photos without transparency, just composites a color layer underneath.
 */
export function applyBackground(
  dataUrl: string,
  bgColor: BgColor,
  outW: number,
  outH: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')!

      // Fill background
      ctx.fillStyle = BG_HEX[bgColor] || '#FFFFFF'
      ctx.fillRect(0, 0, outW, outH)

      // Draw image on top
      ctx.drawImage(img, 0, 0, outW, outH)

      resolve(canvas.toDataURL('image/png', 1.0))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

/**
 * Apply zoom, rotation, and offset adjustments to an image.
 * Returns the adjusted canvas data URL at target dimensions.
 */
export function applyAdjustments(
  dataUrl: string,
  outW: number,
  outH: number,
  zoom: number,       // percentage, 100 = 1x
  rotateDeg: number,
  offsetX = 0,
  offsetY = 0,
  bgColor: BgColor = 'white',
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = BG_HEX[bgColor] || '#FFFFFF'
      ctx.fillRect(0, 0, outW, outH)

      ctx.save()
      ctx.translate(outW / 2 + offsetX, outH / 2 + offsetY)
      ctx.rotate((rotateDeg * Math.PI) / 180)
      ctx.scale(zoom / 100, zoom / 100)
      ctx.drawImage(img, -outW / 2, -outH / 2, outW, outH)
      ctx.restore()

      resolve(canvas.toDataURL('image/png', 1.0))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

/**
 * Convert a data URL to a Blob.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new Blob([u8arr], { type: mime })
}

/**
 * Simple white background removal using canvas pixel manipulation.
 * Works best on studio/plain backgrounds.
 * threshold: 0–255, how aggressively to remove near-white pixels.
 */
export function removeWhiteBackground(
  dataUrl: string,
  threshold = 240,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        // If pixel is near-white, make transparent
        if (r > threshold && g > threshold && b > threshold) {
          data[i + 3] = 0
        }
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png', 1.0))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

/**
 * Trigger a file download in the browser.
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

/**
 * Convert PNG data URL to JPG data URL with white background.
 */
export function pngToJpg(dataUrl: string, quality = 0.95): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}
