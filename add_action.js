const fs = require('fs');
let content = fs.readFileSync('src/app/actions.ts', 'utf8');

const target = `export async function approveFromFinanceAction(formData: FormData)`;
const replacement = `export async function returnForAdjustmentAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR' && user.role !== 'ADMIN')) return

  const id = formData.get('id') as string
  const reason = formData.get('reason') as string

  if (!id || !reason) return

  const request = await prisma.purchaseRequest.findUnique({ where: { id } })
  if (!request) return

  await prisma.purchaseRequest.update({
    where: { id },
    data: { currentStatus: 'DEVOLVIDA_AJUSTES' }
  })

  await prisma.statusHistory.create({
    data: {
      newStatus: 'DEVOLVIDA_AJUSTES',
      observation: 'Devolvido para ajustes: ' + reason,
      requestId: id,
      userId: user.id
    }
  })

  revalidatePath('/dashboard')
  revalidatePath(\`/dashboard/comprador/pedido/\${id}\`)
}

export async function approveFromFinanceAction(formData: FormData)`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/app/actions.ts', content, 'utf8');
    console.log('Added returnForAdjustmentAction');
}
