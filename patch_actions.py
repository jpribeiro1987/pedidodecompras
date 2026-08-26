with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

start_sig = 'export async function createRequestAction(formData: FormData) {'

new_action = """export async function createRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'SOLICITANTE' && user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return { error: 'Não autorizado' }

  const justification = formData.get('justification') as string
  const priority = formData.get('priority') as string
  const classification = formData.get('classification') as string
  const groupId = formData.get('groupId') as string
  let targetRequesterId = user.id

  if (user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') {
    const overrideId = formData.get('requesterId') as string
    if (overrideId) {
      targetRequesterId = overrideId
    }
  }

  const itemsStr = formData.get('items') as string
  let items = []
  if (itemsStr) {
    items = JSON.parse(itemsStr)
  }

  const oldDescription = formData.get('description') as string
  const oldQuantity = parseInt(formData.get('quantity') as string, 10)
  const oldLink = formData.get('link') as string

  const newRequest = await prisma.purchaseRequest.create({
    data: {
      description: items.length > 0 ? null : oldDescription,
      quantity: items.length > 0 ? null : oldQuantity,
      link: items.length > 0 ? null : (oldLink || null),
      justification,
      priority,
      classification,
      groupId: groupId || null,
      requesterId: targetRequesterId,
      items: items.length > 0 ? {
        create: items.map((i: any) => ({
          description: i.description,
          quantity: parseInt(i.quantity, 10),
          link: i.link || null
        }))
      } : undefined
    }
  })

  await prisma.statusHistory.create({
    data: {
      newStatus: 'CRIADA',
      requestId: newRequest.id,
      userId: user.id
    }
  })

  revalidatePath('/dashboard/solicitante')
  revalidatePath('/dashboard/comprador')
  redirect(`/dashboard/${user.role.toLowerCase()}/pedido/${newRequest.id}`)
}"""

start_idx = content.find(start_sig)
if start_idx != -1:
    next_func_idx = content.find('export async function', start_idx + len(start_sig))
    if next_func_idx != -1:
        content = content[:start_idx] + new_action + '\n\n' + content[next_func_idx:]
    else:
        content = content[:start_idx] + new_action
        
    with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
        f.write(content)
