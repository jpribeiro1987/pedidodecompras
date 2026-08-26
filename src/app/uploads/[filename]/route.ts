import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const resolvedParams = await params
  const filename = resolvedParams.filename
  
  // Safe path joining to prevent directory traversal
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-_]/g, '')
  const filePath = join(process.cwd(), 'public', 'uploads', safeFilename)

  if (!existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 })
  }

  try {
    const file = await readFile(filePath)
    
    // Determine content type based on extension
    const ext = safeFilename.split('.').pop()?.toLowerCase() || ''
    let contentType = 'application/octet-stream'
    if (ext === 'pdf') contentType = 'application/pdf'
    else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
      contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`
    } else if (ext === 'txt') contentType = 'text/plain'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      },
    })
  } catch (error) {
    return new NextResponse('Error reading file', { status: 500 })
  }
}
