import os

with open('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add markAsDeliveredAction import
if "markAsDeliveredAction" not in content:
    content = content.replace("import { deleteRequestAction } from '@/app/actions'", "import { deleteRequestAction, markAsDeliveredAction } from '@/app/actions'")

# Add button
buttons_html = """
        {req.currentStatus === 'APROVADA' && (
          <form action={markAsDeliveredAction} style={{ display: 'inline-block' }}>
            <input type="hidden" name="id" value={req.id} />
            <button type="submit" className="btn" style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.875rem', padding: '0.5rem 1rem' }} onClick={(e) => { if(!confirm('Confirmar entrega/retirada desta mercadoria?')) e.preventDefault() }}>
              Confirmar Retirada
            </button>
          </form>
        )}
"""

if "markAsDeliveredAction" not in content.split("Excluir Pedido"):
    idx = content.find("</form>\n          )}")
    if idx != -1:
        idx += len("</form>\n          )}")
        content = content[:idx] + buttons_html + content[idx:]
        
with open('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
