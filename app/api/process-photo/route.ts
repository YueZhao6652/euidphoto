import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json() as {
      imageBase64: string
      mediaType: string
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ found: false, reason: 'no-api-key' })
    }

    // Validate input
    if (!imageBase64 || imageBase64.length < 100) {
      return NextResponse.json({ found: false, reason: 'invalid-image' })
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType || 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `Locate the primary human face in this image.
Return ONLY a single JSON object, no explanation, no markdown:
{"found":true,"x":0.25,"y":0.10,"w":0.50,"h":0.60}
x,y = top-left corner of face bounding box as fraction of image width/height (0-1)
w,h = width/height of face bounding box as fraction (0-1)
If no human face exists: {"found":false}`,
              },
            ],
          },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic API error:', res.status, err)
      return NextResponse.json({ found: false, reason: 'api-error' })
    }

    const data = await res.json() as {
      content: Array<{ type: string; text: string }>
    }
    const text = data.content?.find(b => b.type === 'text')?.text ?? ''

    // Extract JSON from response
    const match = text.match(/\{[^{}]+\}/)
    if (!match) return NextResponse.json({ found: false, reason: 'parse-error' })

    const parsed = JSON.parse(match[0]) as {
      found: boolean; x?: number; y?: number; w?: number; h?: number
    }
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('process-photo route error:', err)
    return NextResponse.json({ found: false, reason: 'server-error' })
  }
}
