import React, { createContext, useReducer, useEffect } from 'react'

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        isLoading: false
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      }
    default:
      return state
  }
}

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('vpms_token')
    const userString = localStorage.getItem('vpms_user')
    
    if (token && userString) {
      try {
        const user = JSON.parse(userString)
        dispatch({
          type: 'INITIALIZE',
          payload: { user, token }
        })
      } catch (error) {
        dispatch({ type: 'INITIALIZE', payload: { user: null, token: null } })
      }
    } else {
      dispatch({ type: 'INITIALIZE', payload: { user: null, token: null } })
    }
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('vpms_token', token)
    localStorage.setItem('vpms_user', JSON.stringify(userData))
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: userData, token }
    })
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
