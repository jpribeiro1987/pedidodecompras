const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'utf8');

// Import PrintButton
content = content.replace("import ManageObservers from '@/components/ManageObservers'", "import ManageObservers from '@/components/ManageObservers'\nimport { PrintButton } from '@/components/PrintButton'");

// Add PrintButton next to Excluir Pedido
const actionsStr = "<ConfirmButton \n            action={deleteRequestAction} \n            requestId={request.id} \n            confirmMessage=\"Tem certeza que deseja excluir esta solicitação?\" \n            buttonText=\"Excluir Pedido\" \n            buttonStyle={{ backgroundColor: '#ef4444', color: 'white' }}\n          />\n        </div>";

const newActionsStr = "<ConfirmButton \n            action={deleteRequestAction} \n            requestId={request.id} \n            confirmMessage=\"Tem certeza que deseja excluir esta solicitação?\" \n            buttonText=\"Excluir Pedido\" \n            buttonStyle={{ backgroundColor: '#ef4444', color: 'white' }}\n          />\n          <PrintButton />\n        </div>";
content = content.replace(actionsStr, newActionsStr);

// Rename Solicitante to Setor Solicitante
content = content.replace("color: '#64748b', fontWeight: 500 }}>Solicitante</p>", "color: '#64748b', fontWeight: 500 }}>Setor Solicitante</p>");

fs.writeFileSync('src/app/dashboard/comprador/pedido/[id]/page.tsx', content);