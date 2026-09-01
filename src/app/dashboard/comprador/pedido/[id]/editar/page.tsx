import { getCurrentUser } from '@/app/actions'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { EditRequestForm } from '@/components/EditRequestForm'

export default async function EditarPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'COMPRADOR') {
    redirect('/')
  }

  const { id } = await params
  
  const request = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: { items: true, requester: true }
  })

  if (!request) {
    return <div style={{ padding: '2rem' }}>Pedido não encontrado.</div>
  }

  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } })
  const groups = await prisma.purchaseGroup.findMany({ orderBy: { name: 'asc' } })

  let targetUsers = []
  if (user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') {
    targetUsers = await prisma.user.findMany({
      where: { role: 'SOLICITANTE' },
      select: { id: true, name: true, department: { select: { name: true } } },
      orderBy: { name: 'asc' }
    })
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Editar Solicitação #{request.id.slice(0,8)}</h1>
      <EditRequestForm 
        user={user} 
        departments={departments} 
        targetUsers={targetUsers as any} 
        groups={groups}
        request={request}
      />
    </div>
  )
}
