const fs = require('fs');
['src/app/dashboard/solicitante/pedido/[id]/page.tsx', 'src/app/dashboard/autorizador/pedido/[id]/page.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Import PrintButton
  if (content.includes('ManageObservers')) {
    content = content.replace("import ManageObservers from '@/components/ManageObservers'", "import ManageObservers from '@/components/ManageObservers'\nimport { PrintButton } from '@/components/PrintButton'");
  } else {
    content = content.replace("import { notFound, redirect } from 'next/navigation'", "import { notFound, redirect } from 'next/navigation'\nimport { PrintButton } from '@/components/PrintButton'");
  }

  // Add PrintButton
  if (content.includes('Excluir Pedido')) {
    const actionsStr = "<ConfirmButton \n            action={deleteRequestAction} \n            requestId={request.id} \n            confirmMessage=\"Tem certeza que deseja excluir esta solicitação?\" \n            buttonText=\"Excluir Pedido\" \n            buttonStyle={{ backgroundColor: '#ef4444', color: 'white' }}\n          />\n        </div>";
    const newActionsStr = "<ConfirmButton \n            action={deleteRequestAction} \n            requestId={request.id} \n            confirmMessage=\"Tem certeza que deseja excluir esta solicitação?\" \n            buttonText=\"Excluir Pedido\" \n            buttonStyle={{ backgroundColor: '#ef4444', color: 'white' }}\n          />\n          <PrintButton />\n        </div>";
    content = content.replace(actionsStr, newActionsStr);
  } else {
    const titleStr = "<h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Análise de Solicitação</h1>\n        </div>";
    const newTitleStr = "<h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Análise de Solicitação</h1>\n          <PrintButton />\n        </div>";
    content = content.replace(titleStr, newTitleStr);
  }

  content = content.replace("color: '#64748b', fontWeight: 500 }}>Solicitante</p>", "color: '#64748b', fontWeight: 500 }}>Setor Solicitante</p>");
  
  // For solicitante: DEVOLVIDA_AJUSTES reason
  if (file.includes('solicitante')) {
    const findStr = "<h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem'";
    const replaceStr = `{request.currentStatus === 'DEVOLVIDA_AJUSTES' && (
                  <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #f87171', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontWeight: 600, color: '#b91c1c', marginBottom: '0.5rem' }}>Atenção: Solicitação Devolvida para Ajustes</h4>
                    <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                      <strong>Motivo / Decisão:</strong> {request.history.find(h => h.newStatus === 'DEVOLVIDA_AJUSTES')?.observation || 'Não informado.'}
                    </p>
                  </div>
                )}
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem'`;
    content = content.replace(findStr, replaceStr);
  }

  fs.writeFileSync(file, content);
});