'use client'

import { FaceBox } from '@/types'

let loaded = false
let faceApi: typeof import('@vladmandic/face-api') | null = null

const CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'

export async function loadFaceDetection(): Promise<void> {
  if (loaded) return
  faceApi = await import('@vladmandic/face-api')
  await Promise.all([
    faceApi.nets.tinyFaceDetector.loadFromUri(CDN),
    faceApi.nets.faceLandmark68TinyNet.loadFromUri(CDN),
  ])
  loaded = true
}

export async function detectFace(img: HTMLImageElement): Promise<FaceBox | null> {
  if (!faceApi) throw new Error('face-api not loaded')
  const det = await faceApi
    .detectSingleFace(img, new faceApi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: 0.35,
    }))
    .withFaceLandmarks(true)
  if (!det) return null
  const { box } = det.detection
  return { x: box.x, y: box.y, width: box.width, height: box.height }
}

export function computeBiometricCrop(
  face: FaceBox,
  imgW: number, imgH: number,
  targetW: number, targetH: number,
  headRatio = 0.75,
  eyeRatio = 0.45,
): { x: number; y: number; width: number; height: number } {
  const aspect  = targetW / targetH
  const headH   = face.height * 1.4
  const centerX = face.x + face.width / 2
  const eyeY    = face.y + face.height * 0.38

  const cropH = headH / headRatio
  const cropW = cropH * aspect

  let cx = centerX - cropW / 2
  let cy = eyeY   - cropH * eyeRatio

  cx = Math.max(0, Math.min(cx, imgW - cropW))
  cy = Math.max(0, Math.min(cy, imgH - cropH))

  return {
    x: Math.round(cx),
    y: Math.round(cy),
    width:  Math.round(Math.min(cropW, imgW)),
    height: Math.round(Math.min(cropH, imgH)),
  }
}
