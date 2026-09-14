import { getCurrentUser } from '@/app/actions'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import KanbanFilter from './KanbanFilter'

export default async function KanbanPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const buyerFilter = searchParams.buyer as string | undefined
  const user = await getCurrentUser()
  if (!user || user.role !== 'COMPRADOR') {
    redirect('/')
  }

  const allBuyers = await prisma.user.findMany({
    where: { role: { in: ['COMPRADOR', 'AUTORIZADOR', 'ADMIN'] } }
  })

  const requests = await prisma.purchaseRequest.findMany({
    where: {
      archived: false,
      currentStatus: {
        notIn: ['CANCELADA', 'RECUSADA']
      },
      ...(buyerFilter === 'unassigned' ? { buyerId: null } : buyerFilter && buyerFilter !== 'all' ? { buyerId: buyerFilter } : {})
    },
    include: {
      requester: { include: { department: true } },
      buyer: true,
      items: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Define Kanban Columns
  const columns = [
    {
      id: 'novas',
      title: 'Novas / Ajustes',
      statuses: ['CRIADA', 'DEVOLVIDA_AJUSTES'],
      color: '#3b82f6', // blue
      bgColor: '#eff6ff'
    },
    {
      id: 'cotacao',
      title: 'Em Cotação',
      statuses: ['EM_COTACAO', 'EM_ANALISE'],
      color: '#eab308', // yellow
      bgColor: '#fefce8'
    },
    {
      id: 'aprovacao',
      title: 'Aguard. Aprovação',
      statuses: ['AGUARDANDO_AUTORIZACAO', 'AGUARDANDO_FINANCEIRO'],
      color: '#f97316', // orange
      bgColor: '#fff7ed'
    },
    {
      id: 'concluidas',
      title: 'Concluídas / Retirada',
      statuses: ['APROVADA', 'DISPONIVEL_RETIRADA', 'ENTREGUE'],
      color: '#22c55e', // green
      bgColor: '#f0fdf4'
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Quadro Kanban (Fila de Compras)</h1>
          <KanbanFilter buyers={allBuyers} currentBuyer={buyerFilter || 'all'} />
        </div>
        <Link href="/dashboard/comprador" className="btn" style={{ backgroundColor: '#e2e8f0', color: 'black' }}>
          Mudar para Visualização em Lista
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start', minHeight: '600px' }}>
        {columns.map(col => {
          const colRequests = requests.filter(req => col.statuses.includes(req.currentStatus))
          
          return (
            <div key={col.id} style={{ 
              minWidth: '320px', 
              flex: 1,
              backgroundColor: col.bgColor, 
              borderRadius: '8px', 
              padding: '1rem',
              borderTop: `4px solid ${col.color}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>{col.title}</h2>
                <span style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {colRequests.length}
                </span>
              </div>

              {colRequests.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', padding: '2rem 0' }}>Vazio</p>
              ) : (
                colRequests.map(req => (
                  <Link href={`/dashboard/comprador/pedido/${req.id}`} key={req.id} style={{ textDecoration: 'none' }}>
                    <div style={{ 
                      backgroundColor: 'white', 
                      padding: '1rem', 
                      borderRadius: '6px', 
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.1s, box-shadow 0.1s',
                      cursor: 'pointer'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                          {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: '#e2e8f0', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>
                          {req.currentStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem', lineHeight: '1.2' }}>
                        {req.items && req.items.length > 0 ? req.items[0].description : req.description}
                        {req.items && req.items.length > 1 && ` (+${req.items.length - 1})`}
                      </h3>
                      
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        Solicitante: {req.requester.name}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginTop: '1rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px dashed #e2e8f0'
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
                          Resp: <span style={{ color: req.buyer ? '#2563eb' : '#94a3b8' }}>{req.buyer ? req.buyer.name : 'Nenhum'}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: req.priority === 'ALTA' ? '#ef4444' : req.priority === 'MEDIA' ? '#f59e0b' : '#3b82f6' }}>
                          {req.priority || 'NORMAL'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}