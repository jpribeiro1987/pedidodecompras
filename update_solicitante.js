const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/solicitante/pedido/[id]/page.tsx', 'utf8');

content = content.replace("import { ConfirmButton } from '@/components/ConfirmButton'", "import { ConfirmButton } from '@/components/ConfirmButton'\nimport ManageObservers from '@/components/ManageObservers'");

content = content.replace('const user = await getCurrentUser()', "const user = await getCurrentUser()\n    const allUsers = await prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } })");

content = content.replace("      history: {\n        include: { user: true },\n        orderBy: { date: 'desc' }\n      }", "      history: {\n        include: { user: true },\n        orderBy: { date: 'desc' }\n      },\n      observers: true");

content = content.replace('<div className="card">\n          <h2', '<div className="card">\n          <ManageObservers requestId={request.id} observers={request.observers} allUsers={allUsers} />\n          <br />\n          <h2');

fs.writeFileSync('src/app/dashboard/solicitante/pedido/[id]/page.tsx', content);