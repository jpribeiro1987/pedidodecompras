import re

# 1. Update /dashboard/solicitante/nova/page.tsx
with open('src/app/dashboard/solicitante/nova/page.tsx', 'r', encoding='utf-8') as f:
    nova_content = f.read()

# Add get departments
if 'const departments =' not in nova_content:
    nova_content = nova_content.replace(
        'const groups = await prisma.purchaseGroup.findMany({ orderBy: { name: \'asc\' } })',
        'const groups = await prisma.purchaseGroup.findMany({ orderBy: { name: \'asc\' } })\n  const departments = await prisma.department.findMany({ orderBy: { name: \'asc\' } })'
    )

    # Pass departments to RequestForm
    nova_content = nova_content.replace(
        '<RequestForm user={user} groups={groups} />',
        '<RequestForm user={user} groups={groups} departments={departments} />'
    )
    with open('src/app/dashboard/solicitante/nova/page.tsx', 'w', encoding='utf-8') as f:
        f.write(nova_content)

# 2. Update RequestForm.tsx
with open('src/app/dashboard/solicitante/nova/RequestForm.tsx', 'r', encoding='utf-8') as f:
    form_content = f.read()

if 'departments?: any[]' not in form_content:
    form_content = form_content.replace(
        'export function RequestForm({ user, groups = [] }: { user: any, groups?: any[] }) {',
        'export function RequestForm({ user, groups = [], departments = [] }: { user: any, groups?: any[], departments?: any[] }) {'
    )
    
    # Add Select for Setor before Justificativa
    setor_select = """      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="departmentId">Setor Solicitante (Opcional - Padrão: Seu Setor)</label>
        <select id="departmentId" name="departmentId" className="input-field" defaultValue={user.departmentId || ''}>
          <option value="">Selecione um setor...</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>"""
    
    form_content = form_content.replace('<div style={{ marginBottom: \'1.5rem\' }}>\n        <label htmlFor="justification">', setor_select + '\n        <label htmlFor="justification">')

    with open('src/app/dashboard/solicitante/nova/RequestForm.tsx', 'w', encoding='utf-8') as f:
        f.write(form_content)

# 3. Add Delete Button to solicitante/pedido/[id]/page.tsx
with open('src/app/dashboard/solicitante/pedido/[id]/page.tsx', 'r', encoding='utf-8') as f:
    sol_content = f.read()

if 'deleteRequestAction' not in sol_content:
    sol_content = sol_content.replace('import { cancelRequestAction } from \'@/app/actions\'', 'import { cancelRequestAction, deleteRequestAction } from \'@/app/actions\'')
    
    delete_form = """          {req.currentStatus === 'CRIADA' && (
            <form action={deleteRequestAction} style={{ display: 'inline-block' }}>
              <input type="hidden" name="id" value={req.id} />
              <button type="submit" className="btn" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.875rem' }} onClick={(e) => { if(!confirm('Tem certeza que deseja excluir permanentemente este pedido?')) e.preventDefault() }}>
                Excluir Pedido
              </button>
            </form>
          )}"""
    
    sol_content = sol_content.replace('{/* TODO: Permitir edio/cancelamento se estiver CRIADA */}', delete_form)
    # Also replace potential utf-8 messed up characters if it was 'edição'
    sol_content = re.sub(r'\{/\* TODO: Permitir edi.*?o/cancelamento se estiver CRIADA \*/\}', delete_form, sol_content)

    with open('src/app/dashboard/solicitante/pedido/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(sol_content)

# 4. Add Delete Button to comprador/pedido/[id]/page.tsx
with open('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'r', encoding='utf-8') as f:
    comp_content = f.read()

if 'deleteRequestAction' not in comp_content:
    comp_content = comp_content.replace('import { getRequestById } from \'@/lib/prisma\'', 'import { getRequestById } from \'@/lib/prisma\'\nimport { deleteRequestAction } from \'@/app/actions\'')
    
    delete_form_comp = """          {req.currentStatus === 'CRIADA' && (
            <form action={deleteRequestAction} style={{ display: 'inline-block' }}>
              <input type="hidden" name="id" value={req.id} />
              <button type="submit" className="btn" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.875rem', padding: '0.5rem 1rem' }} onClick={(e) => { if(!confirm('Tem certeza que deseja excluir permanentemente este pedido?')) e.preventDefault() }}>
                Excluir Pedido
              </button>
            </form>
          )}
        </div>
      </div>"""
    
    comp_content = comp_content.replace('</div>\n      </div>\n\n      <div style={{ display: \'grid\', gap: \'1.5rem\', gridTemplateColumns: \'2fr 1fr\' }}>', delete_form_comp + '\n\n      <div style={{ display: \'grid\', gap: \'1.5rem\', gridTemplateColumns: \'2fr 1fr\' }}>')
    
    with open('src/app/dashboard/comprador/pedido/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(comp_content)

