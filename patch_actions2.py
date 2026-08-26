import os

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

start_sig = 'export async function createRequestAction(formData: FormData) {'

new_action = """export async function createRequestAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'SOLICITANTE' && user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return { error: 'Não autorizado' }

  const justification = formData.get('justification') as string
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
  } else {
    // Fallback for extremely old legacy forms if hit somehow
    const description = formData.get('description') as string
    const quantity = parseInt(formData.get('quantity') as string, 10)
    const link = formData.get('link') as string
    const priority = formData.get('priority') as string
    const classification = formData.get('classification') as string
    const groupId = formData.get('groupId') as string
    
    if (description) {
      items.push({ description, quantity, link, priority, classification, groupId })
    }
  }

  // Create a separate PurchaseRequest for each item
  for (const item of items) {
    const newRequest = await prisma.purchaseRequest.create({
      data: {
        description: null,
        quantity: null,
        link: null,
        justification,
        priority: item.priority || 'MEDIA',
        classification: item.classification || 'Consumo',
        groupId: item.groupId || null,
        requesterId: targetRequesterId,
        items: {
          create: [{
            description: item.description,
            quantity: parseInt(item.quantity, 10),
            link: item.link || null
          }]
        }
      }
    })

    await prisma.statusHistory.create({
      data: {
        newStatus: 'CRIADA',
        requestId: newRequest.id,
        userId: user.id
      }
    })
  }

  revalidatePath('/dashboard/solicitante')
  revalidatePath('/dashboard/comprador')
  
  // Since we created multiple requests, we redirect back to the list instead of a specific request details page
  redirect(`/dashboard/${user.role.toLowerCase()}`)
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
else:
    print("Function signature not found in actions.ts!")
