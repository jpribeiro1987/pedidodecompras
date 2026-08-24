import { getCurrentUser } from "@/app/actions"
import { createSupplierAction, toggleSupplierStatusAction } from "@/app/adminActions"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function SuppliersPage() {
  const user = await getCurrentUser()
  if (!user || user?.role !== "ADMIN") return redirect("/dashboard")

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Gerenciar Fornecedores</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Cadastrar Novo Fornecedor</h2>
        <form action={createSupplierAction} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label htmlFor="name">Nome da Empresa *</label>
            <input type="text" id="name" name="name" className="input-field" required placeholder="Ex: Fornecedor ABC Ltda" />
          </div>
          <div>
            <label htmlFor="cnpj">CNPJ (Opcional)</label>
            <input type="text" id="cnpj" name="cnpj" className="input-field" placeholder="00.000.000/0000-00" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginBottom: '0.25rem' }}>
            Cadastrar
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Fornecedores Cadastrados ({suppliers.length})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
              <th style={{ padding: '0.75rem', fontWeight: 500 }}>Nome</th>
              <th style={{ padding: '0.75rem', fontWeight: 500 }}>CNPJ</th>
              <th style={{ padding: '0.75rem', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '0.75rem', fontWeight: 500, width: '250px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '0.75rem', color: '#64748b' }}>{s.cnpj || '-'}</td>
                <td style={{ padding: '0.75rem' }}>
                  {s.isActive ? (
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>ATIVO</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, width: 'fit-content' }}>INATIVO</span>
                      <small style={{ color: '#ef4444', fontSize: '0.7rem' }}>Motivo: {s.inactivationReason}</small>
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <form action={async (formData: FormData) => {
                    "use server"
                    const reason = formData.get("reason") as string | undefined
                    await toggleSupplierStatusAction(s.id, !s.isActive, reason)
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    
                    {!s.isActive ? (
                      <button type="submit" className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' }}>
                        Reativar
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" name="reason" placeholder="Justificativa p/ inativar" required style={{ fontSize: '0.75rem', padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }} />
                        <button type="submit" className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}>
                          Inativar
                        </button>
                      </div>
                    )}
                  </form>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Nenhum fornecedor cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
