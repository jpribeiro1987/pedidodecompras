const fs = require('fs');
let content = fs.readFileSync('src/app/actions.ts', 'utf8');

// Find deleteRequestAction
const searchStr = "Voc\u00ea s\u00f3 pode excluir seus pr\u00f3prios pedidos e que";
const idx = content.indexOf(searchStr);

if (idx > -1 && !content.includes("Não é possível excluir pedidos finalizados")) {
    const endBrace = content.indexOf('}', idx);
    const newContent = content.slice(0, endBrace + 1) + 
      "\n  if ((user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') && (request.currentStatus === 'ENTREGUE' || request.currentStatus === 'CANCELADA')) {\n    return { error: 'Não é possível excluir pedidos finalizados.' }\n  }" +
      content.slice(endBrace + 1);
    
    fs.writeFileSync('src/app/actions.ts', newContent);
    console.log("Updated actions.ts");
} else {
    console.log("Could not find string or already updated");
}
