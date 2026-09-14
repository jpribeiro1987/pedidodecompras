const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/comprador/page.tsx', 'utf8');

// Add searchParams
content = content.replace('export default async function CompradorDashboard() {', 'export default async function CompradorDashboard({ searchParams }: { searchParams: Promise<{ sort?: string, order?: string }> }) {\n  const params = await searchParams;');

// Add sort parameter extraction
const extraction = `  const sort = params?.sort || 'date';
  const order = params?.order || 'desc';\n`;
content = content.replace('  const user = await getCurrentUser()', extraction + '  const user = await getCurrentUser()');

// Replace headers
// We use a regex to grab the <thead>...</thead> block
content = content.replace(/<thead>[\s\S]*?<\/thead>/, `<thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}><Link href={\`?sort=date&order=\${sort === 'date' && order === 'desc' ? 'asc' : 'desc'}\`} style={{ color: 'inherit', textDecoration: 'none' }}>Pedido (Data) {sort === 'date' ? (order === 'asc' ? '↑' : '↓') : ''}</Link></th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}><Link href={\`?sort=solicitante&order=\${sort === 'solicitante' && order === 'asc' ? 'desc' : 'asc'}\`} style={{ color: 'inherit', textDecoration: 'none' }}>Solicitante {sort === 'solicitante' ? (order === 'asc' ? '↑' : '↓') : ''}</Link></th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Descrição</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}><Link href={\`?sort=status&order=\${sort === 'status' && order === 'asc' ? 'desc' : 'asc'}\`} style={{ color: 'inherit', textDecoration: 'none' }}>Status {sort === 'status' ? (order === 'asc' ? '↑' : '↓') : ''}</Link></th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}><Link href={\`?sort=responsavel&order=\${sort === 'responsavel' && order === 'asc' ? 'desc' : 'asc'}\`} style={{ color: 'inherit', textDecoration: 'none' }}>Responsável {sort === 'responsavel' ? (order === 'asc' ? '↑' : '↓') : ''}</Link></th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Ações</th>
              </tr>
            </thead>`);

// Replace the grouping sort logic
const oldSortLogic = `grouped.sort((a, b) => new Date(b.requests[0].createdAt).getTime() - new Date(a.requests[0].createdAt).getTime())`;
const newSortLogic = `grouped.sort((a, b) => {
                  const reqA = a.requests[0];
                  const reqB = b.requests[0];
                  let comparison = 0;
                  
                  if (sort === 'solicitante') {
                    comparison = reqA.requester.name.localeCompare(reqB.requester.name);
                  } else if (sort === 'status') {
                    comparison = reqA.currentStatus.localeCompare(reqB.currentStatus);
                  } else if (sort === 'responsavel') {
                    const buyerA = reqA.buyer?.name || 'zzz';
                    const buyerB = reqB.buyer?.name || 'zzz';
                    comparison = buyerA.localeCompare(buyerB);
                  } else {
                    // date
                    comparison = new Date(reqB.createdAt).getTime() - new Date(reqA.createdAt).getTime();
                  }
                  
                  return order === 'asc' ? -comparison : comparison;
                })`;

content = content.replace(oldSortLogic, newSortLogic);

fs.writeFileSync('src/app/dashboard/comprador/page.tsx', content, 'utf8');
console.log('Done');
