import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export const useAuth = () => {
  let theAuthContextVal = useContext(AuthContext)
  if (theAuthContextVal === undefined || theAuthContextVal === null) {
    throw new Error('useAuth: no AuthProvider found')
  }
  return theAuthContextVal
}
