import { getCurrentUser } from '@/app/actions'
import { prisma } from '@/lib/prisma'
import { RequestForm } from './RequestForm'
import Link from 'next/link'

export default async function NovaSolicitacaoPage() {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'SOLICITANTE' && user.role !== 'COMPRADOR' && user.role !== 'AUTORIZADOR')) return null
  
  const groups = await prisma.purchaseGroup.findMany({ orderBy: { name: 'asc' } })
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } })
  
  let targetUsers: any[] = []
  if (user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') {
    targetUsers = await prisma.user.findMany({ 
      where: { role: 'SOLICITANTE' },
      include: { department: true },
      orderBy: { name: 'asc' }
    })
  }

  const backLink = (user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR') ? '/dashboard/comprador' : '/dashboard/solicitante'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link href={backLink} className="btn" style={{ backgroundColor: '#e2e8f0', color: '#1e293b' }}>
          &larr; Voltar
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Nova Solicitação de Compra</h1>
      </div>

      <RequestForm user={user} groups={groups} targetUsers={targetUsers} isComprador={user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR'} departments={departments} />
    </div>
  )
}
