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

  const blankForm = { name: '', email: '', password: '', role: 'Employee', department: '', phone: '', isActive: true }
  const [formData, setFormData] = useState(blankForm)

  const loadUsers = async (withLoader = true) => {
    if (withLoader) setLoading(true)
    try {
      const url = roleFilter ? `/users?role=${roleFilter}` : '/users'
      const res = await axiosInstance.get(url)
      setUsers(res.data.data || [])
    } catch (e) {
      alert('Error fetching users')
    } finally {
      if (withLoader) setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(true)
  }, [roleFilter])

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: val })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axiosInstance.put(`/users/${editingId}`, formData)
      } else {
        await axiosInstance.post('/users', formData)
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(blankForm)
      loadUsers(false)
    } catch (e) {
      alert(e.response?.data?.message || 'Something went wrong')
    }
  }

  const openEditForm = (user) => {
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

  const deactivateUser = async (id) => {
    if (!window.confirm('Deactivate this user?')) return
    try {
      await axiosInstance.delete(`/users/${id}`)
      loadUsers(false)
    } catch (e) {
      alert('Error deactivating')
    }
  }

  const reactivateUser = async (id) => {
    if (!window.confirm('Reactivate this user?')) return
    try {
      await axiosInstance.put(`/users/${id}`, { isActive: true })
      loadUsers(false)
    } catch (e) {
      alert('Error reactivating')
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
            setFormData(blankForm)
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
                <label>Role <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="Administrator">Administrator</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
              <div>
                <label>Department <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                <input name="department" value={formData.department} onChange={handleChange} placeholder="Department" required />
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
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ width: 'auto' }} />
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
                  <button onClick={() => openEditForm(user)} className="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                  {user.isActive ? (
                    <button onClick={() => deactivateUser(user._id)} className="danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Deactivate</button>
                  ) : (
                    <button onClick={() => reactivateUser(user._id)} className="success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Reactivate</button>
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
