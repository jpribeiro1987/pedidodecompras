import os

files = [
    'src/app/dashboard/solicitante/page.tsx',
    'src/app/dashboard/comprador/page.tsx',
    'src/app/dashboard/autorizador/page.tsx',
    'src/app/dashboard/historico/page.tsx',
    'src/app/dashboard/relatorios/page.tsx'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import
    if 'formatRequestItems' not in content:
        content = "import { formatRequestItems } from '@/lib/utils'\n" + content
    
    # Simple replacement of specific includes
    content = content.replace("include: { requester: true, group: true }", "include: { requester: true, group: true, items: true }")
    content = content.replace("include: { requester: true, group: true, quotes: true }", "include: { requester: true, group: true, items: true, quotes: true }")
    content = content.replace("include: { requester: true, group: true, quotes: { include: { supplier: true } } }", "include: { requester: true, group: true, items: true, quotes: { include: { supplier: true } } }")
    
    # Replace req.description display
    content = content.replace('{req.description}', '{formatRequestItems(req)}')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
