import re

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's remove the first version entirely
v1_pattern = r"export async function archiveRequestAction\(formData: FormData\) \{\n  const user = await getCurrentUser\(\)\n  if \(\!user \|\| user\.role \!\=\= 'SOLICITANTE'\) return \{ error: 'Não autorizado' \}\n\n  const id = formData\.get\('id'\) as string\n  if \(\!id\) return \{ error: 'ID inválido' \}\n\n  await prisma\.purchaseRequest\.update\(\{\n    where: \{ id, requesterId: user\.id \},\n    data: \{ currentStatus: 'ARQUIVADA' \}\n  \}\)\n  \n  revalidatePath\('/dashboard/solicitante'\)\n\}"

content = re.sub(v1_pattern, "", content)
# It might fail due to utf-8 encoding of 'Não autorizado' in regex, let's use a simpler string replace.

