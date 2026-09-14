'use client'

import { useRouter } from 'next/navigation'

export default function KanbanFilter({ buyers, currentBuyer }: { buyers: any[], currentBuyer: string }) {
  const router = useRouter()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label htmlFor="buyerFilter" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>
        Filtrar por Comprador:
      </label>
      <select 
        id="buyerFilter"
        value={currentBuyer} 
        onChange={(e) => router.push(`?buyer=${e.target.value}`)}
        className="input-field"
        style={{ padding: '0.25rem 0.5rem', height: 'auto', width: 'auto', minWidth: '200px', cursor: 'pointer' }}
      >
        <option value="all">Todos</option>
        <option value="unassigned">Sem responsável</option>
        {buyers.map(b => (
          <option key={b.id} value={b.id}>{ b.name }</option>
        ))}
      </select>
    </div>
  )
}