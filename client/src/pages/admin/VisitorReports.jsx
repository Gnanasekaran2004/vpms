import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import StatusBadge from '../../components/shared/StatusBadge'

const VisitorReports = () => {
  const [rangeType, setRangeType] = useState('today')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    try {
      let url = `/reports/visitors?range=${rangeType}`
      if (rangeType === 'custom') {
        url += `&startDate=${startDate}&endDate=${endDate}`
      }
      const res = await axiosInstance.get(url)
      setReportData(res.data.data)
    } catch (e) {
      alert('Error fetching report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const exportCSV = async () => {
    try {
      const res = await axiosInstance.get('/reports/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Visitor_Report.csv')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (e) {
      alert('Error exporting CSV')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Visitor Reports</h2>
      </div>
      
      <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input type="radio" style={{ width: 'auto' }} value="today" checked={rangeType === 'today'} onChange={() => setRangeType('today')} /> Today
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input type="radio" style={{ width: 'auto' }} value="week" checked={rangeType === 'week'} onChange={() => setRangeType('week')} /> This Week
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input type="radio" style={{ width: 'auto' }} value="custom" checked={rangeType === 'custom'} onChange={() => setRangeType('custom')} /> Custom
            </label>
          </div>

          {rangeType === 'custom' && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span style={{ color: 'var(--text-secondary)' }}>to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
            <button className="primary" onClick={fetchReport} disabled={loading}>
              Generate Report
            </button>
            <button className="secondary" onClick={exportCSV} disabled={loading}>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && reportData && (
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="grid-cards">
            <div className="glass-card"><div className="stat-label">Total</div><div className="stat-value">{reportData.stats.totalRegistrations}</div></div>
            <div className="glass-card"><div className="stat-label">Approved</div><div className="stat-value">{reportData.stats.approved}</div></div>
            <div className="glass-card"><div className="stat-label">Rejected</div><div className="stat-value">{reportData.stats.rejected}</div></div>
            <div className="glass-card"><div className="stat-label">Checked In</div><div className="stat-value">{reportData.stats.checkedIn}</div></div>
            <div className="glass-card"><div className="stat-label">Checked Out</div><div className="stat-value">{reportData.stats.checkedOut}</div></div>
            <div className="glass-card"><div className="stat-label">Cancelled</div><div className="stat-value">{reportData.stats.cancelled}</div></div>
            <div className="glass-card"><div className="stat-label">Pending</div><div className="stat-value">{reportData.stats.pending}</div></div>
          </div>

          <div className="table-container" style={{ marginTop: '2rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Employee</th>
                  <th>Visit Date</th>
                  <th>Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.visitors.map(v => (
                  <tr key={v._id}>
                    <td><strong>{v.visitorName}</strong></td>
                    <td>{v.employeeToVisit?.name || 'N/A'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(v.visitDate).toLocaleDateString()}</td>
                    <td>{v.purposeOfVisit}</td>
                    <td><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
                {reportData.visitors.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No visitors found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisitorReports
