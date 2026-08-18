import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

const RegisterVisitor = () => {
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhone: '',
    visitorEmail: '',
    employeeToVisit: '',
    visitDate: '',
    expectedArrivalTime: '',
    purposeOfVisit: ''
  })

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get('/users/employees/list')
        setEmployees(response.data.data || [])
      } catch (err) {
        setError('Failed to load employee list')
      }
    }
    fetchEmployees()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(formData.visitDate)
    
    if (selectedDate < today) {
      setError('Visit date cannot be in the past')
      return false
    }

    if (selectedDate.getTime() === today.getTime()) {
      const arrivalTime = new Date(formData.expectedArrivalTime)
      if (arrivalTime < new Date()) {
        setError('Arrival time cannot be in the past for today')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validate()) return

    try {
      const response = await axiosInstance.post('/visitors', formData)
      const passNumber = response.data.data?.passNumber
      setSuccess(`Visitor registered successfully! Pass Number: ${passNumber}`)
      setFormData({
        visitorName: '',
        visitorPhone: '',
        visitorEmail: '',
        employeeToVisit: '',
        visitDate: '',
        expectedArrivalTime: '',
        purposeOfVisit: ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering visitor')
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h2>Register New Visitor</h2>
      </div>
      
      {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}
      {success && <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{success}</div>}

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label>Visitor Name <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input name="visitorName" value={formData.visitorName} onChange={handleChange} required placeholder="Full Name" />
            </div>

            <div>
              <label>Visitor Phone <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <PhoneInput
                international
                defaultCountry="US"
                value={formData.visitorPhone}
                onChange={(val) => setFormData({ ...formData, visitorPhone: val })}
                required
              />
            </div>

            <div>
              <label>Visitor Email <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input type="email" name="visitorEmail" value={formData.visitorEmail} onChange={handleChange} required placeholder="Email Address" />
            </div>

            <div>
              <label>Employee to Visit <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <select name="employeeToVisit" value={formData.employeeToVisit} onChange={handleChange} required>
                <option value="">Select an Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.department || 'No Dept'})</option>
                ))}
              </select>
            </div>

            <div>
              <label>Visit Date <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} required />
            </div>

            <div>
              <label>Expected Arrival Time <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input type="datetime-local" name="expectedArrivalTime" value={formData.expectedArrivalTime} onChange={handleChange} required />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label>Purpose of Visit <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <textarea style={{ minHeight: '100px' }} name="purposeOfVisit" value={formData.purposeOfVisit} onChange={handleChange} required placeholder="Briefly describe the purpose of the visit..." />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="success" style={{ padding: '0.75rem 2rem' }}>Complete Registration</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterVisitor
