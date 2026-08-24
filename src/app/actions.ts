'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios' }
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || user.password !== password) {
    return { error: 'E-mail ou senha inválidos' }
  }

  const cookieStore = await cookies()
  cookieStore.set('userId', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })

  // Redirect based on role
  if (user.role === 'SOLICITANTE') {
    redirect('/dashboard/solicitante')
  } else if (user.role === 'COMPRADOR') {
    redirect('/dashboard/comprador')
  } else if (user.role === 'AUTORIZADOR') {
    redirect('/dashboard/autorizador')
  } else {
    redirect('/dashboard/admin')
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
  redirect('/')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) return null

  return await prisma.user.findUnique({
    where: { id: userId },
    include: { department: true }
  })
}

export async function createRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'SOLICITANTE' && user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return { error: 'Não autorizado' }

  const description = formData.get('description') as string
  const justification = formData.get('justification') as string
  const link = formData.get('link') as string
  const priority = formData.get('priority') as string
  const quantity = parseInt(formData.get('quantity') as string, 10)
  
  const classification = formData.get('classification') as string
  const groupId = formData.get('groupId') as string
  let targetRequesterId = user.id

  if (user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') {
    const overrideId = formData.get('requesterId') as string
    if (overrideId) {
      targetRequesterId = overrideId
    }
  }

  const newRequest = await prisma.purchaseRequest.create({
    data: {
      description,
      justification,
      link: link || null,
      priority,
      quantity,
      classification,
      groupId,
      requesterId: targetRequesterId,
      history: {
        create: {
          previousStatus: 'N/A',
          newStatus: 'CRIADA',
          observation: user.id !== targetRequesterId ? `Solicitação criada por ${user.name}` : 'Solicitação criada',
          userId: user.id
        }
      }
    }
  })

  // Handle files
  const files = formData.getAll('files') as File[]
  for (const file of files) {
    if (file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const fileName = `${newRequest.id}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const uploadDir = join(process.cwd(), 'public', 'uploads')
      const filePath = join(uploadDir, fileName)
      
      await writeFile(filePath, buffer)
      
      await prisma.attachment.create({
        data: {
          name: file.name,
          url: `/uploads/${fileName}`,
          requestId: newRequest.id
        }
      })
    }
  }

  redirect('/dashboard/solicitante')
}

export async function extendDeliveryDateAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return { error: 'Não autorizado' }

  const requestId = formData.get('requestId') as string
  const newDate = formData.get('deliveryDate') as string
  const reason = formData.get('reason') as string

  const currentRequest = await prisma.purchaseRequest.findUnique({ where: { id: requestId } })
  if (!currentRequest) return { error: 'Not found' }

  const dataStr = new Date(newDate + 'T12:00:00Z').toLocaleDateString('pt-BR')

  await prisma.purchaseRequest.update({
    where: { id: requestId },
    data: {
      deliveryDate: new Date(newDate + 'T12:00:00Z'),
      history: {
        create: {
          previousStatus: currentRequest.currentStatus,
          newStatus: currentRequest.currentStatus,
          observation: `Prazo de entrega prorrogado para ${dataStr}. Motivo: ${reason}`,
          userId: user.id
        }
      }
    }
  })

  revalidatePath('/dashboard/comprador/pedido/' + requestId)
}

export async function updateRequestStatusAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return { error: 'Não autorizado' }

  const requestId = formData.get('requestId') as string
  const newStatus = formData.get('status') as string
  const observation = formData.get('observation') as string
  const winnerCriteria = formData.get('winnerCriteria') as string
  const winnerJustification = formData.get('winnerJustification') as string
  const deliveryDate = formData.get('deliveryDate') as string
  const autoApproved = formData.get('autoApproved') === 'true'

  // Handle quotes from Comprador
  const quotesCount = parseInt(formData.get('quotesCount') as string || '0', 10)
  const quotesData = []

  if (quotesCount > 0) {
    const winnerIndexStr = formData.get('winnerIndex') as string
    const winnerIndex = parseInt(winnerIndexStr, 10)

    for (let i = 0; i < quotesCount; i++) {
      const supplierId = formData.get(`quote_${i}_supplierId`) as string
      const priceStr = formData.get(`quote_${i}_price`) as string
      const price = parseFloat(priceStr.replace(',', '.'))
      
      const negotiatedPriceStr = formData.get(`quote_${i}_negotiatedPrice`) as string
      const negotiatedPrice = negotiatedPriceStr ? parseFloat(negotiatedPriceStr.replace(',', '.')) : null
      
      if (supplierId && !isNaN(price)) {
        const isWinner = i === winnerIndex
        quotesData.push({ supplierId, supplierName: 'Ver Fornecedor Vinculado', price, negotiatedPrice, isWinner })
      }
    }
  }

  const currentRequest = await prisma.purchaseRequest.findUnique({ where: { id: requestId } })
  if (!currentRequest) return { error: 'Pedido não encontrado' }

  // Check if Autorizador is approving it
  const isAutorizadorApproving = user.role === 'AUTORIZADOR' && newStatus === 'AGUARDANDO_FINANCEIRO'

  await prisma.purchaseRequest.update({
    where: { id: requestId },
    data: {
      currentStatus: newStatus,
      // If Autorizador approves, they have already acknowledged it
      ...(isAutorizadorApproving ? { directorAcknowledged: true } : {}),
      ...(winnerCriteria ? { winnerCriteria } : {}),
      ...(winnerJustification ? { winnerJustification } : {}),
      ...(deliveryDate ? { deliveryDate: new Date(deliveryDate) } : {}),
      ...(quotesData.length > 0 ? {
        quotes: {
          deleteMany: {}, // replace all quotes
          create: quotesData
        }
      } : {}),
      history: {
        create: {
          previousStatus: currentRequest.currentStatus,
          newStatus: newStatus,
          observation: autoApproved ? 'Aprovado Automaticamente (Dentro da Alçada de Compras)' : (observation || 'Atualização de status'),
          userId: user.id
        }
      }
    }
  })

  // Redirect to clear form depending on role
  if (user.role === 'COMPRADOR') {
    redirect('/dashboard/comprador')
  } else {
    redirect('/dashboard/autorizador')
  }
}

export async function denyRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return { error: 'Não autorizado' }

  const requestId = formData.get('requestId') as string
  const reason = formData.get('reason') as string

  if (!reason) return { error: 'A justificativa é obrigatória' }

  const currentRequest = await prisma.purchaseRequest.findUnique({ where: { id: requestId } })
  if (!currentRequest) return { error: 'Pedido não encontrado' }

  await prisma.purchaseRequest.update({
    where: { id: requestId },
    data: {
      currentStatus: 'RECUSADA',
      history: {
        create: {
          previousStatus: currentRequest.currentStatus,
          newStatus: 'RECUSADA',
          observation: `Recusado pelo comprador. Motivo: ${reason}`,
          userId: user.id
        }
      }
    }
  })

  redirect('/dashboard/comprador')
}

export async function acknowledgeRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'AUTORIZADOR') return { error: 'Não autorizado' }

  const requestId = formData.get('requestId') as string

  const currentRequest = await prisma.purchaseRequest.findUnique({ where: { id: requestId } })
  if (!currentRequest) return { error: 'Pedido não encontrado' }

  await prisma.purchaseRequest.update({
    where: { id: requestId },
    data: {
      directorAcknowledged: true,
      history: {
        create: {
          previousStatus: currentRequest.currentStatus,
          newStatus: currentRequest.currentStatus,
          observation: 'Ciência da diretoria registrada.',
          userId: user.id
        }
      }
    }
  })

  redirect('/dashboard/autorizador')
}

export async function archiveRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SOLICITANTE') return { error: 'Não autorizado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'ID inválido' }

  await prisma.purchaseRequest.update({
    where: { id, requesterId: user.id },
    data: { currentStatus: 'ARQUIVADA' }
  })
  
  revalidatePath('/dashboard/solicitante')
}

export async function approveFromFinanceAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return { error: 'Não autorizado' }

  const requestId = formData.get('requestId') as string
  const currentRequest = await prisma.purchaseRequest.findUnique({ where: { id: requestId } })
  if (!currentRequest) return { error: 'Not found' }

  await prisma.purchaseRequest.update({
    where: { id: requestId },
    data: {
      currentStatus: 'APROVADA',
      history: {
        create: {
          previousStatus: currentRequest.currentStatus,
          newStatus: 'APROVADA',
          observation: 'Liberado pelo Financeiro. Compra efetivada.',
          userId: user.id
        }
      }
    }
  })

  redirect('/dashboard/comprador')
}

export async function archiveBuyerRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return { error: 'Não autorizado' }

  const id = formData.get('id') as string
  if (!id) return { error: 'ID inválido' }

  const currentRequest = await prisma.purchaseRequest.findUnique({ where: { id } })
  if (!currentRequest) return { error: 'Pedido não encontrado' }

  await prisma.purchaseRequest.update({
    where: { id },
    data: {
      currentStatus: 'ARQUIVADA',
      history: {
        create: {
          previousStatus: currentRequest.currentStatus,
          newStatus: 'ARQUIVADA',
          observation: 'Arquivado pelo Comprador',
          userId: user.id
        }
      }
    }
  })
  
  revalidatePath('/dashboard/comprador')
}
