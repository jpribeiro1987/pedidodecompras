import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { QuotesForm } from './QuotesForm'
import { ExtendDeliveryForm } from './ExtendDeliveryForm'
import { AttachmentViewer } from '@/components/AttachmentViewer'

export default async function CompradorPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return null
  
  const { id } = await params

  const request = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      requester: { include: { department: true } },
      attachments: true,
      history: {
        include: { user: true },
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!request) notFound()

  const suppliers = await prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })

  const config = await prisma.systemConfig.findUnique({ where: { key: 'WINNER_CRITERIA_LIST' } })
  const defaultCriteria = ['Menor Preço', 'Melhor Qualidade', 'Prazo de Entrega / Urgência', 'Fornecedor Exclusivo']
  let criteriaList = defaultCriteria
  if (config) {
    try { criteriaList = JSON.parse(config.value) } catch(e) {}
  }

  const configLimit = await prisma.systemConfig.findUnique({ where: { key: 'AUTO_APPROVE_LIMIT' } })
  const globalLimit = configLimit ? parseFloat(configLimit.value) : 0
  const autoApproveLimit = user.autoApproveLimit !== null ? user.autoApproveLimit : globalLimit

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link href="/dashboard/comprador" className="btn" style={{ backgroundColor: '#e2e8f0' }}>
          Voltar
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Análise de Solicitação</h1>
        <span style={{ 
          marginLeft: 'auto',
          padding: '0.25rem 0.75rem', 
          borderRadius: '999px', 
          fontSize: '0.875rem', 
          fontWeight: 600,
          backgroundColor: '#fef3c7',
          color: '#b45309'
        }}>
          {request.currentStatus}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          {/* Info Card */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Informações do Pedido
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Solicitante</p>
                <p style={{ fontWeight: 500 }}>{request.requester.name} ({request.requester.department?.name})</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Prioridade</p>
                <p>{request.priority || 'Não definida'}</p>
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
              {request.link && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Link de Referência</p>
                  <a href={request.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                    {request.link}
                  </a>
                </div>
              )}
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Justificativa</p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{request.justification}</p>
            </div>

            {request.attachments && request.attachments.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Anexos</p>
                <AttachmentViewer attachments={request.attachments} />
              </div>
            )}
          </div>
        </div>

        <div>
          {/* Action Card */}
          <div className="card" style={{ borderColor: 'var(--primary)', borderWidth: '2px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              Ação do Comprador
            </h2>
            
            {request.currentStatus === 'AGUARDANDO_FINANCEIRO' ? (
              <form action={async (formData) => {
                'use server'
                const { approveFromFinanceAction } = await import('@/app/actions')
                return approveFromFinanceAction(formData)
              }}>
                <input type="hidden" name="requestId" value={request.id} />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#22c55e', borderColor: '#22c55e', marginBottom: '1rem' }}>
                  Liberado pelo Financeiro (Aprovar Compra)
                </button>
              </form>
            ) : request.currentStatus === 'APROVADA' ? (
              <>
                <form action={async (formData) => {
                  'use server'
                  const { updateRequestStatusAction } = await import('@/app/actions')
                  return updateRequestStatusAction(formData)
                }}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <input type="hidden" name="status" value="DISPONIVEL_RETIRADA" />
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="observation">Observação de Entrega/Retirada</label>
                    <input type="text" id="observation" name="observation" className="input-field" placeholder="Ex: Material chegou. Retirar no almoxarifado." required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#22c55e', borderColor: '#22c55e' }}>
                    Marcar como "Disponível para Retirada"
                  </button>
                </form>

                {request.deliveryDate && (
                  <ExtendDeliveryForm requestId={request.id} currentDeliveryDate={request.deliveryDate} />
                )}
              </>
            ) : ['CRIADA', 'EM_COTACAO', 'AGUARDANDO_AUTORIZACAO'].includes(request.currentStatus) ? (
              <QuotesForm requestId={request.id} suppliers={suppliers} autoApproveLimit={autoApproveLimit} criteriaList={criteriaList} />
            ) : null}

            {['CRIADA', 'EM_COTACAO', 'AGUARDANDO_AUTORIZACAO', 'AGUARDANDO_FINANCEIRO'].includes(request.currentStatus) && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#ef4444' }}>Recusar Solicitação</h3>
                <form action={async (formData) => {
                  'use server'
                  const { denyRequestAction } = await import('@/app/actions')
                  return denyRequestAction(formData)
                }}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="reason">Motivo da Recusa *</label>
                    <textarea id="reason" name="reason" className="input-field" rows={3} required placeholder="Explique por que esta solicitação está sendo recusada..."></textarea>
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' }}>
                    Recusar Pedido Definitivamente
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* History summary could go here... */}
        </div>
      </div>
    </div>
  )
}
