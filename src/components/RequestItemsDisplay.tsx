export function RequestItemsDisplay({ request }: { request: any }) {
  if (request.items && request.items.length > 0) {
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>Itens Solicitados</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {request.items.map((item: any, i: number) => (
            <div key={item.id || i} style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
              <div style={{ fontWeight: 600 }}>{item.description}</div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}>
                <span>Quantidade: {item.quantity}</span>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                    Acessar Link de Referência
                  </a>
                )}
              </div>
              {item.imageUrl && (
                <div style={{ marginTop: '0.75rem', width: '100%' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>📷 Imagem Anexada:</p>
                  <a href={item.imageUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                    <img src={item.imageUrl} alt="Anexo" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Legacy fallback
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Item Solicitado (Legado)</h3>
      <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
        <div style={{ fontWeight: 600 }}>{request.description}</div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}>
          <span>Quantidade: {request.quantity}</span>
          {request.link && (
            <a href={request.link} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
              Acessar Link de Referência
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
