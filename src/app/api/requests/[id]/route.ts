import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const request = await prisma.purchaseRequest.findUnique({ where: { id } })
    if (!request) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (user.role === 'SOLICITANTE' && (request.requesterId !== user.id || !['CRIADA', 'DEVOLVIDA_AJUSTES'].includes(request.currentStatus))) {
      return NextResponse.json({ error: 'Você só pode editar seus próprios pedidos e que estejam com status Novos ou Devolvidos.' }, { status: 403 })
    }

    if (request.currentStatus === 'ENTREGUE' || request.currentStatus === 'CANCELADA') {
      return NextResponse.json({ error: 'Não é possível editar pedidos finalizados' }, { status: 400 })
    }

    // Update items
    await prisma.purchaseItem.deleteMany({ where: { requestId: id } })

    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        ...(request.currentStatus === 'DEVOLVIDA_AJUSTES' ? { currentStatus: 'CRIADA' } : {}),
        justification: body.justification,
        departmentId: body.departmentId || undefined,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
        priority: body.items[0]?.priority || 'BAIXA',
        classification: body.items[0]?.classification || 'Consumo',
        groupId: body.items[0]?.groupId || null,
        description: body.items[0]?.description || null,
        quantity: body.items[0]?.quantity ? parseInt(body.items[0].quantity) : null,
        link: body.items[0]?.link || null,
        items: {
          create: body.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity ? parseInt(item.quantity) : 1,
            link: item.link || null,
            imageUrl: item.imageUrl || null
          }))
        }
      }
    })

    await prisma.statusHistory.create({
      data: {
        newStatus: request.currentStatus === 'DEVOLVIDA_AJUSTES' ? 'CRIADA' : request.currentStatus,
        observation: request.currentStatus === 'DEVOLVIDA_AJUSTES' 
          ? 'Pedido corrigido pelo Solicitante e devolvido para a Fila de Compras' 
          : 'Pedido editado pelo ' + (user.role === 'SOLICITANTE' ? 'Solicitante' : user.role === 'COMPRADOR' ? 'Comprador' : 'Diretor'),
        requestId: id,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true, request: updated })
  } catch (error: any) {
    console.error('API EDIT ERROR:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
