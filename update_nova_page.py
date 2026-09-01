with open('src/app/dashboard/solicitante/nova/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_dept = "const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } })"

new_dept = """let departments: any[] = []
  if (user.role === 'ADMIN' || user.role === 'AUTORIZADOR' || user.role === 'COMPRADOR') {
    departments = await prisma.department.findMany({ orderBy: { name: 'asc' } })
  } else {
    // Solicitante vê apenas seus próprios setores
    if (user.department) departments.push(user.department)
    if (user.additionalDepartments) {
      user.additionalDepartments.forEach((d: any) => {
        if (!departments.find((existing: any) => existing.id === d.id)) {
          departments.push(d)
        }
      })
    }
    departments.sort((a, b) => a.name.localeCompare(b.name))
  }"""

content = content.replace(old_dept, new_dept)

with open('src/app/dashboard/solicitante/nova/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
