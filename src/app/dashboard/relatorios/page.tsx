import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import Link from 'next/link'
import { Prisma } from '@prisma/client'

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR' && user.role !== 'ADMIN')) return null

  const resolvedSearchParams = await searchParams
  
  const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : ''
  const requesterFilter = typeof resolvedSearchParams.requester === 'string' ? resolvedSearchParams.requester : ''
  const dateStart = typeof resolvedSearchParams.dateStart === 'string' ? resolvedSearchParams.dateStart : ''
  const dateEnd = typeof resolvedSearchParams.dateEnd === 'string' ? resolvedSearchParams.dateEnd : ''
  const classificationFilter = typeof resolvedSearchParams.classification === 'string' ? resolvedSearchParams.classification : ''

  const whereCondition: Prisma.PurchaseRequestWhereInput = {}

  if (statusFilter) {
    whereCondition.currentStatus = statusFilter
  }

  if (classificationFilter) {
    whereCondition.classification = classificationFilter
  }

  if (requesterFilter) {
    whereCondition.requester = {
      name: { contains: requesterFilter }
    }
  }

  if (dateStart || dateEnd) {
    whereCondition.createdAt = {}
    if (dateStart) {
      whereCondition.createdAt.gte = new Date(`${dateStart}T00:00:00.000Z`)
    }
    if (dateEnd) {
      whereCondition.createdAt.lte = new Date(`${dateEnd}T23:59:59.999Z`)
    }
  }

  const requests = await prisma.purchaseRequest.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    include: { requester: { include: { department: true } }, quotes: { include: { supplier: true } } }
  })

  // Get distinct statuses for the filter dropdown
  const allStatuses = [
    'CRIADA', 'EM_ANALISE', 'EM_COTACAO', 'AGUARDANDO_AUTORIZACAO', 
    'AGUARDANDO_FINANCEIRO', 'APROVADA', 'RECUSADA', 'REJEITADA', 
    'DEVOLVIDO', 'DISPONIVEL_RETIRADA', 'ARQUIVADA'
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Relatório de Pedidos</h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Filtros</h2>
        <form method="GET" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue={statusFilter} className="input-field" style={{ margin: 0 }}>
              <option value="">Todos</option>
              {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Classificação</label>
            <select name="classification" defaultValue={classificationFilter} className="input-field" style={{ margin: 0 }}>
              <option value="">Todas</option>
              <option value="Consumo">Consumo</option>
              <option value="Equipamento">Equipamento</option>
              <option value="Serviço">Serviço</option>
            </select>
          </div>

          <div>
            <label className="label">Solicitante (Nome)</label>
            <input type="text" name="requester" defaultValue={requesterFilter} className="input-field" style={{ margin: 0 }} placeholder="Ex: João" />
          </div>

          <div>
            <label className="label">Data Início</label>
            <input type="date" name="dateStart" defaultValue={dateStart} className="input-field" style={{ margin: 0 }} />
          </div>

          <div>
            <label className="label">Data Fim</label>
            <input type="date" name="dateEnd" defaultValue={dateEnd} className="input-field" style={{ margin: 0 }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Filtrar</button>
            <Link href="/dashboard/relatorios" className="btn" style={{ backgroundColor: '#e2e8f0', color: '#1e293b' }}>Limpar</Link>
          </div>
        </form>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>ID</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Solicitante</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Descrição / Classificação</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Data</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Vencedor (Valor)</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Nenhum pedido encontrado com estes filtros.
                </td>
              </tr>
            ) : (
              requests.map(req => {
                const winnerQuote = req.quotes.find(q => q.isWinner)
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>{req.id.split('-')[0]}</td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>
                      {req.requester.name}
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                        {req.requester.department?.name || ''}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      {req.description}
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        {req.classification || '-'}
                      </div>
                    </td>
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
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>
                      {winnerQuote ? (
                        <>
                          <div style={{ fontWeight: 500 }}>{winnerQuote.supplierName}</div>
                          <div style={{ color: '#059669', fontWeight: 600 }}>R$ {(winnerQuote.negotiatedPrice || winnerQuote.price).toFixed(2)}</div>
                        </>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <Link href={`/dashboard/comprador/pedido/${req.id}`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
