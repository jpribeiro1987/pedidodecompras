'use server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from './actions'
import { revalidatePath } from 'next/cache'

export async function addObserverAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Não autorizado' }

  const requestId = formData.get('requestId') as string
  const observerId = formData.get('observerId') as string
  if (!requestId || !observerId) return { error: 'Dados inválidos' }

  await prisma.purchaseRequest.update({
    where: { id: requestId },
    data: {
      observers: { connect: { id: observerId } }
    }
  })

  revalidatePath('/dashboard/solicitante/pedido/' + requestId)
  revalidatePath('/dashboard/comprador/pedido/' + requestId)
}

export async function removeObserverAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Não autorizado' }

  const requestId = formData.get('requestId') as string
  const observerId = formData.get('observerId') as string
  if (!requestId || !observerId) return { error: 'Dados inválidos' }

  await prisma.purchaseRequest.update({
    where: { id: requestId },
    data: {
      observers: { disconnect: { id: observerId } }
    }
  })

  revalidatePath('/dashboard/solicitante/pedido/' + requestId)
  revalidatePath('/dashboard/comprador/pedido/' + requestId)
}