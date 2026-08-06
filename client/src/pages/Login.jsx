import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import axiosInstance from '../api/axiosInstance'

const Login = () => {
  let [emailInputVal, setEmailInputVal] = useState('')
  let [passwordInputVal, setPasswordInputVal] = useState('')
  let [loginErrorMsg, setLoginErrorMsg] = useState(null)
  let [isWaitLoading, setIsWaitLoading] = useState(false)
  
  let authHookStuff = useAuth()
  let doLoginCall = authHookStuff.login
  let myNavFunc = useNavigate()

  let onFormSubmitBtnClick = async (eventObj) => {
    eventObj.preventDefault()
    setLoginErrorMsg(null)
    setIsWaitLoading(true)

    try {
      let apiPostResult = await axiosInstance.post('/auth/login', { email: emailInputVal, password: passwordInputVal })
      let loggedUserObj = apiPostResult.data.data.user
      let tokenStr = apiPostResult.data.data.token
      
      doLoginCall(loggedUserObj, tokenStr)
      
      let userRoleStr = loggedUserObj.role
      if (userRoleStr === 'Administrator') {
        myNavFunc('/admin/dashboard')
      } else if (userRoleStr === 'Receptionist') {
        myNavFunc('/receptionist/dashboard')
      } else if (userRoleStr === 'Employee') {
        myNavFunc('/employee/dashboard')
      }
    } catch (caughtErrObj) {
      if (caughtErrObj.response && caughtErrObj.response.data && caughtErrObj.response.data.message) {
        setLoginErrorMsg(caughtErrObj.response.data.message)
      } else {
        setLoginErrorMsg('Login failed')
      }
    } 
    setIsWaitLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>Sign In to VPMS</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Welcome back! Please enter your details.</p>
        </div>
        
        {loginErrorMsg !== null && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            {loginErrorMsg}
          </div>
        )}
        
        <form onSubmit={onFormSubmitBtnClick}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Email Address</label>
            <input type="email" value={emailInputVal} onChange={(e) => setEmailInputVal(e.target.value)} required autoComplete="username" placeholder="Enter your email" />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <input type="password" value={passwordInputVal} onChange={(e) => setPasswordInputVal(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" />
          </div>
          <button type="submit" disabled={isWaitLoading === true} style={{ width: '100%' }}>
            {isWaitLoading === true ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Sample Credentials</h4>
          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--accent-primary)' }}>Admin</span>
              <span>admin@vpms.com / Admin@12345678</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--accent-success)' }}>Receptionist</span>
              <span>receptionist@vpms.com / Recept@1234567</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--accent-warning)' }}>Employee</span>
              <span>alice@vpms.com / Emp@123456789</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
