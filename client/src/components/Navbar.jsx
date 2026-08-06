import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem', 
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div>
        <strong style={{ 
          fontSize: '1.5rem', 
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '1px'
        }}>VPMS</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> 
          <span style={{ 
            fontSize: '0.75rem', 
            background: 'rgba(255,255,255,0.1)', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            marginLeft: '8px',
            color: 'var(--accent-primary)'
          }}>
            {user?.role}
          </span>
        </span>
        <button onClick={handleLogout} className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}

export default Navbar
