'use client'

import { useState } from 'react'
import { extendDeliveryDateAction } from '@/app/actions'

export function ExtendDeliveryForm({ requestId, currentDeliveryDate }: { requestId: string, currentDeliveryDate?: Date | null }) {
  const [showForm, setShowForm] = useState(false)

  if (!showForm) {
    return (
      <button 
        type="button" 
        onClick={() => setShowForm(true)} 
        className="btn" 
        style={{ marginTop: '1rem', width: '100%', backgroundColor: '#fffedd', borderColor: '#eab308', color: '#854d0e' }}
      >
        Prorrogar Prazo de Entrega
      </button>
    )
  }

  return (
    <form action={extendDeliveryDateAction} style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #eab308', borderRadius: '8px', backgroundColor: '#fefce8' }}>
      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#854d0e', marginBottom: '1rem' }}>Prorrogar Entrega</h4>
      <input type="hidden" name="requestId" value={requestId} />
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: '#a16207' }}>Nova Data de Previsão *</label>
        <input type="date" name="deliveryDate" className="input-field" required />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: '#a16207' }}>Motivo da Prorrogação *</label>
        <textarea name="reason" className="input-field" rows={2} required placeholder="Ex: Fornecedor atrasou a produção..." />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: '#ca8a04', borderColor: '#ca8a04' }}>Salvar Prorrogação</button>
        <button type="button" onClick={() => setShowForm(false)} className="btn" style={{ flex: 1, backgroundColor: '#fef08a', color: '#854d0e', borderColor: '#fde047' }}>Cancelar</button>
      </div>
    </form>
  )
}
