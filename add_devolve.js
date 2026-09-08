const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'utf8');

const target = `            {['CRIADA', 'EM_COTACAO', 'AGUARDANDO_AUTORIZACAO', 'AGUARDANDO_FINANCEIRO'].includes(request.currentStatus) && (`;

const newForm = `            {['CRIADA', 'EM_ANALISE', 'EM_COTACAO'].includes(request.currentStatus) && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#f59e0b' }}>Devolver para Ajustes (Kanban)</h3>
                <form action={async (formData) => {
                  'use server'
                  const { returnForAdjustmentAction } = await import('@/app/actions')
                  return returnForAdjustmentAction(formData)
                }}>
                  <input type="hidden" name="id" value={request.id} />
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="adjustmentReason">Motivo / O que deve ser ajustado? *</label>
                    <textarea id="adjustmentReason" name="reason" className="input-field" rows={2} required placeholder="Explique ao solicitante o que precisa ser corrigido..."></textarea>
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fbbf24' }}>
                    Devolver para o Solicitante
                  </button>
                </form>
              </div>
            )}

            {['CRIADA', 'EM_COTACAO', 'AGUARDANDO_AUTORIZACAO', 'AGUARDANDO_FINANCEIRO'].includes(request.currentStatus) && (`;

content = content.replace(target, newForm);
fs.writeFileSync('src/app/dashboard/comprador/pedido/[id]/page.tsx', content, 'utf8');
console.log('Added devolve form');
