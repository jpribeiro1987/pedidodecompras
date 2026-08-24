'use client'

import { useState } from 'react'

type Attachment = {
  id: string
  name: string
  url: string
}

export function AttachmentViewer({ attachments }: { attachments: Attachment[] }) {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null)

  const isPreviewable = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf'].includes(ext || '')
  }

  const isImage = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {attachments.map(att => (
          <button 
            key={att.id} 
            onClick={() => setSelectedAttachment(att)}
            style={{ 
              display: 'inline-block', 
              padding: '0.5rem', 
              backgroundColor: '#e2e8f0', 
              borderRadius: '4px', 
              color: 'var(--foreground)', 
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem' 
            }}
          >
            📎 {att.name}
          </button>
        ))}
      </div>

      {selectedAttachment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedAttachment.name}
              </h3>
              <button 
                onClick={() => setSelectedAttachment(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              {isPreviewable(selectedAttachment.name) ? (
                isImage(selectedAttachment.name) ? (
                  <img 
                    src={selectedAttachment.url} 
                    alt={selectedAttachment.name} 
                    style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
                  />
                ) : (
                  <iframe 
                    src={selectedAttachment.url} 
                    style={{ width: '100%', height: '60vh', border: 'none' }}
                  />
                )
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                  <p style={{ marginBottom: '1rem' }}>Não é possível visualizar este tipo de arquivo diretamente.</p>
                  <a 
                    href={selectedAttachment.url} 
                    download={selectedAttachment.name}
                    className="btn btn-primary"
                    style={{ display: 'inline-block' }}
                  >
                    Fazer Download
                  </a>
                </div>
              )}
            </div>

            {isPreviewable(selectedAttachment.name) && (
              <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'right', backgroundColor: '#f1f5f9' }}>
                <a 
                  href={selectedAttachment.url} 
                  download={selectedAttachment.name}
                  className="btn"
                  style={{ backgroundColor: '#e2e8f0', color: 'black' }}
                >
                  Baixar Arquivo
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
