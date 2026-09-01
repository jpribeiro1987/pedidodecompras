import re

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variables
state_vars = '''  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierCnpj, setNewSupplierCnpj] = useState('')

  const [showConsultModal, setShowConsultModal] = useState(false)
  const [consultQuoteIndex, setConsultQuoteIndex] = useState<number | null>(null)
  const [consultSearch, setConsultSearch] = useState('')'''

content = content.replace('''  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierCnpj, setNewSupplierCnpj] = useState('')''', state_vars)

# 2. Add id and onKeyDown to the input
input_replacement = '''                <input 
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
                  onChange={e => {'''

content = re.sub(r'                <input\s+type="text"\s+list=\{`suppliers-list-\$\{index\}`\}\s+className="input-field"\s+style=\{\{ margin: 0, flex: 1 \}\}\s+placeholder="Digite para buscar..."\s+value=\{quote\.supplierSearch \|\| \'\'\}\s+onChange=\{e => \{', input_replacement, content, flags=re.DOTALL)

# 3. Add the Consult Modal
consult_modal = '''      {/* MODAL CONSULTAR FORNECEDORES (F2) */}
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

      {/* MODAL NOVO FORNECEDOR */}'''

content = content.replace('{/* MODAL NOVO FORNECEDOR */}', consult_modal)

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
