import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import { redirect } from 'next/navigation'
import CriteriosClient from './CriteriosClient'

export default async function AdminCriteriosPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const config = await prisma.systemConfig.findUnique({
    where: { key: 'WINNER_CRITERIA_LIST' }
  })
  
  // Default list if not configured
  const defaultCriteria = ['Menor Preço', 'Melhor Qualidade', 'Prazo de Entrega / Urgência', 'Fornecedor Exclusivo']
  
  let initialList = defaultCriteria
  if (config) {
    try {
      initialList = JSON.parse(config.value)
    } catch(e) {}
  }

  return <CriteriosClient initialList={initialList} />
}
