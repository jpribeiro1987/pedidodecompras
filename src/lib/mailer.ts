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
    include: { requester: true, items: true, attachments: true }
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
