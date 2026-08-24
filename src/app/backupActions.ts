'use server'

import { getCurrentUser } from '@/app/actions'
import { copyFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { revalidatePath } from 'next/cache'

export async function createBackupAction() {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') return { error: 'Não autorizado' }

  const backupDir = join(process.cwd(), 'backups')
  const dbPath = join(process.cwd(), 'prisma', 'dev.db')
  
  // ensure dir exists
  try {
    await mkdir(backupDir, { recursive: true })
  } catch (e) {
    // ignore
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupName = `backup_${timestamp}.db`
  const backupPath = join(backupDir, backupName)

  await copyFile(dbPath, backupPath)
  revalidatePath('/dashboard/admin/backup')
}

export async function restoreBackupAction(formData: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') return { error: 'Não autorizado' }

  const fileName = formData.get('fileName') as string
  if (!fileName || !fileName.endsWith('.db')) {
    return { error: 'Arquivo inválido' }
  }

  const backupPath = join(process.cwd(), 'backups', fileName)
  const dbPath = join(process.cwd(), 'prisma', 'dev.db')

  await copyFile(backupPath, dbPath)
  revalidatePath('/dashboard/admin/backup')
}
