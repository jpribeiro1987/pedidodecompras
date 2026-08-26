'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/app/actions'
import { revalidatePath } from 'next/cache'

// ----- DEPARTMENTS -----
export async function createDepartmentAction(formData: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') return { error: 'Não autorizado' }

  const name = formData.get('name') as string
  if (!name) return { error: 'Nome é obrigatório' }

  await prisma.department.create({ data: { name } })
  revalidatePath('/dashboard/admin/setores')
}

export async function deleteDepartmentAction(formData: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') return { error: 'Não autorizado' }

  const id = formData.get('id') as string
  await prisma.department.delete({ where: { id } })
  revalidatePath('/dashboard/admin/setores')
}

// ----- USERS -----
export async function createUserAction(formData: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') return { error: 'Não autorizado' }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  const departmentId = formData.get('departmentId') as string
  const autoApproveLimitRaw = formData.get('autoApproveLimit') as string

  if (!name || !email || !password || !role) {
    return { error: 'Preencha os campos obrigatórios' }
  }

  if (role !== 'ADMIN' && !departmentId) {
    return { error: 'Setor é obrigatório para este perfil' }
  }

  let autoApproveLimit = null
  if (role === 'COMPRADOR' && autoApproveLimitRaw) {
    autoApproveLimit = parseFloat(autoApproveLimitRaw)
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password,
      role,
      departmentId: departmentId || null,
      autoApproveLimit
    }
  })

  revalidatePath('/dashboard/admin')
}

export async function updateUserAction(formData: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') return { error: 'Não autorizado' }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  const departmentId = formData.get('departmentId') as string
  const autoApproveLimitRaw = formData.get('autoApproveLimit') as string

  if (!id || !name || !email || !role) {
    return { error: 'Preencha os campos obrigatórios' }
  }

  if (role !== 'ADMIN' && !departmentId) {
    return { error: 'Setor é obrigatório para este perfil' }
  }

  let autoApproveLimit = null
  if (role === 'COMPRADOR' && autoApproveLimitRaw) {
    autoApproveLimit = parseFloat(autoApproveLimitRaw)
  }

  const updateData: any = {
    name,
    email,
    role,
    departmentId: departmentId || null,
    autoApproveLimit
  }

  if (password && password.trim() !== '') {
    updateData.password = password
  }

  await prisma.user.update({
    where: { id },
    data: updateData
  })

  revalidatePath('/dashboard/admin')
}

export async function deleteUserAction(formData: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'ADMIN') return { error: 'Não autorizado' }

  const id = formData.get('id') as string
  await prisma.user.delete({ where: { id } })
  revalidatePath('/dashboard/admin')
}

// ----- SUPPLIERS -----
export async function createSupplierAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== "ADMIN" && user.role !== "COMPRADOR")) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const cnpj = formData.get("cnpj") as string

  await prisma.supplier.create({
    data: { name, cnpj: cnpj || null, isActive: true }
  })
  revalidatePath("/dashboard/admin/fornecedores")
}

export async function toggleSupplierStatusAction(id: string, isActive: boolean, reason?: string) {
  const user = await getCurrentUser()
  if (!user || user?.role !== "ADMIN") throw new Error("Unauthorized")

  if (!isActive && !reason) throw new Error("Inactivation reason is required")

  await prisma.supplier.update({
    where: { id },
    data: { isActive, inactivationReason: isActive ? null : reason }
  })
  revalidatePath("/dashboard/admin/fornecedores")
}

// ----- GROUPS -----
export async function createGroupAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user?.role !== "ADMIN") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  await prisma.purchaseGroup.create({ data: { name } })
  revalidatePath("/dashboard/admin/grupos")
}

export async function deleteGroupAction(id: string) {
  const user = await getCurrentUser()
  if (!user || user?.role !== "ADMIN") throw new Error("Unauthorized")

  const group = await prisma.purchaseGroup.findUnique({
    where: { id },
    include: { _count: { select: { requests: true } } }
  })

  if (group?._count?.requests) {
    throw new Error("Cannot delete group with linked requests")
  }

  await prisma.purchaseGroup.delete({ where: { id } })
  revalidatePath("/dashboard/admin/grupos")
}

// ----- CONFIGS -----
export async function updateConfigAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user?.role !== "ADMIN") throw new Error("Unauthorized")

  const limit = formData.get("limit") as string
  if (!limit) throw new Error("Limit is required")

  await prisma.systemConfig.upsert({
    where: { key: "AUTO_APPROVE_LIMIT" },
    update: { value: limit },
    create: { key: "AUTO_APPROVE_LIMIT", value: limit }
  })
  revalidatePath("/dashboard/admin/configuracoes")
}

export async function updateWinnerCriteriaAction(criteria: string[]) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return { error: 'Não autorizado' }
  await prisma.systemConfig.upsert({
    where: { key: 'WINNER_CRITERIA_LIST' },
    update: { value: JSON.stringify(criteria) },
    create: { key: 'WINNER_CRITERIA_LIST', value: JSON.stringify(criteria) }
  })
  revalidatePath('/dashboard/admin/criterios')
  revalidatePath('/dashboard/comprador')
}
