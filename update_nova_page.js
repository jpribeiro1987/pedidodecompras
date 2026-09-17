const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/solicitante/nova/page.tsx', 'utf8');

// Load all users
const loadTarget = "const backLink = (user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') ? '/dashboard/comprador' : '/dashboard/solicitante'";
const loadReplace = "const allUsers = await prisma.user.findMany({ select: { id: true, name: true, department: true }, orderBy: { name: 'asc' } })\n\n  const backLink = (user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') ? '/dashboard/comprador' : '/dashboard/solicitante'";
content = content.replace(loadTarget, loadReplace);

// Pass to RequestForm
const formTarget = "<RequestForm user={user} groups={groups} targetUsers={targetUsers} isComprador={user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR'} departments={departments} />";
const formReplace = "<RequestForm user={user} groups={groups} targetUsers={targetUsers} allUsers={allUsers} isComprador={user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR'} departments={departments} />";
content = content.replace(formTarget, formReplace);

fs.writeFileSync('src/app/dashboard/solicitante/nova/page.tsx', content);