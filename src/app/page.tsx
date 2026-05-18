'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with localStorage, AudioContext, etc.
const BarnabyGame = dynamic(() => import('@/game/BarnabyGame'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#05040a',
      color: '#e8dcc8',
      fontFamily: '"JetBrains Mono", monospace',
      gap: '1rem'
    }}>
      <div style={{ fontSize: '3rem' }}>💀</div>
      <div style={{ fontSize: '1.2rem', color: '#d4943a' }}>Cargando Barnaby...</div>
      <div style={{ 
        width: '200px', 
        height: '4px', 
        backgroundColor: '#16131e', 
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '40%',
          height: '100%',
          backgroundColor: '#d4943a',
          borderRadius: '2px',
          animation: 'loading 1.5s ease-in-out infinite'
        }} />
      </div>
    </div>
  )
})

export default function Home() {
  return <BarnabyGame />
}
