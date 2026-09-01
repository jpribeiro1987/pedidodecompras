import os

files = [
    'src/app/dashboard/comprador/pedido/[id]/page.tsx',
    'src/app/dashboard/autorizador/pedido/[id]/page.tsx',
    'src/app/dashboard/solicitante/pedido/[id]/page.tsx'
]

for p in files:
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content.replace(
            "style={{ color: 'var(--primary)', textDecoration: 'underline' }}",
            "style={{ color: 'var(--primary)', textDecoration: 'underline', wordBreak: 'break-all' }}"
        )
        # Handle cases where we have reqItem.link in batch view
        new_content = new_content.replace(
            "style={{ color: 'var(--primary)' }}>Acessar</a>",
            "style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>Acessar</a>"
        )
        
        with open(p, 'w', encoding='utf-8') as f:
            f.write(new_content)
