import re

# 1. Fix QuotesForm.tsx for freight addition
with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add freight to the state and types if not present
if "freight: ''" not in content:
    content = content.replace(
        "price: '', negotiatedPrice: '', supplierSearch: ''",
        "price: '', negotiatedPrice: '', freight: '', supplierSearch: ''"
    )
    content = content.replace(
        "field: 'supplierId' | 'price' | 'negotiatedPrice' | 'supplierSearch'",
        "field: 'supplierId' | 'price' | 'negotiatedPrice' | 'freight' | 'supplierSearch'"
    )

# Add freight UI
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

if "name={`quote_${index}_freight`}" not in content:
    content = content.replace(price_div, price_div + '\n' + freight_div)

# Fix winner calculation
winner_calc_old = "const winnerValue = parseFloat(winnerQuote?.negotiatedPrice || winnerQuote?.price || '0')"
winner_calc_new = "const winnerValue = parseFloat(winnerQuote?.negotiatedPrice || winnerQuote?.price || '0') + parseFloat(winnerQuote?.freight || '0')"
if winner_calc_old in content:
    content = content.replace(winner_calc_old, winner_calc_new)

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update actions.ts to parse and save freight
with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    act_content = f.read()

freight_parse = """      const negPriceStr = formData.get(`quote_${i}_negotiatedPrice`) as string
      const negotiatedPrice = negPriceStr ? parseFloat(negPriceStr.replace(',', '.')) : null
      
      const freightStr = formData.get(`quote_${i}_freight`) as string
      const freight = freightStr ? parseFloat(freightStr.replace(',', '.')) : 0

      quotesData.push({
        supplierId,
        supplierName: '', // Fallback mantido por segurana
        price,
        negotiatedPrice,
        freight,
        isWinner: i === winnerIndex
      })"""

if "const freightStr = " not in act_content:
    act_content = re.sub(r'const negPriceStr = formData\.get.*?isWinner: i === winnerIndex\n      \}\)', freight_parse, act_content, flags=re.DOTALL)
    
with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(act_content)

