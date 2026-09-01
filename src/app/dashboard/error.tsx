'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Ops! Ocorreu um erro no servidor.</h2>
      <p style={{ marginBottom: '1rem' }}>
        Infelizmente a página não pôde ser carregada. Por favor, tire um print ou copie o erro abaixo e envie para o suporte:
      </p>
      
      <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', textAlign: 'left', fontFamily: 'monospace', overflowX: 'auto', marginBottom: '1rem', color: '#000' }}>
        <strong>Message:</strong> {error.message}
        <br/><br/>
        <strong>Digest:</strong> {error.digest || 'N/A'}
        <br/><br/>
        <strong>Stack:</strong> <pre style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>{error.stack}</pre>
      </div>

      <button
        onClick={() => reset()}
        style={{ padding: '0.5rem 1rem', backgroundColor: '#b91c1c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
      >
        Tentar Novamente
      </button>
    </div>
  )
}
