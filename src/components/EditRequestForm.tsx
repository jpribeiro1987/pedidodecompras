'use client'

import { useState } from 'react'
import { updateRequestAction, updateRequestActionData } from '@/app/actions'
import { useRouter } from 'next/navigation'

export function EditRequestForm({ 
  user,
  groups, 
  targetUsers, 
  isComprador,
  departments = [],
  request
}: {
  user: any,
  groups: any[],
  targetUsers?: any[],
  isComprador?: boolean,
  departments?: any[],
  request: any
}) {
  const router = useRouter()
  const [items, setItems] = useState(request.items && request.items.length > 0 ? request.items.map((i) => ({ ...i, quantity: String(i.quantity), file: null, previewUrl: i.imageUrl || "" })) : [{ 
    description: '', 
    quantity: 1, 
    link: '',
    priority: 'MEDIA',
    classification: 'Consumo',
    groupId: '',
    file: null as File | null,
    previewUrl: '' as string
  }])
  const [justification, setJustification] = useState(request.justification || '')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const addItem = () => {
    setItems([...items, { 
      description: '', 
      quantity: 1, 
      link: '',
      priority: 'MEDIA',
      classification: 'Consumo',
      groupId: '',
      file: null,
      previewUrl: ''
    }])
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

  const handlePaste = (index: number, e: React.ClipboardEvent) => {
    const itemsData = e.clipboardData.items
    for (let i = 0; i < itemsData.length; i++) {
      if (itemsData[i].type.indexOf('image') !== -1) {
        const file = itemsData[i].getAsFile()
        if (file) {
          updateItem(index, 'file', file)
          updateItem(index, 'previewUrl', URL.createObjectURL(file))
        }
      }
    }
  }

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      updateItem(index, 'file', file)
      updateItem(index, 'previewUrl', URL.createObjectURL(file))
    }
  }

  return (
    <form onSubmit={async (e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      setLoading(true)
      setErrorMsg('')
      try {
        const itemsWithoutFiles = items.map(item => {
          const { file, previewUrl, ...rest } = item
          return rest
        })
        const data = {
          id: (formData.get('id') as string) || request.id,
          justification: justification,
          itemsJson: JSON.stringify(itemsWithoutFiles),
          departmentId: (formData.get('departmentId') as string) || undefined,
          deliveryDateStr: (formData.get('deliveryDate') as string) || undefined
        }
        
        console.log("CALLING updateRequestActionData", data)
        const res = await updateRequestActionData(data)
        console.log("updateRequestActionData RETURNED", res)
        
        if (res?.error) {
          setErrorMsg(res.error)
          setLoading(false)
        } else if (res?.success) {
          router.push(`/dashboard/solicitante/pedido/${request.id}`)
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro crítico')
        setLoading(false)
      }
    }} className="card">
      
      <input type="hidden" name="id" value={request.id} />
      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #f87171' }}>
          <strong>Erro:</strong> {errorMsg}
        </div>
      )}

      {isComprador && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label htmlFor="requesterId" style={{ fontWeight: 600, color: '#334155' }}>Solicitante Original (Criando em nome de:)</label>
          <select id="requesterId" name="requesterId" className="input-field">
            {targetUsers?.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.department?.name || 'Sem Setor'})</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Itens da Solicitação</h2>
        
        {items.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '1.5rem', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              backgroundColor: '#f8fafc',
              position: 'relative'
            }}
            onPaste={(e) => handlePaste(index, e)}
          >
            {items.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeItem(index)}
                style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  background: 'none', 
                  border: 'none', 
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
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
                  placeholder="https://..." 
                />
              </div>
            </div>

            {/* Imagem / Print */}
            <div style={{ marginBottom: '1rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem' }}>
              <label>Anexar Imagem ou Colar Print (Opcional)</label>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Dica: Você pode dar Ctrl+V nesta área para colar uma captura de tela.</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(index, e)}
                  style={{ fontSize: '0.9rem' }}
                />
                
                {item.previewUrl && (
                  <div style={{ position: 'relative' }}>
                    <img src={item.previewUrl} alt="Preview" style={{ height: '60px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    <button 
                      type="button"
                      onClick={() => { updateItem(index, 'file', null); updateItem(index, 'previewUrl', ''); }}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}
                    >X</button>
                  </div>
                )}
              </div>
            </div>

            {/* Novas Configurações Individuais */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
              <div>
                <label>Prioridade *</label>
                <select 
                  className="input-field" 
                  value={item.priority}
                  onChange={e => updateItem(index, 'priority', e.target.value)}
                  required
                >
                  <option value="BAIXA">Baixa (Rotina)</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta (Urgente)</option>
                </select>
              </div>
              <div>
                <label>Classificação *</label>
                <select 
                  className="input-field" 
                  value={item.classification}
                  onChange={e => updateItem(index, 'classification', e.target.value)}
                  required
                >
                  <option value="Consumo">Material de Consumo</option>
                  <option value="Equipamento">Equipamento</option>
                  <option value="Serviço">Serviço</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label>Grupo de Compra</label>
                <select 
                  className="input-field" 
                  value={item.groupId}
                  onChange={e => updateItem(index, 'groupId', e.target.value)}
                >
                  <option value="">Nenhum (Padrão)</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
        
        <button 
          type="button" 
          className="btn" 
          style={{ width: '100%', marginBottom: '2rem', border: '2px dashed #cbd5e1', color: '#64748b' }}
          onClick={addItem}
        >
          + Adicionar Outro Item
        </button>
      </div>

            <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="departmentId">Setor Solicitante (Opcional - Padrão: Seu Setor)</label>
        <select id="departmentId" name="departmentId" className="input-field" defaultValue={request.departmentId || user.departmentId || ''}>
          <option value="">Selecione um setor...</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="justification">Qual a justificativa global da compra? *</label>
        <textarea 
          id="justification" 
          className="input-field" 
          rows={3} 
          required 
          value={justification}
          onChange={e => setJustification(e.target.value)}
          placeholder="Explique por que precisamos destes itens..."
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Processando...' : 'Salvar Alterações'}
      </button>
    </form>
  )
}
