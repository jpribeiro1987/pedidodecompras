import { RequestItemsDisplay } from '@/components/RequestItemsDisplay'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, updateRequestStatusAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AttachmentViewer } from '@/components/AttachmentViewer'

export default async function AutorizadorPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'AUTORIZADOR') return null
  
  const { id } = await params

  const request = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      requester: { include: { department: true } },
      quotes: { include: { supplier: true } },
      attachments: true,
      history: {
        include: { user: true },
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!request) notFound()

  const winnerQuote = request.quotes.find(q => q.isWinner)

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link href="/dashboard/autorizador" className="btn" style={{ backgroundColor: '#e2e8f0' }}>
          Voltar
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Avaliação de Solicitação</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Detalhes da Compra
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Solicitante</p>
                <p style={{ fontWeight: 500 }}>{request.requester.name} ({request.requester.department?.name})</p>
              </div>
              {request.deliveryDate && (
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Previsão de Entrega</p>
                  <p>{new Date(request.deliveryDate).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Descrição</p>
                <p style={{ fontWeight: 500 }}>{request.description} (Qtd: {request.quantity})</p>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Justificativa Original do Solicitante</p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{request.justification}</p>
            </div>

            {request.attachments && request.attachments.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Anexos do Solicitante</p>
                <AttachmentViewer attachments={request.attachments} />
              </div>
            )}

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Cotações Realizadas</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
                  <th style={{ padding: '0.5rem', fontWeight: 500 }}>Fornecedor</th>
                  <th style={{ padding: '0.5rem', fontWeight: 500 }}>Valor Inicial</th>
                  <th style={{ padding: '0.5rem', fontWeight: 500 }}>Valor Negociado</th>
                  <th style={{ padding: '0.5rem', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {request.quotes.map((q: any) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: q.isWinner ? '#f0fdf4' : 'transparent' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: q.isWinner ? 600 : 400 }}>{q.supplier?.name || q.supplierName}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: q.isWinner ? 600 : 400 }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.price)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: q.isWinner ? 600 : 400 }}>
                      {q.negotiatedPrice ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.negotiatedPrice) : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {q.isWinner && (
                        <span style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>VENCEDOR</span>
                      )}
                    </td>
                  </tr>
                ))}
                {request.quotes.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Nenhuma cotação registrada</td></tr>
                )}
              </tbody>
            </table>

            {winnerQuote && (
              <div style={{ padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius)' }}>
                <p style={{ fontSize: '0.875rem', color: '#b45309', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Critério de Escolha do Comprador: {request.winnerCriteria}
                </p>
                {request.winnerJustification && (
                  <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                    <strong>Justificativa:</strong> {request.winnerJustification}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          {request.currentStatus === 'AGUARDANDO_AUTORIZACAO' && (
            <div className="card" style={{ marginBottom: '2rem', borderColor: 'var(--primary)', borderWidth: '2px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                Parecer do Autorizador
              </h2>
              
              <form action={updateRequestStatusAction}>
                <input type="hidden" name="requestId" value={request.id} />
                
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="status">Decisão:</label>
                  <select id="status" name="status" className="input-field" required defaultValue="AGUARDANDO_FINANCEIRO">
                    <option value="AGUARDANDO_FINANCEIRO">Aprovar Compra</option>
                    <option value="RECUSADA">Rejeitar Compra</option>
                    <option value="EM_COTACAO">Devolver ao Comprador (Ajustes)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="observation">Justificativa da Decisão *</label>
                  <textarea 
                    id="observation" 
                    name="observation" 
                    className="input-field" 
                    rows={4} 
                    placeholder="Motivo da aprovação ou rejeição..."
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Confirmar Decisão
                </button>
              </form>
            </div>
          )}

          {['AGUARDANDO_FINANCEIRO', 'APROVADA'].includes(request.currentStatus) && !request.directorAcknowledged && (
            <div className="card" style={{ marginBottom: '2rem', borderColor: '#3b82f6', borderWidth: '2px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#1d4ed8' }}>
                Ciência da Diretoria
              </h2>
              <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Esta compra foi aprovada diretamente pelo comprador (dentro da alçada). Confirme que você está ciente desta aquisição.
              </p>
              <form action={async (formData) => {
                'use server'
                const { acknowledgeRequestAction } = await import('@/app/actions')
                return acknowledgeRequestAction(formData)
              }}>
                <input type="hidden" name="requestId" value={request.id} />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
                  Dar Ciência da Compra
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
