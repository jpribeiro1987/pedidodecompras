import re

with open('src/app/dashboard/admin/usuario/[id]/EditUserForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_div = r'(<div>\s*<label htmlFor="departmentId">Setor[\s\S]*?</select>\s*</div>)'

def repl(match):
    return match.group(1) + """
        <div>
          <label htmlFor="additionalDepartments">Setores Adicionais (Segure Ctrl para vários)</label>
          <select 
            id="additionalDepartments" 
            name="additionalDepartments" 
            className="input-field" 
            multiple
            size={3}
            defaultValue={user.additionalDepartments?.map((d: any) => d.id) || []}
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>"""

new_content = re.sub(old_div, repl, content)
with open('src/app/dashboard/admin/usuario/[id]/EditUserForm.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
