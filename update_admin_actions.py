import re

with open('src/app/adminActions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Update createUserAction
create_old = """  const departmentId = formData.get('departmentId') as string
  const autoApproveLimitRaw = formData.get('autoApproveLimit') as string"""

create_new = """  const departmentId = formData.get('departmentId') as string
  const additionalDepartments = formData.getAll('additionalDepartments') as string[]
  const autoApproveLimitRaw = formData.get('autoApproveLimit') as string"""

content = content.replace(create_old, create_new)

create_data_old = """    data: {
      name,
      email,
      password,
      role,
      departmentId: departmentId || null,
      autoApproveLimit
    }"""

create_data_new = """    data: {
      name,
      email,
      password,
      role,
      departmentId: departmentId || null,
      additionalDepartments: {
        connect: additionalDepartments.filter(id => id !== '').map(id => ({ id }))
      },
      autoApproveLimit
    }"""

content = content.replace(create_data_old, create_data_new)

# Update updateUserAction
update_old = """  const departmentId = formData.get('departmentId') as string
  const autoApproveLimitRaw = formData.get('autoApproveLimit') as string"""

update_new = """  const departmentId = formData.get('departmentId') as string
  const additionalDepartments = formData.getAll('additionalDepartments') as string[]
  const autoApproveLimitRaw = formData.get('autoApproveLimit') as string"""

content = content.replace(update_old, update_new)

update_data_old = """  const updateData: any = {
    name,
    email,
    role,
    departmentId: departmentId || null,
    autoApproveLimit
  }"""

update_data_new = """  const updateData: any = {
    name,
    email,
    role,
    departmentId: departmentId || null,
    additionalDepartments: {
      set: additionalDepartments.filter(id => id !== '').map(id => ({ id }))
    },
    autoApproveLimit
  }"""

content = content.replace(update_data_old, update_data_new)

with open('src/app/adminActions.ts', 'w', encoding='utf-8') as f:
    f.write(content)
