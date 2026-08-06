import React, { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const ActivityHistory = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // fetch all the logs
    const loadLogs = async () => {
      try {
        const historyData = await axiosInstance.get('/activity-logs')
        setLogs(historyData.data.data || [])
      } catch (e) {
        console.error("error fetching logs", e)
        alert('Error fetching activity logs')
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Global Activity History</h2>
      </div>
      
      <div className="table-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Action</th>
              <th>Visitor Name</th>
              <th>Performed By</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id}>
                <td style={{ color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: '500', background: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem' }}>
                    {log.actionPerformed}
                  </span>
                </td>
                <td><strong>{log.visitorId?.visitorName || 'Unknown'}</strong></td>
                <td>
                  {log.performedBy ? (
                    <span>{log.performedBy.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({log.performedBy.role})</span></span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>System</span>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No activity logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ActivityHistory
