import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SimpleEditForm } from '@/components/SimpleEditForm'

export default async function EditarPedidoCompradorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return null

  const { id } = await params
  const request = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: { items: true, requester: true }
  })

  if (!request) notFound()

  if (request.currentStatus === 'ENTREGUE' || request.currentStatus === 'CANCELADA') {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Este pedido já foi finalizado e não pode ser editado.</p>
        <Link href={`/dashboard/comprador/pedido/${id}`} className="btn" style={{ marginTop: '1rem' }}>Voltar</Link>
      </div>
    )
  }

  const groups = await prisma.purchaseGroup.findMany({ orderBy: { name: 'asc' } })
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } })

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link href={`/dashboard/comprador/pedido/${id}`} className="btn" style={{ backgroundColor: '#e2e8f0' }}>Voltar</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Editar Solicitação #{request.id.slice(0,8)}</h1>
      </div>
      <SimpleEditForm 
        departments={JSON.parse(JSON.stringify(departments))} 
        groups={JSON.parse(JSON.stringify(groups))}
        request={JSON.parse(JSON.stringify(request))}
        role="COMPRADOR"
      />
    </div>
  )
}
