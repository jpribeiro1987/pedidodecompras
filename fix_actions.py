import os

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('redirect(/dashboard//pedido/)', 'redirect(`/dashboard/${user.role.toLowerCase()}/pedido/${newRequest.id}`)')
content = content.replace("}'use server'", "}\n\n'use server'")

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(content)
