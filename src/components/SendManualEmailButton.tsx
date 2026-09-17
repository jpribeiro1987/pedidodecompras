'use client'
import { useState } from 'react'
import { sendManualEmailAction } from '@/app/actions'

export function SendManualEmailButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false)

  return (
    <button 
      onClick={async (e) => {
        e.preventDefault()
        if (!confirm('Deseja enviar um e-mail manual de atualização de status para o solicitante?')) return
        setLoading(true)
        const res = await sendManualEmailAction(requestId)
        setLoading(false)
        if (res?.error) alert('Erro: ' + res.error)
        else alert('E-mail enviado com sucesso!')
      }} 
      className="btn" 
      style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', backgroundColor: '#e2e8f0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
      title="Enviar atualização de status por e-mail"
      disabled={loading}
    >
      {loading ? '...' : '📧 Enviar Email'}
    </button>
  )
}