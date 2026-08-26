import { formatRequestItems } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, archiveBuyerRequestAction } from '@/app/actions'
import Link from 'next/link'

export default async function CompradorDashboard() {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return null

  // Comprador sees requests that are CRIADA or EM_ANALISE or EM_COTACAO
  const requests = await prisma.purchaseRequest.findMany({
    where: {
      currentStatus: {
        in: ['CRIADA', 'EM_ANALISE', 'EM_COTACAO', 'DEVOLVIDO', 'AGUARDANDO_FINANCEIRO', 'APROVADA', 'RECUSADA']
      }
    },
    orderBy: { createdAt: 'asc' },
    include: { requester: true }
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
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Data</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => {
                const canArchive = req.currentStatus === 'APROVADA' || req.currentStatus === 'RECUSADA'
                
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>{req.id.split('-')[0]}</td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{req.requester.name}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{formatRequestItems(req)}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
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
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                      {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link href={`/dashboard/comprador/pedido/${req.id}`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                          Analisar
                        </Link>
                        
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
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
