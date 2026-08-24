'use client'

import { useState } from 'react'
import { createUserAction } from '@/app/adminActions'

export function UserForm({ departments }: { departments: { id: string, name: string }[] }) {
  const [role, setRole] = useState('SOLICITANTE')

  return (
    <form action={createUserAction} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 200px' }}>
        <label htmlFor="name">Nome</label>
        <input type="text" id="name" name="name" className="input-field" required />
      </div>
      <div style={{ flex: '1 1 200px' }}>
        <label htmlFor="email">E-mail</label>
        <input type="email" id="email" name="email" className="input-field" required />
      </div>
      <div style={{ flex: '1 1 150px' }}>
        <label htmlFor="password">Senha</label>
        <input type="password" id="password" name="password" className="input-field" required />
      </div>
      <div style={{ flex: '1 1 150px' }}>
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
      <div style={{ flex: '1 1 150px' }}>
        <label htmlFor="departmentId">Setor {role !== 'ADMIN' && <span style={{color: 'red'}}>*</span>}</label>
        <select 
          id="departmentId" 
          name="departmentId" 
          className="input-field" 
          required={role !== 'ADMIN'}
        >
          <option value="">{role === 'ADMIN' ? 'Nenhum' : 'Selecione um setor'}</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      {role === 'COMPRADOR' && (
        <div style={{ flex: '1 1 150px' }}>
          <label htmlFor="autoApproveLimit">Limite Aprovação Automática (R$)</label>
          <input type="number" step="0.01" min="0" id="autoApproveLimit" name="autoApproveLimit" className="input-field" placeholder="Ex: 500.00" />
        </div>
      )}
      <div style={{ flex: '0 0 auto' }}>
        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', height: '42px' }}>
          Salvar
        </button>
      </div>
    </form>
  )
}
