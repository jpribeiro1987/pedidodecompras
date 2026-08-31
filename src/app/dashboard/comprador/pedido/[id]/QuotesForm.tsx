'use client'

import { useState } from 'react'
import { updateRequestStatusAction } from '@/app/actions'
import { createSupplierAction } from '@/app/adminActions'
import { useRouter } from 'next/navigation'

export function QuotesForm({ requestId, suppliers = [], autoApproveLimit = 0, criteriaList = [] }: { requestId: string, suppliers?: any[], autoApproveLimit?: number, criteriaList?: string[] }) {
  const router = useRouter()
  // Start with 1 quote to allow single-supplier quotes
  const [quotes, setQuotes] = useState([{ supplierId: '', price: '', negotiatedPrice: '', freight: '', supplierSearch: '' }])
  const [winnerIndex, setWinnerIndex] = useState<number>(0)
  const [winnerCriteria, setWinnerCriteria] = useState(criteriaList[0] || 'Menor Preço')
  const [deliveryDate, setDeliveryDate] = useState('')
  
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierCnpj, setNewSupplierCnpj] = useState('')

  const [showConsultModal, setShowConsultModal] = useState(false)
  const [consultQuoteIndex, setConsultQuoteIndex] = useState<number | null>(null)
  const [consultSearch, setConsultSearch] = useState('')

  const addQuote = () => {
    setQuotes([...quotes, { supplierId: '', price: '', negotiatedPrice: '', freight: '', supplierSearch: '' }])
  }

  const removeQuote = (index: number) => {
    if (quotes.length === 1) return // Prevents removing the last quote
    const newQuotes = quotes.filter((_, i) => i !== index)
    setQuotes(newQuotes)
    if (winnerIndex >= newQuotes.length) setWinnerIndex(0)
  }

  const handleQuoteChange = (index: number, field: 'supplierId' | 'price' | 'negotiatedPrice' | 'freight' | 'supplierSearch', value: string) => {
    const newQuotes = [...quotes]
    newQuotes[index][field] = value
    setQuotes(newQuotes)
  }

  const handleCreateSupplier = async () => {
    if (!newSupplierName) return alert('Nome é obrigatório')
    const formData = new FormData()
    formData.append('name', newSupplierName)
    formData.append('cnpj', newSupplierCnpj)
    
    try {
      await createSupplierAction(formData)
      setShowSupplierModal(false)
      setNewSupplierName('')
      setNewSupplierCnpj('')
      router.refresh() // Refreshes the page to load the new supplier into the select
    } catch (e: any) {
      alert(e.message)
    }
  }

  // Calculate winner value to check against limit
  const winnerQuote = quotes[winnerIndex]
  const winnerValue = parseFloat(winnerQuote?.negotiatedPrice || winnerQuote?.price || '0') + parseFloat(winnerQuote?.freight || '0')
  const canAutoApprove = winnerValue > 0 && winnerValue <= autoApproveLimit

  return (
    <>
      <form action={updateRequestStatusAction}>
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="quotesCount" value={quotes.length} />
        <input type="hidden" name="winnerIndex" value={winnerIndex} />
        <input type="hidden" name="deliveryDate" value={deliveryDate} />
        
        {/* We will let the button's name/value determine the status and autoApprove on submit */}

        <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Cotações Recebidas</h3>
            <button type="button" onClick={addQuote} className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#e2e8f0' }}>
              + Adicionar Cotação
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Fornecedor</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Valor Inicial (R$)</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Valor Negociado (R$)</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Vencedor</div>
            <div></div>
          </div>

          {quotes.map((quote, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <input 
                  type="text"
                  id={`supplier-search-${index}`}
                  list={`suppliers-list-${index}`}
                  className="input-field" 
                  style={{ margin: 0, flex: 1 }}
                  placeholder="Digite ou tecle F2..."
                  value={quote.supplierSearch || ''}
                  onKeyDown={e => {
                    if (e.key === 'F2') {
                      e.preventDefault();
                      setConsultQuoteIndex(index);
                      setConsultSearch('');
                      setShowConsultModal(true);
                    }
                  }}
                  onChange={e => {
                    const val = e.target.value
                    handleQuoteChange(index, 'supplierSearch', val)
                    
                    const matched = suppliers.find(s => `${s.name} ${s.cnpj ? `(${s.cnpj})` : ''}` === val)
                    if (matched) {
                      handleQuoteChange(index, 'supplierId', matched.id)
                      e.target.setCustomValidity('')
                    } else {
                      handleQuoteChange(index, 'supplierId', '')
                      e.target.setCustomValidity('Selecione um fornecedor válido da lista')
                    }
                  }}
                  required
                />
                <input type="hidden" name={`quote_${index}_supplierId`} value={quote.supplierId} />
                <datalist id={`suppliers-list-${index}`}>
                  {suppliers.map(s => (
                    <option key={s.id} value={`${s.name} ${s.cnpj ? `(${s.cnpj})` : ''}`} />
                  ))}
                </datalist>
                {quote.supplierSearch && !quote.supplierId && (
                  <span style={{ color: 'red', fontSize: '0.7rem', marginTop: '-0.25rem' }}>Fornecedor inválido</span>
                )}
              </div>

              <input 
                type="number" 
                step="0.01" 
                name={`quote_${index}_price`} 
                className="input-field" 
                style={{ margin: 0 }} 
                placeholder="Ex: 1500.00" 
                value={quote.price}
                onChange={e => handleQuoteChange(index, 'price', e.target.value)}
                required 
              />
              <input 
                type="number" 
                step="0.01" 
                name={`quote_${index}_negotiatedPrice`} 
                className="input-field" 
                style={{ margin: 0 }} 
                placeholder="Opcional" 
                value={quote.negotiatedPrice}
                onChange={e => handleQuoteChange(index, 'negotiatedPrice', e.target.value)}
              />
              <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                <input 
                  type="radio" 
                  name="winner_radio" 
                  checked={winnerIndex === index}
                  onChange={() => setWinnerIndex(index)}
                  style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                />
              </div>
              {quotes.length > 1 ? (
                <button type="button" onClick={() => removeQuote(index)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>
                  X
                </button>
              ) : <div style={{ width: '15px' }}></div>}
            </div>
          ))}

          <div style={{ marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowSupplierModal(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
              Fornecedor não está na lista? Cadastrar Novo
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label htmlFor="winnerCriteria">Critério de Escolha do Vencedor</label>
            <select id="winnerCriteria" name="winnerCriteria" className="input-field" value={winnerCriteria} onChange={e => setWinnerCriteria(e.target.value)} required>
              {criteriaList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="deliveryDate">Previsão de Entrega (Data) *</label>
            <input type="date" id="deliveryDate" name="deliveryDate" className="input-field" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="winnerJustification">Justificativa da Escolha (Obrigatório se não for o Menor Preço)</label>
          <textarea id="winnerJustification" name="winnerJustification" className="input-field" rows={2} required={winnerCriteria !== (criteriaList[0] || 'Menor Preço')} placeholder="Explique por que esta cotação foi a escolhida..." />
        </div>

        {canAutoApprove ? (
          <>
            <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px', border: '1px solid #86efac', marginBottom: '1rem' }}>
              <p style={{ color: '#166534', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>
                ✓ O valor vencedor (R$ {winnerValue.toFixed(2)}) está dentro da sua alçada de aprovação (R$ {autoApproveLimit.toFixed(2)}).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                name="status" 
                value="AGUARDANDO_FINANCEIRO" 
                className="btn btn-primary" 
                style={{ flex: 1, backgroundColor: '#16a34a' }}
                onClick={(e) => {
                  const form = e.currentTarget.form;
                  if (form) {
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = 'autoApproved';
                    hiddenInput.value = 'true';
                    form.appendChild(hiddenInput);
                  }
                }}
              >
                Aprovar Compra (Aguardar Financeiro)
              </button>
              <button 
                type="submit" 
                name="status" 
                value="AGUARDANDO_AUTORIZACAO" 
                className="btn" 
                style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#1e293b' }}
                onClick={(e) => {
                  const form = e.currentTarget.form;
                  if (form) {
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = 'autoApproved';
                    hiddenInput.value = 'false';
                    form.appendChild(hiddenInput);
                  }
                }}
              >
                Enviar para Diretoria Avaliar (Opcional)
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '1rem', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #fdba74', marginBottom: '1rem' }}>
              <p style={{ color: '#9a3412', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>
                ⚠ O valor vencedor excede sua alçada (R$ {autoApproveLimit.toFixed(2)}). O pedido será enviado para o Autorizador.
              </p>
            </div>
            <button 
              type="submit" 
              name="status" 
              value="AGUARDANDO_AUTORIZACAO" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={(e) => {
                const form = e.currentTarget.form;
                if (form) {
                  const hiddenInput = document.createElement('input');
                  hiddenInput.type = 'hidden';
                  hiddenInput.name = 'autoApproved';
                  hiddenInput.value = 'false';
                  form.appendChild(hiddenInput);
                }
              }}
            >
              Enviar para Autorizador
            </button>
          </>
        )}
      </form>

            {/* MODAL CONSULTAR FORNECEDORES (F2) */}
      {showConsultModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Consultar Fornecedores (F2)</h3>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Buscar fornecedor por nome ou CNPJ..." 
              value={consultSearch} 
              onChange={e => setConsultSearch(e.target.value)} 
              style={{ marginBottom: '1rem' }} 
              autoFocus
            />
            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--border)', borderRadius: '4px', maxHeight: '400px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '0.5rem', fontWeight: 500 }}>Nome</th>
                    <th style={{ padding: '0.5rem', fontWeight: 500 }}>CNPJ</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.filter(s => 
                    s.name.toLowerCase().includes(consultSearch.toLowerCase()) || 
                    (s.cnpj && s.cnpj.includes(consultSearch))
                  ).map(s => (
                    <tr 
                      key={s.id} 
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => {
                        if (consultQuoteIndex !== null) {
                          const val = `${s.name} ${s.cnpj ? `(${s.cnpj})` : ''}`
                          handleQuoteChange(consultQuoteIndex, 'supplierSearch', val)
                          handleQuoteChange(consultQuoteIndex, 'supplierId', s.id)
                          const inputEl = document.getElementById(`supplier-search-${consultQuoteIndex}`) as HTMLInputElement
                          if(inputEl) inputEl.setCustomValidity('')
                        }
                        setShowConsultModal(false)
                      }}
                    >
                      <td style={{ padding: '0.5rem' }}>{s.name}</td>
                      <td style={{ padding: '0.5rem', color: '#64748b' }}>{s.cnpj || '-'}</td>
                    </tr>
                  ))}
                  {suppliers.filter(s => 
                    s.name.toLowerCase().includes(consultSearch.toLowerCase()) || 
                    (s.cnpj && s.cnpj.includes(consultSearch))
                  ).length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Nenhum fornecedor encontrado</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowConsultModal(false)} className="btn" style={{ backgroundColor: '#e2e8f0', color: '#1e293b' }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO FORNECEDOR */}
      {showSupplierModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Novo Fornecedor</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label>CNPJ (Deixe em branco se não aplicável)</label>
              <input type="text" className="input-field" value={newSupplierCnpj} onChange={e => setNewSupplierCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Nome da Empresa *</label>
              <input type="text" className="input-field" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={handleCreateSupplier} className="btn btn-primary" style={{ flex: 1 }}>Salvar</button>
              <button type="button" onClick={() => setShowSupplierModal(false)} className="btn" style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#1e293b' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
