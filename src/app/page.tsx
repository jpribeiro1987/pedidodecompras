import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <img src="/logo.png" alt="Hospital Santo Antônio" style={{ maxWidth: '250px', marginBottom: '1rem' }} />
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Sistema de Solicitação de Compras</p>
        
        <LoginForm />

        <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          <p>Login de MVP (Senhas padrão: 123).</p>
        </div>
      </div>
    </div>
  )
}
