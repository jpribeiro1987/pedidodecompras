import { getCurrentUser } from "@/app/actions"
import { updateConfigAction } from "@/app/adminActions"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TestSmtpButton } from "@/components/TestSmtpButton"

export default async function ConfigPage() {
  const user = await getCurrentUser()
  if (!user || user?.role !== "ADMIN") return redirect("/dashboard")

  const limitConfig = await prisma.systemConfig.findUnique({
    where: { key: "AUTO_APPROVE_LIMIT" }
  })

  const smtpConfigs = await prisma.systemConfig.findMany({
    where: { key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'] } }
  })
  const smtp = smtpConfigs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>)

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Configurações do Sistema</h1>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          Regras de Negócio
        </h2>
        
        <form action={updateConfigAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="limit" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
              Limite de Aprovação Automática para Compradores (R$)
            </label>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
              Pedidos com cotação vencedora cujo valor (negociado ou inicial) seja menor ou igual a este limite serão aprovados automaticamente sem passar pela fila do Autorizador.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>R$</span>
              <input 
                id="limit"
                name="limit" 
                type="number" 
                step="0.01"
                min="0"
                className="input-field"
                style={{ margin: 0, flex: 1 }}
                defaultValue={limitConfig?.value || "0"} 
                required 
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            Salvar Limite
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          Configurações de E-mail (SMTP)
        </h2>
        
        <form action={async (formData) => {
          'use server'
          const { updateSmtpConfigAction } = await import('@/app/adminActions')
          return updateSmtpConfigAction(formData)
        }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="smtpHost" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Servidor SMTP (Host)</label>
              <input id="smtpHost" name="host" type="text" className="input-field" placeholder="ex: smtp.gmail.com" defaultValue={smtp['SMTP_HOST'] || ''} />
            </div>
            <div>
              <label htmlFor="smtpPort" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Porta</label>
              <input id="smtpPort" name="port" type="number" className="input-field" placeholder="ex: 587" defaultValue={smtp['SMTP_PORT'] || ''} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="smtpUser" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Usuário / E-mail</label>
              <input id="smtpUser" name="user" type="text" className="input-field" placeholder="ex: suporte@hospital.com" defaultValue={smtp['SMTP_USER'] || ''} />
            </div>
            <div>
              <label htmlFor="smtpPass" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Senha</label>
              <input id="smtpPass" name="pass" type="password" className="input-field" placeholder="Senha do e-mail" defaultValue={smtp['SMTP_PASS'] || ''} />
            </div>
          </div>

          <div>
            <label htmlFor="smtpFrom" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>E-mail de Remetente (From)</label>
            <input id="smtpFrom" name="from" type="text" className="input-field" placeholder='ex: "Sistema de Compras" <suporte@hospital.com>' defaultValue={smtp['SMTP_FROM'] || ''} />
          </div>
          
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            Preencha todos os campos para habilitar o envio de e-mails para os solicitantes quando o pedido for disponibilizado para retirada ou entregue.
            Para manter as configurações atuais em branco, apenas salve.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Salvar SMTP
            </button>
            <TestSmtpButton />
          </div>
        </form>
      </div>
    </div>
  )
}
