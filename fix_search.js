const fs = require('fs');

['src/app/dashboard/relatorios/page.tsx', 'src/app/dashboard/historico/page.tsx'].forEach(file_path => {
    let content = fs.readFileSync(file_path, 'utf8');

    const target_input = `          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Data Fim</label>
            <input type="date" name="dateEnd" defaultValue={dateEnd} className="input-field" />
          </div>`;
    
    const new_input = target_input + `
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Buscar por Item</label>
            <input type="text" name="itemSearch" defaultValue={searchParams?.itemSearch || ''} placeholder="Ex: Papel..." className="input-field" />
          </div>`;

    content = content.replace(target_input, new_input);

    const target_param = `const departmentId = searchParams?.departmentId || ''`;
    const new_param = target_param + `\n  const itemSearch = searchParams?.itemSearch || ''`;

    content = content.replace(target_param, new_param);

    // Some files might have different spacing for the where clause.
    // Let's use Regex to find the place.
    content = content.replace(/(...\(status \? \{ currentStatus: status \} : \{\}\),)/, `$1\n    ...(itemSearch ? { items: { some: { description: { contains: itemSearch, mode: 'insensitive' } } } } : {}),`);

    fs.writeFileSync(file_path, content, 'utf8');
    console.log('Processed', file_path);
});
