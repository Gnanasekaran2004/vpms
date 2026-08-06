import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import StatusBadge from '../../components/shared/StatusBadge'

const VisitorHistory = () => {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [employees, setEmployees] = useState([])

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date: '',
    employeeId: ''
  })

  useEffect(() => {
    axiosInstance.get('/users/employees').then(res => {
      setEmployees(res.data.data || [])
    }).catch(() => {})
  }, [])

  const loadVisitors = async (withLoader = true) => {
    if (withLoader) setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.date) params.append('date', filters.date)
      if (filters.employeeId) params.append('employeeId', filters.employeeId)

      const res = await axiosInstance.get(`/visitors?${params.toString()}`)
      setVisitors(res.data.data || [])
    } catch (e) {
      alert('Error fetching visitors')
    } finally {
      if (withLoader) setLoading(false)
    }
  }

  useEffect(() => {
    loadVisitors(true)
  }, [filters])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleAction = async (id, action) => {
    if (action === 'cancel' && !window.confirm('Cancel this visit?')) return

    try {
      if (action === 'cancel') {
        await axiosInstance.patch(`/visitors/${id}/cancel`)
      } else {
        await axiosInstance.post(`/visitors/${id}/${action}`)
      }
      loadVisitors(false)
    } catch (e) {
      alert(e.response?.data?.message || `Error: ${action}`)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Visitor History</h2>
      </div>

      <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          <div>
            <label>Search Visitors</label>
            <input type="text" name="search" placeholder="Search name or phone..." value={filters.search} onChange={handleFilterChange} />
          </div>
          <div>
            <label>Status Filter</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="CheckedIn">Checked In</option>
              <option value="CheckedOut">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label>Employee Filter</label>
            <select name="employeeId" value={filters.employeeId} onChange={handleFilterChange}>
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Date Filter</label>
            <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="table-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <table>
            <thead>
              <tr>
                <th>Visitor Name</th>
                <th>Phone</th>
                <th>Employee</th>
                <th>Visit Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(v => (
                <React.Fragment key={v._id}>
                  <tr>
                    <td><strong>{v.visitorName}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{v.visitorPhone}</td>
                    <td>{v.employeeToVisit?.name || 'N/A'}</td>
                    <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                    <td>{new Date(v.expectedArrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => toggleExpand(v._id)} className="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>View</button>
                      {v.status === 'Approved' && <button onClick={() => handleAction(v._id, 'check-in')} className="success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Check In</button>}
                      {v.status === 'CheckedIn' && <button onClick={() => handleAction(v._id, 'check-out')} className="primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Check Out</button>}
                      {(v.status === 'Pending' || v.status === 'Approved') && <button onClick={() => handleAction(v._id, 'cancel')} className="danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>}
                    </td>
                  </tr>
                  {expandedId === v._id && (
                    <tr>
                      <td colSpan="7" style={{ padding: '0' }}>
                        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--glass-border)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                              <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Visitor Details</h4>
                              <p style={{ margin: '0.5rem 0' }}><strong style={{ color: 'var(--text-secondary)' }}>Email:</strong> {v.visitorEmail || 'N/A'}</p>
                              <p style={{ margin: '0.5rem 0' }}><strong style={{ color: 'var(--text-secondary)' }}>Purpose:</strong> {v.purposeOfVisit}</p>
                              <p style={{ margin: '0.5rem 0' }}><strong style={{ color: 'var(--text-secondary)' }}>Remarks:</strong> {v.remarks || 'None'}</p>
                            </div>
                            <div>
                              <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Activity Logs</h4>
                              <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {v.activityLogs?.map((log, i) => (
                                  <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--text-primary)' }}>{log.action}</span> at {new Date(log.timestamp).toLocaleString()}
                                  </li>
                                ))}
                                {(!v.activityLogs || v.activityLogs.length === 0) && <li style={{ color: 'var(--text-secondary)' }}>No logs available</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {visitors.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No visitors found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default VisitorHistory
