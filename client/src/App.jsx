import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

import Login from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import EmployeeManagement from './pages/admin/EmployeeManagement'
import UserManagement from './pages/admin/UserManagement'
import VisitorReports from './pages/admin/VisitorReports'
import ActivityHistory from './pages/admin/ActivityHistory'
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard'
import RegisterVisitor from './pages/receptionist/RegisterVisitor'
import VisitorHistory from './pages/receptionist/VisitorHistory'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import VisitorRequests from './pages/employee/VisitorRequests'

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="app-container">
        <Sidebar />
        <main className="main-content animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<EmployeeManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/reports" element={<VisitorReports />} />
              <Route path="/admin/activity" element={<ActivityHistory />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Receptionist']} />}>
              <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
              <Route path="/receptionist/register" element={<RegisterVisitor />} />
              <Route path="/receptionist/history" element={<VisitorHistory />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Employee']} />}>
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee/requests" element={<VisitorRequests />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
