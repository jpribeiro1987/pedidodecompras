const fs = require('fs');

const buttons = (role, isAutorizador = false) => `
        {request.currentStatus !== 'ENTREGUE' && request.currentStatus !== 'CANCELADA' && (
          <>
            <Link href={\`/dashboard/\${'${role}'}/pedido/\${request.id}/editar\`} className="btn" style={{ backgroundColor: '#3b82f6', color: '#fff', fontSize: '0.875rem', textDecoration: 'none', textAlign: 'center' }}>
              Editar Pedido
            </Link>
            <form action={deleteRequestAction}>
              <input type="hidden" name="id" value={request.id} />
              <ConfirmButton message="Tem certeza que deseja excluir permanentemente este pedido?" className="btn" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.875rem' }}>
                Excluir Pedido
              </ConfirmButton>
            </form>
          </>
        )}
`

function addButtons(file, role) {
    let c = fs.readFileSync(file, 'utf8');
    
    // Add import ConfirmButton and deleteRequestAction if missing
    if (!c.includes('ConfirmButton')) {
        c = c.replace(
            "import Link from 'next/link'",
            "import Link from 'next/link'\nimport { ConfirmButton } from '@/components/ConfirmButton'\nimport { deleteRequestAction } from '@/app/actions'"
        );
        
        // Sometimes link is not imported right next to it, let's just put it near the top
        if (!c.includes('ConfirmButton')) {
            c = c.replace(
                "import { redirect } from 'next/navigation'",
                "import { redirect } from 'next/navigation'\nimport { ConfirmButton } from '@/components/ConfirmButton'\nimport { deleteRequestAction } from '@/app/actions'"
            );
        }
    }

    // Insert the buttons in the action bar. The action bar usually has `display: 'flex', gap: '1rem', flexWrap: 'wrap'`
    // Let's insert after `<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>`
    // or `<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>`
    
    // Actually, we can just insert before the `span` showing the status
    c = c.replace(
        /(<span style={{[^>]+>\s*\{request\.currentStatus\}\s*<\/span>)/,
        buttons(role) + "\n        $1"
    );
    
    fs.writeFileSync(file, c);
}

addButtons('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'comprador');
addButtons('src/app/dashboard/autorizador/pedido/[id]/page.tsx', 'autorizador');
