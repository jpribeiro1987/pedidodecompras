import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const request = await prisma.purchaseRequest.findUnique({ where: { id } })
    if (!request) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (request.currentStatus === 'ENTREGUE' || request.currentStatus === 'CANCELADA') {
      return NextResponse.json({ error: 'No  possvel editar pedidos finalizados' }, { status: 400 })
    }

    // Update items
    await prisma.purchaseItem.deleteMany({ where: { requestId: id } })

    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: {
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
        newStatus: request.currentStatus,
        observation: 'Pedido editado pela ' + (user.role === 'COMPRADOR' ? 'Compras' : 'Diretoria'),
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
