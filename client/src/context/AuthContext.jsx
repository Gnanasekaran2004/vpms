import React, { createContext, useReducer, useEffect } from 'react'

let myAuthReducerFunc = (currentState, dispatchedAction) => {
  if (dispatchedAction.type === 'INIT') {
    return { 
      ...currentState, 
      user: dispatchedAction.payload.user, 
      token: dispatchedAction.payload.token, 
      isAuthenticated: dispatchedAction.payload.token ? true : false, 
      isLoading: false 
    }
  } else if (dispatchedAction.type === 'LOGIN') {
    return { 
      ...currentState, 
      user: dispatchedAction.payload.user, 
      token: dispatchedAction.payload.token, 
      isAuthenticated: true, 
      isLoading: false 
    }
  } else if (dispatchedAction.type === 'LOGOUT') {
    return { 
      ...currentState, 
      user: null, 
      token: null, 
      isAuthenticated: false, 
      isLoading: false 
    }
  } else {
    return currentState
  }
}

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  let [authStateObj, dispatchMyAction] = useReducer(myAuthReducerFunc, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  })

  useEffect(() => {
    let tokenStr = sessionStorage.getItem('vpms_token')
    let userStr = sessionStorage.getItem('vpms_user')

    if (tokenStr !== null && userStr !== null) {
      try {
        let parsedUserObj = JSON.parse(userStr)
        dispatchMyAction({ type: 'INIT', payload: { user: parsedUserObj, token: tokenStr } })
      } catch (parseErr) {
        dispatchMyAction({ type: 'INIT', payload: { user: null, token: null } })
      }
    } else {
      dispatchMyAction({ type: 'INIT', payload: { user: null, token: null } })
    }
  }, [])

  let doLoginFunc = (userProfileObj, userTokenStr) => {
    sessionStorage.setItem('vpms_token', userTokenStr)
    sessionStorage.setItem('vpms_user', JSON.stringify(userProfileObj))
    dispatchMyAction({ type: 'LOGIN', payload: { user: userProfileObj, token: userTokenStr } })
  }

  let doLogoutFunc = () => {
    sessionStorage.removeItem('vpms_token')
    sessionStorage.removeItem('vpms_user')
    dispatchMyAction({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...authStateObj, login: doLoginFunc, logout: doLogoutFunc }}>
      {children}
    </AuthContext.Provider>
  )
}
