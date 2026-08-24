import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import { deleteUserAction } from '@/app/adminActions'
import { UserForm } from './UserForm'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'ADMIN') return null

  const users = await prisma.user.findMany({
    include: { department: true },
    orderBy: { name: 'asc' }
  })

  const departments = await prisma.department.findMany()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Gerenciamento de Usuários</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Adicionar Novo Usuário</h2>
        <UserForm departments={departments} />
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Nome</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>E-mail</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Perfil</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Setor</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Alçada (Personalizada)</th>
              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '1rem 0.5rem' }}>{u.email}</td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    backgroundColor: u.role === 'ADMIN' ? '#fee2e2' : '#e0e7ff',
                    color: u.role === 'ADMIN' ? '#991b1b' : '#3730a3'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>{u.department?.name || '-'}</td>
                <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>
                  {u.role === 'COMPRADOR' ? (u.autoApproveLimit !== null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(u.autoApproveLimit) : 'Usar Padrão Global') : '-'}
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link 
                      href={`/dashboard/admin/usuario/${u.id}`} 
                      className="btn" 
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#e2e8f0', color: '#1e293b' }}
                    >
                      ✏️ Editar
                    </Link>
                    <form action={deleteUserAction} style={{ display: 'inline' }}>
                      <input type="hidden" name="id" value={u.id} />
                      <button 
                        type="submit" 
                        className="btn" 
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'red', backgroundColor: '#fee2e2' }}
                        disabled={u.id === currentUser.id}
                        title={u.id === currentUser.id ? "Você não pode excluir a si mesmo" : "Excluir Usuário"}
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
