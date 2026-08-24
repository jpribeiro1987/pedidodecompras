import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import { createDepartmentAction, deleteDepartmentAction } from '@/app/adminActions'

export default async function SetoresPage() {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') return null

  const departments = await prisma.department.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: 'asc' }
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Gerenciar Setores</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Formulario de Novo Setor */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Novo Setor</h2>
          <form action={createDepartmentAction}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="name">Nome do Setor</label>
              <input type="text" id="name" name="name" className="input-field" required placeholder="Ex: Financeiro" />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Cadastrar Setor
            </button>
          </form>
        </div>

        {/* Lista de Setores */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Setores Cadastrados</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>Nome</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>Usuários Vinculados</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{dept.name}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{dept._count.users}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    {dept._count.users === 0 ? (
                      <form action={deleteDepartmentAction} style={{ display: 'inline' }}>
                        <input type="hidden" name="id" value={dept.id} />
                        <button type="submit" style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '0.875rem' }}>
                          Excluir
                        </button>
                      </form>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Não pode excluir</span>
                    )}
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>Nenhum setor cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
