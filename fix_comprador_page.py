with open('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_query = """    include: {
      requester: { include: { department: true } },
      attachments: true,
      history: {
        include: { user: true },
        orderBy: { date: 'desc' }
      }
    }"""

new_query = """    include: {
      requester: { include: { department: true } },
      attachments: true,
      items: true,
      quotes: true,
      history: {
        include: { user: true },
        orderBy: { date: 'desc' }
      }
    }"""

content = content.replace(old_query, new_query)

old_desc = """              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Descrição Principal</p>
                <p style={{ fontWeight: 500 }}>
                  {request.items && request.items.length > 0 ? request.items[0].description : request.description} 
                  (Qtd: {request.items && request.items.length > 0 ? request.items[0].quantity : request.quantity})
                </p>
              </div>"""

new_desc = """              <div style={{ gridColumn: '1 / -1' }}>
                <RequestItemsDisplay request={request} />
              </div>"""

content = content.replace(old_desc, new_desc)

with open('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
