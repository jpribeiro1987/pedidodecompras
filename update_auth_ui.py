import re

with open('src/app/dashboard/autorizador/pedido/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if 'deleteRequestAction' not in content:
    content = content.replace('import { updateRequestStatusAction', 'import { deleteRequestAction, updateRequestStatusAction')
    
    delete_form_auth = """          <form action={deleteRequestAction} style={{ display: 'inline-block' }}>
            <input type="hidden" name="id" value={req.id} />
            <button type="submit" className="btn" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.875rem', padding: '0.5rem 1rem' }} onClick={(e) => { if(!confirm('Tem certeza que deseja excluir permanentemente este pedido?')) e.preventDefault() }}>
              Excluir Pedido
            </button>
          </form>
        </div>
      </div>"""
      
    content = content.replace('</div>\n      </div>\n\n      <div style={{ display: \'grid\', gap: \'1.5rem\', gridTemplateColumns: \'2fr 1fr\' }}>', delete_form_auth + '\n\n      <div style={{ display: \'grid\', gap: \'1.5rem\', gridTemplateColumns: \'2fr 1fr\' }}>')
    
    with open('src/app/dashboard/autorizador/pedido/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
