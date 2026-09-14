const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'utf8');

const target = `            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Solicitante</p>
                <p style={{ fontWeight: 500 }}>{request.requester.name} ({request.requester.department?.name})</p>
              </div>`;

const replacement = `            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Solicitante</p>
                <p style={{ fontWeight: 500 }}>{request.requester.name} ({request.requester.department?.name})</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Data da Solicitação</p>
                <p>{new Date(request.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
              </div>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/app/dashboard/comprador/pedido/[id]/page.tsx', content, 'utf8');
    console.log('Added date to details page');
} else {
    console.log('Target not found in page.tsx');
}
