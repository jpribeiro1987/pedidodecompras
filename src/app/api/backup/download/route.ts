import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/actions'
import { join } from 'path'
import { readFileSync, existsSync } from 'fs'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const fileName = searchParams.get('file')

  if (!fileName || !fileName.endsWith('.db')) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
  }

  const backupPath = join(process.cwd(), 'backups', fileName)
  
  if (!existsSync(backupPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const fileBuffer = readFileSync(backupPath)

  const headers = new Headers()
  headers.set('Content-Disposition', `attachment; filename="${fileName}"`)
  headers.set('Content-Type', 'application/octet-stream')

  return new NextResponse(fileBuffer, {
    status: 200,
    headers,
  })
}