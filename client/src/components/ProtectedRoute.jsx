import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'Administrator') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'Receptionist') return <Navigate to="/receptionist/dashboard" replace />
    if (user.role === 'Employee') return <Navigate to="/employee/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
