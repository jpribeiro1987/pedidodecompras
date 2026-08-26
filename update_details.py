import os

files = [
    'src/app/dashboard/solicitante/pedido/[id]/page.tsx',
    'src/app/dashboard/comprador/pedido/[id]/page.tsx',
    'src/app/dashboard/autorizador/pedido/[id]/page.tsx'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import
    if 'RequestItemsDisplay' not in content:
        content = "import { RequestItemsDisplay } from '@/components/RequestItemsDisplay'\n" + content
    
    # Also need to make sure prisma.purchaseRequest.findUnique includes items
    content = content.replace("include: { requester: true, group: true, history: { include: { user: true }, orderBy: { date: 'desc' } }, comments: { include: { user: true }, orderBy: { date: 'desc' } }, attachments: true, quotes: { include: { supplier: true } } }", 
    "include: { requester: true, group: true, items: true, history: { include: { user: true }, orderBy: { date: 'desc' } }, comments: { include: { user: true }, orderBy: { date: 'desc' } }, attachments: true, quotes: { include: { supplier: true } } }")
    
    content = content.replace("include: { requester: true, group: true, history: { include: { user: true }, orderBy: { date: 'desc' } }, comments: { include: { user: true }, orderBy: { date: 'desc' } }, attachments: true }",
    "include: { requester: true, group: true, items: true, history: { include: { user: true }, orderBy: { date: 'desc' } }, comments: { include: { user: true }, orderBy: { date: 'desc' } }, attachments: true }")

    html_old = """<div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Item</div>
              <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{request.description}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Quantidade</div>
                <div style={{ fontWeight: 500 }}>{request.quantity}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Link</div>
                <div style={{ fontWeight: 500 }}>
                  {request.link ? <a href={request.link} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>Acessar Link</a> : '-'}
                </div>
              </div>
            </div>"""
            
    content = content.replace(html_old, '<RequestItemsDisplay request={request} />')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
