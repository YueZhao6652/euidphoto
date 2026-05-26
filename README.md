# EUIDPhoto v3

> AI-powered passport photo generator. Upload any photo → get professional passport, visa, and CV portrait photos instantly.

**Tech:** Next.js 15 · TypeScript · TailwindCSS · Claude Vision AI · remove.bg

---

## ✨ What's new in v3

- **Claude Vision AI** face detection — works on any photo, any background
- **Three output formats**: Passport · Visa · CV Portrait — all in one shot
- **Single "Download Image" button** directly below each photo
- **Eraser tool** for manual touch-up after AI processing
- **Fully automatic** — no manual cropping required
- **Privacy notice** — photos never stored

---

## 🚀 Setup (5 minutes)

### 1. Clone & install
```bash
git clone https://github.com/yourname/euidphoto.git
cd euidphoto
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# REQUIRED for AI face detection
ANTHROPIC_API_KEY=sk-ant-...

# OPTIONAL but recommended for clean background removal
REMOVE_BG_API_KEY=your_key_here

# Your production URL
NEXT_PUBLIC_APP_URL=https://euidphoto.com
```

**API keys:**
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com) — pay-per-use, ~$0.003 per photo
- **remove.bg**: [remove.bg/api](https://www.remove.bg/api) — 50 free calls/month

> **Works without both keys** — falls back to CDN face-api.js then center-crop, and canvas white-pixel removal.

### 3. Run
```bash
npm run dev
# → http://localhost:3000
```

---

## ☁️ Deploy to Vercel (one click)

```bash
vercel --prod
```

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Recommended | Claude Vision face detection |
| `REMOVE_BG_API_KEY` | Optional | Professional bg removal |
| `NEXT_PUBLIC_APP_URL` | Yes | Your domain |

---

## 🔄 Processing pipeline

```
Upload photo
     │
     ▼
[Claude Vision API] → face bounding box (x, y, w, h as 0-1 fractions)
     │ fallback: face-api.js from CDN
     │ fallback: center-of-image estimate
     ▼
[remove.bg API] → transparent PNG (background removed)
     │ fallback: canvas white-pixel threshold removal
     ▼
[Canvas rendering × 3 formats]
  Passport  35×45mm  413×531px
  Visa      51×51mm  600×600px
  Portrait  60×75mm  600×750px
     │
     ▼
Display with "Download Image" button below each photo
```

---

## 📁 Project structure

```
euidphoto/
├── app/
│   ├── layout.tsx               # Root layout, fonts, SEO metadata
│   ├── page.tsx                 # Home (landing + editor routing)
│   ├── globals.css
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── [country]/page.tsx       # SEO pages: /germany-passport-photo
│   └── api/
│       ├── process-photo/       # Claude Vision face detection
│       └── remove-bg/           # remove.bg proxy
├── components/
│   ├── Nav.tsx
│   ├── UploadZone.tsx
│   ├── editor/
│   │   └── Editor.tsx           # Main editor (854 lines)
│   └── landing/
│       ├── Hero.tsx
│       ├── HowItWorks.tsx
│       ├── Countries.tsx
│       ├── Features.tsx
│       ├── FAQ.tsx
│       ├── CTABand.tsx
│       └── Footer.tsx
├── config/
│   └── passport-templates.ts    # 8 country specs
├── lib/
│   ├── face-detection.ts        # face-api.js (CDN fallback)
│   ├── image-processing.ts
│   └── export.ts
├── types/index.ts
├── .env.example
├── vercel.json
└── README.md
```

---

## 🆕 Adding a country

Edit `config/passport-templates.ts`, add to `PASSPORT_TEMPLATES` and `COUNTRY_SLUGS`. Done — country card, SEO page, sitemap all update automatically.

---

## 🔮 Future-ready architecture

| Feature | Where to add |
|---|---|
| Auth / accounts | NextAuth.js + middleware |
| Stripe paywall | `/api/checkout` + gate PDF export |
| Better AI segmentation | Swap `/api/remove-bg` handler |
| Face relighting | Post-process step after bg removal |
| More countries | `config/passport-templates.ts` |

---

## 📄 License

MIT
