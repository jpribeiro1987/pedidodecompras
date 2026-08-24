import { getCurrentUser, logoutAction } from '@/app/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-fg)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <img src="/logo.png" alt="HSA Compras" style={{ filter: 'brightness(0) invert(1)', width: '100%' }} />
        </div>
        
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {user.role === 'ADMIN' && (
            <div style={{ padding: '0 1rem' }}>
              <Link href="/dashboard/admin" style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'white', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                Gerenciar Usuários
              </Link>
              <Link href="/dashboard/admin/setores" style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'white', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                Gerenciar Setores
              </Link>
              <Link href="/dashboard/admin/fornecedores" style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'white', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                Fornecedores
              </Link>
              <Link href="/dashboard/admin/grupos" style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'white', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                Grupos de Compras
              </Link>
              <Link href="/dashboard/admin/configuracoes" style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'white', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                Configurações
              </Link>
              <Link href="/dashboard/admin/backup" style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'white', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                Backup do Sistema
              </Link>
              <Link href="/dashboard/estatisticas" style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'white', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                Estatísticas
              </Link>
            </div>
          )}

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {user.role === 'SOLICITANTE' && (
              <>
                <li>
                  <Link href="/dashboard/solicitante" style={{ display: 'block', padding: '0.75rem 1.5rem', transition: 'background-color 0.2s' }}>
                    Meus Pedidos
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/solicitante/nova" style={{ display: 'block', padding: '0.75rem 1.5rem', transition: 'background-color 0.2s' }}>
                    Nova Solicitação
                  </Link>
                </li>
              </>
            )}
            {(user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') && (
              <>
                <li>
                  <Link href="/dashboard/comprador" style={{ display: 'block', padding: '0.75rem 1.5rem', transition: 'background-color 0.2s' }}>
                    Fila de Compras
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/solicitante/nova" style={{ display: 'block', padding: '0.75rem 1.5rem', transition: 'background-color 0.2s' }}>
                    Nova Solicitação
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/relatorios" style={{ display: 'block', padding: '0.75rem 1.5rem', transition: 'background-color 0.2s' }}>
                    Relatórios
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/estatisticas" style={{ display: 'block', padding: '0.75rem 1.5rem', transition: 'background-color 0.2s' }}>
                    Estatísticas
                  </Link>
                </li>
              </>
            )}
            {user.role === 'AUTORIZADOR' && (
              <>
                <li>
                  <Link href="/dashboard/autorizador" style={{ display: 'block', padding: '0.75rem 1.5rem', transition: 'background-color 0.2s' }}>
                    Aguardando Aprovação
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link href="/dashboard/historico" style={{ display: 'block', padding: '0.75rem 1.5rem', transition: 'background-color 0.2s' }}>
                Histórico
              </Link>
            </li>
          </ul>
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
            <strong>{user.name}</strong><br />
            <span style={{ opacity: 0.8 }}>{user.department?.name || 'Admin'}</span>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
