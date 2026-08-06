import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import LoadingSpinner from './components/shared/LoadingSpinner'

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const EmployeeManagement = lazy(() => import('./pages/admin/EmployeeManagement'))
const UserManagement = lazy(() => import('./pages/admin/UserManagement'))
const VisitorReports = lazy(() => import('./pages/admin/VisitorReports'))
const ActivityHistory = lazy(() => import('./pages/admin/ActivityHistory'))
const ReceptionistDashboard = lazy(() => import('./pages/receptionist/ReceptionistDashboard'))
const RegisterVisitor = lazy(() => import('./pages/receptionist/RegisterVisitor'))
const VisitorHistory = lazy(() => import('./pages/receptionist/VisitorHistory'))
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'))
const VisitorRequests = lazy(() => import('./pages/employee/VisitorRequests'))

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="app-container">
        <Sidebar />
        <main className="main-content animate-fade-in">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<LoadingSpinner />}>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
