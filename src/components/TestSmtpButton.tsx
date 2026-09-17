'use client'
import { useState } from 'react'
import { testSmtpAction } from '@/app/adminActions'

export function TestSmtpButton() {
  const [loading, setLoading] = useState(false)

  return (
    <button 
      type="button" 
      onClick={async () => {
        setLoading(true)
        const res = await testSmtpAction()
        setLoading(false)
        if (res?.error) {
          alert('Erro: ' + res.error)
        } else {
          alert('E-mail de teste enviado com sucesso!')
        }
      }} 
      className="btn" 
      style={{ alignSelf: 'flex-start', backgroundColor: '#e2e8f0', color: '#1e293b' }}
      disabled={loading}
    >
      {loading ? 'Testando...' : 'Testar Configuração'}
    </button>
  )
}