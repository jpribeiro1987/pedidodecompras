import { getCurrentUser } from '@/app/actions'
import { createBackupAction, restoreBackupAction } from '@/app/backupActions'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { ConfirmButton } from '@/components/ConfirmButton'

export default async function AdminBackupPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'ADMIN') return null

  const backupDir = join(process.cwd(), 'backups')
  let files: { name: string, date: Date, size: number }[] = []
  
  try {
    const fileNames = await readdir(backupDir)
    for (const name of fileNames) {
      if (name.endsWith('.db')) {
        const stats = await stat(join(backupDir, name))
        files.push({
          name,
          date: stats.mtime,
          size: stats.size
        })
      }
    }
    // sort by newest
    files.sort((a, b) => b.date.getTime() - a.date.getTime())
  } catch (e) {
    // Dir might not exist or error reading
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Backup e Restauração</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Criar Novo Backup</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>O backup realiza uma cópia completa de todos os dados do sistema no momento exato em que o botão é clicado.</p>
        </div>
        <form action={createBackupAction}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            💾 Fazer Backup Agora
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Backups Disponíveis</h2>
        
        {files.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>Nenhum backup realizado ainda.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Nome do Arquivo</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Data da Cópia</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Tamanho</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.name} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500, color: 'var(--primary)' }}>{f.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{f.date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{(f.size / 1024).toFixed(2)} KB</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <form action={restoreBackupAction} style={{ display: 'inline' }}>
                      <input type="hidden" name="fileName" value={f.name} />
                      <ConfirmButton 
                        className="btn" 
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#991b1b', backgroundColor: '#fee2e2' }}
                        message={`ATENÇÃO: Restaurar o backup '${f.name}' irá SOBRESCREVER todos os dados atuais do sistema! Você perderá tudo o que foi feito desde esse backup. Deseja continuar?`}
                      >
                        Restaurar Este Backup
                      </ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
