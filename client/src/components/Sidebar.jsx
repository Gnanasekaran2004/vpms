import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Sidebar = () => {
  const { user } = useAuth()
  const role = user?.role

  const getLinks = () => {
    if (role === 'Administrator') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/employees', label: 'Employees' },
        { path: '/admin/users', label: 'Users' },
        { path: '/admin/reports', label: 'Reports' },
        { path: '/admin/activity', label: 'Activity' }
      ]
    }
    if (role === 'Receptionist') {
      return [
        { path: '/receptionist/dashboard', label: 'Dashboard' },
        { path: '/receptionist/register', label: 'Register Visitor' },
        { path: '/receptionist/history', label: 'Visitor History' }
      ]
    }
    if (role === 'Employee') {
      return [
        { path: '/employee/dashboard', label: 'Dashboard' },
        { path: '/employee/requests', label: 'Visitor Requests' }
      ]
    }
    return []
  }

  const links = getLinks()

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2rem', marginTop: '1rem', paddingLeft: '1rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Menu</span>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {links.map((link) => (
          <li key={link.path} style={{ marginBottom: '0.5rem' }}>
            <NavLink
              to={link.path}
              style={({ isActive }) => ({
                display: 'block',
                padding: '0.75rem 1rem',
                textDecoration: 'none',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? '500' : '400',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                borderRadius: '0 8px 8px 0',
                transition: 'all 0.2s ease'
              })}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
