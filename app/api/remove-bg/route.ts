import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as Blob | null
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey || apiKey === 'your_removebg_api_key_here') {
      return NextResponse.json({ fallback: true })
    }

    const rbForm = new FormData()
    rbForm.append('image_file', imageFile)
    rbForm.append('size', 'auto')
    rbForm.append('type', 'person')
    rbForm.append('type_level', '2')
    rbForm.append('format', 'png')
    rbForm.append('crop', 'false')

    const rbRes = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: rbForm,
    })

    if (!rbRes.ok) {
      console.error('remove.bg error:', rbRes.status, await rbRes.text())
      return NextResponse.json({ fallback: true })
    }

    const buf = await rbRes.arrayBuffer()
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('remove-bg route error:', err)
    return NextResponse.json({ fallback: true })
  }
}
