import sys

with open('src/app/dashboard/autorizador/pedido/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Avaliação de Solicitação</h1>
      </div>'''

replacement = '''        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Avaliação de Solicitação</h1>
        {request.currentStatus !== 'ENTREGUE' && request.currentStatus !== 'CANCELADA' && (
          <Link href={`/dashboard/autorizador/pedido/${request.id}/editar`} className="btn" style={{ backgroundColor: '#3b82f6', color: '#fff', fontSize: '0.875rem', textDecoration: 'none', marginLeft: 'auto' }}>
            Editar Pedido
          </Link>
        )}
      </div>'''

if target in content:
    content = content.replace(target, replacement)
    with open('src/app/dashboard/autorizador/pedido/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replaced')
else:
    print('Target not found')
