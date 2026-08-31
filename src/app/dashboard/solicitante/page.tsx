import { formatRequestItems } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, archiveRequestAction } from '@/app/actions'
import Link from 'next/link'

export default async function SolicitanteDashboard() {
  const user = await getCurrentUser()
  
  if (!user) return null

  const requests = await prisma.purchaseRequest.findMany({
    where: { requesterId: user.id, archived: false },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  })

  const columns = [
    { id: 'novas', title: 'Novas / Análise', statuses: ['CRIADA', 'EM_ANALISE'], color: '#e2e8f0', borderColor: '#cbd5e1' },
    { id: 'cotacao', title: 'Em Cotação', statuses: ['EM_COTACAO'], color: '#fef08a', borderColor: '#fde047' },
    { id: 'autorizacao', title: 'Aguard. Aprovação', statuses: ['AGUARDANDO_AUTORIZACAO', 'AGUARDANDO_FINANCEIRO'], color: '#fed7aa', borderColor: '#fdba74' },
    { id: 'concluidas', title: 'Concluídas', statuses: ['APROVADA', 'DISPONIVEL_RETIRADA', 'REJEITADA', 'RECUSADA'], color: '#bbf7d0', borderColor: '#86efac' },
  ]

  const getStatusBadge = (status: string) => {
    if (status === 'APROVADA') return <span style={{ backgroundColor: '#22c55e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>APROVADA</span>
    if (status === 'DISPONIVEL_RETIRADA') return <span style={{ backgroundColor: '#14b8a6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>RETIRADA DISPONÍVEL</span>
    if (status === 'REJEITADA' || status === 'RECUSADA') return <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>{status}</span>
    if (status === 'AGUARDANDO_FINANCEIRO') return <span style={{ backgroundColor: '#eab308', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>FINANCEIRO</span>
    return <span style={{ backgroundColor: '#94a3b8', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>{status}</span>
  }

  return (
    <div style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Meus Pedidos (Kanban)</h1>
        <Link href="/dashboard/solicitante/nova" className="btn btn-primary">
          + Nova Solicitação
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="card">
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
            Nenhuma solicitação encontrada.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          overflowX: 'auto', 
          flex: 1,
          paddingBottom: '1rem'
        }}>
          {columns.map(col => {
            const colRequests = requests.filter(r => col.statuses.includes(r.currentStatus))
            
            // Agrupar por batchId se existir e estiverem na mesma coluna
            const grouped: any[] = []
            const map = new Map()
            for (const req of colRequests) {
              if (req.batchId) {
                if (!map.has(req.batchId)) {
                  map.set(req.batchId, [])
                }
                map.get(req.batchId).push(req)
              } else {
                grouped.push({ isBatch: false, requests: [req] })
              }
            }
            map.forEach((reqs, batchId) => {
              grouped.push({ isBatch: true, batchId, requests: reqs })
            })
            grouped.sort((a, b) => new Date(b.requests[0].createdAt).getTime() - new Date(a.requests[0].createdAt).getTime())
            
            return (
              <div key={col.id} style={{ 
                minWidth: '300px', 
                width: '300px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px', 
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e2e8f0',
                maxHeight: '100%'
              }}>
                <div style={{ 
                  padding: '1rem', 
                  borderBottom: `2px solid ${col.borderColor}`,
                  backgroundColor: col.color,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#1e293b' }}>{col.title}</h2>
                  <span style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: '#1e293b', padding: '2px 8px', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600 }}>
                    {grouped.length}
                  </span>
                </div>
                
                <div style={{ 
                  padding: '0.75rem', 
                  overflowY: 'auto', 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {grouped.map(group => {
                    const mainReq = group.requests[0];
                    const isMulti = group.requests.length > 1;
                    const itemsDesc = group.requests.map((r: any) => formatRequestItems(r)).join(', ');
                    const totalQty = group.requests.reduce((acc: number, r: any) => acc + (r.items?.reduce((s: number, i: any) => s + i.quantity, 0) || r.quantity || 1), 0);

                    return (
                      <div key={group.isBatch ? group.batchId : mainReq.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Link href={`/dashboard/solicitante/pedido/${mainReq.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div style={{ 
                            backgroundColor: 'white', 
                            padding: '1rem', 
                            borderRadius: '6px', 
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            cursor: 'pointer'
                          }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                {isMulti ? `Pacote (${group.requests.length} pedidos)` : `#${mainReq.id.split('-')[0]}`}
                              </span>
                              {getStatusBadge(mainReq.currentStatus)}
                            </div>
                            <p style={{ fontWeight: 500, margin: '0 0 0.5rem 0', fontSize: '0.95rem', lineHeight: '1.4' }}>
                              {itemsDesc}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {new Date(mainReq.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                Qtd Total: {totalQty}
                              </span>
                            </div>
                          </div>
                        </Link>
                        {col.id === 'concluidas' && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {group.requests.map((req: any, idx: number) => (
                              <form key={req.id} action={archiveRequestAction} style={{ flex: 1 }}>
                                <input type="hidden" name="id" value={req.id} />
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.7rem', padding: '0.5rem', backgroundColor: '#334155', border: 'none' }} title={formatRequestItems(req)}>
                                  Ocultar {isMulti ? (idx + 1) : ''}
                                </button>
                              </form>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  {grouped.length === 0 && (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', border: '2px dashed #e2e8f0', borderRadius: '6px' }}>
                      Vazio
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
