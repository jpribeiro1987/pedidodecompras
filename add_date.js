const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/comprador/page.tsx', 'utf8');

const target_th = `<th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>ID</th>`;
const new_th = `<th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Pedido (Data)</th>`;
content = content.replace(target_th, new_th);

const target_td = `                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>
                        {isMulti ? \`Pacote (\${group.requests.length})\` : req.id.split('-')[0]}
                      </td>`;

const new_td = `                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 600 }}>{isMulti ? \`Pacote (\${group.requests.length})\` : req.id.split('-')[0]}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {new Date(req.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                        </div>
                      </td>`;

content = content.replace(target_td, new_td);

fs.writeFileSync('src/app/dashboard/comprador/page.tsx', content, 'utf8');
console.log('Replaced data in Fila de Compras');
