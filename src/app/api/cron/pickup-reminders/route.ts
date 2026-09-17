import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPickupStatusEmail } from '@/lib/mailer'

export async function GET(request: Request) {
  // In a real app, you'd want to check an Authorization header here for security
  // e.g. if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const pendingPickups = await prisma.purchaseRequest.findMany({
      where: {
        currentStatus: 'DISPONIVEL_RETIRADA',
        archived: false
      }
    })

    let count = 0
    for (const req of pendingPickups) {
      await sendPickupStatusEmail(req.id, 'DISPONIVEL_RETIRADA')
      count++
    }

    return NextResponse.json({ success: true, count, message: `Disparados ${count} e-mails de lembrete de retirada.` })
  } catch (error: any) {
    console.error('Erro na cron de lembrete de retirada:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}