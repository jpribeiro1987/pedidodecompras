import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import Link from 'next/link'

export default async function HistoricoGeralPage({
  searchParams
}: {
  searchParams: Promise<{ start?: string, end?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) return null

  // Ensure resolved
  const params = await searchParams
  const startParam = params.start
  const endParam = params.end

  let whereClause: any = {
    requesterId: user.id
  }

  if (startParam || endParam) {
    whereClause.createdAt = {}
    if (startParam) {
      const startDate = new Date(startParam)
      startDate.setHours(0, 0, 0, 0)
      whereClause.createdAt.gte = startDate
    }
    if (endParam) {
      const endDate = new Date(endParam)
      endDate.setHours(23, 59, 59, 999)
      whereClause.createdAt.lte = endDate
    }
  }

  const requests = await prisma.purchaseRequest.findMany({
    where: whereClause,
    include: {
      requester: {
        include: { department: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Meu Histórico de Solicitações</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form method="GET" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label htmlFor="start">Data Inicial</label>
            <input type="date" id="start" name="start" className="input-field" defaultValue={startParam || ''} />
          </div>
          <div>
            <label htmlFor="end">Data Final</label>
            <input type="date" id="end" name="end" className="input-field" defaultValue={endParam || ''} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', height: 'fit-content' }}>
              🔍 Filtrar
            </button>
            {(startParam || endParam) && (
              <Link href="/dashboard/historico" className="btn" style={{ padding: '0.75rem 1.5rem', height: 'fit-content', backgroundColor: '#e2e8f0', color: 'black', textDecoration: 'none' }}>
                Limpar
              </Link>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        {requests.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
            Nenhum pedido encontrado nesse período.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Data</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>ID</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Descrição</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Solicitante / Setor</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                    {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>{req.id.split('-')[0]}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{req.description}</td>
                  <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>
                    <strong>{req.requester.name}</strong><br />
                    <span style={{ color: '#64748b' }}>{req.requester.department?.name || 'Sem Setor'}</span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: req.archived ? '#e2e8f0' : (req.currentStatus === 'APROVADA' ? '#bbf7d0' : (req.currentStatus === 'REJEITADA' ? '#fecaca' : '#dbeafe')),
                      color: req.archived ? '#475569' : (req.currentStatus === 'APROVADA' ? '#166534' : (req.currentStatus === 'REJEITADA' ? '#991b1b' : '#1e40af'))
                    }}>
                      {req.archived ? `ARQUIVADA (${req.currentStatus})` : req.currentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Link href={user.role === 'ADMIN' ? `/dashboard/solicitante/pedido/${req.id}` : `/dashboard/${user.role.toLowerCase()}/pedido/${req.id}`} style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.875rem' }}>
                      Ver detalhes
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
