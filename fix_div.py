with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = ") : <div style={{ width: '15px' }}></div>}\n            </div>"

replacement = """              ) : <div style={{ width: '15px' }}></div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Frete (R$):</label>
              <input 
                type="number" step="0.01" min="0" 
                name={`quote_${index}_freight`}
                className="input-field" style={{ width: '150px', margin: 0 }} 
                value={quote.freight} 
                onChange={e => handleQuoteChange(index, 'freight', e.target.value)} 
              />
            </div>
          </div>"""

content = content.replace(target, replacement)

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
