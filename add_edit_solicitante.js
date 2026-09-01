const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/solicitante/pedido/[id]/page.tsx', 'utf8');

c = c.replace(
    /(request\.currentStatus === 'CRIADA' && \(\s*)<form/,
    "$1<>\n          <Link href={`/dashboard/solicitante/pedido/${request.id}/editar`} className=\"btn\" style={{ backgroundColor: '#3b82f6', color: '#fff', fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center' }}>Editar Pedido</Link>\n          <form"
);

c = c.replace(
    /<\/ConfirmButton>\s*<\/form>\s*\)/,
    "</ConfirmButton>\n          </form>\n          </>\n        )"
);

fs.writeFileSync('src/app/dashboard/solicitante/pedido/[id]/page.tsx', c);
