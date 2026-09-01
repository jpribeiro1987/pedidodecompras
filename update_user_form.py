import re

with open('src/app/dashboard/admin/UserForm.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_div = r'(<div style=\{\{ flex: \'1 1 150px\' \}\}>\s*<label htmlFor="departmentId">Setor[\s\S]*?</select>\s*</div>)'

def repl(match):
    return match.group(1) + """
      <div style={{ flex: '1 1 200px' }}>
        <label htmlFor="additionalDepartments">Setores Adicionais (Segure Ctrl para vários)</label>
        <select 
          id="additionalDepartments" 
          name="additionalDepartments" 
          className="input-field" 
          multiple
          size={3}
        >
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>"""

new_content = re.sub(old_div, repl, content)
with open('src/app/dashboard/admin/UserForm.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
