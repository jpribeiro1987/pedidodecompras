'use client'

import { useState, useTransition } from 'react'
import { loginAction } from './actions'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
      {error && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email">E-mail</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          className="input-field" 
          required 
          placeholder="seu@email.com"
        />
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="password">Senha</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          className="input-field" 
          required 
          placeholder="******"
        />
      </div>
      
      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isPending}>
        {isPending ? 'Entrando...' : 'Entrar no Sistema'}
      </button>
    </form>
  )
}
