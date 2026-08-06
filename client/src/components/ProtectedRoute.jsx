import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const dashboardByRole = {
  Administrator: '/admin/dashboard',
  Receptionist: '/receptionist/dashboard',
  Employee: '/employee/dashboard'
}

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dest = dashboardByRole[user.role] || '/login'
    return <Navigate to={dest} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
