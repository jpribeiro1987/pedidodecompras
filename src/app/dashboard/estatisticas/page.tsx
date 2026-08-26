import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import { redirect } from 'next/navigation'

export default async function EstatisticasPage() {
  const user = await getCurrentUser()
  if (!user || !['ADMIN', 'AUTORIZADOR', 'COMPRADOR'].includes(user.role)) {
    redirect('/dashboard')
  }

  // Aggregate stats
  const totalRequests = await prisma.purchaseRequest.count()
  
  const approvedRequests = await prisma.purchaseRequest.count({
    where: { currentStatus: 'APROVADA' }
  })
  
  const rejectedRequests = await prisma.purchaseRequest.count({
    where: { currentStatus: 'REJEITADA' }
  })
  
  const inProgressRequests = totalRequests - approvedRequests - rejectedRequests

  // Financial volume
  // We calculate sum of quotes that are winners AND whose request is APROVADA
  const approvedWithQuotes = await prisma.purchaseRequest.findMany({
    where: { currentStatus: 'APROVADA' },
    include: { quotes: { where: { isWinner: true } } }
  })

  let totalVolume = 0
  approvedWithQuotes.forEach(req => {
    if (req.quotes.length > 0) {
      const quote = req.quotes[0]
      const finalPrice = quote.negotiatedPrice ? quote.negotiatedPrice : quote.price
      totalVolume += finalPrice // The user inputs the total value, not unit value
    }
  })

  // Sector distribution
  const requestsWithDept = await prisma.purchaseRequest.findMany({
    include: { requester: { include: { department: true } } }
  })

  const deptCounts: Record<string, number> = {}
  requestsWithDept.forEach(req => {
    const deptName = req.requester.department?.name || 'Sem Setor'
    deptCounts[deptName] = (deptCounts[deptName] || 0) + 1
  })

  // Sort departments by count
  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])
  const maxDeptCount = sortedDepts.length > 0 ? sortedDepts[0][1] : 1

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Dashboard de Estatísticas</h1>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Solicitado</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a' }}>{totalRequests}</span>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', borderTop: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Em Andamento</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#3b82f6' }}>{inProgressRequests}</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', borderTop: '4px solid #22c55e' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aprovadas</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#22c55e' }}>{approvedRequests}</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', borderTop: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejeitadas</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ef4444' }}>{rejectedRequests}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Financial Volume */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Volume Financeiro Aprovado</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Valor total das compras concluídas com base na cotação vencedora e quantidade.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700, color: '#10b981' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVolume)}
            </span>
          </div>
        </div>

        {/* Departments Chart */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1e293b' }}>Pedidos por Setor</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedDepts.map(([dept, count]) => (
              <div key={dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 500 }}>{dept}</span>
                  <span style={{ color: '#64748b' }}>{count} ({Math.round((count / totalRequests) * 100) || 0}%)</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '999px', height: '0.75rem', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      backgroundColor: '#3b82f6', 
                      width: `${(count / maxDeptCount) * 100}%`,
                      transition: 'width 1s ease-in-out'
                    }} 
                  />
                </div>
              </div>
            ))}

            {sortedDepts.length === 0 && (
              <p style={{ color: '#64748b', textAlign: 'center' }}>Nenhum dado disponível.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
