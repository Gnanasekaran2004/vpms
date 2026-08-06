import React, { createContext, useReducer, useEffect } from 'react'

const authReducer = (state, action) => {
  switch (action.type) {
    case 'INIT':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: !!action.payload.token, isLoading: false }
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false }
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false }
    default:
      return state
  }
}

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  })

  useEffect(() => {
    const token = localStorage.getItem('vpms_token')
    const stored = localStorage.getItem('vpms_user')

    if (token && stored) {
      try {
        const user = JSON.parse(stored)
        dispatch({ type: 'INIT', payload: { user, token } })
      } catch {
        dispatch({ type: 'INIT', payload: { user: null, token: null } })
      }
    } else {
      dispatch({ type: 'INIT', payload: { user: null, token: null } })
    }
  }, [])

  const login = (profile, token) => {
    localStorage.setItem('vpms_token', token)
    localStorage.setItem('vpms_user', JSON.stringify(profile))
    dispatch({ type: 'LOGIN', payload: { user: profile, token } })
  }

  const logout = () => {
    localStorage.removeItem('vpms_token')
    localStorage.removeItem('vpms_user')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
