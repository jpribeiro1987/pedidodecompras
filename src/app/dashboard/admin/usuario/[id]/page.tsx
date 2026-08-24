import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import { EditUserForm } from './EditUserForm'
import { redirect } from 'next/navigation'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') redirect('/dashboard')

  const resolvedParams = await params
  
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!user) {
    redirect('/dashboard/admin')
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Editar Usuário</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <EditUserForm user={user} departments={departments} />
      </div>
    </div>
  )
}
