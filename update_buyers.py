import os

files = [
    'src/app/dashboard/comprador/page.tsx',
    'src/app/dashboard/comprador/lote/[batchId]/page.tsx',
    'src/app/dashboard/comprador/pedido/[id]/page.tsx'
]

for p in files:
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        "where: { role: 'COMPRADOR' }",
        "where: { role: { in: ['COMPRADOR', 'AUTORIZADOR', 'ADMIN'] } }"
    )
    
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
