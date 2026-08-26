with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'export function QuotesForm({ requestId, suppliers, autoApproveLimit }: { requestId: string, suppliers: any[], autoApproveLimit: number }) {',
    'export function QuotesForm({ requestId, suppliers, autoApproveLimit, criteriaList = [] }: { requestId: string, suppliers: any[], autoApproveLimit: number, criteriaList?: string[] }) {'
)

options_old = '''<select id="winnerCriteria" name="winnerCriteria" className="input-field" value={winnerCriteria} onChange={e => setWinnerCriteria(e.target.value)} required>
              <option value="PRECO">Menor Preço</option>
              <option value="QUALIDADE">Melhor Qualidade</option>
              <option value="URGENCIA">Prazo de Entrega / Urgência</option>
            </select>'''

options_new = '''<select id="winnerCriteria" name="winnerCriteria" className="input-field" value={winnerCriteria} onChange={e => setWinnerCriteria(e.target.value)} required>
              {criteriaList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>'''
content = content.replace(options_old, options_new)

content = content.replace("const [winnerCriteria, setWinnerCriteria] = useState('PRECO')",
    "const [winnerCriteria, setWinnerCriteria] = useState(criteriaList[0] || 'Menor Preço')")

content = content.replace("required={winnerCriteria !== 'PRECO'}", "required={winnerCriteria !== (criteriaList[0] || 'Menor Preço')}")

with open('src/app/dashboard/comprador/pedido/[id]/QuotesForm.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
