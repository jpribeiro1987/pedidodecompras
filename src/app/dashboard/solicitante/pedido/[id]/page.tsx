import { RequestItemsDisplay } from '@/components/RequestItemsDisplay'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, deleteRequestAction, markAsDeliveredAction, archiveRequestAction } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AttachmentViewer } from '@/components/AttachmentViewer'

export default async function PedidoDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return null
  
  const { id } = await params

  const request = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      requester: { include: { department: true } },
      quotes: true,
      attachments: true,
      items: true,
      history: {
        include: { user: true },
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!request) {
    notFound()
  }

  let batchRequests = [request]
  if (request.batchId) {
    batchRequests = await prisma.purchaseRequest.findMany({
      where: { batchId: request.batchId },
      include: { items: true, quotes: true }
    })
    batchRequests.sort((a, b) => a.id.localeCompare(b.id))
  }

  // Only the requester or other roles can view this
  if (user.role === 'SOLICITANTE' && request.requesterId !== user.id) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Acesso negado.</div>
  }

  const winnerQuote = request.quotes.find(q => q.isWinner)

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link href={`/dashboard/${user.role.toLowerCase()}`} className="btn" style={{ backgroundColor: '#e2e8f0' }}>
          Voltar
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Detalhes da Solicitação</h1>
        
        {request.currentStatus === 'CRIADA' && (
          <form action={deleteRequestAction}>
            <input type="hidden" name="id" value={request.id} />
            <button type="submit" className="btn" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.875rem' }} onClick={(e) => { if(!confirm('Tem certeza que deseja excluir permanentemente este pedido?')) e.preventDefault() }}>
              Excluir Pedido
            </button>
          </form>
        )}
        
        {request.currentStatus === 'APROVADA' && (
          <form action={markAsDeliveredAction}>
            <input type="hidden" name="id" value={request.id} />
            <button type="submit" className="btn" style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.875rem' }} onClick={(e) => { if(!confirm('Confirmar retirada desta mercadoria?')) e.preventDefault() }}>
              Confirmar Retirada
            </button>
          </form>
        )}

        {request.currentStatus === 'ENTREGUE' && (
          <form action={archiveRequestAction}>
            <input type="hidden" name="id" value={request.id} />
            <button type="submit" className="btn" style={{ backgroundColor: '#64748b', color: '#fff', fontSize: '0.875rem' }} onClick={(e) => { if(!confirm('Deseja ocultar este pedido de sua lista principal?')) e.preventDefault() }}>
              Ocultar (Arquivar)
            </button>
          </form>
        )}

        <span style={{ 
          marginLeft: 'auto',
          padding: '0.25rem 0.75rem', 
          borderRadius: '999px', 
          fontSize: '0.875rem', 
          fontWeight: 600,
          backgroundColor: '#dbeafe',
          color: '#1e40af'
        }}>
          {request.currentStatus}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Informações do Pedido
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>Itens do Pacote</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {batchRequests.map((req, idx) => {
                  const reqItem = (req.items && req.items.length > 0) ? req.items[0] : req;
                  return (
                    <div key={req.id} style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>{idx + 1}. {reqItem.description}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', backgroundColor: '#e2e8f0', borderRadius: '999px' }}>
                          Status: {req.currentStatus}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                        <div><strong>Quantidade:</strong> {reqItem.quantity}</div>
                        <div><strong>Prioridade:</strong> {req.priority || 'Não definida'}</div>
                        {reqItem.link && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Link:</strong> <a href={reqItem.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>Acessar</a>
                          </div>
                        )}
                        {reqItem.imageUrl && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Anexo/Print:</strong> <a href={reqItem.imageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontWeight: 600 }}>📷 Ver Imagem</a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {request.deliveryDate && (
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Previsão de Entrega</p>
                  <p>{new Date(request.deliveryDate).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                </div>
              )}
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Data da Solicitação</p>
                <p>{new Date(request.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
              </div>
              {winnerQuote && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Cotação Selecionada</p>
                  <p style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {winnerQuote.supplierName} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(winnerQuote.price)}
                  </p>
                </div>
              )}
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Justificativa Global</p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{request.justification}</p>
            </div>

            {request.attachments && request.attachments.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Anexos Extras</p>
                <AttachmentViewer attachments={request.attachments} />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Histórico
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {request.history.map((hist, index) => (
                <div key={hist.id} style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  {/* Timeline line */}
                  {index !== request.history.length - 1 && (
                    <div style={{ position: 'absolute', left: '0.3rem', top: '1.5rem', bottom: '-1rem', width: '2px', backgroundColor: 'var(--border)' }} />
                  )}
                  {/* Timeline dot */}
                  <div style={{ position: 'absolute', left: 0, top: '0.4rem', width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid white' }} />
                  
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{hist.newStatus}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    {new Date(hist.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} por {hist.user.name}
                  </p>
                  {hist.observation && (
                    <p style={{ fontSize: '0.875rem', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                      "{hist.observation}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
