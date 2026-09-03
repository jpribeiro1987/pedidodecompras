"use client"

import { useState } from 'react'

export function SimpleEditForm({ 
  groups, 
  departments,
  request,
  role
}: { 
  groups: any[]
  departments: any[]
  request: any
  role: string
}) {
  const [items, setItems] = useState(request.items && request.items.length > 0 ? request.items.map((i: any) => ({ ...i, quantity: String(i.quantity) })) : [{ 
    description: '', quantity: '1', priority: 'BAIXA', classification: 'Consumo', link: '', groupId: ''
  }])
  
  const [justification, setJustification] = useState(request.justification || '')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: '1', priority: 'BAIXA', classification: 'Consumo', link: '', groupId: '' }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      const formData = new FormData(e.currentTarget)
      
      const payload = {
        justification,
        departmentId: formData.get('departmentId'),
        deliveryDate: formData.get('deliveryDate'),
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          priority: item.priority,
          classification: item.classification,
          link: item.link,
          groupId: item.groupId,
          imageUrl: item.imageUrl // preserve existing
        }))
      }

      const res = await fetch('/api/requests/' + request.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Erro ao salvar')
        setLoading(false)
      } else {
        // Hard navigation to bypass cache issues
        window.location.href = `/dashboard/${role.toLowerCase()}/pedido/${request.id}`
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro crítico')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <strong>Erro:</strong> {errorMsg}
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Itens da Solicitação</h2>
        
        {items.map((item: any, index: number) => (
          <div key={index} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#f8fafc', position: 'relative' }}>
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Remover</button>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label>Descrição (Item {index + 1}) *</label>
              <input type="text" className="input-field" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Quantidade *</label>
                <input type="number" className="input-field" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} required />
              </div>
              <div>
                <label>Link de Referência (Opcional)</label>
                <input type="url" className="input-field" value={item.link || ''} onChange={e => updateItem(index, 'link', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
              <div>
                <label>Prioridade *</label>
                <select className="input-field" value={item.priority || 'BAIXA'} onChange={e => updateItem(index, 'priority', e.target.value)} required>
                  <option value="BAIXA">Baixa (Rotina)</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta (Urgente)</option>
                </select>
              </div>
              <div>
                <label>Classificação *</label>
                <select className="input-field" value={item.classification || 'Consumo'} onChange={e => updateItem(index, 'classification', e.target.value)} required>
                  <option value="Consumo">Material de Consumo</option>
                  <option value="Equipamento">Equipamento</option>
                  <option value="Serviço">Serviço</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label>Grupo de Compra</label>
                <select className="input-field" value={item.groupId || ''} onChange={e => updateItem(index, 'groupId', e.target.value)}>
                  <option value="">Nenhum (Padrão)</option>
                  {groups.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
        
        <button type="button" className="btn" style={{ width: '100%', marginBottom: '2rem', border: '2px dashed #cbd5e1', color: '#64748b' }} onClick={addItem}>
          + Adicionar Outro Item
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label htmlFor="departmentId">Setor Solicitante (Opcional)</label>
          <select id="departmentId" name="departmentId" className="input-field" defaultValue={request.departmentId || ''}>
            <option value="">Selecione um setor...</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="deliveryDate">Previsão de Entrega (Opcional)</label>
          <input type="date" id="deliveryDate" name="deliveryDate" className="input-field" defaultValue={request.deliveryDate ? request.deliveryDate.split('T')[0] : ''} />
        </div>
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="justification">Justificativa *</label>
        <textarea id="justification" className="input-field" rows={3} required value={justification} onChange={e => setJustification(e.target.value)} />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Processando...' : 'Salvar Alterações'}
      </button>
    </form>
  )
}
