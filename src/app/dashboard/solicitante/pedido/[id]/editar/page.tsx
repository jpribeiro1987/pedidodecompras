import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SimpleEditForm } from '@/components/SimpleEditForm'

export default async function EditarPedidoSolicitantePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SOLICITANTE') return null

  const { id } = await params
  const request = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: { items: true, requester: true }
  })

  if (!request) notFound()

  if (request.requesterId !== user.id) {
    return <div style={{ padding: '2rem' }}>Não autorizado.</div>
  }

  if (request.currentStatus !== 'CRIADA' && request.currentStatus !== 'DEVOLVIDA_AJUSTES') {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Este pedido já está em andamento e não pode ser editado. Caso precise, peça ao comprador para devolvê-lo para ajustes.</p>
        <Link href={`/dashboard/solicitante/pedido/${id}`} className="btn" style={{ marginTop: '1rem' }}>Voltar</Link>
      </div>
    )
  }

  const groups = await prisma.purchaseGroup.findMany({ orderBy: { name: 'asc' } })
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } })

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link href={`/dashboard/solicitante/pedido/${id}`} className="btn" style={{ backgroundColor: '#e2e8f0' }}>Voltar</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Editar Solicitação #{request.id.slice(0,8)}</h1>
      </div>
      
      {request.currentStatus === 'DEVOLVIDA_AJUSTES' && (
        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fbbf24' }}>
          <strong>⚠️ Pedido Devolvido para Ajustes:</strong> Faça as correções solicitadas. Ao salvar, ele será reenviado automaticamente para a Fila de Compras.
        </div>
      )}

      <SimpleEditForm 
        departments={JSON.parse(JSON.stringify(departments))} 
        groups={JSON.parse(JSON.stringify(groups))}
        request={JSON.parse(JSON.stringify(request))}
        role="SOLICITANTE"
      />
    </div>
  )
}
