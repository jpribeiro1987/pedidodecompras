import nodemailer from 'nodemailer'
import { prisma } from './prisma'
import { join } from 'path'

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  const configParams = await prisma.systemConfig.findMany({
    where: { key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'] } }
  })
  
  const config = configParams.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const host = config['SMTP_HOST'] || process.env.SMTP_HOST
  const port = parseInt(config['SMTP_PORT'] || process.env.SMTP_PORT || '587', 10)
  const user = config['SMTP_USER'] || process.env.SMTP_USER
  const pass = config['SMTP_PASS'] || process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn('SMTP configuration is missing. Emails will not be sent.')
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  })
  
  return transporter;
}

export async function sendPickupStatusEmail(requestId: string, status: 'DISPONIVEL_RETIRADA' | 'ENTREGUE') {
  const request = await prisma.purchaseRequest.findUnique({
    where: { id: requestId },
    include: { requester: true, items: true, attachments: true, history: { include: { user: true }, orderBy: { date: 'desc' } } }
  })

  if (!request) return
  if (!request.requester.email) return

  const mailer = await getTransporter()
  if (!mailer) return

  const configFrom = await prisma.systemConfig.findUnique({ where: { key: 'SMTP_FROM' } })
  const from = configFrom?.value || process.env.SMTP_FROM || '"Sistema de Compras" <no-reply@hospital.com>'

  const isRetirada = status === 'DISPONIVEL_RETIRADA'
  const subject = isRetirada 
    ? `Pedido #${request.id.substring(0, 8).toUpperCase()} - Disponível para Retirada`
    : `Pedido #${request.id.substring(0, 8).toUpperCase()} - Retirado/Entregue`
  
  const statusText = isRetirada
    ? 'O seu pedido já está disponível para retirada no almoxarifado.'
    : 'O seu pedido foi marcado como retirado/entregue.'

  const itemsListHtml = request.items.map(item => `<li>${item.quantity}x ${item.description}</li>`).join('')
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">Atualização do Pedido de Compra</h2>
      <p>Olá <strong>${request.requester.name}</strong>,</p>
      <p style="font-size: 16px; font-weight: bold; padding: 12px; background-color: #f1f5f9; border-radius: 6px;">
        ${statusText}
      </p>
      <p><strong>ID do Pedido:</strong> ${request.id.toUpperCase()}</p>
      <p><strong>Itens:</strong></p>
      <ul>
        ${itemsListHtml || `<li>${request.description}</li>`}
      </ul>
      ${request.winnerJustification ? `
      <div style="margin-top: 20px;">
        <p><strong>Justificativa do Comprador (Cotação):</strong></p>
        <p style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #94a3b8; font-size: 14px; border-radius: 4px;">
          ${request.winnerJustification}
        </p>
      </div>
      ` : ''}

      ${request.history.some(h => h.observation && h.observation.trim() !== 'Atualização de status' && h.observation.trim() !== 'Pedido editado' && !h.observation.startsWith('Mercadoria informada')) ? `
      <div style="margin-top: 20px;">
        <p><strong>Observações do Processo:</strong></p>
        <ul style="background-color: #f8fafc; padding: 12px 12px 12px 30px; font-size: 14px; border-radius: 6px;">
          ${request.history.filter(h => h.observation && h.observation.trim() !== 'Atualização de status' && h.observation.trim() !== 'Pedido editado' && !h.observation.startsWith('Mercadoria informada')).map(h => `
            <li style="margin-bottom: 8px;">
              <strong>${new Date(h.date).toLocaleDateString('pt-BR')}:</strong> ${h.observation}
              <br/><span style="font-size: 11px; color: #64748b;">(por ${h.user?.name || 'Sistema'})</span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}
      <br />
      <p>As imagens anexadas ao pedido estão inclusas neste e-mail.</p>
      <hr style="border: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b;">Este é um e-mail automático do Sistema de Compras.</p>
    </div>
  `

  const attachments = request.attachments.map(att => {
    return {
      filename: att.name,
      path: join(process.cwd(), 'public', att.url)
    }
  })

  try {
    await mailer.sendMail({
      from,
      to: request.requester.email,
      subject,
      html,
      attachments
    })
    console.log(`Email sent for request ${request.id} (${status})`)
  } catch (error) {
    console.error('Failed to send status email:', error)
  }
}

export async function sendManualStatusEmail(requestId: string) {
  const request = await prisma.purchaseRequest.findUnique({
    where: { id: requestId },
    include: { requester: true, items: true, attachments: true, history: { include: { user: true }, orderBy: { date: 'desc' } } }
  })

  if (!request) throw new Error('Pedido não encontrado')
  if (!request.requester.email) throw new Error('Solicitante não possui e-mail cadastrado')

  const mailer = await getTransporter()
  if (!mailer) throw new Error('SMTP não configurado')

  const configFrom = await prisma.systemConfig.findUnique({ where: { key: 'SMTP_FROM' } })
  const from = configFrom?.value || process.env.SMTP_FROM || '"Sistema de Compras" <no-reply@hospital.com>'

  const statusMap: Record<string, string> = {
    'CRIADA': 'Criada',
    'URGENTE': 'Urgente',
    'EM_COTACAO': 'Em Cotação',
    'EM_ANALISE': 'Em Análise de Cotação',
    'AGUARDANDO_AUTORIZACAO': 'Aguardando Autorização',
    'AGUARDANDO_FINANCEIRO': 'Aguardando Financeiro',
    'APROVADA': 'Aprovada',
    'DISPONIVEL_RETIRADA': 'Disponível para Retirada',
    'ENTREGUE': 'Retirado / Entregue',
    'CANCELADA': 'Cancelada'
  }
  const statusName = statusMap[request.currentStatus] || request.currentStatus

  const subject = `Pedido #${request.id.substring(0, 8).toUpperCase()} - Status: ${statusName}`
  const statusText = `O seu pedido está atualmente no status: ${statusName}.`

  const itemsListHtml = request.items.map(item => `<li>${item.quantity}x ${item.description}</li>`).join('')
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">Atualização do Pedido de Compra</h2>
      <p>Olá <strong>${request.requester.name}</strong>,</p>
      <p style="font-size: 16px; font-weight: bold; padding: 12px; background-color: #f1f5f9; border-radius: 6px;">
        ${statusText}
      </p>
      <p><strong>ID do Pedido:</strong> ${request.id.toUpperCase()}</p>
      <p><strong>Itens:</strong></p>
      <ul>
        ${itemsListHtml || `<li>${request.description}</li>`}
      </ul>
      ${request.winnerJustification ? `
      <div style="margin-top: 20px;">
        <p><strong>Justificativa do Comprador (Cotação):</strong></p>
        <p style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #94a3b8; font-size: 14px; border-radius: 4px;">
          ${request.winnerJustification}
        </p>
      </div>
      ` : ''}

      ${request.history.some(h => h.observation && h.observation.trim() !== 'Atualização de status' && h.observation.trim() !== 'Pedido editado' && !h.observation.startsWith('Mercadoria informada')) ? `
      <div style="margin-top: 20px;">
        <p><strong>Observações do Processo:</strong></p>
        <ul style="background-color: #f8fafc; padding: 12px 12px 12px 30px; font-size: 14px; border-radius: 6px;">
          ${request.history.filter(h => h.observation && h.observation.trim() !== 'Atualização de status' && h.observation.trim() !== 'Pedido editado' && !h.observation.startsWith('Mercadoria informada')).map(h => `
            <li style="margin-bottom: 8px;">
              <strong>${new Date(h.date).toLocaleDateString('pt-BR')}:</strong> ${h.observation}
              <br/><span style="font-size: 11px; color: #64748b;">(por ${h.user?.name || 'Sistema'})</span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}
      <br />
      <p>As imagens anexadas ao pedido estão inclusas neste e-mail.</p>
      <hr style="border: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b;">Este é um e-mail automático do Sistema de Compras.</p>
    </div>
  `

  const attachments = request.attachments.map(att => ({
    filename: att.name,
    path: join(process.cwd(), 'public', att.url)
  }))

  await mailer.sendMail({
    from,
    to: request.requester.email,
    subject,
    html,
    attachments
  })
}
