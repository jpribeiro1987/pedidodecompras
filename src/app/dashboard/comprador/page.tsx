import { formatRequestItems } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, archiveBuyerRequestAction, assignBuyerAction, transferBuyerAction } from '@/app/actions'
import Link from 'next/link'

export default async function CompradorDashboard() {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR' && user.role !== 'ADMIN')) return null

  const whereClause: any = {
    currentStatus: {
      in: ['CRIADA', 'EM_ANALISE', 'EM_COTACAO', 'DEVOLVIDO', 'AGUARDANDO_FINANCEIRO', 'APROVADA', 'RECUSADA']
    }
  }

  const requests = await prisma.purchaseRequest.findMany({
    where: whereClause,
    orderBy: { createdAt: 'asc' },
    include: { requester: true, items: true, buyer: true }
  })

  const allBuyers = await prisma.user.findMany({
    where: { role: 'COMPRADOR' }
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Fila de Compras</h1>
      </div>

      <div className="card">
        {requests.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
            Nenhuma solicitação na fila de trabalho.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>ID</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Solicitante</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Descrição</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Responsável</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const grouped: any[] = []
                const map = new Map()
                for (const req of requests) {
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
                grouped.sort((a, b) => new Date(a.requests[0].createdAt).getTime() - new Date(b.requests[0].createdAt).getTime())
                
                return grouped.map(group => {
                  const req = group.requests[0]
                  const isMulti = group.requests.length > 1
                  const canArchive = req.currentStatus === 'APROVADA' || req.currentStatus === 'RECUSADA'
                  const currentBuyer = req.buyer
                  
                  return (
                    <tr key={group.isBatch ? group.batchId : req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>
                        {isMulti ? `Pacote (${group.requests.length})` : req.id.split('-')[0]}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{req.requester.name}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        {group.requests.map((r: any) => formatRequestItems(r)).join(', ')}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        {isMulti ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Vários</span>
                        ) : (
                          <span style={{ 
                            display: 'inline-block', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            backgroundColor: '#fef3c7',
                            color: '#b45309'
                          }}>
                            {req.currentStatus}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        {currentBuyer ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e40af' }}>{currentBuyer.name}</span>
                            {(user.role === 'AUTORIZADOR' || user.role === 'ADMIN' || currentBuyer.id === user.id) && (
                              <form action={transferBuyerAction} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                <input type="hidden" name="id" value={req.id} />
                                <input type="hidden" name="isBatch" value={isMulti ? "true" : "false"} />
                                <select name="buyerId" style={{ fontSize: '0.7rem', padding: '0.1rem', maxWidth: '100px' }} required>
                                  <option value="">Transferir...</option>
                                  {allBuyers.filter(b => b.id !== currentBuyer.id).map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                  ))}
                                </select>
                                <button type="submit" className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.1rem 0.25rem' }}>Ok</button>
                              </form>
                            )}
                          </div>
                        ) : (
                          <form action={assignBuyerAction}>
                            <input type="hidden" name="id" value={req.id} />
                            <input type="hidden" name="isBatch" value={isMulti ? "true" : "false"} />
                            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#10b981', border: 'none' }}>
                              Assumir {isMulti ? 'Pacote' : 'Pedido'}
                            </button>
                          </form>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {(!currentBuyer || currentBuyer.id === user.id || user.role === 'AUTORIZADOR' || user.role === 'ADMIN') ? (
                            <Link href={isMulti ? `/dashboard/comprador/lote/${group.batchId}` : `/dashboard/comprador/pedido/${req.id}`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                              Analisar
                            </Link>
                          ) : (
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', backgroundColor: '#e2e8f0', color: '#94a3b8', borderRadius: '4px', cursor: 'not-allowed' }}>
                              Em uso
                            </span>
                          )}
                          
                          {!isMulti && (
                            <form action={archiveBuyerRequestAction}>
                              <input type="hidden" name="id" value={req.id} />
                              <button 
                                type="submit" 
                                disabled={!canArchive}
                                className="btn"
                                style={{ 
                                  fontSize: '0.75rem', 
                                  padding: '0.25rem 0.75rem',
                                  backgroundColor: canArchive ? '#f1f5f9' : '#e2e8f0',
                                  color: canArchive ? '#475569' : '#94a3b8',
                                  cursor: canArchive ? 'pointer' : 'not-allowed',
                                  border: '1px solid #cbd5e1'
                                }}
                              >
                                Arquivar
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              })()}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
