const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'utf8');

// Render Authorizer Feedback
const findStr = "            ) : ['CRIADA', 'EM_COTACAO', 'AGUARDANDO_AUTORIZACAO'].includes(request.currentStatus) ? (\n              <QuotesForm";
const replaceStr = `            ) : ['CRIADA', 'EM_COTACAO', 'AGUARDANDO_AUTORIZACAO', 'AJUSTES_COMPRADOR'].includes(request.currentStatus) ? (
              <>
                {request.currentStatus === 'AJUSTES_COMPRADOR' && (
                  <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #f87171', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontWeight: 600, color: '#b91c1c', marginBottom: '0.5rem' }}>Atenção: Solicitação Devolvida pela Diretoria</h4>
                    <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                      <strong>Motivo / Decisão:</strong> {request.history.find(h => h.newStatus === 'AJUSTES_COMPRADOR')?.observation || 'Não informado.'}
                    </p>
                  </div>
                )}
              <QuotesForm`;
content = content.replace(findStr, replaceStr);

content = content.replace("['CRIADA', 'EM_ANALISE', 'EM_COTACAO']", "['CRIADA', 'EM_ANALISE', 'EM_COTACAO', 'AJUSTES_COMPRADOR']");
content = content.replace("['CRIADA', 'EM_COTACAO', 'AGUARDANDO_AUTORIZACAO', 'AGUARDANDO_FINANCEIRO']", "['CRIADA', 'EM_COTACAO', 'AGUARDANDO_AUTORIZACAO', 'AGUARDANDO_FINANCEIRO', 'AJUSTES_COMPRADOR']");

// Also close the <> fragment
const formCloseStr = "                existingDeliveryDate={request.deliveryDate ? request.deliveryDate.toISOString() : ''}\n              />\n            ) : null}";
const formCloseReplace = "                existingDeliveryDate={request.deliveryDate ? request.deliveryDate.toISOString() : ''}\n              />\n              </>\n            ) : null}";
content = content.replace(formCloseStr, formCloseReplace);

fs.writeFileSync('src/app/dashboard/comprador/pedido/[id]/page.tsx', content);