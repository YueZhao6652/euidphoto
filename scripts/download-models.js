#!/usr/bin/env node
/**
 * Downloads face-api.js TinyFaceDetector and FaceLandmark68TinyNet models
 * into /public/models/ — required for client-side face detection.
 *
 * Run: npm run download-models
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const MODELS_DIR = path.join(__dirname, '..', 'public', 'models')
const BASE_URL =
  'https://raw.githubusercontent.com/vladmandic/face-api/master/model'

const FILES = [
  // TinyFaceDetector
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  // FaceLandmark68TinyNet
  'face_landmark_68_tiny_model-weights_manifest.json',
  'face_landmark_68_tiny_model-shard1',
]

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      console.log(`  ✓ Already exists: ${path.basename(dest)}`)
      return resolve()
    }
    const file = fs.createWriteStream(dest)
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`))
          return
        }
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          console.log(`  ↓ Downloaded: ${path.basename(dest)}`)
          resolve()
        })
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {})
        reject(err)
      })
  })
}

async function main() {
  console.log('\n📦 Downloading face-api.js models...\n')
  fs.mkdirSync(MODELS_DIR, { recursive: true })

  for (const file of FILES) {
    const url = `${BASE_URL}/${file}`
    const dest = path.join(MODELS_DIR, file)
    try {
      await download(url, dest)
    } catch (err) {
      console.error(`  ✗ Failed: ${file}`, err.message)
    }
  }

  console.log('\n✅ Models ready in /public/models/\n')
}

main()
