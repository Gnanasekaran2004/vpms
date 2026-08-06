import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

let roleLinksMappingVar = {
  Administrator: [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/employees', label: 'Employees' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/reports', label: 'Reports' },
    { path: '/admin/activity', label: 'Activity' }
  ],
  Receptionist: [
    { path: '/receptionist/dashboard', label: 'Dashboard' },
    { path: '/receptionist/register', label: 'Register Visitor' },
    { path: '/receptionist/history', label: 'Visitor History' }
  ],
  Employee: [
    { path: '/employee/dashboard', label: 'Dashboard' },
    { path: '/employee/requests', label: 'Visitor Requests' }
  ]
}

const Sidebar = () => {
  let authDataFromHook = useAuth()
  let loggedUserVar = authDataFromHook.user
  
  let menuLinksArr = []
  if (loggedUserVar && loggedUserVar.role) {
    if (roleLinksMappingVar[loggedUserVar.role]) {
      menuLinksArr = roleLinksMappingVar[loggedUserVar.role]
    }
  }

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2rem', marginTop: '1rem', paddingLeft: '1rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Menu</span>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {menuLinksArr.map((singleLinkObj) => (
          <li key={singleLinkObj.path} style={{ marginBottom: '0.5rem' }}>
            <NavLink
              to={singleLinkObj.path}
              style={(navLinkPropsObj) => {
                let isCurrentLinkActive = navLinkPropsObj.isActive
                return {
                  display: 'block',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  color: isCurrentLinkActive ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isCurrentLinkActive ? '500' : '400',
                  backgroundColor: isCurrentLinkActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  borderLeft: isCurrentLinkActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  borderRadius: '0 8px 8px 0',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              {singleLinkObj.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
