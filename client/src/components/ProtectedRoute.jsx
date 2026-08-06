import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

let roleDashboardsObj = {
  Administrator: '/admin/dashboard',
  Receptionist: '/receptionist/dashboard',
  Employee: '/employee/dashboard'
}

const ProtectedRoute = ({ allowedRoles }) => {
  let authStuff = useAuth()
  let isItAuthenticated = authStuff.isAuthenticated
  let isItLoading = authStuff.isLoading
  let loggedInUser = authStuff.user

  if (isItLoading === true) {
    return <div>Loading...</div>
  }
  
  if (isItAuthenticated === false) {
    return <Navigate to="/login" replace={true} />
  }

  if (allowedRoles !== undefined && allowedRoles !== null) {
    let hasRoleMatch = false
    for (let i = 0; i < allowedRoles.length; i++) {
      if (allowedRoles[i] === loggedInUser.role) {
        hasRoleMatch = true
      }
    }
    
    if (hasRoleMatch === false) {
      let whereToGoNext = roleDashboardsObj[loggedInUser.role]
      if (!whereToGoNext) {
        whereToGoNext = '/login'
      }
      return <Navigate to={whereToGoNext} replace={true} />
    }
  }

  return <Outlet />
}

export default ProtectedRoute
