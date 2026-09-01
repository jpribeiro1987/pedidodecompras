import os

with open('src/app/dashboard/solicitante/pedido/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
if "deleteRequestAction" not in content:
    content = content.replace("import { getCurrentUser } from '@/app/actions'", "import { getCurrentUser, deleteRequestAction, markAsDeliveredAction, archiveRequestAction } from '@/app/actions'")

# Add buttons
buttons_html = """
        {request.currentStatus === 'CRIADA' && (
          <form action={deleteRequestAction}>
            <input type="hidden" name="id" value={request.id} />
            <button type="submit" className="btn" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.875rem' }} onClick={(e) => { if(!confirm('Tem certeza que deseja excluir permanentemente este pedido?')) e.preventDefault() }}>
              Excluir Pedido
            </button>
          </form>
        )}
        
        {request.currentStatus === 'APROVADA' && (
          <form action={markAsDeliveredAction}>
            <input type="hidden" name="id" value={request.id} />
            <button type="submit" className="btn" style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.875rem' }} onClick={(e) => { if(!confirm('Confirmar retirada desta mercadoria?')) e.preventDefault() }}>
              Confirmar Retirada
            </button>
          </form>
        )}

        {request.currentStatus === 'ENTREGUE' && (
          <form action={archiveRequestAction}>
            <input type="hidden" name="id" value={request.id} />
            <button type="submit" className="btn" style={{ backgroundColor: '#64748b', color: '#fff', fontSize: '0.875rem' }} onClick={(e) => { if(!confirm('Deseja ocultar este pedido de sua lista principal?')) e.preventDefault() }}>
              Ocultar (Arquivar)
            </button>
          </form>
        )}
"""

if "deleteRequestAction" not in content.split("Detalhes da Solicita"):
    # Insert before <span style={{ marginLeft: 'auto'
    idx = content.find("<span style={{ \n          marginLeft: 'auto',")
    if idx == -1:
        idx = content.find("<span style={{ \n          marginLeft: 'auto'")
    if idx != -1:
        content = content[:idx] + buttons_html + '\n        ' + content[idx:]

with open('src/app/dashboard/solicitante/pedido/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
