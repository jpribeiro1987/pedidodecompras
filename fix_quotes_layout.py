import re

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the broken freight block
old_freight = """            <div style={{ flex: 1, minWidth: '100px' }}>
              <label>Frete (R$)</label>
              <input 
                type="number" step="0.01" min="0" 
                name={`quote_${index}_freight`}
                className="input-field" style={{ width: '100%' }} 
                value={quote.freight} 
                onChange={e => handleQuoteChange(index, 'freight', e.target.value)} 
              />
            </div>"""

content = content.replace(old_freight, "")

# Now find where to insert the wrapper
# We change:
# <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
# To:
# <div key={index} style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: index < quotes.length - 1 ? '1px dashed var(--border)' : 'none' }}>
#   <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>

old_grid_start = "<div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>"
new_grid_start = """<div key={index} style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: index < quotes.length - 1 ? '1px dashed var(--border)' : 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>"""

content = content.replace(old_grid_start, new_grid_start)

# Now find the end of the quote row. It's after the delete button.
# Let's find:
#               {quotes.length > 1 ? (
#                 <button type="button" onClick={() => handleRemoveQuote(index)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.5rem' }} title="Remover cotação">
#                   X
#                 </button>
#               ) : <div />}
#             </div>

delete_button_str = """              {quotes.length > 1 ? (
                <button type="button" onClick={() => handleRemoveQuote(index)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.5rem' }} title="Remover cotao">
                  X
                </button>
              ) : <div />}
            </div>"""

new_end_str = """              {quotes.length > 1 ? (
                <button type="button" onClick={() => handleRemoveQuote(index)} style={{ color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.5rem', fontWeight: 'bold' }} title="Remover cotação">
                  X
                </button>
              ) : <div />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Frete Adicional (R$):</label>
              <input 
                type="number" step="0.01" min="0" 
                name={`quote_${index}_freight`}
                className="input-field" style={{ width: '150px', margin: 0 }} 
                value={quote.freight} 
                onChange={e => handleQuoteChange(index, 'freight', e.target.value)} 
              />
            </div>
          </div>"""

# Handle encoding differences for "cotação"
delete_button_pattern = r"\{\s*quotes\.length > 1 \? \([\s\S]*?<button type=\"button\" onClick=\{.*?\} style=\{.*?\} title=\"Remover cota.*?>\s*X\s*</button>\s*\)\s*:\s*<div\s*/>\}\s*</div>"

match = re.search(delete_button_pattern, content)
if match:
    content = content[:match.start()] + new_end_str + content[match.end():]

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
