'use client'

import { useState, useRef, useEffect } from 'react'
import { createRequestAction } from '@/app/actions'

export function RequestForm({ 
  groups, 
  targetUsers, 
  isComprador 
}: { 
  groups?: any[], 
  targetUsers?: any[], 
  isComprador?: boolean 
}) {
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      
      const newFiles: File[] = []
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            const ext = file.type.split('/')[1] || 'png'
            const renamedFile = new File([file], `print-${Date.now()}.${ext}`, { type: file.type })
            newFiles.push(renamedFile)
          }
        }
      }
      
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles])
      }
    }

    window.addEventListener('paste', handleGlobalPaste)
    return () => window.removeEventListener('paste', handleGlobalPaste)
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Files are managed in state, so we append them to the FormData
    // The browser form logic handles standard inputs, but we inject files manually.
    // However, if the input is in the DOM it sends them. But we overrode with global paste.
    // So we need to intercept and use JS formData.
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    // Remove the original empty file input if exists
    formData.delete('files')
    
    // Add our files
    files.forEach(file => {
      formData.append('files', file)
    })
    
    createRequestAction(formData)
  }

  return (
    <form className="card" onSubmit={handleSubmit} encType="multipart/form-data">
      
      {isComprador && targetUsers && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '4px', border: '1px solid #c7d2fe' }}>
          <label htmlFor="requesterId" style={{ color: '#3730a3', fontWeight: 600 }}>Comprando em nome de (Setor Destino) *</label>
          <select id="requesterId" name="requesterId" className="input-field" required>
            <option value="">Selecione o Solicitante Real</option>
            {targetUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} - {u.department?.name || 'Sem Setor'}</option>
            ))}
          </select>
          <small style={{ color: '#4f46e5' }}>Você pode abrir o pedido em nome de outro setor/usuário.</small>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="description">Descrição Resumida (O que comprar?) *</label>
        <input type="text" id="description" name="description" className="input-field" required placeholder="Ex: Cadeira de escritório ergonômica" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label htmlFor="classification">Classificação *</label>
          <select id="classification" name="classification" className="input-field" required>
            <option value="">Selecione...</option>
            <option value="CONSUMO">Material de Consumo</option>
            <option value="EQUIPAMENTO">Equipamento</option>
            <option value="SERVICO">Serviço Terceirizado</option>
          </select>
        </div>

        <div>
          <label htmlFor="groupId">Grupo de Compras *</label>
          <select id="groupId" name="groupId" className="input-field" required>
            <option value="">Selecione...</option>
            {groups?.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quantity">Quantidade *</label>
          <input type="number" id="quantity" name="quantity" min="1" className="input-field" required defaultValue="1" />
        </div>

        <div>
          <label htmlFor="priority">Prioridade *</label>
          <select id="priority" name="priority" className="input-field" required>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="justification">Justificativa da Compra *</label>
        <textarea id="justification" name="justification" className="input-field" rows={4} required placeholder="Por que este item é necessário? (Você pode colar prints/imagens aqui com Ctrl+V)" />
      </div>

      {/* Upload Zone */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label>Anexos (Arquivos ou Imagens)</label>
        <div style={{ border: '2px dashed var(--border)', padding: '1rem', borderRadius: 'var(--radius)', backgroundColor: '#f8fafc', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Arraste, clique para escolher arquivos ou aperte Ctrl+V para colar prints</p>
          <input 
            type="file" 
            name="files" 
            multiple 
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'block', margin: '0 auto', fontSize: '0.875rem' }} 
          />
        </div>
        
        {files.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {files.map((file, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e2e8f0', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                <span>{file.name}</span>
                <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label htmlFor="link">Link de Referência (Opcional)</label>
        <input type="url" id="link" name="link" className="input-field" placeholder="https://..." />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
        Enviar Solicitação
      </button>
    </form>
  )
}
