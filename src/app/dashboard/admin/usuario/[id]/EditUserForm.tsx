'use client'

import { useState } from 'react'
import { updateUserAction } from '@/app/adminActions'
import { useRouter } from 'next/navigation'

export function EditUserForm({ 
  user, 
  departments 
}: { 
  user: any, 
  departments: { id: string, name: string }[] 
}) {
  const [role, setRole] = useState(user.role)
  const router = useRouter()

  return (
    <form action={async (formData) => {
      const res = await updateUserAction(formData)
      if (res?.error) {
        alert(res.error)
      } else {
        router.push('/dashboard/admin')
      }
    }}>
      <input type="hidden" name="id" value={user.id} />
      
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label htmlFor="name">Nome</label>
          <input type="text" id="name" name="name" className="input-field" defaultValue={user.name} required />
        </div>
        
        <div>
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" name="email" className="input-field" defaultValue={user.email} required />
        </div>
        
        <div>
          <label htmlFor="role">Perfil</label>
          <select 
            id="role" 
            name="role" 
            className="input-field" 
            required
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="SOLICITANTE">Solicitante</option>
            <option value="COMPRADOR">Comprador</option>
            <option value="AUTORIZADOR">Autorizador</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="departmentId">Setor {role !== 'ADMIN' && <span style={{color: 'red'}}>*</span>}</label>
          <select 
            id="departmentId" 
            name="departmentId" 
            className="input-field" 
            required={role !== 'ADMIN'}
            defaultValue={user.departmentId || ''}
          >
            <option value="">{role === 'ADMIN' ? 'Nenhum' : 'Selecione um setor'}</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {role === 'COMPRADOR' && (
          <div>
            <label htmlFor="autoApproveLimit">Limite Aprovação Automática (R$)</label>
            <input type="number" step="0.01" min="0" id="autoApproveLimit" name="autoApproveLimit" className="input-field" placeholder="Ex: 500.00" defaultValue={user.autoApproveLimit || ''} />
          </div>
        )}

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <label htmlFor="password">Nova Senha (Deixe em branco para não alterar)</label>
          <input type="text" id="password" name="password" className="input-field" placeholder="Digite apenas se quiser mudar a senha..." />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
          Salvar Alterações
        </button>
        <button type="button" className="btn" style={{ flex: 1, padding: '0.75rem', backgroundColor: '#e2e8f0', color: '#1e293b' }} onClick={() => router.push('/dashboard/admin')}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
