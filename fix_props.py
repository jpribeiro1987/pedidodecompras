import re

# Fix page.tsx
with open('src/app/dashboard/solicitante/nova/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

page = page.replace(
    "<RequestForm groups={groups} targetUsers={targetUsers} isComprador={user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR'} />",
    "<RequestForm user={user} groups={groups} targetUsers={targetUsers} isComprador={user.role === 'COMPRADOR' || user.role === 'AUTORIZADOR'} departments={departments} />"
)

with open('src/app/dashboard/solicitante/nova/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page)

# Fix RequestForm.tsx
with open('src/app/dashboard/solicitante/nova/RequestForm.tsx', 'r', encoding='utf-8') as f:
    form = f.read()

form = form.replace(
"""export function RequestForm({ 
  groups, 
  targetUsers, 
  isComprador 
}: { 
  groups: any[], 
  targetUsers?: any[], 
  isComprador?: boolean
}) {""",
"""export function RequestForm({ 
  user,
  groups, 
  targetUsers, 
  isComprador,
  departments = []
}: { 
  user: any,
  groups: any[], 
  targetUsers?: any[], 
  isComprador?: boolean,
  departments?: any[]
}) {""")

with open('src/app/dashboard/solicitante/nova/RequestForm.tsx', 'w', encoding='utf-8') as f:
    f.write(form)
