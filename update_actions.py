import re

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update createRequestAction to accept departmentId
create_req_start = content.find('export async function createRequestAction(formData: FormData) {')
create_req_end = content.find('const itemsStr = formData.get(\\'items\\') as string', create_req_start)

new_create_req_start = """export async function createRequestAction(formData: FormData) {
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

  """
content = content[:create_req_start] + new_create_req_start + content[create_req_end:]

# Update the prisma.purchaseRequest.create inside createRequestAction
prisma_create_start = content.find('const newRequest = await prisma.purchaseRequest.create({')
prisma_create_end = content.find('requester: { connect: { id: targetRequesterId } },', prisma_create_start)
if prisma_create_start != -1 and prisma_create_end != -1:
    content = content[:prisma_create_end] + "department: departmentId ? { connect: { id: departmentId } } : undefined,\n          requester: { connect: { id: targetRequesterId } }," + content[prisma_create_end + len('requester: { connect: { id: targetRequesterId } },'):]

# 2. Rewrite assignBuyerAction
assign_buyer_pattern = r'export async function assignBuyerAction\(formData: FormData\) \{.*?revalidatePath\(\'/dashboard/comprador\'\)\n\}'
assign_buyer_new = """export async function assignBuyerAction(formData: FormData) {
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
}"""
content = re.sub(assign_buyer_pattern, assign_buyer_new, content, flags=re.DOTALL)

# 3. Add deleteRequestAction
delete_action = """
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
  }

  if (user.role === 'COMPRADOR' && request.currentStatus !== 'CRIADA') {
    return { error: 'Compradores só podem excluir pedidos novos (CRIADA).' }
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
}
"""
content += delete_action

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(content)
