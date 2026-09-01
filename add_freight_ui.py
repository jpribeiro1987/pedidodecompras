import os

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
    
start = content.find('name={`quote_${index}_negotiatedPrice`}')
div_end = content.find('</div>', start) + 6

freight_html = """
            <div style={{ flex: 1, minWidth: '100px' }}>
              <label>Frete (R$)</label>
              <input 
                type="number" step="0.01" min="0" 
                name={`quote_${index}_freight`}
                className="input-field" style={{ width: '100%' }} 
                value={quote.freight} 
                onChange={e => handleQuoteChange(index, 'freight', e.target.value)} 
              />
            </div>
"""

if "name={`quote_${index}_freight`}" not in content:
    new_content = content[:div_end] + freight_html + content[div_end:]
    with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
