import re

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add markAsDeliveredAction and archiveRequestAction
new_actions = """
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
"""

if "export async function markAsDeliveredAction" not in content:
    content += new_actions
    with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
        f.write(content)
