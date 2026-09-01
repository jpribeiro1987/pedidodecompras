import os
import re

# 1. Update Timezones
def add_timezone(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We replace .toLocaleString('pt-BR') with .toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    # and .toLocaleDateString('pt-BR') with .toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    
    content = content.replace("toLocaleString('pt-BR')", "toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })")
    content = content.replace("toLocaleDateString('pt-BR')", "toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('src/app/dashboard'):
    for file in files:
        if file.endswith('.tsx'):
            add_timezone(os.path.join(root, file))

# 2. Update QuotesForm.tsx
with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'r', encoding='utf-8') as f:
    q_content = f.read()

# Add freight to the type
q_content = q_content.replace(
    'price: number\n  supplierSearch: string',
    'price: number\n  freight: number\n  supplierSearch: string'
)

# Add freight to state initialization
q_content = q_content.replace(
    "[{ supplierSearch: '', price: 0 }]",
    "[{ supplierSearch: '', price: 0, freight: 0 }]"
)

# Add freight to handleAddQuote
q_content = q_content.replace(
    "setQuotes([...quotes, { supplierSearch: '', price: 0 }])",
    "setQuotes([...quotes, { supplierSearch: '', price: 0, freight: 0 }])"
)

# Add UI for freight
freight_ui = """            <div style={{ flex: 1, minWidth: '100px' }}>
              <label>Frete (R$)</label>
              <input type="number" step="0.01" min="0" required value={q.freight} onChange={e => {
                const newQ = [...quotes];
                newQ[idx].freight = parseFloat(e.target.value) || 0;
                setQuotes(newQ);
              }} className="input-field" style={{ width: '100%' }} />
            </div>"""

q_content = q_content.replace(
    "onChange={e => {", 
    "onChange={e => {" # dummy just to find the place
)
# Better way to insert freight_ui: after the price input div
price_div_end = 'className="input-field" style={{ width: \'100%\' }} />\n            </div>'
idx_price = q_content.find('value={q.price}')
if idx_price != -1:
    idx_end = q_content.find('</div>', idx_price) + 6
    q_content = q_content[:idx_end] + '\n' + freight_ui + q_content[idx_end:]


# Update minQuote calculation to include freight
q_content = q_content.replace(
    'const minQuote = [...quotes].sort((a,b) => a.price - b.price)[0]',
    'const minQuote = [...quotes].sort((a,b) => (a.price + (a.freight||0)) - (b.price + (b.freight||0)))[0]'
)

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'w', encoding='utf-8') as f:
    f.write(q_content)

# 3. Update actions.ts (submitQuotesAction)
with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    act_content = f.read()

act_content = act_content.replace(
    'price: parseFloat(q.price),',
    'price: parseFloat(q.price),\n          freight: parseFloat(q.freight) || 0,'
)

# Fix timezone in actions as well
act_content = act_content.replace("toLocaleDateString('pt-BR')", "toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })")

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(act_content)

