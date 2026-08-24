import { getCurrentUser } from "@/app/actions"
import { updateConfigAction } from "@/app/adminActions"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function ConfigPage() {
  const user = await getCurrentUser()
  if (!user || user?.role !== "ADMIN") return redirect("/dashboard")

  const limitConfig = await prisma.systemConfig.findUnique({
    where: { key: "AUTO_APPROVE_LIMIT" }
  })

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
            Salvar Configurações
          </button>
        </form>
      </div>
    </div>
  )
}
