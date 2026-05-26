# Face Detection Models

This directory is populated by running:

```bash
npm run download-models
```

It will download the following files from vladmandic/face-api (~2MB total):

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_tiny_model-weights_manifest.json`
- `face_landmark_68_tiny_model-shard1`

These files are served statically and loaded in the browser for client-side face detection.
Do NOT commit these binary files to git (add to .gitignore if needed).
