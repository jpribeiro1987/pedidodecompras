'use client'

import { useState } from 'react'
import { addObserverAction, removeObserverAction } from '@/app/observerActions'

export default function ManageObservers({ requestId, observers, allUsers }: { requestId: string, observers: any[], allUsers: any[] }) {
  const [selectedUser, setSelectedUser] = useState('')

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Observadores do Pedido</h3>
      
      {observers.length > 0 ? (
        <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
          {observers.map((obs) => (
            <li key={obs.id} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {obs.name} ({obs.email})
              <form action={removeObserverAction}>
                <input type="hidden" name="requestId" value={requestId} />
                <input type="hidden" name="observerId" value={obs.id} />
                <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
                  Remover
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Nenhum observador adicionado.</p>
      )}

      <form action={addObserverAction} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input type="hidden" name="requestId" value={requestId} />
        <select 
          name="observerId" 
          className="input-field" 
          style={{ flex: 1, margin: 0 }}
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          required
        >
          <option value="">Selecione um usuário para adicionar...</option>
          {allUsers.filter(u => !observers.find(o => o.id === u.id)).map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary" style={{ margin: 0, padding: '0.5rem 1rem' }} disabled={!selectedUser}>
          Adicionar
        </button>
      </form>
    </div>
  )
}