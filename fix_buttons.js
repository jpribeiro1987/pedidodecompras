const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/solicitante/pedido/[id]/page.tsx', 'utf8');

// Ensure import exists
if (!content.includes('ConfirmButton')) {
    content = content.replace(
        "import { AttachmentViewer } from '@/components/AttachmentViewer'",
        "import { AttachmentViewer } from '@/components/AttachmentViewer'\nimport { ConfirmButton } from '@/components/ConfirmButton'"
    );
}

// Replace exact strings
content = content.replace(
    "<button type=\"submit\" className=\"btn\" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.875rem' }} onClick={(e) => { if(!confirm('Tem certeza que deseja excluir permanentemente este pedido?')) e.preventDefault() }}>",
    "<ConfirmButton message=\"Tem certeza que deseja excluir permanentemente este pedido?\" className=\"btn\" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.875rem' }}>"
).replace(
    "<button type=\"submit\" className=\"btn\" style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.875rem' }} onClick={(e) => { if(!confirm('Confirmar retirada desta mercadoria?')) e.preventDefault() }}>",
    "<ConfirmButton message=\"Confirmar retirada desta mercadoria?\" className=\"btn\" style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.875rem' }}>"
).replace(
    "<button type=\"submit\" className=\"btn\" style={{ backgroundColor: '#64748b', color: '#fff', fontSize: '0.875rem' }} onClick={(e) => { if(!confirm('Deseja ocultar este pedido de sua lista principal?')) e.preventDefault() }}>",
    "<ConfirmButton message=\"Deseja ocultar este pedido de sua lista principal?\" className=\"btn\" style={{ backgroundColor: '#64748b', color: '#fff', fontSize: '0.875rem' }}>"
);

// We need to also replace the closing tags for these buttons.
// Wait, the regex is easier and safer. Let's do regex for the whole element.
content = content.replace(
    /<button type="submit" className="btn" style={{ backgroundColor: '([^']+)', color: '([^']+)', fontSize: '([^']+)' }} onClick={\(e\) => { if\(!confirm\('([^']+)'\)\) e\.preventDefault\(\) }}>\s*(.*?)\s*<\/button>/g,
    '<ConfirmButton message="$4" className="btn" style={{ backgroundColor: \'$1\', color: \'$2\', fontSize: \'$3\' }}>\n              $5\n            </ConfirmButton>'
);

fs.writeFileSync('src/app/dashboard/solicitante/pedido/[id]/page.tsx', content);
