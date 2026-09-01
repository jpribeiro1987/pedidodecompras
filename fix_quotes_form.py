import re

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add freight to the type and state
content = content.replace(
    "price: '', negotiatedPrice: '', supplierSearch: ''",
    "price: '', negotiatedPrice: '', freight: '', supplierSearch: ''"
)

content = content.replace(
    "field: 'supplierId' | 'price' | 'negotiatedPrice' | 'supplierSearch'",
    "field: 'supplierId' | 'price' | 'negotiatedPrice' | 'freight' | 'supplierSearch'"
)

# Add UI for freight
price_div = """            <div style={{ flex: 1, minWidth: '100px' }}>
              <label>Desconto/Negociado (R$)</label>
              <input 
                type="number" step="0.01" min="0" 
                name={`quote_${index}_negotiatedPrice`}
                className="input-field" style={{ width: '100%' }} 
                value={quote.negotiatedPrice} 
                onChange={e => handleQuoteChange(index, 'negotiatedPrice', e.target.value)} 
              />
            </div>"""

freight_div = """            <div style={{ flex: 1, minWidth: '100px' }}>
              <label>Frete (R$)</label>
              <input 
                type="number" step="0.01" min="0" 
                name={`quote_${index}_freight`}
                className="input-field" style={{ width: '100%' }} 
                value={quote.freight} 
                onChange={e => handleQuoteChange(index, 'freight', e.target.value)} 
              />
            </div>"""

content = content.replace(price_div, price_div + '\n' + freight_div)

# Fix winnerValue check to include freight
winner_calc = "const winnerValue = parseFloat(winnerQuote?.negotiatedPrice || winnerQuote?.price || '0')"
new_winner_calc = "const winnerValue = parseFloat(winnerQuote?.negotiatedPrice || winnerQuote?.price || '0') + parseFloat(winnerQuote?.freight || '0')"
content = content.replace(winner_calc, new_winner_calc)

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
