import { formatRequestItems } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import Link from 'next/link'

export default async function AutorizadorDashboard() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'AUTORIZADOR') return null

  // Autorizador sees requests that are AGUARDANDO_AUTORIZACAO
  const pendingApproval = await prisma.purchaseRequest.findMany({
    where: {
      currentStatus: 'AGUARDANDO_AUTORIZACAO'
    },
    orderBy: { createdAt: 'asc' },
    include: { requester: true, quotes: true, items: true }
  })

  // Autorizador also sees requests that need acknowledgement
  const pendingAcknowledgement = await prisma.purchaseRequest.findMany({
    where: {
      directorAcknowledged: false,
      currentStatus: { in: ['AGUARDANDO_FINANCEIRO', 'APROVADA'] }
    },
    orderBy: { createdAt: 'desc' },
    include: { requester: true, quotes: true, items: true }
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Aguardando Aprovação</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        {pendingApproval.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
            Nenhuma solicitação aguardando aprovação no momento.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>ID</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Solicitante</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Descrição</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Valor Vencedor</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Data</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pendingApproval.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>{req.id.split('-')[0]}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{req.requester.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{formatRequestItems(req)}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                    {(() => {
                      const winnerQuote = req.quotes?.find(q => q.isWinner)
                      return winnerQuote 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(winnerQuote.price)
                        : 'Não cotado'
                    })()}
                  </td>
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                    {new Date(req.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Link href={`/dashboard/autorizador/pedido/${req.id}`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                      Avaliar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '3rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Aguardando Ciência da Diretoria</h1>
      </div>

      <div className="card">
        {pendingAcknowledgement.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
            Nenhuma solicitação aguardando ciência no momento.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>ID</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Solicitante</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Descrição</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Valor Vencedor</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pendingAcknowledgement.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>{req.id.split('-')[0]}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{req.requester.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{formatRequestItems(req)}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#16a34a' }}>
                    {(() => {
                      const winnerQuote = req.quotes?.find(q => q.isWinner)
                      return winnerQuote 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(winnerQuote.price)
                        : 'Não cotado'
                    })()}
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {req.currentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Link href={`/dashboard/autorizador/pedido/${req.id}`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
                      Visualizar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
