import { getCurrentUser } from "@/app/actions"
import { createGroupAction, deleteGroupAction } from "@/app/adminActions"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function PurchaseGroupsPage() {
  const user = await getCurrentUser()
  if (!user || user?.role !== "ADMIN") return redirect("/dashboard")

  const groups = await prisma.purchaseGroup.findMany({
    include: { _count: { select: { requests: true } } },
    orderBy: { name: 'asc' }
  })

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Gerenciar Grupos de Compras</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Novo Grupo</h2>
        <form action={createGroupAction} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="name">Nome do Grupo *</label>
            <input type="text" id="name" name="name" className="input-field" required placeholder="Ex: Informática, Papelaria..." />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginBottom: '0.25rem' }}>
            Criar Grupo
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Grupos Cadastrados</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
              <th style={{ padding: '0.75rem', fontWeight: 500 }}>Nome</th>
              <th style={{ padding: '0.75rem', fontWeight: 500 }}>Pedidos Vinculados</th>
              <th style={{ padding: '0.75rem', fontWeight: 500, textAlign: 'right' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{g.name}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {g._count.requests}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <form action={deleteGroupAction.bind(null, g.id)}>
                    <button 
                      type="submit" 
                      className="btn" 
                      disabled={g._count.requests > 0}
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.5rem', 
                        backgroundColor: g._count.requests > 0 ? '#f1f5f9' : '#fee2e2', 
                        color: g._count.requests > 0 ? '#94a3b8' : '#991b1b', 
                        borderColor: g._count.requests > 0 ? 'transparent' : '#fca5a5',
                        cursor: g._count.requests > 0 ? 'not-allowed' : 'pointer'
                      }}
                      title={g._count.requests > 0 ? "Não é possível excluir grupos com pedidos vinculados" : "Excluir Grupo"}
                    >
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Nenhum grupo cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
