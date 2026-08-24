'use client'

import { ReactNode } from 'react'

export function ConfirmButton({ 
  children, 
  message, 
  className, 
  style 
}: { 
  children: ReactNode
  message: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <button 
      type="submit" 
      className={className} 
      style={style}
      onClick={(e) => {
        if (!confirm(message)) {
          e.preventDefault()
        }
      }}
    >
      {children}
    </button>
  )
}
