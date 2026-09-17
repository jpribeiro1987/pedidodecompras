const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/comprador/page.tsx', 'utf8');

const thTarget = "<th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Descrição</th>";
const thReplace = "<th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Local de Consumo</th>\n                  <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Descrição</th>";
content = content.replace(thTarget, thReplace);

const tdTarget = "<td style={{ padding: '1rem 0.5rem' }}>\n                        {group.requests.map((r: any) => formatRequestItems(r)).join(', ')}\n                      </td>";
const tdReplace = "<td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>\n                        {isMulti ? group.requests.map((r: any) => r.consumptionLocation).filter(Boolean).join(', ') || '-' : (req.consumptionLocation || '-')}\n                      </td>\n                      <td style={{ padding: '1rem 0.5rem' }}>\n                        {group.requests.map((r: any) => formatRequestItems(r)).join(', ')}\n                      </td>";
content = content.replace(tdTarget, tdReplace);

fs.writeFileSync('src/app/dashboard/comprador/page.tsx', content);