import { prisma } from '@/lib/prisma'
import { loginAction } from './actions'

export default async function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <img src="/logo.png" alt="Hospital Santo Antônio" style={{ maxWidth: '250px', marginBottom: '1rem' }} />
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Sistema de Solicitação de Compras</p>
        
        <form action={loginAction} style={{ textAlign: 'left' }}>
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
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Entrar no Sistema
          </button>
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          <p>Login de MVP (Senhas padrão: 123).</p>
        </div>
      </div>
    </div>
  )
}
