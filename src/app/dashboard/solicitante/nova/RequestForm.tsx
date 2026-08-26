'use client'

import { useState } from 'react'
import { createRequestAction } from '@/app/actions'

export function RequestForm({ 
  groups, 
  targetUsers, 
  isComprador 
}: { 
  groups: any[], 
  targetUsers?: any[], 
  isComprador?: boolean
}) {
  const [items, setItems] = useState([{ description: '', quantity: 1, link: '' }])
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, link: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  return (
    <form action={async (formData) => {
      setLoading(true)
      // Append items as JSON string to the formData
      formData.append('items', JSON.stringify(items))
      await createRequestAction(formData)
    }} className="card">
      
      {isComprador && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label htmlFor="requesterId" style={{ fontWeight: 600, color: '#334155' }}>Solicitante Original (Criando em nome de:)</label>
          <select id="requesterId" name="requesterId" className="input-field">
            {targetUsers?.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.department?.name || 'Sem Setor'})</option>
            ))}
          </select>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Você pode criar um pedido em nome de outro usuário.</span>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Itens da Solicitação</h3>
        
        {items.map((item, index) => (
          <div key={index} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#f8fafc', position: 'relative' }}>
            {items.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeItem(index)}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
              >
                Remover
              </button>
            )}
            
            <div style={{ marginBottom: '1rem' }}>
              <label>O que você precisa comprar? (Item {index + 1}) *</label>
              <input 
                type="text" 
                className="input-field" 
                value={item.description}
                onChange={e => updateItem(index, 'description', e.target.value)}
                required 
                placeholder="Ex: Seringa Descartável 10ml" 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div>
                <label>Quantidade *</label>
                <input 
                  type="number" 
                  className="input-field" 
                  min="1" 
                  value={item.quantity}
                  onChange={e => updateItem(index, 'quantity', e.target.value)}
                  required 
                />
              </div>
              <div>
                <label>Link de Referência (Opcional)</label>
                <input 
                  type="url" 
                  className="input-field" 
                  value={item.link}
                  onChange={e => updateItem(index, 'link', e.target.value)}
                  placeholder="Ex: https://site.com/produto" 
                />
              </div>
            </div>
          </div>
        ))}
        
        <button 
          type="button" 
          onClick={addItem}
          style={{ background: 'none', border: '1px dashed #cbd5e1', padding: '0.75rem', width: '100%', borderRadius: '8px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}
        >
          + Adicionar mais um item
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="justification">Qual a justificativa da compra? *</label>
        <textarea id="justification" name="justification" className="input-field" rows={3} required placeholder="Explique por que precisamos destes itens..."></textarea>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label htmlFor="priority">Prioridade *</label>
          <select id="priority" name="priority" className="input-field" required>
            <option value="BAIXA">Baixa (Rotina)</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta (Urgente)</option>
          </select>
        </div>
        <div>
          <label htmlFor="classification">Classificação *</label>
          <select id="classification" name="classification" className="input-field" required>
            <option value="Consumo">Material de Consumo</option>
            <option value="Equipamento">Equipamento</option>
            <option value="Serviço">Serviço</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <div>
          <label htmlFor="groupId">Grupo de Compra</label>
          <select id="groupId" name="groupId" className="input-field">
            <option value="">Nenhum (Padrão)</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Criando Solicitação...' : 'Criar Solicitação'}
      </button>
    </form>
  )
}
