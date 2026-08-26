'use client'

import { useState } from 'react'
import { updateWinnerCriteriaAction } from '@/app/adminActions'

export default function CriteriosClient({ initialList }: { initialList: string[] }) {
  const [criteria, setCriteria] = useState<string[]>(initialList)
  const [newCriterion, setNewCriterion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!newCriterion.trim()) return
    const updatedList = [...criteria, newCriterion.trim()]
    setCriteria(updatedList)
    setNewCriterion('')
    setLoading(true)
    await updateWinnerCriteriaAction(updatedList)
    setLoading(false)
  }

  const handleRemove = async (index: number) => {
    const updatedList = criteria.filter((_, i) => i !== index)
    setCriteria(updatedList)
    setLoading(true)
    await updateWinnerCriteriaAction(updatedList)
    setLoading(false)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Critérios de Escolha (Comprador)</h1>
      <div className="card" style={{ maxWidth: '600px' }}>
        <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
          Gerencie as opções de critério de escolha que aparecem para o Comprador na hora de definir a cotação vencedora.
        </p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            className="input-field" 
            style={{ margin: 0 }}
            placeholder="Ex: Fornecedor Exclusivo" 
            value={newCriterion} 
            onChange={(e) => setNewCriterion(e.target.value)} 
          />
          <button 
            className="btn btn-primary" 
            onClick={handleAdd}
            disabled={loading || !newCriterion.trim()}
          >
            Adicionar
          </button>
        </div>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {criteria.map((crit, index) => (
            <li key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '0.75rem', 
              backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white',
              borderBottom: '1px solid #e2e8f0',
              alignItems: 'center'
            }}>
              <span>{crit}</span>
              <button 
                onClick={() => handleRemove(index)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                disabled={loading}
              >
                Remover
              </button>
            </li>
          ))}
          {criteria.length === 0 && (
            <li style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Nenhum critério cadastrado.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
