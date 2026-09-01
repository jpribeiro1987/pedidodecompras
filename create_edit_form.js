const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/solicitante/nova/RequestForm.tsx', 'utf8');

content = content.replace('export function RequestForm', 'export function EditRequestForm');
content = content.replace('createRequestAction', 'updateRequestAction');
content = content.replace('Criar Solicitação', 'Salvar Alterações');

content = content.replace("import { createRequestAction } from '@/app/actions'", "import { updateRequestAction } from '@/app/actions'");

content = content.replace(
    "groups: { id: string, name: string }[]",
    "groups: { id: string, name: string }[]\n  request: any"
);

content = content.replace(
    "{ user, departments, targetUsers, groups }:",
    "{ user, departments, targetUsers, groups, request }:"
);

content = content.replace(
    "const [justification, setJustification] = useState('')",
    "const [justification, setJustification] = useState(request.justification || '')"
);

content = content.replace(
    "const [items, setItems] = useState<RequestItem[]>([{",
    "const [items, setItems] = useState<RequestItem[]>(request.items && request.items.length > 0 ? request.items.map((i: any) => ({ ...i, quantity: String(i.quantity) })) : [{"
);

content = content.replace(
    "{errorMsg && (",
    "<input type=\"hidden\" name=\"id\" value={request.id} />\n      {errorMsg && ("
);

// default department ID
content = content.replace(
    "defaultValue={user.departmentId || ''}",
    "defaultValue={request.departmentId || user.departmentId || ''}"
);

fs.writeFileSync('src/components/EditRequestForm.tsx', content);
console.log('Created EditRequestForm.tsx');
