import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const emptyForm = { name: '', email: '', password: '', department: '', phone: '' }
  const [formData, setFormData] = useState(emptyForm)

  const loadEmployees = async (withLoader = true) => {
    if (withLoader) setLoading(true)
    try {
      const res = await axiosInstance.get('/users?role=Employee')
      setEmployees(res.data.data || [])
    } catch (e) {
      alert('Error fetching employees')
    } finally {
      if (withLoader) setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axiosInstance.put(`/users/${editingId}`, { ...formData, role: 'Employee' })
      } else {
        await axiosInstance.post('/users', { ...formData, role: 'Employee' })
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(emptyForm)
      loadEmployees(false)
    } catch (e) {
      alert(e.response?.data?.message || 'Something went wrong')
    }
  }

  const openEditForm = (emp) => {
    setEditingId(emp._id)
    setFormData({
      name: emp.name,
      email: emp.email,
      password: '',
      department: emp.department || '',
      phone: emp.phone || ''
    })
    setShowForm(true)
  }

  const deactivateEmp = async (id) => {
    if (!window.confirm('Deactivate this employee?')) return
    try {
      await axiosInstance.delete(`/users/${id}`)
      loadEmployees(false)
    } catch (e) {
      alert('Error deactivating employee')
    }
  }

  const reactivateEmp = async (id) => {
    if (!window.confirm('Reactivate this employee?')) return
    try {
      await axiosInstance.put(`/users/${id}`, { isActive: true })
      loadEmployees(false)
    } catch (e) {
      alert('Error reactivating')
    }
  }

  if (loading && employees.length === 0) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Employee Management</h2>
        <button className="primary" onClick={() => {
          setShowForm(!showForm)
          setEditingId(null)
          setFormData(emptyForm)
        }}>
          {showForm ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
            {editingId ? 'Edit Employee Details' : 'Register New Employee'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
              </div>
              <div>
                <label>Email Address</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
              </div>
              <div>
                <label>Password <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter Password" required pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{13,}" title="Must be at least 13 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character" />
              </div>
              <div>
                <label>Department <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                <input name="department" value={formData.department} onChange={handleChange} placeholder="Department Name" required />
              </div>
              <div>
                <label>Phone Number <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                  required
                />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="success">Save Employee</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No employees found.</td></tr>
            ) : employees.map(emp => (
              <tr key={emp._id}>
                <td><strong>{emp.name}</strong></td>
                <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                <td>{emp.department || '-'}</td>
                <td>{emp.phone || '-'}</td>
                <td>
                  <span className={`badge ${emp.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditForm(emp)} className="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                  {emp.isActive ? (
                    <button onClick={() => deactivateEmp(emp._id)} className="danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Deactivate</button>
                  ) : (
                    <button onClick={() => reactivateEmp(emp._id)} className="success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Reactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EmployeeManagement
