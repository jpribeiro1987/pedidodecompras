const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/solicitante/pedido/[id]/page.tsx', 'utf8');

const target = `        {request.currentStatus !== 'ENTREGUE' && request.currentStatus !== 'CANCELADA' && (
          <form action={deleteRequestAction}>`;

const replacement = `        {(request.currentStatus === 'CRIADA' || request.currentStatus === 'DEVOLVIDA_AJUSTES') && (
          <Link href={\`/dashboard/solicitante/pedido/\${request.id}/editar\`} className="btn" style={{ backgroundColor: '#3b82f6', color: '#fff', fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center' }}>
            Editar Pedido
          </Link>
        )}
        {request.currentStatus !== 'ENTREGUE' && request.currentStatus !== 'CANCELADA' && (
          <form action={deleteRequestAction}>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/app/dashboard/solicitante/pedido/[id]/page.tsx', content, 'utf8');
console.log('Added Edit button to Solicitante');
