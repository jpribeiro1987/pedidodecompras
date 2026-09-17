const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/solicitante/nova/RequestForm.tsx', 'utf8');

// Props
content = content.replace("targetUsers?: any[],", "targetUsers?: any[],\n  allUsers?: any[],");
content = content.replace("isComprador,\n  departments = []\n}: {", "isComprador,\n  departments = [],\n  allUsers = []\n}: {");

// State for observers
content = content.replace("const [items, setItems] = useState([{", "const [observerIds, setObserverIds] = useState<string[]>([])\n  const [items, setItems] = useState([{");

// Hidden inputs for observers
const hiddenInputTarget = "<input type=\"hidden\" name=\"itemsCount\" value={items.length} />";
const hiddenInputReplace = "<input type=\"hidden\" name=\"itemsCount\" value={items.length} />\n        {observerIds.map((id, index) => (\n          <input key={`obs-${id}`} type=\"hidden\" name={`observer_${index}`} value={id} />\n        ))}\n        <input type=\"hidden\" name=\"observersCount\" value={observerIds.length} />";
content = content.replace(hiddenInputTarget, hiddenInputReplace);

// Observers UI
const observerUITarget = "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>";
const observerUIReplace = `<div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="observerSelect">Observadores do Pedido (Receberão e-mails de acompanhamento)</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <select id="observerSelect" className="input-field" style={{ flex: 1 }}>
              <option value="">Selecione um usuário...</option>
              {allUsers.filter(u => u.id !== user.id && !observerIds.includes(u.id)).map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.department?.name || 'Sem Setor'})</option>
              ))}
            </select>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                const select = document.getElementById('observerSelect') as HTMLSelectElement;
                if (select.value) {
                  setObserverIds([...observerIds, select.value]);
                  select.value = '';
                }
              }}
            >
              Adicionar
            </button>
          </div>
          {observerIds.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {observerIds.map(id => {
                const obsUser = allUsers.find(u => u.id === id);
                return (
                  <span key={id} style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {obsUser?.name}
                    <button type="button" onClick={() => setObserverIds(observerIds.filter(o => o !== id))} style={{ color: '#ef4444', fontWeight: 'bold' }}>&times;</button>
                  </span>
                )
              })}
            </div>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>`;

content = content.replace(observerUITarget, observerUIReplace);

fs.writeFileSync('src/app/dashboard/solicitante/nova/RequestForm.tsx', content);