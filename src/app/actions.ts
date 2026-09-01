'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function loginAction(formData: FormData) {
  const rawEmail = formData.get('email') as string
  const password = (formData.get('password') as string)?.trim()

  if (!rawEmail || !password) {
    return { error: 'E-mail e senha são obrigatórios' }
  }

  // Fetch all users to do case-insensitive match since SQLite doesn't support mode: insensitive
  const email = rawEmail.trim().toLowerCase()
  
  const users = await prisma.user.findMany()
  const user = users.find(u => u.email.toLowerCase() === email)

  if (!user || user.password !== password) {
    return { error: 'E-mail ou senha inválidos' }
  }

  const cookieStore = await cookies()
  cookieStore.set('userId', user.id, {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
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
    include: { department: true, additionalDepartments: true }
  })
}
export async function createRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'SOLICITANTE' && user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return { error: 'No autorizado' }

  const justification = formData.get('justification') as string
  let targetRequesterId = user.id
  let departmentId = formData.get('departmentId') as string || user.departmentId

  if (user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') {
    const overrideId = formData.get('requesterId') as string
    if (overrideId) {
      targetRequesterId = overrideId
    }
  }

  const itemsStr = formData.get('items') as string
  let items: any[] = []
  if (itemsStr) {
    items = JSON.parse(itemsStr)
  }

  const batchId = crypto.randomUUID()

  try {
    for (let index = 0; index < items.length; index++) {
      const item = items[index]
      
      let imageUrl = null
      const file = formData.get(`item_image_${index}`) as File | null
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const uploadDir = join(process.cwd(), 'public/uploads')
        await writeFile(join(uploadDir, filename), buffer)
        imageUrl = `/uploads/${filename}`
      }

      const newRequest = await prisma.purchaseRequest.create({
        data: {
          description: item.description,
          quantity: parseInt(item.quantity, 10),
          link: item.link || null,
          justification,
          batchId,
          priority: item.priority || 'MEDIA',
          classification: item.classification || 'Consumo',
          ...(item.groupId ? { group: { connect: { id: item.groupId } } } : {}),
          department: departmentId ? { connect: { id: departmentId } } : undefined,
          requester: { connect: { id: targetRequesterId } },
          items: {
            create: [{
              description: item.description,
              quantity: parseInt(item.quantity, 10),
              link: item.link || null,
              imageUrl
            }]
          }
        }
      })

      await prisma.statusHistory.create({
        data: {
          newStatus: 'CRIADA',
          request: { connect: { id: newRequest.id } },
          user: { connect: { id: user.id } }
        }
      })
    }
    
    revalidatePath('/dashboard/solicitante')
    revalidatePath('/dashboard/comprador')
    return { success: true, redirectUrl: `/dashboard/${user.role.toLowerCase()}` }
  } catch (err: any) {
    console.error('CREATE REQUEST ERROR:', err);
    return { error: err.message || 'Erro ao criar pedido no banco de dados' }
  }
}

export async function extendDeliveryDateAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return { error: 'Não autorizado' }

  const requestId = formData.get('requestId') as string
  const newDate = formData.get('deliveryDate') as string
  const reason = formData.get('reason') as string

  const currentRequest = await prisma.purchaseRequest.findUnique({ where: { id: requestId } })
  if (!currentRequest) return { error: 'Not found' }

  const dataStr = new Date(newDate + 'T12:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

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

export async function assignBuyerAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR' && user.role !== 'ADMIN')) return { error: 'Não autorizado' }

  const id = formData.get('id') as string
  const isBatch = formData.get('isBatch') === 'true'

  if (isBatch) {
    const request = await prisma.purchaseRequest.findUnique({ where: { id } })
    if (request?.batchId) {
      const requestsInBatch = await prisma.purchaseRequest.findMany({ where: { batchId: request.batchId } })
      for (const req of requestsInBatch) {
        if (req.currentStatus === 'CRIADA') {
          await prisma.purchaseRequest.update({
            where: { id: req.id },
            data: { 
              buyerId: user.id, 
              currentStatus: 'EM_COTACAO',
              history: { create: { previousStatus: req.currentStatus, newStatus: 'EM_COTACAO', observation: 'Comprador assumiu o pedido e iniciou cotação', userId: user.id } }
            }
          })
        } else {
          await prisma.purchaseRequest.update({
            where: { id: req.id },
            data: { buyerId: user.id }
          })
        }
      }
    }
  } else {
    const req = await prisma.purchaseRequest.findUnique({ where: { id } })
    if (req) {
      if (req.currentStatus === 'CRIADA') {
        await prisma.purchaseRequest.update({
          where: { id },
          data: { 
            buyerId: user.id,
            currentStatus: 'EM_COTACAO',
            history: { create: { previousStatus: req.currentStatus, newStatus: 'EM_COTACAO', observation: 'Comprador assumiu o pedido e iniciou cotação', userId: user.id } }
          }
        })
      } else {
        await prisma.purchaseRequest.update({
          where: { id },
          data: { buyerId: user.id }
        })
      }
    }
  }

  revalidatePath('/dashboard/comprador')
}

export async function transferBuyerAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR' && user.role !== 'ADMIN')) return { error: 'Não autorizado' }

  const id = formData.get('id') as string
  const newBuyerId = formData.get('buyerId') as string
  const isBatch = formData.get('isBatch') === 'true'

  if (!newBuyerId) return { error: 'Nenhum comprador selecionado' }

  if (isBatch) {
    const request = await prisma.purchaseRequest.findUnique({ where: { id } })
    if (request?.batchId) {
      await prisma.purchaseRequest.updateMany({
        where: { batchId: request.batchId },
        data: { buyerId: newBuyerId }
      })
    }
  } else {
    await prisma.purchaseRequest.update({
      where: { id },
      data: { buyerId: newBuyerId }
    })
  }

  revalidatePath('/dashboard/comprador')
}

export async function deleteRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Não autorizado' }

  const id = formData.get('id') as string
  const request = await prisma.purchaseRequest.findUnique({ 
    where: { id },
    include: { items: true, requester: true }
  })
  if (!request) return { error: 'Pedido não encontrado' }

  if (user.role === 'SOLICITANTE' && (request.requesterId !== user.id || request.currentStatus !== 'CRIADA')) {
    return { error: 'Você só pode excluir seus próprios pedidos e que estejam com status Novos (CRIADA).' }
  if ((user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') && (request.currentStatus === 'ENTREGUE' || request.currentStatus === 'CANCELADA')) {
    return { error: 'Não é possível excluir pedidos finalizados.' }
  }
  }


  // Deixar log de exclusão
  const itemsDesc = request.items.map(i => i.description).join(', ')
  await prisma.deletionLog.create({
    data: {
      requestId: request.id,
      description: request.description || itemsDesc,
      requesterId: request.requesterId,
      deletedBy: user.name + ' (' + user.role + ')'
    }
  })

  await prisma.purchaseRequest.delete({ where: { id } })

  if (user.role === 'SOLICITANTE') {
    revalidatePath('/dashboard/solicitante')
  } else {
    revalidatePath('/dashboard/comprador')
    revalidatePath('/dashboard/autorizador')
  }
  
  redirect('/dashboard/' + (user.role === 'COMPRADOR' ? 'comprador' : user.role === 'AUTORIZADOR' ? 'autorizador' : 'solicitante'))
}

export async function markAsDeliveredAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Não autorizado' }

  const id = formData.get('id') as string
  const request = await prisma.purchaseRequest.findUnique({ where: { id } })
  if (!request) return { error: 'Pedido não encontrado' }

  await prisma.purchaseRequest.update({
    where: { id },
    data: {
      currentStatus: 'ENTREGUE',
      history: {
        create: {
          previousStatus: request.currentStatus,
          newStatus: 'ENTREGUE',
          observation: 'Mercadoria informada com retirada (Entregue)',
          userId: user.id
        }
      }
    }
  })

  revalidatePath(`/dashboard/${user.role.toLowerCase()}/pedido/${id}`)
}

export async function archiveRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Não autorizado' }

  const id = formData.get('id') as string
  const request = await prisma.purchaseRequest.findUnique({ where: { id } })
  if (!request) return { error: 'Pedido não encontrado' }

  await prisma.purchaseRequest.update({
    where: { id },
    data: { archived: true }
  })

  revalidatePath(`/dashboard/${user.role.toLowerCase()}`)
}

export async function updateRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'SOLICITANTE' && user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR' && user.role !== 'ADMIN')) {
    return { error: 'Não autorizado' }
  }

  const id = formData.get('id') as string
  const request = await prisma.purchaseRequest.findUnique({ where: { id }, include: { items: true } })
  if (!request) return { error: 'Pedido não encontrado' }

  if (user.role === 'SOLICITANTE' && (request.requesterId !== user.id || request.currentStatus !== 'CRIADA')) {
    return { error: 'Você só pode editar seus próprios pedidos e que estejam com status Novos (CRIADA).' }
  }
  
  if ((user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') && (request.currentStatus === 'ENTREGUE' || request.currentStatus === 'CANCELADA')) {
    return { error: 'Não é possível editar pedidos finalizados.' }
  }

  const justification = formData.get('justification') as string
  const departmentId = formData.get('departmentId') as string | null
  const deliveryDateStr = formData.get('deliveryDate') as string | null
  const itemsJson = formData.get('items') as string
  
  let parsedItems = []
  try {
    if (itemsJson) parsedItems = JSON.parse(itemsJson)
  } catch(e) {}

  let deliveryDate = null
  if (deliveryDateStr) {
    deliveryDate = new Date(deliveryDateStr)
  }

  // Deletar os itens antigos e criar os novos
  await prisma.purchaseItem.deleteMany({ where: { purchaseRequestId: id } })

  await prisma.purchaseRequest.update({
    where: { id },
    data: {
      justification,
      departmentId: departmentId || undefined,
      deliveryDate,
      items: {
        create: parsedItems.map((item: any) => ({
          description: item.description,
          quantity: item.quantity ? parseInt(item.quantity) : null,
          priority: item.priority || null,
          link: item.link || null,
          imageUrl: item.imageUrl || null
        }))
      }
    }
  })

  // Registrar histórico
  await prisma.statusHistory.create({
    data: {
      newStatus: request.currentStatus,
      observation: 'Pedido editado',
      purchaseRequestId: id,
      userId: user.id
    }
  })

  // revalidatePath('/dashboard/solicitante')
  // revalidatePath('/dashboard/comprador')
  // revalidatePath('/dashboard/autorizador')
  // revalidatePath('/dashboard/solicitante/pedido/' + id)
  
  return { success: true }
}
