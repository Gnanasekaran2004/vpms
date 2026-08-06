import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: '',
    phone: '',
    isActive: true
  })

  const fetchUsers = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    try {
      const url = roleFilter ? `/users?role=${roleFilter}` : '/users'
      const response = await axiosInstance.get(url)
      setUsers(response.data.data || [])
    } catch (err) {
      alert('Error fetching users')
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(true)
  }, [roleFilter])

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const payload = { ...formData }
        await axiosInstance.put(`/users/${editingId}`, payload)
      } else {
        await axiosInstance.post('/users', formData)
      }
      setShowForm(false)
      setEditingId(null)
      resetForm()
      fetchUsers(false)
    } catch (err) {
      alert(err.response?.data?.message || 'An error occurred')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'Employee', department: '', phone: '', isActive: true })
  }

  const handleEdit = (user) => {
    setEditingId(user._id)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
      phone: user.phone || '',
      isActive: user.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await axiosInstance.delete(`/users/${id}`)
        fetchUsers(false)
      } catch (err) {
        alert('Error deactivating user')
      }
    }
  }

  const handleReactivate = async (id) => {
    if (window.confirm('Are you sure you want to reactivate this user?')) {
      try {
        await axiosInstance.put(`/users/${id}`, { isActive: true })
        fetchUsers(false)
      } catch (err) {
        alert('Error reactivating user')
      }
    }
  }

  if (loading && users.length === 0) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>User Management</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Employee">Employee</option>
          </select>
          <button className="primary" onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            resetForm()
          }}>
            {showForm ? 'Cancel' : '+ Add User'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
            {editingId ? 'Edit User Details' : 'Register New User'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" required />
              </div>
              <div>
                <label>Email Address</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required />
              </div>
              <div>
                <label>Password <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Enter Password" required pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{13,}" title="Must be at least 13 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character" />
              </div>
              <div>
                <label>Role <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                <select name="role" value={formData.role} onChange={handleInputChange} required>
                  <option value="Administrator">Administrator</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
              <div>
                <label>Department <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                <input name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" required />
              </div>
              <div>
                <label>Phone <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                  required
                />
              </div>
              {editingId && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} style={{ width: 'auto' }} />
                    Is Active
                  </label>
                </div>
              )}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="success">Save User</button>
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
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No users found.</td></tr>
            ) : users.map(user => (
              <tr key={user._id}>
                <td><strong>{user.name}</strong></td>
                <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'Administrator' ? 'badge-cancelled' : user.role === 'Receptionist' ? 'badge-checkedin' : 'badge-checkedout'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.department || '-'}</td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(user)} className="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                  {user.isActive ? (
                    <button onClick={() => handleDelete(user._id)} className="danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Deactivate</button>
                  ) : (
                    <button onClick={() => handleReactivate(user._id)} className="success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Reactivate</button>
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

export default UserManagement
