const fs = require('fs');
let content = fs.readFileSync('src/app/api/requests/[id]/route.ts', 'utf8');

const target = `    const user = await getCurrentUser()
    if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const request = await prisma.purchaseRequest.findUnique({ where: { id } })
    if (!request) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }`;

const newCode = `    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const request = await prisma.purchaseRequest.findUnique({ where: { id } })
    if (!request) {
      return NextResponse.json({ error: 'Pedido nao encontrado' }, { status: 404 })
    }

    if (user.role === 'SOLICITANTE') {
      if (request.requesterId !== user.id) {
        return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })
      }
      if (request.currentStatus !== 'CRIADA' && request.currentStatus !== 'DEVOLVIDA_AJUSTES') {
        return NextResponse.json({ error: 'Somente pedidos Novos ou Devolvidos podem ser editados pelo solicitante.' }, { status: 400 })
      }
    } else if (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })
    }`;

content = content.replace(target, newCode);

// Also need to automatically change status back to CRIADA if it was DEVOLVIDA_AJUSTES
const targetUpdate = `    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: {`;

const newUpdate = `    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        ...(user.role === 'SOLICITANTE' && request.currentStatus === 'DEVOLVIDA_AJUSTES' ? { currentStatus: 'CRIADA' } : {}),`;

content = content.replace(targetUpdate, newUpdate);

fs.writeFileSync('src/app/api/requests/[id]/route.ts', content, 'utf8');
console.log('Fixed API route for solicitante edit');
